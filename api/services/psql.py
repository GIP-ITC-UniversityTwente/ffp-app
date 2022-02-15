#!C:\ms4w\Python\python.exe

import psycopg2
import json


# -----
# ----- Connect to the database returning a connection object or an error message
# -----
def db_connection(connection_string):
    result = dict()

    try:
        pg = psycopg2.connect(connection_string)
    except Exception as err:
        result['success'] = False
        result['message'] = err
    else:
        result['success'] = True
        result['conn'] = pg

    return result


# -----
# ----- Execute a query returning the resulting records or an error message
# -----
def db_query(cursor, code):
    result = dict()

    try:
        cursor.execute(code)
    except Exception as err:
        result['success'] = False
        result['message'] = err
    else:
        result['success'] = True
        result['records'] = cursor.fetchall()
    return result


# -----
# ----- Execute an update or insert and return a succes message or an error message
# -----
def db_transaction(cursor, code):
    result = dict()

    try:
        cursor.execute(code)
    except Exception as err:
        result['success'] = False
        result['message'] = err
    else:
        result['success'] = True
        result['message'] = cursor.statusmessage
    return result


# -----
# ----- Generate connection parameters
# -----
def connParams(database, admin = False):
    file = open('params.json')
    dbparams = json.loads(str(file.read()))

    if admin == True:
        file = open('.params')
        adminParams = json.loads(str(file.read()))
        dbparams['user'] = adminParams['user']
        dbparams['password'] = adminParams['password']

    return ("""dbname='%s' host='%s' port='%s' user='%s' password='%s'"""
            % (database, dbparams['host'], dbparams['port'], dbparams['user'], dbparams['password']))
