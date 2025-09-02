--
-- PostgreSQL database dump
--

\restrict UcMNDl7wUMXdePUInPE5DB88SeTbEnwp695j6Q4teC2KdVYF82sLX8LDC7ro93C

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

\unrestrict UcMNDl7wUMXdePUInPE5DB88SeTbEnwp695j6Q4teC2KdVYF82sLX8LDC7ro93C
\connect space_vision
\restrict UcMNDl7wUMXdePUInPE5DB88SeTbEnwp695j6Q4teC2KdVYF82sLX8LDC7ro93C

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
    updated_at timestamp without time zone DEFAULT now()
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
    updated_at timestamp without time zone DEFAULT now()
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

COPY public.sessions (id, user_id, current_db, session_data, ip_address, user_agent, is_active, expires_at, created_at, updated_at) FROM stdin;
1	1	default	{"loginTime": "2025-09-02T14:02:18.286Z"}	\N	\N	t	2025-09-03 14:02:18.286	2025-09-02 14:02:18.287205	2025-09-02 14:02:18.287205
\.


--
-- Data for Name: starlink_usage; Type: TABLE DATA; Schema: public; Owner: root
--

COPY public.starlink_usage (id, date_key, kit_number, vessel_name, mobile_priority_gb, standard_gb, chargebee_subscription_id, created_at, updated_at) FROM stdin;
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
1	admin@admin.com	$2b$12$MdrRJpOM22qwyikPKHTyx.s8LjBy2GdMi9uV2cez7Z8at2zx3Ieu6	System Administrator	admin	4	t	t	\N	\N	\N	f	\N	2025-09-02 14:02:18.267	\N	\N	\N	2025-09-02 13:48:59.292236	2025-09-02 13:48:59.292236
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
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: root
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


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

SELECT pg_catalog.setval('public.sessions_id_seq', 1, true);


--
-- Name: starlink_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.starlink_usage_id_seq', 1, false);


--
-- Name: telephony_dids_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.telephony_dids_id_seq', 1, false);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: root
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 47, true);


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

SELECT pg_catalog.setval('public.vessels_id_seq', 5, true);


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
-- Name: starlink_usage starlink_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: root
--

ALTER TABLE ONLY public.starlink_usage
    ADD CONSTRAINT starlink_usage_pkey PRIMARY KEY (id);


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

\unrestrict UcMNDl7wUMXdePUInPE5DB88SeTbEnwp695j6Q4teC2KdVYF82sLX8LDC7ro93C

