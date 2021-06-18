#!C:\ms4w\Python\python.exe

import cgi
import json
from psql import db_query
from psql import db_connection
from psycopg2.extras import RealDictCursor


def err_message(err):
    return '{"success" : false, "message" : ' + json.dumps(str(err)) + '}'
#-- err_message --



def connParams(database):
    return ("""dbname='%s' host='%s' port='%s' user='%s' password='%s'"""
            % (database, dbparams['host'], dbparams['port'], dbparams['user'], dbparams['password']))
#-- connParams ---



def spatialunitSearch(searchString):
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    sql_code = ("""
        SELECT p.objectid as party_id, initcap(p.first_name || ' ' || p.last_name) AS "value",
                coalesce(p.id_number, '') AS id_number,
                ltrim(to_char(s.objectid, '9999')) AS spatialunit_id, spatialunit_name
        FROM party AS p JOIN "right" AS r ON p.right_id = r.globalid
                JOIN spatialunit AS s on r.spatialunit_id = s.globalid
        WHERE (
            to_tsvector(coalesce(unaccent(p.first_name), '')) ||
            to_tsvector(coalesce(unaccent(p.last_name), '')) ||
            to_tsvector(coalesce(p.id_number, '')) ||
            to_tsvector(coalesce(s.objectid::text, ''))
        ) @@ to_tsquery('simple', '%s:*')
        ORDER by 2, 1;
    """ % (searchString))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
    else:
        result = json.dumps(query['records'])
        response = result

    pg_cursor.close()
    return response
#-- spatialunitsearch ---



def getFullSpatialunitData(suId, srid):
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    response = ''

    #-----

    sql_code = ("""
        SELECT objectid, globalid, round((st_area(st_transform(geom,%s)))::numeric,0)::VARCHAR AS area_m2,
            INITCAP(spatialunit_name) AS su_label, landuse, creationdate::VARCHAR AS surveyed_on, physical_id, legal_id
        FROM spatialunit
        WHERE objectid = %s;
    """ % (srid, suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'][0])
        response += '"details" : ' + result

    #-----

    sql_code = ("""
        WITH d AS (
            SELECT p.objectid AS objectid, r.right_type
            FROM spatialunit AS s JOIN "right" AS r on s.globalid = r.spatialunit_id
                JOIN party AS p on r.globalid = p.right_id
            WHERE s.objectid = %s
        )
        SELECT ROW_NUMBER() OVER()::INTEGER AS id, p.objectid AS objectid, p.globalid,
            initcap(p.first_name) || ' ' || initcap(p.last_name) AS full_name,
            p.id_number, p.right_id AS right_id, d.right_type
        FROM party as p JOIN d ON d.objectid = p.objectid
    """ % (suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "parties" : ' + result

    #-----

    sql_code = ("""
        WITH s AS ((
            SELECT DISTINCT limite1 AS bounrary_id, pol2 AS su_id, initcap(nombre1) AS party_name, concepto1 AS status
            FROM revisa_limite
            WHERE pol1 = %s
            ) union all (
            SELECT DISTINCT limite1 AS bounrary_id, pol2 AS su_id, initcap(nombre2) AS party_name, concepto2 AS status
            FROM revisa_limite
            WHERE pol1 = %s
        ))
        SELECT su_id, json_agg(row_to_json((SELECT list FROM (select party_name, status) AS list))) AS status_list
        FROM s
        GROUP BY 1
        ORDER BY 1
    """ % (suId, suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "status" : ' + result

    #-----

    sql_code = ("""
        WITH l AS (
            SELECT distinct predio_vecino AS neigh_suid, initcap(nombre_vecino) AS neigh_name
            FROM v_firma_colinda_todos
            WHERE predio = %s
        )
        SELECT row_number() over() AS nid, l.*
        FROM l
    """ % (suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "neighbours" : ' + result

    #-----

    pg_cursor.close()
    return '{"success" : true, ' + response + '}'
#-- getFullSpatialunitData ---



def partySpatialunits(id_number):
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    sql_code = ("""
        SELECT 'Feature' as type,
            s.objectid AS ogc_id,
            row_to_json((SELECT list FROM
            (SELECT s.objectid AS id, initcap(s.spatialunit_name) AS label, r.spatialunit_id, s.physical_id) AS list )) AS properties,
            st_asgeojson(st_transform(s.geom,3857))::json AS geometry
        FROM party AS p JOIN "right" AS r ON p.right_id = r.globalid
            JOIN spatialunit AS s ON r.spatialunit_id = s.globalid
        WHERE p.id_number = '%s' --AND p.right_id IS NOT NULL
    """ % (id_number))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
    else:
        result = '{"type":"FeatureCollection", "features":' + json.dumps(query['records']) + '}'
        response = '{"success" : true, "collection" : ' + result + '}'

    pg_cursor.close()
    return response
#-- partySpatialunits ---



def getSpatialunitData(suId, srid):
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    response = ''

    #-----

    sql_code = ("""
        WITH d AS (
            SELECT p.objectid AS objectid
            FROM spatialunit AS s JOIN "right" AS r on s.globalid = r.spatialunit_id
                JOIN party AS p on r.globalid = p.right_id
            WHERE s.objectid = %s
        )
        SELECT ROW_NUMBER() OVER()::INTEGER AS id, p.objectid AS objectid, p.globalid,
            initcap(p.first_name) || ' ' || initcap(p.last_name) AS full_name,
            p.id_number, p.right_id AS right_id,
            g.details, g.signed_on::VARCHAR, g.signature, encode(g.fingerprint, 'base64') as fingerprint
        FROM party as p JOIN d ON d.objectid = p.objectid
            LEFT JOIN boundary_signature AS g ON g.party_id = p.objectid
    """ % (suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += '"parties" : ' + result

    #-----

    sql_code = ("""
        SELECT distinct vecino AS neigh_suid, id_party AS objectid, limitid as limit_id, initcap(nombre_vecino) AS neigh_name,
            concepto AS status, fecha::VARCHAR AS sign_date, remarks
        FROM concepto_predio_con_vecinos_view
        WHERE predio = %s
        ORDER BY 1,2
    """ % (suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "concepts" : ' + result

    #-----

    sql_code = ("""
        with l as (
            SELECT distinct predio_vecino AS neigh_suid, initcap(nombre_vecino) AS neigh_name
            FROM v_firma_colinda_todos
            WHERE predio = %s
        )
        select row_number() over() as nid, l.*
        from l
    """ % (suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "neighbours" : ' + result

    #-----

    sql_code = ("""
        SELECT objectid as id, globalid, round((st_area(st_transform(geom,%s)))::numeric,0)::VARCHAR AS area_m2,
            INITCAP(spatialunit_name) AS su_label, landuse, creationdate::VARCHAR AS surveyed_on, physical_id,
            spatialunit_type as su_type
        FROM spatialunit
        WHERE objectid = %s
    """ % (srid, suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'][0])
        response += ', "details" : ' + result

    #-----

    sql_code = ("""
        SELECT 'Feature' as type,
            limitid as id,
            row_to_json((SELECT list FROM
                (SELECT limitid, round((st_length(st_transform(geom,%s)))::numeric,0) AS length) AS list )) as properties,
                st_asgeojson(st_transform(geom,3857))::json as geometry
        FROM limites
        WHERE id_pol = %s
    """ % (srid, suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "boundaries" : {"type":"FeatureCollection", "features":' + str(result) + '}'

    #-----

    pg_cursor.close()
    return '{"success" : true, ' + response + '}'

#-- getSpatialunitData ---



#--- main ---
params = cgi.FieldStorage()
operation = params.getvalue('operation')

file = open('params.json')
dbparams = json.loads(str(file.read()))
database = params.getvalue('database')

connection_string = connParams(database)
pg = db_connection(connection_string)
if pg['success'] == False:
    response = err_message(pg['message'])
else:
    schema = params.getvalue('schema')
    if operation == 'search':
        response = spatialunitSearch(params.getvalue('filter[value]'))
    elif operation == 'full':
        suId = params.getvalue('su_id')
        srid = params.getvalue('srid')
        response = getFullSpatialunitData(suId, srid)
    elif operation == 'data':
        suId = params.getvalue('su_id')
        srid = params.getvalue('srid')
        response = getSpatialunitData(suId, srid)
    elif operation == 'party':
        idNumber = params.getvalue('id_number')
        response = partySpatialunits(idNumber)
    else:
        response = """{"success" : false, "message" : "Operation '%s' not recognized!!!"}""" % operation

print ("Content-type: application/json")
print ()
print (response)