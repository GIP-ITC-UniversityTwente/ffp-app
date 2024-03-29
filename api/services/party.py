#!C:\ms4w\Python\python.exe

import cgi
import json
from psql import db_query, db_transaction, db_connection, connParams
from psycopg2.extras import RealDictCursor
from uuid import uuid4
import os

import psycopg2
import urllib3


def err_message(err):
    return '{"success" : false, "message" : ' + json.dumps(str(err)) + '}'
#-- err_message ---



def partySearch(searchString):
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    # ---

    sqlCode = ("""
        SELECT initcap(first_name || ' ' || last_name) AS "value",
            coalesce(id_number, '') AS id_number, json_agg(objectid) AS oid_list, count (objectid)
        FROM party
        WHERE (
            to_tsvector(coalesce(unaccent(first_name), '')) ||
            to_tsvector(coalesce(unaccent(last_name), '')) ||
            to_tsvector(coalesce(id_number, ''))
        ) @@ to_tsquery('simple', '%s:*')
        GROUP BY 1,2
        ORDER BY 1
    """ % (searchString))

    query = db_query(pg_cursor, sqlCode)
    if query['success'] == False:
        response = err_message(query['message'])
    else:
        result = json.dumps(query['records'])
        response = result

    pg_cursor.close()
    return response
#-- partySearch ---



def getPartyData():
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    idNumber = params.getvalue('id_number')
    objectid = params.getvalue('objectid')

    if idNumber is None:
        queryCondition = 'p.objectid = ' + objectid
        dataChecked = False
    else:
        queryCondition = "p.id_number = ''" + idNumber + "''"
        existsQuery = """SELECT EXISTS (
                            SELECT objectid
                            FROM la_party
                            WHERE id_number = '%s'
                    )""" % idNumber
        pg_cursor.execute(existsQuery)
        dataChecked = pg_cursor.fetchone()['exists']

    if dataChecked:
        sqlCode = ("""
            WITH d AS (
                SELECT * FROM crosstab(
                    'SELECT p.objectid, a.attachment_type::TEXT, json_agg(a.globalid)::TEXT
                    FROM la_party AS p LEFT JOIN party__attach AS a ON p.globalid = a.la_partyid
                    WHERE p.id_number = ''%s''
                    GROUP by 1,2
                    ORDER BY 1,2',
                    '(SELECT ''5'') UNION
                    (SELECT ''3'')'
                ) AS (
                    objectid INTEGER, id_doc JSON, face_photo JSON
                )
            ),
            s AS (
                SELECT json_agg(objectid) AS oid_list
                FROM party
                WHERE id_number = '%s'
            )
            SELECT p.first_name, p.last_name, p.gender, p.party_type, p.globalid,
                p.phone_number, p.id_number,
                p.date_of_birth::varchar AS date_of_birth,
                to_char(p.checked_on, 'dd-Mon-yyyy') AS checked_on,
                d.*,
                s.oid_list
            FROM la_party AS p, d, s
            WHERE id_number = '%s'
        """ % (idNumber, idNumber, idNumber))
    else:
        sqlCode = ("""
            WITH d AS (
                SELECT * FROM crosstab(
                    'SELECT p.objectid, a.attachment_type::TEXT, json_agg(i.globalid)::TEXT
                    FROM party AS p LEFT JOIN partyattachment AS a ON p.globalid = a.party_id
                        LEFT JOIN party__attach AS i on a.globalid = i.rel_globalid
                    WHERE %s
                    GROUP by 1,2
                    ORDER BY 1,2',
                    '(SELECT ''5'') UNION
                    (SELECT ''3'')'
                ) AS (
                    objectid INTEGER, id_doc TEXT, face_photo TEXT
                )
            ),
            r AS (
                SELECT p.id_number, initcap(p.first_name) AS first_name, initcap(p.last_name) AS last_name, p.gender,
                    coalesce (phone_number,'') AS phone_number,
                    coalesce(date_of_birth::varchar, '') AS date_of_birth,
                    false AS checked_on, id_doc, face_photo, json_agg(p.objectid) AS oid_list
                FROM party AS p JOIN d ON (p.objectid = d.objectid)
                GROUP BY 1,2,3,4,5,6,7,8,9
            )
            SELECT id_number, first_name, last_name, gender, phone_number, date_of_birth,
                   checked_on, id_doc::JSON, face_photo::JSON, oid_list
            FROM r
        """ % queryCondition)

    query = db_query(pg_cursor, sqlCode)
    if query['success'] == False:
        response = err_message(query['message'])
    else:
        result = json.dumps(query['records'])
        response = '{"success" : true, "records" : ' + result + '}'

    pg_cursor.close()
    return response
#-- getPartyData ---



def updateParty():
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))
    pg_cursor.execute("""SET datestyle TO 'ISO, MDY'""")

    partyChecked = True if params.getvalue('partyChecked') == 'true' else False
    alreadyChecked = True if params.getvalue('alreadyChecked') == 'true' else False
    knownId = True if params.getvalue('known_id') == 'true' else False
    newPhoneNumber = True if params.getvalue('newPhoneNumber') == 'true' else False

    idNumber = params.getvalue('pf-id_number')
    oidList = params.getvalue('oid_list')

    firstName = params.getvalue('pf-first_name')
    lastName = params.getvalue('pf-last_name')
    dateOfBirth = params.getvalue('pf-date_of_birth')
    gender = params.getvalue('pf-gender')
    phoneNumber = params.getvalue('pf-phone_number')

    response = ''

    if not alreadyChecked:
        sqlCode = "update party set"

        first = True
        if firstName:
            firstName = ' '.join(firstName.split())
            sqlCode += """ first_name = '%s'""" % firstName
            first = False
        if lastName:
            if first is False:
                sqlCode += ','
            else:
                first = False
            lastName = ' '.join(lastName.split())
            sqlCode += """ last_name = '%s'""" % lastName
        if dateOfBirth:
            if first is False:
                sqlCode += ','
            else:
                first = False
            dateOfBirth = dateOfBirth.strip()
            sqlCode += """ date_of_birth = '%s'""" % dateOfBirth
        if phoneNumber:
            if first is False:
                sqlCode += ','
            else:
                first = False
            phoneNumber = phoneNumber.strip()
            sqlCode += """ phone_number = '%s'""" % phoneNumber
        if gender:
            if first is False:
                sqlCode += ','
            else:
                first = False
            sqlCode += """ gender = '%s'""" % gender

        if knownId:
            sqlCondition = """ where id_number = '%s';""" % idNumber
        else:
            if first is False:
                sqlCode += ','
            else:
                first = False
            sqlCode += """ id_number = '%s'""" % idNumber
            sqlCondition = """ where objectid in %s;""" % ('(' + str(oidList)[1:-1] + ')')

        sqlCode += sqlCondition

        if first is False:
            query = db_transaction(pg_cursor, sqlCode)
            if query['success'] == False:
                response = err_message(query['message'])
                pg_cursor.close()
                return response
            else:
                response += ' -[ ' + query['message'] + ' ]- '


    if partyChecked:
        if not alreadyChecked:
            newPhoneNumber = False
            if phoneNumber:
                phoneNumber = "'" + phoneNumber + "'"
            else:
                phoneNumber = 'null'
            laPartyid = '{' + str(uuid4()) + '}'


            sqlCode = """
                update party set la_partyid = '%s'
                where objectid in %s
            """ % (laPartyid, '(' + str(oidList)[1:-1] + ')')

            query = db_transaction(pg_cursor, sqlCode)
            if query['success'] == False:
                response = err_message(query['message'])
                pg_cursor.close()
                return response
            else:
                response += ' -[ ' + query['message'] + ' ]- '

            sqlCode = """
                insert into la_party
                    (first_name, last_name, gender, date_of_birth, party_type, globalid, phone_number,
                    id_number, checked_on)
                select
                    '%s' as first_name,
                    '%s' as last_name,
                    %s as gender,
                    '%s' as date_of_birth,
                    '1' as party_type,
                    '%s' as globalid,
                    %s as phone_number,
                    '%s' as id_number,
                    now()::timestamp(0) as checked_on
                from party
                where id_number = '%s'
                limit 1;
            """ % (firstName, lastName, gender, dateOfBirth,
                laPartyid, phoneNumber, idNumber, idNumber)
            query = db_transaction(pg_cursor, sqlCode)
            if query['success'] == False:
                response = err_message(query['message'])
                pg_cursor.close()
                return response
            else:
                response += ' -[ ' + query['message'] + ' ]- '

        else:
            laPartyid =  params.getvalue('la_partyid')

        if newPhoneNumber:
            sqlCode = """
                update la_party
                set phone_number = '%s'
                where globalid = '%s'
            """ % (phoneNumber, laPartyid)

            query = db_transaction(pg_cursor, sqlCode)
            if query['success'] == False:
                response = err_message(query['message'])
                pg_cursor.close()
                return response + json.dumps(sqlCode)
            else:
                response += ' 1-[ ' + query['message'] + ' ]- '

        face_photos	= json.loads(params.getvalue('face_photos'))
        for item in face_photos:
            update = False
            if not item['new'] and not alreadyChecked:
                sqlCode = """
                    update party__attach
                    set attachment_type = '%s', la_partyid = '%s'
                    where globalid = '%s'
                """ % ('5', laPartyid, item['globalid'])
                query = db_transaction(pg_cursor, sqlCode)
                update = True
            elif item['new']:
                imageName = '../../images/uploads/' + item['globalid'] + '.jpg'
                image = open(imageName, 'rb').read()
                sqlCode = """
                    insert into party__attach
                        (globalid, rel_globalid, la_partyid, attachment_type, content_type, att_name, data_size, data)
                    values
                        ('%s', '%s', '%s', '%s', 'image/jpeg', 'app_attachment.jpg', %s, %s)
                """ % (item['globalid'], laPartyid, laPartyid, '5', os.stat(imageName).st_size, psycopg2.Binary(image))
                query = db_transaction(pg_cursor, sqlCode)
                update = True

            if update:
                if query['success'] == False:
                    response = err_message(query['message'])
                    pg_cursor.close()
                    return response
                else:
                    # os.remove(imageName)
                    response += ' -[ ' + query['message'] + ' ]- '

        id_docs = json.loads(params.getvalue('id_docs'))
        for item in id_docs:
            update = False
            if not item['new'] and not alreadyChecked:
                sqlCode = """
                    update party__attach
                    set attachment_type = '%s', la_partyid = '%s'
                    where globalid = '%s'
                """ % ('3', laPartyid, item['globalid'])
                query = db_transaction(pg_cursor, sqlCode)
                update = True
            elif item['new']:
                imageName = '../../images/uploads/' + item['globalid'] + '.jpg'
                image = open(imageName, 'rb').read()
                sqlCode = """
                    insert into party__attach
                        (globalid, rel_globalid, la_partyid, attachment_type, content_type, att_name, data_size, data)
                    values
                        ('%s', '%s', '%s', '%s', 'image/jpeg', 'app_attachment.jpg', %s, %s)
                """ % (item['globalid'], laPartyid, laPartyid, '3', os.stat(imageName).st_size, psycopg2.Binary(image))
                query = db_transaction(pg_cursor, sqlCode)
                update = True

            if update:
                if query['success'] == False:
                    response = err_message(query['message'])
                    pg_cursor.close()
                    return response
                else:
                    # os.remove(imageName)
                    response += ' -[ ' + query['message'] + ' ]- '

    response = '{"success" : true, "message": "' + response + '" }'

    pg_cursor.execute("commit;")
    pg_cursor.close()

    return response
#-- updateParty ---



def insertParty():
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))
    pg_cursor.execute("""SET datestyle TO 'ISO, MDY'""")

    # ---

    right_id = params.getvalue('right_id')
    su_id = params.getvalue('su_id')

    response = ''

    for party in json.loads(params.getvalue('parties')):
        # find la_partyid if new party already checked
        sqlCode = """
            SELECT globalid
            FROM la_party
            WHERE id_number = '%s'
        """ % (party['id_number'])

        query = db_query(pg_cursor, sqlCode)
        if len(query['records']) == 1:
            la_partyid = "'" + query['records'][0]['globalid'] + "'"
        else:
            la_partyid = 'null'

        # determine the objectid for the new party
        sqlCode = """
            SELECT CASE
                WHEN max(objectid) < 10000 THEN 10000
                ELSE max(objectid) + 1
                END AS objectid
            FROM party
        """
        query = db_query(pg_cursor, sqlCode)
        objectid = str(query['records'][0]['objectid'])

        # add the new party
        phone_number = 'null' if party['phone_number'] == '' else "'"+party['phone_number']+"'"
        sqlCode = """
            INSERT INTO party (objectid, first_name, last_name, date_of_birth, id_number,
                               gender, party_type, globalid, right_id, phone_number, civil_status,
                               housing_subsidy, other_ownership_rights, la_partyid)
            VALUES(%s, '%s', '%s', '%s', '%s', %s, 1,
                   (SELECT '{'||upper((uuid_generate_v4())::text)||'}'),
                   '%s', %s, null, null, null, %s);
        """ % (objectid, party['first_name'], party['last_name'], party['date_of_birth'],
               party['id_number'], party['gender'], right_id, phone_number, la_partyid)

        query = db_transaction(pg_cursor, sqlCode)
        if query['success'] == False:
            response = err_message(query['message'])
            pg_cursor.close()
            return response
        else:
            response += ' -[ ' + query['message'] + ' ]- '


        # update firma_l
        sqlCode = """
            SELECT limitid FROM limites WHERE id_pol = %s;
        """ % (su_id)

        query = db_query(pg_cursor, sqlCode)
        sqlCode = """
            INSERT INTO firma_l VALUES
        """
        comma = False
        for record in query['records']:
            if comma == False:
                comma = True
            else:
                sqlCode += ',\n'
            sqlCode += """(%s, '%s', %s)""" % (str(record['limitid']), right_id, objectid)

        query = db_transaction(pg_cursor, sqlCode)
        if query['success'] == False:
            response = err_message(query['message'])
            pg_cursor.close()
            return response
        else:
            response += ' -[ ' + query['message'] + ' ]- '

    response = '{"success" : true, "message": "' + response + '" }'

    sql_code = """
        REFRESH MATERIALIZED VIEW muestra_limite_view;
        REFRESH MATERIALIZED VIEW concepto_predio_con_vecinos_view;
    """
    query = db_transaction(pg_cursor, sql_code)

    pg_cursor.execute("commit;")
    pg_cursor.close()

    return response
# -- insertParty



#--- main ---
params = cgi.FieldStorage()
operation = params.getvalue('operation')

database = params.getvalue('database')

admin = False
if operation == 'update' or operation == 'insert':
    admin = True

connection_string = connParams(database, admin)
pg = db_connection(connection_string)
if pg['success'] == False:
    response = err_message(pg['message'])
else:
    schema = params.getvalue('schema')
    if operation == 'search':
        response = partySearch(params.getvalue('filter[value]'))
    elif operation == 'data':
        response = getPartyData()
    elif operation == 'update':
        response = updateParty()
    elif operation == 'insert':
        response = insertParty()
    else:
        response = """{"success" : false, "message" : "Operation '%s' not recognized!!!"}""" % operation

print ("Content-type: application/json")
print ()
print (response)