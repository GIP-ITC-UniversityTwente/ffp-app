#!C:\ms4w\Python\python.exe

import psycopg2
from psycopg2.extras import RealDictCursor
import json
from psql import db_connection, db_transaction, connParams
import cgi
import base64


def err_message(err):
    return '{"success" : false, "message" : ' + json.dumps(str(err)) + '}'
#-- err_message ---



def updateConcepts():
    schema = params.getvalue('schema')
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))
    pg_cursor.execute("""SET datestyle TO 'ISO, MDY'""")


    partyId = params.getvalue('party_id')
    rightId = params.getvalue('right_id')
    details = params.getvalue('details')
    if details:
        details = "'" + details + "'"
    else:
        details = 'null'
    concepts = json.loads(params.getvalue('concepts'))

    response = ''

    signature = params.getvalue('signature')
    if params.getvalue('fingerprint'):
        fingerprint = base64.b64decode(params.getvalue('fingerprint'))
    else:
        fingerprint = params.getvalue('fingerprint')

    if signature and fingerprint:
        sql_code = ("""
            WITH ins AS (
                UPDATE boundary_signature
                SET party_id = %s, signed_on = now(), details = %s, signature = '%s', fingerprint = %s
                WHERE globalid = '%s'
                RETURNING *
            )
            INSERT INTO boundary_signature (party_id, globalid, details, signed_on, signature, fingerprint)
            SELECT '%s', '%s', %s, now(), '%s', %s
            WHERE NOT EXISTS (SELECT * FROM ins);
        """ % (partyId, details, signature, psycopg2.Binary(fingerprint),
               rightId, partyId, rightId, details, signature, psycopg2.Binary(fingerprint)))
    elif signature:
        sql_code = ("""
            WITH ins AS (
                UPDATE boundary_signature
                SET party_id = %s, signed_on = now(), details = %s, signature = '%s'
                WHERE globalid = '%s'
                RETURNING *
            )
            INSERT INTO boundary_signature (party_id, globalid, details, signed_on, signature)
            SELECT '%s', '%s', %s, now(), '%s'
            WHERE NOT EXISTS (SELECT * FROM ins);
        """ % (partyId, details, signature, rightId, partyId, rightId, details, signature))
    elif fingerprint:
        sql_code = ("""
            WITH ins AS (
                UPDATE boundary_signature
                SET party_id = %s, signed_on = now(), details = %s, fingerprint = %s
                WHERE globalid = '%s'
                RETURNING *
            )
            INSERT INTO boundary_signature (party_id, globalid, details, signed_on, fingerprint)
            SELECT '%s', '%s', %s, now(), %s
            WHERE NOT EXISTS (SELECT * FROM ins);
        """ % (partyId, details, psycopg2.Binary(fingerprint), rightId, partyId, rightId,
               details, psycopg2.Binary(fingerprint)))
    else:
        response = err_message('Data could not be saved, no fingerprint and/or signature provided')
        pg_cursor.close()
        return response

    query = db_transaction(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        response += ' -[ ' + query['message'] + ' ]- '

    keys = list(concepts.keys())
    i = 0
    for key in keys[::3]:
        status = keys[i]
        sign_date = keys[i+1]
        remarks = keys[i+2]
        i = i + 3
        limitId = key[7:]

        if concepts[status]:
            if concepts[remarks]:
                concepts[remarks] = "'" + concepts[remarks] + "'::VARCHAR"
            else:
                concepts[remarks] = 'null'
            sql_code = ("""
                SELECT concepto_propietario_limite(%s, %s, %s, to_timestamp('%s', 'DD-Mon-YYYY')::date, %s);
            """ % (limitId, partyId, concepts[status], concepts[sign_date], concepts[remarks]))
            query = db_transaction(pg_cursor, sql_code)
            if query['success'] == False:
                response = err_message(query['message'])
                pg_cursor.close()
                return response
            else:
                response += ' -[ ' + query['message'] + ' ]- '

    response = '{"success" : true, "message": "' + response + '" }'

    pg_cursor.execute("TRUNCATE signature_log;")
    pg_cursor.execute("commit;")
    pg_cursor.close()
    return response
#-- updateConcepts ---



#--- main ---
params = cgi.FieldStorage()
database = params.getvalue('database')

connection_string = connParams(database, True)
pg = db_connection(connection_string)
if pg['success'] == False:
    response = err_message(pg['message'])
else:
    response = updateConcepts()


print ("Content-type: application/json")
print ()
print (response)