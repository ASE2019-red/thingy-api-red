--
-- PostgreSQL database dump
--

-- Dumped from database version 11.5
-- Dumped by pg_dump version 11.5

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

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: coffee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coffee (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "machineId" uuid
);


ALTER TABLE public.coffee OWNER TO postgres;

--
-- Name: machine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.machine (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    "sensorIdentifier" text NOT NULL,
    active boolean NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "maintenanceThreshold" integer
);


ALTER TABLE public.machine OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "hashedPassword" text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: coffee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coffee (id, "createdAt", "updatedAt", "machineId") FROM stdin;
9815b727-08ba-444a-a561-39bddd87716c	2019-11-06 18:39:57.528635	2019-11-06 18:39:57.528635	1b607aec-d887-4586-b8ba-c52d28dbfcbe
f58d7825-4d9a-4757-a22c-abfb87622ea1	2019-11-06 18:40:00.078374	2019-11-06 18:40:00.078374	1b607aec-d887-4586-b8ba-c52d28dbfcbe
9b9bf152-73c7-45d7-81b2-6ec6b40014ba	2019-11-06 18:40:00.467716	2019-11-06 18:40:00.467716	1b607aec-d887-4586-b8ba-c52d28dbfcbe
f84a4b6c-b38d-48db-a232-d4586cc31209	2019-11-06 18:40:00.705176	2019-11-06 18:40:00.705176	1b607aec-d887-4586-b8ba-c52d28dbfcbe
3e1bfef5-e61a-4b2b-9cee-a60d334733b4	2019-11-06 18:40:00.86786	2019-11-06 18:40:00.86786	1b607aec-d887-4586-b8ba-c52d28dbfcbe
f5051d04-2f91-4962-8a8d-2541791ca6d6	2019-11-06 18:40:01.037524	2019-11-06 18:40:01.037524	1b607aec-d887-4586-b8ba-c52d28dbfcbe
0b07ed7d-7a27-40ff-ad2d-f0ee4d92a786	2019-11-06 18:40:01.224208	2019-11-06 18:40:01.224208	1b607aec-d887-4586-b8ba-c52d28dbfcbe
c8e1ee58-3b4f-4c83-9671-9192ab3f6896	2019-11-06 18:40:01.374066	2019-11-06 18:40:01.374066	1b607aec-d887-4586-b8ba-c52d28dbfcbe
a2cc412a-d603-4a02-83aa-b5af346930c8	2019-11-06 18:40:01.572979	2019-11-06 18:40:01.572979	1b607aec-d887-4586-b8ba-c52d28dbfcbe
cb1e0696-e72b-4d38-95a7-a1709042bf17	2019-11-06 18:40:01.760871	2019-11-06 18:40:01.760871	1b607aec-d887-4586-b8ba-c52d28dbfcbe
d01f6122-5e82-4ee0-87e1-c44c09ada930	2019-11-06 18:40:01.896573	2019-11-06 18:40:01.896573	1b607aec-d887-4586-b8ba-c52d28dbfcbe
87705751-512b-42cb-b9ae-9824e0fef1c1	2019-11-06 18:40:02.107701	2019-11-06 18:40:02.107701	1b607aec-d887-4586-b8ba-c52d28dbfcbe
fd19d384-c64d-4eae-9782-c51eedba2e75	2019-11-06 18:40:02.181149	2019-11-06 18:40:02.181149	1b607aec-d887-4586-b8ba-c52d28dbfcbe
8afd8ac3-0880-4693-a800-e7c0d0d47d54	2019-11-06 18:40:02.438257	2019-11-06 18:40:02.438257	1b607aec-d887-4586-b8ba-c52d28dbfcbe
d8c5adb4-e527-460b-8ce9-cf08c4e34e41	2019-11-06 18:40:36.874073	2019-11-06 18:40:36.874073	577d4eea-050c-406c-b300-5ebaaac3c9ea
\.


--
-- Data for Name: machine; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.machine (id, name, "sensorIdentifier", active, "createdAt", "updatedAt", "maintenanceThreshold") FROM stdin;
1b607aec-d887-4586-b8ba-c52d28dbfcbe	testmachine	e8:e0:72:6b:92:a3	t	2019-11-06 18:37:58.727858	2019-11-06 18:37:58.727858	\N
690c6ccc-c0b1-4a1c-92f1-2bd037132ddf	insomnia	nop	t	2019-11-07 13:28:01.983123	2019-11-07 13:28:01.983123	\N
577d4eea-050c-406c-b300-5ebaaac3c9ea	fakemachine	e8:e0:72:6b:92:a3	f	2019-11-06 18:38:39.615769	2019-11-06 18:38:39.615769	25
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, "hashedPassword", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: coffee PK_4d27239ee0b99a491ad806aec46; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coffee
    ADD CONSTRAINT "PK_4d27239ee0b99a491ad806aec46" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: machine PK_acc588900ffa841d96eb5fd566c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.machine
    ADD CONSTRAINT "PK_acc588900ffa841d96eb5fd566c" PRIMARY KEY (id);


--
-- Name: coffee FK_aa456daad09aa43b915f41e6c87; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coffee
    ADD CONSTRAINT "FK_aa456daad09aa43b915f41e6c87" FOREIGN KEY ("machineId") REFERENCES public.machine(id);


--
-- PostgreSQL database dump complete
--

