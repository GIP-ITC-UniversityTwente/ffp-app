#!C:\ms4w\Python\python.exe

import cgi
import json
from psql import db_connection, connParams
from psycopg2.extras import RealDictCursor
import sys


def err_message(err):
    return '{"success" : false, "message" : ' + json.dumps(str(err)) + '}'
#-- err_message ---



def table_name(att_type):
    return {
        'party': 'party__attach',
        'right': 'right__attach'
    }[att_type]
#-- table_name ---



def attribute(att_type):
    return {
        'party': 'globalid',
        'right': 'globalid'
    }[att_type]
#-- attribute ---



def getAttachment():
    schema = params.getvalue('schema')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    att_class = params.getvalue('att_class')
    global_id = params.getvalue('global_id')

    pg_cursor.execute("""
        SELECT data
        FROM %s
        WHERE %s = '%s';
    """ % (table_name(att_class), attribute(att_class), global_id))

    if pg_cursor.rowcount == 1:
        record = pg_cursor.fetchone()
        image = record['data']
        print ("Content-type: image/jpeg")
        print ()
        sys.stdout.flush()
        sys.stdout.buffer.write(image)
    else:
        print ("Content-type: text/plain")
        print ()
        print (global_id)

    pg_cursor.close()

    return False
#-- getAttachment ---



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
    error = True

    if operation == 'get':
        error = getAttachment()
    else:
        response = """{"success" : false, "message" : "Operation '%s' not recognized!!!"}""" % operation

if error:
    print ("Content-type: application/json")
    print ()
    print (response)