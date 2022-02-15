--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

-- Started on 2022-02-04 10:02:13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 350 (class 1259 OID 44131)
-- Name: codelist; Type: TABLE; Schema: inspection; Owner: -
--

CREATE TABLE inspection.codelist (
    objectid integer NOT NULL,
    description character varying NOT NULL,
    value integer NOT NULL,
    en character varying NOT NULL,
    es character varying NOT NULL
);


--
-- TOC entry 349 (class 1259 OID 44130)
-- Name: codelist_objectid_seq1; Type: SEQUENCE; Schema: inspection; Owner: -
--

CREATE SEQUENCE inspection.codelist_objectid_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4779 (class 0 OID 0)
-- Dependencies: 349
-- Name: codelist_objectid_seq1; Type: SEQUENCE OWNED BY; Schema: inspection; Owner: -
--

ALTER SEQUENCE inspection.codelist_objectid_seq1 OWNED BY inspection.codelist.objectid;


--
-- TOC entry 4575 (class 2604 OID 44134)
-- Name: codelist objectid; Type: DEFAULT; Schema: inspection; Owner: -
--

ALTER TABLE ONLY inspection.codelist ALTER COLUMN objectid SET DEFAULT nextval('inspection.codelist_objectid_seq1'::regclass);


--
-- TOC entry 4773 (class 0 OID 44131)
-- Dependencies: 350
-- Data for Name: codelist; Type: TABLE DATA; Schema: inspection; Owner: -
--

INSERT INTO inspection.codelist VALUES (1, 'yesno', 0, 'No', 'No');
INSERT INTO inspection.codelist VALUES (2, 'yesno', 1, 'Yes', 'Si');
INSERT INTO inspection.codelist VALUES (3, 'spatialunittype', 1, 'House', 'Casa');
INSERT INTO inspection.codelist VALUES (4, 'spatialunittype', 2, 'House Lot', 'Casa Lote');
INSERT INTO inspection.codelist VALUES (5, 'spatialunittype', 3, 'Business', 'Negocio');
INSERT INTO inspection.codelist VALUES (6, 'spatialunittype', 4, 'Farm', 'Finca');
INSERT INTO inspection.codelist VALUES (7, 'spatialunittype', 0, 'Other', 'Otro');
INSERT INTO inspection.codelist VALUES (8, 'gender', 1, 'Male', 'Masculino');
INSERT INTO inspection.codelist VALUES (9, 'gender', 2, 'Female', 'Femenino');
INSERT INTO inspection.codelist VALUES (10, 'civilstatus', 1, 'Single', 'Soltero(a)');
INSERT INTO inspection.codelist VALUES (11, 'civilstatus', 2, 'Married', 'Casado(a)');
INSERT INTO inspection.codelist VALUES (12, 'civilstatus', 3, 'Living Common', 'Unión Libre');
INSERT INTO inspection.codelist VALUES (13, 'righttype', 1, 'Ownership', 'Dominio o Propiedad');
INSERT INTO inspection.codelist VALUES (14, 'righttype', 2, 'Common Ownership', 'Propiedad Comunitaria');
INSERT INTO inspection.codelist VALUES (15, 'righttype', 3, 'Tenancy', 'Arriendo');
INSERT INTO inspection.codelist VALUES (16, 'righttype', 4, 'Usufruct', 'Usufructo');
INSERT INTO inspection.codelist VALUES (17, 'righttype', 5, 'Customary', 'Consuetudinario');
INSERT INTO inspection.codelist VALUES (18, 'righttype', 6, 'Occupation', 'Ocupación');
INSERT INTO inspection.codelist VALUES (19, 'righttype', 7, 'Ownership Assumed', 'Posesión');
INSERT INTO inspection.codelist VALUES (20, 'righttype', 8, 'Superficies', 'Superficies');
INSERT INTO inspection.codelist VALUES (21, 'righttype', 9, 'Mining', 'Minero');
INSERT INTO inspection.codelist VALUES (22, 'righttype', 0, 'Unknown', 'Desconocido');
INSERT INTO inspection.codelist VALUES (23, 'righttype', 99, 'Conflict', 'Conflicto');
INSERT INTO inspection.codelist VALUES (24, 'rightsource', 1, 'Title', 'Titulo');
INSERT INTO inspection.codelist VALUES (25, 'rightsource', 2, 'Deed', 'Escritura');
INSERT INTO inspection.codelist VALUES (26, 'rightsource', 3, 'Verbal Agreement', 'Acuerdo Verbal');
INSERT INTO inspection.codelist VALUES (27, 'rightsource', 4, 'Purchase Agreement', 'Carta de Compraventa');
INSERT INTO inspection.codelist VALUES (28, 'rightsource', 5, 'Adjudication', 'Adjudicación');
INSERT INTO inspection.codelist VALUES (29, 'rightsource', 6, 'Prescription', 'Prescripción');
INSERT INTO inspection.codelist VALUES (30, 'rightsource', 7, 'Inheritance', 'Herencia');
INSERT INTO inspection.codelist VALUES (31, 'rightsource', 0, 'Other', 'Otro');
INSERT INTO inspection.codelist VALUES (32, 'landuse', 1, 'Agriculture', 'Agricultura');
INSERT INTO inspection.codelist VALUES (33, 'landuse', 2, 'Cattle Raising', 'Ganadería');
INSERT INTO inspection.codelist VALUES (34, 'landuse', 3, 'Residential', 'Residencial');
INSERT INTO inspection.codelist VALUES (35, 'landuse', 4, 'Commercial', 'Comercial');
INSERT INTO inspection.codelist VALUES (36, 'landuse', 5, 'Industrial', 'Industrial');
INSERT INTO inspection.codelist VALUES (37, 'landuse', 6, 'Conservation', 'Conservación');
INSERT INTO inspection.codelist VALUES (38, 'landuse', 7, 'Government', 'Gubernamental');
INSERT INTO inspection.codelist VALUES (39, 'landuse', 9, 'Mixed', 'Mixto');
INSERT INTO inspection.codelist VALUES (40, 'landuse', 0, 'None', 'Ninguno');
INSERT INTO inspection.codelist VALUES (41, 'rightattachment', 1, 'Title', 'Titulo');
INSERT INTO inspection.codelist VALUES (42, 'rightattachment', 2, 'Deed', 'Escritura');
INSERT INTO inspection.codelist VALUES (43, 'rightattachment', 3, 'Utility Receipt', 'Recibo Servicios Públicos');
INSERT INTO inspection.codelist VALUES (44, 'rightattachment', 4, 'Purchase Agreement', 'Carta de Compraventa');
INSERT INTO inspection.codelist VALUES (45, 'rightattachment', 5, 'Tax Receipt', 'Recibo de Impuestos');
INSERT INTO inspection.codelist VALUES (46, 'rightattachment', 6, 'Certificate of Honest Posseion', 'Certificado de Sana Posesión');
INSERT INTO inspection.codelist VALUES (47, 'rightattachment', 7, 'Certificate of Tradition and Freedom', 'Certiificado de Tradicion y Libertad');
INSERT INTO inspection.codelist VALUES (48, 'rightattachment', 0, 'Other', 'Otro');
INSERT INTO inspection.codelist VALUES (49, 'partyattachment', 1, 'ID Card Minor', 'Tarjeta de Identidad');
INSERT INTO inspection.codelist VALUES (50, 'partyattachment', 2, 'ID Card Foreigner', 'Cedula de Extranjería');
INSERT INTO inspection.codelist VALUES (51, 'partyattachment', 3, 'ID Card', 'Cedula de Ciudadanía');
INSERT INTO inspection.codelist VALUES (52, 'partyattachment', 4, 'Passport', 'Pasaporte');
INSERT INTO inspection.codelist VALUES (53, 'partyattachment', 5, 'Face Photo', 'Foto del Rostro');
INSERT INTO inspection.codelist VALUES (54, 'partyattachment', 6, 'Fingerprint', 'Huella Digital');
INSERT INTO inspection.codelist VALUES (55, 'partyattachment', 7, 'Signature', 'Firma');
INSERT INTO inspection.codelist VALUES (56, 'partyattachment', 0, 'Other', 'Otro');


--
-- TOC entry 4780 (class 0 OID 0)
-- Dependencies: 349
-- Name: codelist_objectid_seq1; Type: SEQUENCE SET; Schema: inspection; Owner: -
--

SELECT pg_catalog.setval('inspection.codelist_objectid_seq1', 56, true);


--
-- TOC entry 4577 (class 2606 OID 44138)
-- Name: codelist codelist_pk; Type: CONSTRAINT; Schema: inspection; Owner: -
--

ALTER TABLE ONLY inspection.codelist
    ADD CONSTRAINT codelist_pk PRIMARY KEY (objectid);


-- Completed on 2022-02-04 10:02:14

--
-- PostgreSQL database dump complete
--

