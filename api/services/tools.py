#!C:\ms4w\Python\python.exe
# ---

import os
import cgi
import json
from psql import db_query, db_transaction, db_connection, connParams
from psycopg2.extras import RealDictCursor
from pathlib import Path


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

    pg_cursor.execute("commit;")
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

    mosaic = Path("../../../basedata/mosaic_%s.tif" % (params.getvalue('database')))
    if mosaic.is_file():
        response = '"mosaic" : true'
    else:
        response = '"mosaic" : false'

    schema = params.getvalue('schema')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    #-----

    box = 'BOX(-81.735620556 -4.22940646586102,-66.847215427 13.3947277615742)'
    sql_code = ("""
        WITH w AS (
            SELECT st_setsrid('%s'::box2d, 4326) AS outerbox
        ),
        d as (
            SElECT st_setsrid(st_extent(geom),4326) AS innerbox
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
    schema = params.getvalue('schema')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

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




#--- main ---
params = cgi.FieldStorage()
function = params.getvalue('function')

file = open('params.json')
dbparams = json.loads(str(file.read()))

if function == 'params':
    response = getParams()
else:
    if function == 'refreshviews':
        file = open('.params')
        adminParams = json.loads(str(file.read()))
        dbparams['user'] = adminParams['user']
        dbparams['password'] = adminParams['password']

    connection_string = connParams(params.getvalue('database'))
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
        elif function == 'refreshviews':
            response = refreshViews()
        else:
            response = """{"success" : false, "message" : "function '%s'not recognized!!!"}""" % function

print ("Content-type: application/json")
print ()
print (response)