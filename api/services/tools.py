#!C:\ms4w\Python\python.exe
# ---

import os
import cgi
import json
from psql import db_query, db_transaction, db_connection, connParams
from psycopg2.extras import RealDictCursor
from pathlib import Path
import re
import urllib.request as req


def err_message(err):
    return '{"success" : false, "message" : ' + json.dumps(str(err)) + '}'
#-- err_message ---



def getParams():
    dbparams.pop('password')

    return ("""{
        "success" : true,
        "path" : %s,
        "params" : %s
    }
    """ % (json.dumps(str(os.getcwd())), json.dumps(dbparams)))
#-- getParams ---



def checkBasedata():
    schema = params.getvalue('schema')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    pg_cursor.execute("""
        SELECT
        CASE
            WHEN to_regclass('basedata.roads') is not null THEN true
            ELSE false
        END as roads,
        CASE
            WHEN to_regclass('basedata.rivers') is not null THEN true
            ELSE false
        END as rivers
    """)

    result = json.dumps(pg_cursor.fetchall()[0])
    pg_cursor.close()

    return '"basedata" : ' + result
#-- checkBasedata ---



def checkTimeline():
    schema = params.getvalue('schema')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    pg_cursor.execute("""
        SELECT count(*)
        FROM firma_l
        WHERE fecha IS NOT NULL
    """)

    result = json.dumps(pg_cursor.fetchone())
    pg_cursor.close()

    return '"timeline" : ' + result
#-- checkTimeline ---



def getSridList():
    searchString = params.getvalue('filter[value]')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)

    sql_code = """
        SELECT srid as id, srid, substring(srtext,'"(.*?)"') AS srtext,
            CASE WHEN char_length(substring(srtext,'"(.*?)"')) > 38
                    THEN substring(substring(srtext,'"(.*?)"'), 0, 38) || '...'
                ELSE substring(srtext,'"(.*?)"')
            END AS displaytext
        FROM spatial_ref_sys
        WHERE srtext LIKE 'PROJCS%'
            AND srid::text LIKE '""" + searchString + """%'"""

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
    else:
        result = json.dumps(query['records'])
        response = result

    pg_cursor.close()

    return response
#-- getSridList ---



def refreshViews():
    schema = params.getvalue('schema')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    sql_code = """
        BEGIN;
            REFRESH MATERIALIZED VIEW muestra_limite_view;
            REFRESH MATERIALIZED VIEW concepto_predio_con_vecinos_view;
        END;
    """

    query = db_transaction(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
    else:
        response = '{"success" : true, "message": "' + query['message'] + '"}'
        pg_cursor.execute("commit;")

    pg_cursor.close()
    return response
#-- refreshViews ---



def getAppdataValues():

    schema = params.getvalue('schema')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    #-----

    sql_code = """
        WITH t AS (
            SELECT count(*) FROM information_schema.tables
            WHERE table_schema = 'inspection'
        ), p AS (
            SELECT count(*) FROM information_schema.table_privileges
            WHERE grantee = 'kadaster'
        )
        SELECT
            CASE
                WHEN to_regproc('inspection.log_signature') is not null THEN true
                ELSE false
            END as signature,
            CASE
                WHEN to_regproc('inspection.log_status') is not null THEN true
                ELSE false
            END as status,
            t.count AS tables, p.count AS privileges
        FROM t, p
    """

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        if query['records'][0]['privileges'] == 0 or query['records'][0]['tables'] != query['records'][0]['privileges']:
            return '{"success" : false, "message" : "User \'%s\' does not have sufficient privileges"}' % params.getvalue('user')
        if query['records'][0]['status'] == False:
            return '{"success" : false, "message" : "This database is not properly configured for the FfP app, make sure to execute the \'app_init\' script located in the \'./api/dbconfig\' folder"}'
    #-----

    mosaic = Path("../../../../basedata/mosaic_%s.tif" % (params.getvalue('database')))
    if mosaic.is_file():
        response = '"mosaic" : true'
    else:
        response = '"mosaic" : false'

    #-----

    box = 'BOX(-81.735620556 -4.22940646586102,-66.847215427 13.3947277615742)'
    sql_code = ("""
        WITH w AS (
            SELECT st_setsrid('%s'::box2d, 4326) AS outerbox
        ),
        d as (
            SELECT st_setsrid(st_extent(geom),4326) AS innerbox
            FROM spatialunit
        )
        SELECT
            CASE
                WHEN to_regclass('basedata.road') is not null THEN true
                ELSE false
            END as roads,
            CASE
                WHEN to_regclass('basedata.river') is not null THEN true
                ELSE false
            END as rivers,
            CASE
                WHEN to_regclass('basedata.village') is not null THEN true
                ELSE false
            END as villages,
            st_within(d.innerbox, w.outerbox) AS tiles100k
        FROM w, d
    """ % (box))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'][0])
        response += ', "basedata" : ' + result

    #-----

    sql_code = """
        SELECT count(*)
        FROM firma_l
        WHERE fecha IS NOT NULL
    """

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'][0])
        response += ', "timeline" : ' + result


    pg_cursor.close()
    return '{"success" : true, ' + response + '}'
#-- getAppdataValues ---



def getCodelists():
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = public""" % (schema))

    sql_code = """
        WITH list AS (
            (SELECT 'en' AS lang, c.description, json_object_agg(c.value, c.en)::text AS values
            FROM inspection.codelist c
            GROUP BY lang, c.description)
            UNION
            (SELECT 'es' AS lang, c.description, json_object_agg(c.value, c.es)::text AS values
            FROM inspection.codelist c
            GROUP BY lang, c.description)
        ),
        result as (
            SELECT lang, json_object_agg(description, values::json) AS codelist
            FROM list
            GROUP BY lang
            ORDER BY lang
        )
        SELECT json_object_agg(lang, codelist) as codes
        FROM result;
    """

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
    else:
        result = json.dumps(query['records'][0])
        response = '{"success" : true, "records" : ' + result + '}'

    pg_cursor.close()
    return response
#-- getCodelists ---



def setGraticluleSrid():

    srid = params.getvalue('srid')
    proj = 'init=epsg:'

    mapfile = open('graticule.map', 'r')
    content = mapfile.readlines()
    newContent = list()
    count = 0
    pattern = r'.*?\:(.*)\",*'

    for line in content:
        if proj in line:
            if count == 1:
                match = re.search(pattern, line)
                val = match.group(1)
                line = line.replace(val, srid)
            else:
                count += 1
        newContent.append(line)

    mapfile.close()
    mapfile = open('graticule.map', 'w')
    mapfile.writelines(newContent)
    mapfile.close()

    if srid == '9377':
        wgsbounds = '-78.99, -4.29, -66.88, 12.44'
        bounds = '4334000, 1080500, 5666500, 2940200'
        result = '"proj4text" : "+proj=tmerc +lat_0=4.596200416666666 +lon_0=-74.07750791666666 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"'
    else:
        with req.urlopen('https://spatialreference.org/ref/epsg/' + srid + '/') as f:
            content = f.readlines()
        pattern1 = r'.*?\:(.*)\<,*'
        pattern2 = r'.*?\:(.*)'

        for line in content:
            data = line.decode('utf-8')
            if 'Projected Bounds' in data:
                match = re.search(pattern1, data)
                bounds = match.group(1)
            if 'WGS84 Bounds' in data:
                match = re.search(pattern2, data)
                wgsbounds = match.group(1)

        schema = params.getvalue('schema')
        pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
        pg_cursor.execute("""SET search_path = %s, public""" % (schema))

        sql_code = ("""
            SELECT proj4text FROM spatial_ref_sys WHERE srid = %s;
        """ % (srid))

        query = db_query(pg_cursor, sql_code)
        result = (json.dumps(query['records'][0])).replace('{',' ').replace('}','')
        pg_cursor.close()

    return '{"wgsbounds" : "' + wgsbounds.strip() + '", "bounds" : "' + bounds.strip() + '",' + result + '}'


#--- main ---
params = cgi.FieldStorage()
function = params.getvalue('function')

file = open('params.json')
dbparams = json.loads(str(file.read()))

if function == 'params':
    response = getParams()
else:
    database = params.getvalue('database')
    connection_string = connParams(database, True if function == 'refreshviews' else False)
    pg = db_connection(connection_string)
    if pg['success'] == False:
        response = err_message(pg['message'])
    else:
        if function == 'checkconnection':
            response = getAppdataValues()
        elif function == 'sridlist':
            response = getSridList()
        elif function == 'codelists':
            response = getCodelists()
        elif function == 'gridsrid':
            response = setGraticluleSrid()
        elif function == 'refreshviews':
            response = refreshViews()
        else:
            response = """{"success" : false, "message" : "function '%s'not recognized!!!"}""" % function

print ("Content-type: application/json")
print ()
print (response)