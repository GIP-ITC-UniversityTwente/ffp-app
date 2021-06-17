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



def getReport(objectid):
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    response = ''

    #-----

    sql_code = ("""
        SELECT objectid AS spatialunit_id, spatialunit_name AS address, landuse_description AS notes, legal_id,
            physical_id, round(st_area(st_transform(geom,3116))::numeric,2)::varchar AS area_m2, spatialunit_type,
            globalid, ('{"type": "Feature", "geometry": ' || ST_AsGeoJSON(ST_Transform(geom,3857)) || '}')::json as geometry
        FROM spatialunit
        WHERE objectid = %s;
    """ % (objectid))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'][0])
        response += '"su_details" : ' + result

    #-----

    sql_code = ("""
        SELECT string_agg(DISTINCT predio_vecino::text, ',') AS list
        FROM v_firma_colinda_todos
        WHERE predio = %s;
    """ % objectid)

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'][0])
        response += ', "neighbours" : ' + result

    #-----

    sql_code = ("""
        SELECT r.objectid, r.right_type, r.right_source, r.description AS notes,
            r.time_spec_start::varchar AS valid_since
        FROM spatialunit AS s JOIN "right" AS r on r.spatialunit_id = s.globalid
        WHERE s.objectid = %s;
    """ % objectid)

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "right" : ' + result

    #-----

    sql_code = ("""
        SELECT r.objectid AS r_object_id, p.objectid,
            initcap(p.first_name || ' ' || p.last_name) AS full_name,
            initcap(p.first_name) AS first_name,
            initcap(p.last_name) AS last_name,
            p.date_of_birth::VARCHAR, p.id_number, p.phone_number,
            p.civil_status, p.housing_subsidy, p.other_ownership_rights, p.globalid,
            b.signed_on::varchar
        FROM spatialunit AS s JOIN "right" AS r ON s.globalid = r.spatialunit_id
            JOIN party AS p on r.globalid = p.right_id
            LEFT JOIN boundary_signature AS b ON b.party_id = p.objectid
        WHERE s.objectid = %s;
    """ % (objectid))

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
        SELECT i.attachmentid, i.globalid AS image_id, p.id_number, a.attachment_type
        FROM spatialunit AS s JOIN "right" AS r ON r.spatialunit_id = s.globalid
            JOIN party AS p ON p.right_id = r.globalid
            JOIN partyattachment AS a ON p.globalid = a.party_id
            JOIN party__attach AS i ON a.globalid = i.rel_globalid
            WHERE s.objectid = %s
            ORDER BY 3,4 DESC;
    """ % (objectid))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "party_attachments" : ' + result

    #-----

    sql_code = ("""
        SELECT i.attachmentid, i.globalid AS image_id
        FROM spatialunit AS s JOIN "right" AS r ON r.spatialunit_id = s.globalid
            JOIN rightattachment AS a ON r.globalid = a.right_id
            JOIN right__attach AS i ON a.globalid = i.rel_globalid
        where s.objectid = %s
        order by 1;
    """ % (objectid))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "right_attachments" : ' + result

    pg_cursor.close()
    return '{"success" : true, ' + response + '}'
#-- getReport



def search(searchString):
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    sql_code = ("""
        WITH l AS (
            SELECT unnest(physical_id) AS physical_id, count(*),
                json_agg(objectid ORDER BY objectid) AS oids
            FROM spatialunit
            GROUP BY 1
        )
        SELECT physical_id, count, oids
        FROM l
        WHERE physical_id LIKE '%s';
    """ %('%' + searchString + '%'))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
    else:
        result = json.dumps(query['records'])
        response = result

    pg_cursor.close()
    return response
#-- search



def getList(idList):
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    sql_code = ("""
        SELECT s.objectid, s.spatialunit_name, r.right_type,
	           json_agg(p.first_name ||' '|| p.last_name) as parties
        FROM spatialunit AS s
            LEFT JOIN inspection.right AS r ON s.globalid = r.spatialunit_id
            LEFT JOIN inspection.party AS p ON r.globalid = p.right_id
        WHERE s.objectid in (%s)
        GROUP BY 1,2,3;
    """ % (idList))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response = '"spatialunits" : ' + result

    pg_cursor.close()
    return '{"success" : true, ' + response + '}'



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
        response = search(params.getvalue('filter[value]'))
    elif operation == 'list':
        idList = params.getvalue('id_list')
        response = getList(idList)
    elif operation == 'report':
        objectid = params.getvalue('objectid')
        response = getReport(objectid)
    else:
        response = """{"success" : false, "message" : "Operation '%s' not recognized!!!"}""" % operation

print ("Content-type: application/json")
print ()
print (response)