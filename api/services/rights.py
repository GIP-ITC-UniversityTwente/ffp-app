#!C:\ms4w\Python\python.exe

import psycopg2
from psycopg2.extras import RealDictCursor
import json
from psql import db_connection, db_transaction, db_query, connParams
import cgi
from uuid import uuid4
import os


def err_message(err):
    return '{"success" : false, "message" : ' + json.dumps(str(err)) + '}'
#-- err_message ---



def getrightdetails():
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    suId = params.getvalue('su_id')
    response = ''

    #-----

    sql_code = ("""
        with d as (
            SELECT s.objectid, r.objectid, r.globalid as r_globalid, a.globalid as a_globalid,
                attachment_type, coalesce(a.description, '') as notes
            FROM spatialunit as s JOIN "right" AS r ON s.globalid = r.spatialunit_id
                JOIN rightattachment AS a ON a.right_id = r.globalid
            WHERE s.objectid = %s
        )
        SELECT d.attachment_type, d.notes, d.a_globalid AS rel_globalid,
				json_agg(row_to_json((SELECT list FROM (select i.attachmentid, i.globalid) AS list))) AS images
        FROM d join right__attach as i ON d.a_globalid = i.rel_globalid
		GROUP BY 1,2,3
    """ % (suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += '"attachments" : ' + result

    #-----

    sql_code = ("""
        SELECT r.globalid AS right_id, r.right_type, r.right_source,
            (r.time_spec_start::timestamp)::varchar AS valid_since, description
        FROM spatialunit AS s JOIN "right" AS r ON s.globalid = r.spatialunit_id
        WHERE s.objectid = %s
    """ % (suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'][0])
        response += ', "details" : ' + result

    pg_cursor.close()
    return '{"success" : true, ' + response + '}'
#-- getrightdetails ---



def updateRight():
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))
    pg_cursor.execute("""SET datestyle TO 'ISO, MDY'""")

    rightId = params.getvalue('right_id')

    data = json.loads(params.getvalue('data'))
    rightType = data['rw:right_type']
    rightSource = data['rw:right_source']
    validSince = data['rw:right_validsince']
    description = data['rw:right_description']

    response = ''

    # ---

    sqlCode = """
        UPDATE "right" SET
            right_type = '%s',
            right_source = '%s',
            time_spec_start ='%s'::timestamp,
            description = '%s'
        WHERE globalid = '%s'
    """ % (rightType, rightSource, validSince, description, rightId)

    query = db_transaction(pg_cursor, sqlCode)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        response += ' -[ ' + query['message'] + ' ]- '

    # ---

    if params.getvalue('att_data'):
        for item in json.loads(params.getvalue('att_data')):
            sqlCode = """
                UPDATE rightattachment SET
                    attachment_type = '%s',
                    description = '%s'
                WHERE globalid = '%s'
            """ % (item['attachment_type'], item['description'], item['globalid'])

            query = db_transaction(pg_cursor, sqlCode)
            if query['success'] == False:
                response = err_message(query['message'])
                pg_cursor.close()
                return response
            else:
                response += ' -[ ' + query['message'] + ' ]- '

    # ---

    newAttachments = True if params.getvalue('new_attachments') == 'true' else False

    if newAttachments:
        newAttData = json.loads(params.getvalue('new_attdata'))
        relGlobalid = '{' + str(uuid4()) + '}'

        sqlCode = """SELECT max(objectid) + 100 AS newobjectid FROM rightattachment"""

        query = db_query(pg_cursor, sqlCode)
        newObjectid = query['records'][0]['newobjectid']

        sqlCode = """
            INSERT INTO rightattachment
                (objectid, attachment_type, globalid, right_id, description)
            VALUES
                (%s, '%s', '%s', '%s', '%s')
        """ % (newObjectid , newAttData['type'], relGlobalid, rightId, newAttData['description'])

        query = db_transaction(pg_cursor, sqlCode)
        if query['success'] == False:
            response = err_message(query['message'])
            pg_cursor.close()
            return response
        else:
            response += ' -[ ' + query['message'] + ' ]- '

        # ---


        sqlCode = """SELECT max(attachmentid) + 99 AS newobjectid FROM right__attach"""

        query = db_query(pg_cursor, sqlCode)
        newObjectid = query['records'][0]['newobjectid']

        addedAttachmnets = json.loads(params.getvalue('added_attachments'))

        for item in addedAttachmnets:
            imageName = '../../images/uploads/' + item['globalid'] + '.jpg'
            image = open(imageName, 'rb').read()

            newObjectid = newObjectid + 1
            sqlCode = """
                INSERT INTO right__attach
                    (attachmentid, globalid, rel_globalid, content_type, att_name, data_size, data)
                VALUES
                    (%s, '%s', '%s', 'image/jpeg', 'app_attachment', %s, %s)
            """ % (newObjectid, item['globalid'], relGlobalid, os.stat(imageName).st_size, psycopg2.Binary(image))

            query = db_transaction(pg_cursor, sqlCode)
            if query['success'] == False:
                response = err_message(query['message'])
                pg_cursor.close()
                return response
            else:
                os.remove(imageName)
                response += ' -[ ' + query['message'] + ' ]- '

    response = '{"success" : true, "message": "' + response + '" }'

    pg_cursor.execute("commit;")
    pg_cursor.close()
    return response

#-- updateRight ---




#--- main ---
params = cgi.FieldStorage()
operation = params.getvalue('operation')

file = open('params.json')
dbparams = json.loads(str(file.read()))
database = params.getvalue('database')

# if operation == 'update':
#     file = open('.params')
#     adminParams = json.loads(str(file.read()))
#     dbparams['user'] = adminParams['user']
#     dbparams['password'] = adminParams['password']
# connection_string = connParams(database)

connection_string = connParams(database, True if operation == 'update' else False)
pg = db_connection(connection_string)
if pg['success'] == False:
    response = err_message(pg['message'])
else:
    schema = params.getvalue('schema')
    if operation == 'details':
        response = getrightdetails()
    elif operation == 'update':
        response = updateRight()
    else:
        response = """{"success" : false, "message" : "Operation '%s' not recognized!!!"}""" % operation

print ("Content-type: application/json")
print ()
print (response)