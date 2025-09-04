--
-- PostgreSQL database dump
--

\restrict qrhLpOhevJDEn0nsoR33PhR7XryLyQAqb40Njdwq3jmdQAveDnQwbVBKjwIFUSh

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: space_vision; Type: DATABASE; Schema: -; Owner: root
--

CREATE DATABASE space_vision WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';


ALTER DATABASE space_vision OWNER TO root;

\unrestrict qrhLpOhevJDEn0nsoR33PhR7XryLyQAqb40Njdwq3jmdQAveDnQwbVBKjwIFUSh
\connect space_vision
\restrict qrhLpOhevJDEn0nsoR33PhR7XryLyQAqb40Njdwq3jmdQAveDnQwbVBKjwIFUSh

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: root
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO root;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: root
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO root;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: root
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO root;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: root
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: bluetide_usage; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.bluetide_usage (
    id integer NOT NULL,
    date text NOT NULL,
    kitp text NOT NULL,
    name text,
    usage_gb real,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bluetide_usage OWNER TO root;

--
-- Name: bluetide_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.bluetide_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bluetide_usage_id_seq OWNER TO root;

--
-- Name: bluetide_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.bluetide_usage_id_seq OWNED BY public.bluetide_usage.id;


--
-- Name: group_access; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.group_access (
    id integer NOT NULL,
    role text NOT NULL,
    group_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.group_access OWNER TO root;

--
-- Name: group_access_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.group_access_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_access_id_seq OWNER TO root;

--
-- Name: group_access_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.group_access_id_seq OWNED BY public.group_access.id;


--
-- Name: mikrotik_vessels; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.mikrotik_vessels (
    id integer NOT NULL,
    vessel_name text NOT NULL,
    router_ip text,
    api_port integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.mikrotik_vessels OWNER TO root;

--
-- Name: mikrotik_vessels_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.mikrotik_vessels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mikrotik_vessels_id_seq OWNER TO root;

--
-- Name: mikrotik_vessels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.mikrotik_vessels_id_seq OWNED BY public.mikrotik_vessels.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    current_db character varying(100),
    session_data jsonb,
    ip_address character varying(45),
    user_agent text,
    is_active boolean DEFAULT true,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    token character varying(255)
);


ALTER TABLE public.sessions OWNER TO root;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO root;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: starlink_usage; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.starlink_usage (
    id integer NOT NULL,
    date_key text NOT NULL,
    kit_number text NOT NULL,
    vessel_name text,
    mobile_priority_gb real,
    standard_gb real,
    chargebee_subscription_id text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    usage_limit_gb real,
    public_ip_enabled boolean
);


ALTER TABLE public.starlink_usage OWNER TO root;

--
-- Name: starlink_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.starlink_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.starlink_usage_id_seq OWNER TO root;

--
-- Name: starlink_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.starlink_usage_id_seq OWNED BY public.starlink_usage.id;


--
-- Name: telephony_dids; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.telephony_dids (
    id integer NOT NULL,
    number text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone,
    channels_included_count integer,
    dedicated_channels_count integer,
    blocked boolean DEFAULT false,
    terminated boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now(),
    channels_included integer,
    dedicated_channels integer
);


ALTER TABLE public.telephony_dids OWNER TO root;

--
-- Name: telephony_dids_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.telephony_dids_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.telephony_dids_id_seq OWNER TO root;

--
-- Name: telephony_dids_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.telephony_dids_id_seq OWNED BY public.telephony_dids.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(200),
    description text,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    is_system boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_roles OWNER TO root;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_roles_id_seq OWNER TO root;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    full_name character varying(200),
    username character varying(100),
    role_id integer,
    is_active boolean DEFAULT true,
    is_email_verified boolean DEFAULT false,
    email_verification_token character varying(255),
    password_reset_token character varying(255),
    password_reset_expires timestamp without time zone,
    mfa_enabled boolean DEFAULT false,
    mfa_secret text,
    last_login_at timestamp without time zone,
    profile_picture character varying(500),
    bio text,
    preferences jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO root;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO root;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vessel_groups; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.vessel_groups (
    id integer NOT NULL,
    group_name text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vessel_groups OWNER TO root;

--
-- Name: vessel_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.vessel_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vessel_groups_id_seq OWNER TO root;

--
-- Name: vessel_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.vessel_groups_id_seq OWNED BY public.vessel_groups.id;


--
-- Name: vessels; Type: TABLE; Schema: public; Owner: root
--

CREATE TABLE public.vessels (
    id integer NOT NULL,
    vesselskit_number text NOT NULL,
    name text,
    subscription_plan text,
    group_id integer,
    device_id text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vessels OWNER TO root;

--
-- Name: vessels_id_seq; Type: SEQUENCE; Schema: public; Owner: root
--

CREATE SEQUENCE public.vessels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vessels_id_seq OWNER TO root;

--
-- Name: vessels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: root
--

ALTER SEQUENCE public.vessels_id_seq OWNED BY public.vessels.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: root
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: bluetide_usage id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.bluetide_usage ALTER COLUMN id SET DEFAULT nextval('public.bluetide_usage_id_seq'::regclass);


--
-- Name: group_access id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.group_access ALTER COLUMN id SET DEFAULT nextval('public.group_access_id_seq'::regclass);


--
-- Name: mikrotik_vessels id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.mikrotik_vessels ALTER COLUMN id SET DEFAULT nextval('public.mikrotik_vessels_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: starlink_usage id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.starlink_usage ALTER COLUMN id SET DEFAULT nextval('public.starlink_usage_id_seq'::regclass);


--
-- Name: telephony_dids id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.telephony_dids ALTER COLUMN id SET DEFAULT nextval('public.telephony_dids_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vessel_groups id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.vessel_groups ALTER COLUMN id SET DEFAULT nextval('public.vessel_groups_id_seq'::regclass);


--
-- Name: vessels id; Type: DEFAULT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.vessels ALTER COLUMN id SET DEFAULT nextval('public.vessels_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: root
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	903ee411aba04918dd0cebbb76fe1165acca3327d630f9283fd0efce527f2c13	1756820900000
2	279721ef15b06510bcb1b6e093fb4517563d4efe94e7fe13d7fee1f85d3f0d7b	1756822467814
3	cba50075fadb41846b08814569f6392c8d6fa5df1c313ff459c9dbfbabbbd514	1757003259770
4	7c37c2e2e0d88c57446a38c241535d8aa0db8bca6da9ca4640bbba680382f438	1757003443177
\.


--
-- Data for Name: bluetide_usage; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.bluetide_usage (id, date, kitp, name, usage_gb, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: group_access; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.group_access (id, role, group_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mikrotik_vessels; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.mikrotik_vessels (id, vessel_name, router_ip, api_port, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.sessions (id, user_id, current_db, session_data, ip_address, user_agent, is_active, expires_at, created_at, updated_at, token) FROM stdin;
7	1	default	{"loginTime": "2025-09-04T11:22:31.588Z"}	\N	\N	t	2025-09-05 11:22:31.588	2025-09-04 11:22:31.595671	2025-09-04 11:22:31.595671	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBhZG1pbi5jb20iLCJmdWxsTmFtZSI6IlN5c3RlbSBBZG1pbmlzdHJhdG9yIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc1Njk4NDk1MX0.QKB3c2Q_b_8zfWYzotpedzWY9w58IKkkUbvcWnlU45Q
\.


--
-- Data for Name: starlink_usage; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.starlink_usage (id, date_key, kit_number, vessel_name, mobile_priority_gb, standard_gb, chargebee_subscription_id, created_at, updated_at, usage_limit_gb, public_ip_enabled) FROM stdin;
1	20250903	KIT403124357KNT	\N	4.26	0	BTLkQuUnp0KIV3XpX	2025-09-03 17:30:59.223	2025-09-03 17:30:59.223	250	f
2	20250903	KITP00348377	\N	21.86	0	BTcNMQUr381w93wfV	2025-09-03 17:30:59.225	2025-09-03 17:30:59.225	1500	f
3	20250903	KITP00429879	\N	4.96	0	773p6Uqe7MtE36wf	2025-09-03 17:30:59.227	2025-09-03 17:30:59.227	250	f
4	20250903	KITP00428193	\N	40.11	0	BTcOGcUqubCAn1ZVf	2025-09-03 17:30:59.228	2025-09-03 17:30:59.228	750	f
5	20250903	KITP00408827	\N	16.25	0	BTUQi9UmmwK3u57vh	2025-09-03 17:30:59.229	2025-09-03 17:30:59.229	250	f
6	20250903	KITP00429769	\N	21.36	0	BTM9N3UphsEf5eDW	2025-09-03 17:30:59.231	2025-09-03 17:30:59.231	500	f
7	20250903	KITP00236747	\N	0.4	0	199VtVUpuq1isC5I4	2025-09-03 17:30:59.233	2025-09-03 17:30:59.233	250	f
8	20250903	KIT403296830ZVH	\N	3.91	0	BTcMPXUpsbILWBjU8	2025-09-03 17:30:59.234	2025-09-03 17:30:59.234	250	f
9	20250903	KITP00427531	\N	6.31	0	BTUXRLUpnXXe82ylR	2025-09-03 17:30:59.239	2025-09-03 17:30:59.237	250	f
10	20250903	KITP00170284	\N	0.02	0	BTciEgUsw6Ael4gXY	2025-09-03 17:30:59.241	2025-09-03 17:30:59.241	750	f
11	20250903	KITP00195247	\N	0.05	0	199WtNUsvQ1V03xCI	2025-09-03 17:30:59.243	2025-09-03 17:30:59.243	750	f
12	20250903	KITP00191377	\N	1.04	0	BTciEgUsvubBB4Ulz	2025-09-03 17:30:59.245	2025-09-03 17:30:59.245	750	f
13	20250903	KITP00191362	\N	0.13	0	BTciEgUsvzDhL4ZhR	2025-09-03 17:30:59.246	2025-09-03 17:30:59.246	750	f
14	20250903	KITP00191364	\N	1.89	0	BTUP6tUsw2fkD4ckS	2025-09-03 17:30:59.248	2025-09-03 17:30:59.248	750	f
15	20250903	KITP00195241	\N	0.03	0	BTTuYyUsvO4LG3t06	2025-09-03 17:30:59.249	2025-09-03 17:30:59.249	250	f
16	20250903	KITP00170274	\N	0.39	0	198dquUsvHh4a3nd6	2025-09-03 17:30:59.25	2025-09-03 17:30:59.25	750	f
17	20250903	KITP00195240	\N	0.06	0	BTTuYyUsvJsZK3oDh	2025-09-03 17:30:59.252	2025-09-03 17:30:59.252	250	f
18	20250903	KITP00191378	\N	49.76	0	19AKSqUswAp464lyG	2025-09-03 17:30:59.255	2025-09-03 17:30:59.255	2000	t
19	20250903	KITP00170282	\N	25.62	0	199WtNUswHZx74qE7	2025-09-03 17:30:59.256	2025-09-03 17:30:59.256	2000	t
20	20250903	KITP00414265	\N	6.24	0	7738FUuUWT4514xE	2025-09-03 17:30:59.258	2025-09-03 17:30:59.258	250	f
21	20250903	KITP00348370	\N	1.51	0	BTLWx2UuWwHSG3fKC	2025-09-03 17:30:59.26	2025-09-03 17:30:59.26	250	f
22	20250903	KITP00194895	\N	3.54	0	BTLY1lUuhynQ57GT8	2025-09-03 17:30:59.261	2025-09-03 17:30:59.261	250	f
23	20250903	KITP00194894	\N	5.08	0	BTceQLUuJdZyY1xWt	2025-09-03 17:30:59.262	2025-09-03 17:30:59.262	250	f
24	20250903	KITP00414260	\N	0.1	0	19AKL0UunAgBDAj8N	2025-09-03 17:30:59.264	2025-09-03 17:30:59.264	250	f
25	20250903	KITP00428241	\N	4.54	0	199CNfUuxd9tcufa	2025-09-03 17:30:59.265	2025-09-03 17:30:59.265	1000	f
26	20250903	KITP00422620	\N	70.53	0	BTcf9TUvfSaUbBe4z	2025-09-03 17:30:59.266	2025-09-03 17:30:59.266	1500	t
27	20250903	KITP00289826	\N	25.09	0	77E3TUv3zPcc1YUL	2025-09-03 17:30:59.267	2025-09-03 17:30:59.267	500	f
28	20250903	KITP00428171	\N	0.23	0	779ZfUtfHtj62OKY	2025-09-03 17:30:59.271	2025-09-03 17:30:59.271	500	f
29	20250903	KITP00443623	\N	38.32	0	BTcXgyUu2SXvGBfTl	2025-09-03 17:30:59.273	2025-09-03 17:30:59.272	500	f
30	20250903	KITP00121387	\N	57.09	0	BTUQi9UmqOnVx6nLb	2025-09-03 17:30:59.274	2025-09-03 17:30:59.274	2250	f
31	20250903	KITP00427532	\N	11.38	0	77CiMUtZy5mD36yn	2025-09-03 17:30:59.276	2025-09-03 17:30:59.276	250	f
32	20250903	KITP00428243	\N	30.43	0	77CiMUtZ7dUE28tT	2025-09-03 17:30:59.278	2025-09-03 17:30:59.278	1000	f
33	20250903	KITP00414259	\N	2.12	0	BTcjedUv6U9z84fiR	2025-09-03 17:30:59.279	2025-09-03 17:30:59.279	250	f
34	20250903	KITP00428217	\N	0.21	0	19AHkFUsd6YQr2lBz	2025-09-03 17:30:59.281	2025-09-03 17:30:59.281	1000	f
35	20250903	KITP00141545	\N	23.24	0	198LtbUsazb9JRzW	2025-09-03 17:30:59.282	2025-09-03 17:30:59.282	1000	f
36	20250903	KITP00367708	\N	18.51	0	19AAwSUsRIlZu2UTx	2025-09-03 17:30:59.283	2025-09-03 17:30:59.283	1500	f
37	20250903	KITP00429880	\N	10.45	0	BTTxaQUsRe1xk2reZ	2025-09-03 17:30:59.284	2025-09-03 17:30:59.284	250	f
38	20250903	KITP00408831	\N	6.01	0	BTcum7UnK5bkJ1IcN	2025-09-03 17:30:59.288	2025-09-03 17:30:59.288	250	f
39	20250903	KITP00288410	\N	33.52	0	BTLb1uUjjhzuDUr6	2025-09-03 17:30:59.29	2025-09-03 17:30:59.29	1000	f
40	20250903	KITP00422628	\N	14.88	0	BTU30nUvemuJU91Ek	2025-09-03 17:30:59.292	2025-09-03 17:30:59.292	1000	t
41	20250903	KITP00427534	\N	7.27	0	BTURcoUnAzppH3PkU	2025-09-03 17:30:59.294	2025-09-03 17:30:59.294	500	f
42	20250903	KITP00263466	\N	8.35	0	19AAwSUsRHmVL2TNr	2025-09-03 17:30:59.295	2025-09-03 17:30:59.295	1500	f
43	20250903	KITP00263465	\N	8.77	0	BTLsksUsRHXJh2TDy	2025-09-03 17:30:59.296	2025-09-03 17:30:59.296	1000	f
44	20250903	KITP00332624	\N	12.71	0	777o6UsM4GZE3Bov	2025-09-03 17:30:59.297	2025-09-03 17:30:59.297	750	f
45	20250903	KITP00188991	\N	24.9	0	BTcciLUsRGaIj2Q15	2025-09-03 17:30:59.299	2025-09-03 17:30:59.299	1000	f
46	20250903	KITP00422610	\N	7.01	0	198QziUvemIur94P9	2025-09-03 17:30:59.3	2025-09-03 17:30:59.3	500	f
47	20250903	KITP00348369	\N	24.37	0	BTURzZUrh8MnJ325E	2025-09-03 17:30:59.305	2025-09-03 17:30:59.305	1500	f
48	20250903	KITP00268384	\N	13.8	0	BTccm4UrbaqCG3PTv	2025-09-03 17:30:59.307	2025-09-03 17:30:59.307	250	f
49	20250903	KITP00428186	\N	13.02	0	i6cwUrmwMrK2zvS	2025-09-03 17:30:59.309	2025-09-03 17:30:59.309	1000	f
50	20250903	KITP00443765	\N	10.13	0	BTM0R5UrwEOz0Wax	2025-09-03 17:30:59.31	2025-09-03 17:30:59.31	500	f
51	20250903	KITP00427535	\N	2.35	0	BTcVw2Us9pFSaAgJj	2025-09-03 17:30:59.312	2025-09-03 17:30:59.312	500	f
52	20250903	KITP00414096	\N	12.88	0	BTcVLLUvKvt2r6QSL	2025-09-03 17:30:59.313	2025-09-03 17:30:59.313	500	f
53	20250903	KITP00289831	\N	2.85	0	BTU3ToUvZIUfg4pRj	2025-09-03 17:30:59.314	2025-09-03 17:30:59.314	50	f
54	20250903	KITP00429771	\N	15.14	0	198hNzUpdZlZx2HQy	2025-09-03 17:30:59.315	2025-09-03 17:30:59.315	500	f
55	20250903	KITP00443493	\N	12.41	0	BTcqHvUpKH4Vn9nAU	2025-09-03 17:30:59.316	2025-09-03 17:30:59.316	500	f
56	20250903	KITP00443495	\N	12.87	0	BTLigBUoXsQRzdwC	2025-09-03 17:30:59.32	2025-09-03 17:30:59.319	500	f
57	20250903	KITP00427530	\N	3.96	0	BTU8XUUp13NYSoct	2025-09-03 17:30:59.321	2025-09-03 17:30:59.321	250	f
58	20250903	KITP00235492	\N	0.89	0	BTUSpwUo0FuSV34SQ	2025-09-03 17:30:59.323	2025-09-03 17:30:59.323	250	f
59	20250903	KITP00422629	\N	8.22	0	BTU30nUvfSwnVBcZ2	2025-09-03 17:30:59.324	2025-09-03 17:30:59.324	1000	t
60	20250903	KITP00408945	\N	20.89	0	19A8KbUliv9Sirvf	2025-09-03 17:30:59.325	2025-09-03 17:30:59.325	1000	f
61	20250903	KITP00408836	\N	34.19	0	BTUQeqUlY5qNz8cys	2025-09-03 17:30:59.326	2025-09-03 17:30:59.326	1000	f
62	20250903	KIT401827122BGD	\N	9.97	0	777r7UmUdBAi56LS	2025-09-03 17:30:59.327	2025-09-03 17:30:59.327	250	f
63	20250903	KITP00137073	\N	4.04	0	BTLb3HUmR7qLy3mn1	2025-09-03 17:30:59.328	2025-09-03 17:30:59.328	1000	f
64	20250903	KITP00308529	\N	36.54	0	77CdGUmUjDNN5Ebg	2025-09-03 17:30:59.329	2025-09-03 17:30:59.329	1000	f
65	20250903	KITP00118430	\N	1.19	0	777r7UmUhViC5BmF	2025-09-03 17:30:59.331	2025-09-03 17:30:59.331	1000	f
66	20250903	KITP00124148	\N	1.72	0	199Gb0UmR8ua43ipZ	2025-09-03 17:30:59.332	2025-09-03 17:30:59.332	1000	f
67	20250903	KITP00235475	\N	2.81	0	BTLb3HUmR8Sbo3nHC	2025-09-03 17:30:59.334	2025-09-03 17:30:59.334	1000	f
68	20250903	KITP00305602	\N	0.46	0	777r7UmUh5le5BRV	2025-09-03 17:30:59.336	2025-09-03 17:30:59.336	250	f
69	20250903	KITP00305435	\N	3.46	0	BTcNQMUmQKmhm3GNs	2025-09-03 17:30:59.337	2025-09-03 17:30:59.337	1000	f
70	20250903	KITP00118628	\N	2.11	0	BTLb3HUmR6sfI3lcr	2025-09-03 17:30:59.338	2025-09-03 17:30:59.338	1000	f
71	20250903	KITP00422618	\N	9.21	0	BTcIp6UvjuoOT36qY	2025-09-03 17:30:59.34	2025-09-03 17:30:59.34	2000	f
72	20250903	KITP00422615	\N	5.8	0	198O1lUvjv4zg37k3	2025-09-03 17:30:59.341	2025-09-03 17:30:59.341	1000	f
\.


--
-- Data for Name: telephony_dids; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.telephony_dids (id, number, description, created_at, expires_at, channels_included_count, dedicated_channels_count, blocked, terminated, updated_at, channels_included, dedicated_channels) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.user_roles (id, name, display_name, description, permissions, is_active, is_system, created_at, updated_at) FROM stdin;
1	admin	Administrator	Full system access with all permissions	["create_user_role", "read_user_roles", "read_user_role", "update_user_role", "delete_user_role", "read_user_profile", "update_user_profile", "change_password", "delete_user_account"]	t	t	2025-09-02 13:48:58.970952	2025-09-02 13:48:58.970952
2	user	User	Standard user with basic permissions	["read_user_profile", "update_user_profile", "change_password"]	t	t	2025-09-02 13:48:58.973231	2025-09-02 13:48:58.973231
3	moderator	Moderator	Moderator with limited administrative permissions	["read_user_roles", "read_user_role", "read_user_profile", "update_user_profile", "change_password"]	t	f	2025-09-02 13:48:58.974636	2025-09-02 13:48:58.974636
4	system	System Administrator	System-level administrator with full access	["create_user_role", "read_user_roles", "read_user_role", "update_user_role", "delete_user_role", "read_user_profile", "update_user_profile", "change_password", "delete_user_account", "system_admin"]	t	t	2025-09-02 13:48:58.981958	2025-09-02 13:48:58.981958
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.users (id, email, password, full_name, username, role_id, is_active, is_email_verified, email_verification_token, password_reset_token, password_reset_expires, mfa_enabled, mfa_secret, last_login_at, profile_picture, bio, preferences, created_at, updated_at) FROM stdin;
1	admin@admin.com	$2b$12$MdrRJpOM22qwyikPKHTyx.s8LjBy2GdMi9uV2cez7Z8at2zx3Ieu6	System Administrator	admin	4	t	t	\N	\N	\N	f	\N	2025-09-04 11:22:31.556	\N	\N	\N	2025-09-02 13:48:59.292236	2025-09-02 13:48:59.292236
\.


--
-- Data for Name: vessel_groups; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.vessel_groups (id, group_name, created_at, updated_at) FROM stdin;
1	A	2025-09-02 14:09:34.714145	2025-09-02 14:09:34.714145
\.


--
-- Data for Name: vessels; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.vessels (id, vesselskit_number, name, subscription_plan, group_id, device_id, created_at, updated_at) FROM stdin;
2	AB11	AB11		1	AB11-1	2025-09-02 14:09:40.307423	2025-09-02 14:09:40.307423
4	AB12	AB12		1	AB11-2	2025-09-02 14:09:57.536532	2025-09-02 14:09:57.536532
5	AB112	AB112		1	AB112	2025-09-02 14:28:37.28323	2025-09-02 14:28:37.28323
6	KITP00118628	KITP001	PROD	1	KKLO	2025-09-03 17:49:37.274699	2025-09-03 17:49:37.274699
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: root
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 4, true);


--
-- Name: bluetide_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.bluetide_usage_id_seq', 1, false);


--
-- Name: group_access_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.group_access_id_seq', 1, false);


--
-- Name: mikrotik_vessels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.mikrotik_vessels_id_seq', 1, false);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.sessions_id_seq', 7, true);


--
-- Name: starlink_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.starlink_usage_id_seq', 72, true);


--
-- Name: telephony_dids_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.telephony_dids_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 266, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: vessel_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.vessel_groups_id_seq', 1, true);


--
-- Name: vessels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.vessels_id_seq', 6, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: root
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: bluetide_usage bluetide_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.bluetide_usage
    ADD CONSTRAINT bluetide_usage_pkey PRIMARY KEY (id);


--
-- Name: group_access group_access_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.group_access
    ADD CONSTRAINT group_access_pkey PRIMARY KEY (id);


--
-- Name: mikrotik_vessels mikrotik_vessels_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.mikrotik_vessels
    ADD CONSTRAINT mikrotik_vessels_pkey PRIMARY KEY (id);


--
-- Name: mikrotik_vessels mikrotik_vessels_vessel_name_unique; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.mikrotik_vessels
    ADD CONSTRAINT mikrotik_vessels_vessel_name_unique UNIQUE (vessel_name);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: starlink_usage starlink_usage_date_key_kit_number_pk; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.starlink_usage
    ADD CONSTRAINT starlink_usage_date_key_kit_number_pk PRIMARY KEY (date_key, kit_number);


--
-- Name: telephony_dids telephony_dids_number_unique; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.telephony_dids
    ADD CONSTRAINT telephony_dids_number_unique UNIQUE (number);


--
-- Name: telephony_dids telephony_dids_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.telephony_dids
    ADD CONSTRAINT telephony_dids_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_name_unique; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_name_unique UNIQUE (name);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vessel_groups vessel_groups_group_name_unique; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.vessel_groups
    ADD CONSTRAINT vessel_groups_group_name_unique UNIQUE (group_name);


--
-- Name: vessel_groups vessel_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.vessel_groups
    ADD CONSTRAINT vessel_groups_pkey PRIMARY KEY (id);


--
-- Name: vessels vessels_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.vessels
    ADD CONSTRAINT vessels_pkey PRIMARY KEY (id);


--
-- Name: vessels vessels_vesselskit_number_unique; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.vessels
    ADD CONSTRAINT vessels_vesselskit_number_unique UNIQUE (vesselskit_number);


--
-- Name: group_access group_access_group_id_vessel_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.group_access
    ADD CONSTRAINT group_access_group_id_vessel_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.vessel_groups(id);


--
-- Name: vessels vessels_group_id_vessel_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.vessels
    ADD CONSTRAINT vessels_group_id_vessel_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.vessel_groups(id);


--
-- PostgreSQL database dump complete
--

\unrestrict qrhLpOhevJDEn0nsoR33PhR7XryLyQAqb40Njdwq3jmdQAveDnQwbVBKjwIFUSh

