#!C:\ms4w\Python\python.exe

import cgi
import json
from psql import db_query, db_connection, connParams
from psycopg2.extras import RealDictCursor


def err_message(err):
    return '{"success" : false, "message" : ' + json.dumps(str(err)) + '}'
#-- err_message ---



def getCertificateData(suId, srid):
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    response = ''

    #-----

    sql_code = ("""
        WITH d AS (
            SELECT p.objectid
            FROM spatialunit AS s JOIN "right" AS r on s.globalid = r.spatialunit_id
                JOIN party AS p on r.globalid = p.right_id
            WHERE s.objectid = %s
        )
        SELECT ROW_NUMBER() OVER()::INTEGER AS id, p.objectid AS party_id, p.globalid,
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
        SELECT objectid as id, globalid, round((st_area(st_transform(geom,%s)))::numeric,1)::VARCHAR AS area_has,
            initcap(spatialunit_name) AS su_label, landuse, creationdate::VARCHAR AS surveyed_on, physical_id, legal_id,
            spatialunit_type as su_type, initcap(trim(gps_bearer)) AS gps_bearer
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

    location = True if params.getvalue('getlocation') == 'true' else False

    if location:
        sql_code = ("""
            SELECT initcap(v.village_name) AS village_name,
                   initcap(v.municipality_name) AS municipality_name
            FROM spatialunit as s LEFT JOIN basedata.village as v
                ON st_intersects(st_centroid(s.geom), v.geom)
            WHERE s.objectid = %s
        """ %(suId))

        query = db_query(pg_cursor, sql_code)
        if query['success'] == False:
            response = err_message(query['message'])
            pg_cursor.close()
            return response
        else:
            result = json.dumps(query['records'][0])
            response += ', "location" : ' + result

    else:
        response += ', "location" : { "village_name" : null, "municipality_name" : null }'

    #-----

    sql_code = ("""
        with l as (
            SELECT DISTINCT r.limite AS bounrary_id, r.pol2 AS su_id, initcap(r.nombre2) AS full_name, r.concepto2 AS status,
                r.id_number2 as id_number, r.party_id2 as party_id, g.signature
            FROM revisa_limite_crt AS r LEFT JOIN boundary_signature AS g ON r.party_id2 = g.party_id
            WHERE r.pol1 = %s
        )
        select l.su_id, s.spatialunit_name, json_agg(row_to_json((select list from (select l.full_name, l.party_id, l.id_number, l.status, l.signature) as list))) as status_list
        from l JOIN spatialunit AS s ON l.su_id = s.objectid
        group by 1,2
        order by 1
    """ % (suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "status" : ' + result

    pg_cursor.close()
    return '{"success" : true, ' + response + '}'

#-- getCertificateData ---




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
    if operation == 'get':
        suId = params.getvalue('su_id')
        srid = params.getvalue('srid')
        response = getCertificateData(suId, srid)
    else:
        response = """{"success" : false, "message" : "Operation '%s' not recognized!!!"}""" % operation

print ("Content-type: application/json")
print ()
print (response)