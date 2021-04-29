#!C:\ms4w\Python\python.exe

from psycopg2.extras import RealDictCursor
import json
from psql import db_connection
from psql import db_query
import cgi


def err_message(err):
    return '{"success" : false, "message" : ' + json.dumps(str(err)) + '}'
#-- err_message --


def connParams(database):
    return ("""dbname='%s' host='%s' port='%s' user='%s' password='%s'"""
            % (database, dbparams['host'], dbparams['port'], dbparams['user'], dbparams['password']))
#-- connParams ---


def getDashboardData():
    srid = params.getvalue('srid')

    schema = params.getvalue('schema')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    sql_code = ("""
        SELECT count(*) AS num_spatialunits, sum(st_area(st_transform(geom,%s))) AS total_area,
               max(st_area(st_transform(geom,%s))) AS largest,
               min(st_area(st_transform(geom,%s))) AS smallest,
               avg(st_area(st_transform(geom,%s))) AS average_size
        FROM spatialunit
    """ % (srid, srid, srid, srid))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        response = ''
        result = query['records'][0]

        sql_code = ("""
            SELECT count(*) AS num_rights
            FROM "right"
        """)
        query = db_query(pg_cursor, sql_code)
        result.update(query['records'][0])

        sql_code = ("""
            SELECT count(*) AS num_parties
            FROM party
        """)
        query = db_query(pg_cursor, sql_code)
        result.update(query['records'][0])
        result = json.dumps(result)
        response += '"details" : ' + result

        sql_code = ("""
            SELECT gender AS id, count(*)
            FROM party
            GROUP BY 1
        """)
        query = db_query(pg_cursor, sql_code)
        result = json.dumps(query['records'])
        response += ', "gender_dist" : ' + result

    #-----

    sql_code = ("""
        WITH d AS (
            SELECT CASE
                    WHEN concepto IS NULL THEN 'pending'
                    ELSE 'processed'
                END as status
            FROM concepto_predio_con_vecinos_view
        )
        SELECT status, count(*)
        FROM d
        GROUP BY status
    """)

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "progress" : ' + result

    #-----

    sql_code = ("""
        WITH d AS (
            SELECT CASE
                    WHEN status = 2 OR status = 5 THEN 2
                    WHEN status = 3 OR status = 6 THEN 3
                    WHEN status = 4 OR status = 7 THEN 4
                    ELSE status
            END AS status
            FROM muestra_limite_view
            WHERE status is not null
        ),
        n AS (
            SELECT status, count(*) AS count
            FROM d
            GROUP by status
        )
        SELECT row_number() over() as id, status as concept, count,
            round(100.0*count/(select count(*)
                            from muestra_limite_view
                            WHERE status is not null), 1)::real AS percent
        FROM n
    """)

    #-----

    query = db_query(pg_cursor, sql_code)
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
        SELECT right_type, count(*)
        FROM "right"
        GROUP BY right_type
    """)

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "tenure" : ' + result

    #-----

    pg_cursor.close()
    return '{"success" : true, ' + response + '}'

#-- getDashboardData ---



#--- main ---
params = cgi.FieldStorage()

file = open('params.json')
dbparams = json.loads(str(file.read()))
database = params.getvalue('database')

connection_string = connParams(database)
pg = db_connection(connection_string)
if pg['success'] == False:
    response = err_message(pg['message'])
else:
    schema = params.getvalue('schema')
    response = getDashboardData()


print ("Content-type: application/json")
print ()
print (response)