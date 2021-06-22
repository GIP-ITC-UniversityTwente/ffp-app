-- ---
-- Code to generate required DB components for the public inspection app
-- ---

BEGIN;

	CREATE EXTENSION IF NOT EXISTS postgis;
	CREATE EXTENSION IF NOT EXISTS tablefunc;
	CREATE EXTENSION IF NOT EXISTS unaccent;
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    --

	SET search_path = inspection;

	--

        ALTER TABLE party
            ADD COLUMN IF NOT EXISTS la_partyid character varying;  -- Check with Alvaro

        ALTER TABLE party__attach
            ADD COLUMN IF NOT EXISTS la_partyid character varying;  -- Check with Alvaro

        --

        CREATE TABLE IF NOT EXISTS la_party
        (
            objectid integer NOT NULL DEFAULT nextval('inspection.la_party_objectid_seq'::regclass),
            globalid character varying COLLATE pg_catalog."default" NOT NULL,
            first_name character varying(150) COLLATE pg_catalog."default" NOT NULL,
            last_name character varying(150) COLLATE pg_catalog."default" NOT NULL,
            gender character varying(50) COLLATE pg_catalog."default" NOT NULL,
            party_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
            phone_number character varying(150) COLLATE pg_catalog."default",
            id_number character varying(20) COLLATE pg_catalog."default",
            date_of_birth timestamp without time zone,
            created_on timestamp without time zone,
            checked_on timestamp without time zone,
            CONSTRAINT la_party_pk PRIMARY KEY (objectid),
            CONSTRAINT la_party_globalid_uk UNIQUE (globalid),
            CONSTRAINT la_party_ldnumber_uk UNIQUE (id_number)
        );

	--
	-- Views
	--

	CREATE OR REPLACE VIEW v_firma_l
	AS
	SELECT f.limitid,
		f.limitid / 100 AS predio,
		f.limitid % 100 AS limite,
		(upper(pt.first_name::text) || ' '::text) || upper(pt.last_name::text) AS nombre,
		pt.objectid AS id_party,
		f.concepto,
		f.fecha,
		f.titulo,
		f.remarks
   	FROM inspection.firma_l f
     	LEFT JOIN party pt ON f.globalid::text = pt.right_id::text;

	--

	DROP VIEW IF EXISTS v_firma_l_crt;

    CREATE OR REPLACE VIEW v_firma_l_crt
    AS
    SELECT f.limitid,
        f.limitid / 100 AS predio,
        f.limitid % 100 AS limite,
        (upper(pt.first_name::text) || ' '::text) || upper(pt.last_name::text) AS nombre,
        pt.id_number,
        pt.objectid AS party_id,
        pt.objectid AS id_party,
        f.concepto,
        f.fecha,
        f.titulo
    FROM firma_l f
        LEFT JOIN party pt ON f.globalid::text = pt.right_id::text;


	--

	DROP VIEW IF EXISTS revisa_limite_crt;

    CREATE OR REPLACE VIEW revisa_limite_crt
    AS
    SELECT c_t.limit1 AS limite,
        c_t.pol1,
        vfl_1.nombre AS nombre1,
        vfl_1.party_id AS party_id1,
        vfl_1.id_number AS id_number1,
        vfl_1.concepto AS concepto1,
        c_t.pol2,
        vfl_2.nombre AS nombre2,
        vfl_2.party_id AS party_id2,
        vfl_2.id_number AS id_number2,
        vfl_2.concepto AS concepto2
    FROM c_t,
        v_firma_l_crt vfl_1,
        v_firma_l_crt vfl_2
    WHERE c_t.limit1 = vfl_1.limitid AND c_t.limit2 = vfl_2.limitid
    ORDER BY c_t.limit1;

	--

	DROP VIEW IF EXISTS revisa_limite;

	CREATE OR REPLACE VIEW revisa_limite		-- Check with Alvaro
	AS
	SELECT c_t.limit1 AS limite1,
		c_t.pol1,
		vfl_1.nombre AS nombre1,
		vfl_1.concepto AS concepto1,
		c_t.pol2,
		vfl_2.nombre AS nombre2,
		vfl_2.concepto AS concepto2,
		c_t.limit2 AS limite2
	FROM c_t,
		v_firma_l vfl_1,
		v_firma_l vfl_2
	WHERE c_t.limit1 = vfl_1.limitid AND c_t.limit2 = vfl_2.limitid
	ORDER BY c_t.limit1;

	--

	DROP MATERIALIZED VIEW IF EXISTS muestra_limite_view;

	CREATE MATERIALIZED VIEW muestra_limite_view
    AS
    SELECT limitid, estate as status
    FROM muestra_limite;

    --

	DROP MATERIALIZED VIEW IF EXISTS concepto_predio_con_vecinos_view;

	CREATE MATERIALIZED VIEW concepto_predio_con_vecinos_view
    AS
    SELECT vr.predio,
        f.limitid,
        f.id_party,
        vr.vecino,
        vr.nombre_vecino,
        f.concepto,
        f.fecha,
        f.remarks
        -- ,json_build_object('type', 'Feature', 'id', l.limitid, 'geometry', st_asgeojson(l.geom)::json, 'properties', json_build_object('limitid', l.limitid)) AS geom
    --FROM v_firma_l f
    FROM firma_l f
        JOIN c_t c ON f.limitid = c.limit1
        --JOIN limites l ON l.limitid = f.limitid
        ,vecinos_representantes vr
    WHERE c.pol1 = vr.predio AND c.pol2 = vr.vecino;

	--

	ALTER TABLE muestra_limite_view
        OWNER TO kadaster_admin;
    ALTER TABLE concepto_predio_con_vecinos_view
        OWNER TO kadaster_admin;

	--
	--	Triggers
	--

	CREATE TABLE IF NOT EXISTS status_log
	(
		limitid integer,
		rightid character varying,
		id_party integer,
		concept boolean,
		signed_on date,
		remarks character varying,
		signature character varying,
		fingerprint bytea,
		details character varying,
		changed_on timestamp
	);

	--

	CREATE TABLE IF NOT EXISTS signature_log
	(
		party_id integer,
		signed_on date,
		signature character varying,
		fingerprint bytea,
		details character varying
	);

	--

	CREATE OR REPLACE FUNCTION log_signature() RETURNS TRIGGER
	AS $$
		BEGIN
			INSERT INTO signature_log(party_id, signed_on, signature, fingerprint, details)
			VALUES (NEW.party_id, NEW.signed_on, NEW.signature, NEW.fingerprint, NEW.details);
			RETURN NEW;
		END;
	$$ LANGUAGE plpgsql;
	--
    DROP TRIGGER IF EXISTS signature_trigger ON boundary_signature;
	CREATE TRIGGER signature_trigger
		BEFORE INSERT OR UPDATE ON boundary_signature
		FOR EACH ROW
		EXECUTE PROCEDURE log_signature();

	--

	CREATE OR REPLACE FUNCTION log_status() RETURNS TRIGGER
	AS $$
		BEGIN
			IF OLD.concepto is null OR NEW.concepto <> OLD.concepto THEN
				WITH d AS (
					SELECT *
					FROM signature_log
				)
				INSERT INTO status_log(limitid, rightid, id_party, concept, signed_on,
												remarks, signature, fingerprint, details, changed_on)
				SELECT NEW.limitid, NEW.globalid, NEW.id_party, NEW.concepto, signed_on, NEW.remarks,
					d.signature, d.fingerprint, d.details, now()
				FROM d
				WHERE d.party_id = NEW.id_party;
			END IF;
			RETURN NEW;
		END;
	$$ LANGUAGE plpgsql;
	--
	DROP TRIGGER IF EXISTS status_trigger ON firma_l;
	CREATE TRIGGER status_trigger
		BEFORE UPDATE ON firma_l
		FOR EACH ROW
		EXECUTE PROCEDURE log_status();

	--

    CREATE SCHEMA IF NOT EXISTS basedata;
    GRANT USAGE ON SCHEMA basedata TO kadaster;
    ALTER DEFAULT PRIVILEGES IN SCHEMA basedata GRANT SELECT ON TABLES TO kadaster;

    GRANT USAGE ON SCHEMA inspection TO kadaster, kadaster_admin;
    GRANT SELECT ON ALL TABLES IN SCHEMA basedata TO kadaster;
    GRANT SELECT ON ALL TABLES IN SCHEMA inspection TO kadaster;
    GRANT ALL ON ALL TABLES IN SCHEMA inspection TO kadaster_admin;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA inspection TO kadaster_admin;

END;
