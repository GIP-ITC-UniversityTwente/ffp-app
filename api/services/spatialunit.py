#!C:\ms4w\Python\python.exe

import cgi
import json
from psql import db_query, db_transaction, db_connection, connParams
from psycopg2.extras import RealDictCursor


def err_message(err):
    return '{"success" : false, "message" : ' + json.dumps(str(err)) + '}'
#-- err_message --



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



def getEditingData(suId, srid):
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
            p.id_number, p.right_id AS right_id
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
        WITH gc AS (
            SELECT ST_Force2D(geom) as geom, count(geom), json_agg(pto) AS pto_list
            FROM puntos_predio
            GROUP BY ST_Force2D(geom)
        )
        SELECT p.pto, p.num_pto, p.label, gc.count, gc.pto_list,
        	('[ ' || st_x(p.geom) || ', ' || st_y(p.geom) || ' ]')::json as wgscoords
        FROM puntos_predio AS p LEFT JOIN gc ON ST_Force2D(p.geom) = gc.geom
        WHERE p.id_pol = %s
        ORDER BY p.num_pto
    """ % (suId))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += ', "points" : ' + result

    #-----

    pg_cursor.close()
    return '{"success" : true, ' + response + '}'
#-- getEditingData ---



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



def checkSpatialunits():
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    #-----

    response = ''
    validity_code = ''
    validityCode = ''
    overlap_code = ''
    overlapCode = ''
    suList = ''
    union = False

    for record in json.loads(params.getvalue('records')):
        if union == False:
            union = True
        else:
            validityCode = ' UNION '
            overlapCode = ' UNION '
            suList += ', '
        validityCode += ("SELECT %s AS su_id, ST_GeomFromText('POLYGON((" % (record['su_id']))
        overlapCode += ("SELECT %s AS su_id, ST_GeomFromText('POLYGON((" % (record['su_id']))
        suList += str(record['su_id'])
        for point in record['points']:
            validityCode += ' '.join(map(str, point['coords'])) + ','
            overlapCode += ' '.join(map(str, point['wgscoords'])) + ','

        validityCode += ' '.join(map(str, record['points'][0]['coords'])) + '))'
        overlapCode += ' '.join(map(str, record['points'][0]['wgscoords'])) + '))'
        validity_code += validityCode + "', 3857) AS geom "
        overlap_code += overlapCode + "', 4326) AS geom "

    sql_code = ("""
        WITH g AS (
            %s
        )
        SELECT su_id, ST_IsValid(geom) as isvalid,
               reason(ST_IsValidDetail(geom)),
               ST_AsText(location(ST_IsValidDetail(geom))) as location
        FROM g
    """ % (validity_code))

    query = db_query(pg_cursor, sql_code)
    if query['success'] == False:
        response = err_message(query['message'])
        pg_cursor.close()
        return response
    else:
        result = json.dumps(query['records'])
        response += '"validity" : ' + result

        isValid = True
        for item in query['records']:
            if not item['isvalid']:
                isValid = False

        if isValid:
            sql_code = ("""
                WITH g AS (
                    %s
                ),
                u1 AS (
                    SELECT ST_Union(geom) AS src_geom
                    FROM g
                ),
                u2 AS (
                    SELECT ST_Union(geom) AS trg_geom
                    FROM inspection.spatialunit
                    WHERE objectid NOT IN (%s)
                )
                SELECT ST_Overlaps(u1.src_geom, u2.trg_geom) AS overlaps,
                    ST_AsGeoJSON(ST_Transform(ST_CollectionExtract(ST_Intersection(u1.src_geom, u2.trg_geom)), 3857))::json AS overlap_geom
                FROM u1, u2
            """ % (overlap_code, suList))

            query = db_query(pg_cursor, sql_code)
            if query['success'] == False:
                response = err_message(query['message'])
                pg_cursor.close()
                return response
            else:
                result = json.dumps(query['records'][0])
                response += ', "topology" : ' + result

    pg_cursor.close()
    return '{"success" : true, ' + response + '}'
# -- checkSpatialunits ---



def updateSpatialunits():
    pg_cursor = pg['conn'].cursor(cursor_factory=RealDictCursor)
    pg_cursor.execute("""SET search_path = %s, public""" % (schema))

    #-----

    response = ''

    for record in json.loads(params.getvalue('records')):
        sqlCode = ''
        su_id = str(record['su_id'])

        if len(record['removed_points']) > 0:
            for point in record['removed_points']:
                sqlCode += ("""
                    DELETE FROM puntos_predio
                    WHERE pto = %s;
                """ % (point['pto']))

        for point in record['points']:
            if point['status'] == 1:
                coords = ','.join([str(c) for c in point['wgscoords']])
                sqlCode += ("""
                    UPDATE puntos_predio
                    SET geom = ST_Force4D(ST_Point(%s, 4326))
                    WHERE id_pol = %s AND num_pto = %s;
                """ % (coords, su_id, str(point['num_pto'])))
            elif point['status'] == 2:
                sqlCode += ("""
                    UPDATE puntos_predio
                    SET num_pto = num_pto + 1
                    WHERE id_pol = %s AND num_pto >= %s;
                """ % (su_id, str(point['num_pto'])))

                coords = ','.join([str(c) for c in point['wgscoords']])
                sqlCode += ("""
                    INSERT INTO puntos_predio VALUES (
                        (SELECT MAX(pto) FROM puntos_predio) + 1,
                        %s, %s, 'T', 0,
                        ST_Force4D(ST_Point(%s, 4326))
                    );
                """ % (su_id, str(point['num_pto']), coords))

        sqlCode += ("""
                SELECT actualice_geom_predio(%s);
                SELECT reemplaza_limite(%s);
        """ % (su_id, su_id))

        query = db_transaction(pg_cursor, sqlCode)
        if query['success'] == False:
            response = err_message(query['message'])
            pg_cursor.close()
            return response
        else:
            response = ' -[ ' + query['message'] + ' ]- '


    response = '{"success" : true, "message": "' + response + '" }'

    pg_cursor.execute("commit;")
    pg_cursor.close()

    return response
#-- updateSpatialunit



#--- main ---
params = cgi.FieldStorage()
operation = params.getvalue('operation')
database = params.getvalue('database')

connection_string = connParams(database, True if operation == 'update' else False)
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
    elif operation == 'edit':
        suId = params.getvalue('su_id')
        srid = params.getvalue('srid')
        response = getEditingData(suId, srid)
    elif operation == 'check':
        response = checkSpatialunits()
    elif operation == 'update':
        response = updateSpatialunits()
    else:
        response = """{"success" : false, "message" : "Operation '%s' not recognized!!!"}""" % operation

print ("Content-type: application/json")
print ()
print (response)