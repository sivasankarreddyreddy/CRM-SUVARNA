--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

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
-- Name: activities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description text,
    completed_at timestamp without time zone,
    related_to text,
    related_id integer,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL
);


ALTER TABLE public.activities OWNER TO neondb_owner;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activities_id_seq OWNER TO neondb_owner;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    location text,
    attendee_type text NOT NULL,
    attendee_id integer NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.appointments OWNER TO neondb_owner;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO neondb_owner;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name text NOT NULL,
    industry text,
    website text,
    phone text,
    address text,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL,
    required_size_of_hospital text
);


ALTER TABLE public.companies OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    title text,
    company_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL
);


ALTER TABLE public.contacts OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    name text NOT NULL,
    source text,
    status text DEFAULT 'new'::text NOT NULL,
    email text,
    phone text,
    company_name text,
    notes text,
    assigned_to integer,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL,
    team_id integer,
    company_id integer,
    contact_id integer
);


ALTER TABLE public.leads OWNER TO neondb_owner;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leads_id_seq OWNER TO neondb_owner;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    code text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer DEFAULT 1,
    modified_at timestamp without time zone,
    modified_by integer,
    price numeric(10,2)
);


ALTER TABLE public.modules OWNER TO neondb_owner;

--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_id_seq OWNER TO neondb_owner;

--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: opportunities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.opportunities (
    id integer NOT NULL,
    name text NOT NULL,
    stage text DEFAULT 'qualification'::text NOT NULL,
    value numeric(10,2),
    probability integer,
    expected_close_date timestamp without time zone,
    notes text,
    contact_id integer,
    company_id integer,
    lead_id integer,
    assigned_to integer,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL,
    team_id integer
);


ALTER TABLE public.opportunities OWNER TO neondb_owner;

--
-- Name: opportunities_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.opportunities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opportunities_id_seq OWNER TO neondb_owner;

--
-- Name: opportunities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.opportunities_id_seq OWNED BY public.opportunities.id;


--
-- Name: product_modules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_modules (
    id integer NOT NULL,
    product_id integer NOT NULL,
    module_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL
);


ALTER TABLE public.product_modules OWNER TO neondb_owner;

--
-- Name: product_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.product_modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_modules_id_seq OWNER TO neondb_owner;

--
-- Name: product_modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.product_modules_id_seq OWNED BY public.product_modules.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    sku text,
    price numeric(10,2) NOT NULL,
    tax numeric(5,2) DEFAULT '0'::numeric,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL,
    vendor_id integer
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotation_items (
    id integer NOT NULL,
    quotation_id integer NOT NULL,
    product_id integer NOT NULL,
    description text,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    tax numeric(5,2),
    subtotal numeric(10,2) NOT NULL,
    module_id integer
);


ALTER TABLE public.quotation_items OWNER TO neondb_owner;

--
-- Name: quotation_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.quotation_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotation_items_id_seq OWNER TO neondb_owner;

--
-- Name: quotation_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.quotation_items_id_seq OWNED BY public.quotation_items.id;


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quotations (
    id integer NOT NULL,
    quotation_number text NOT NULL,
    opportunity_id integer,
    contact_id integer,
    company_id integer,
    subtotal numeric(10,2) NOT NULL,
    tax numeric(10,2),
    discount numeric(10,2),
    total numeric(10,2) NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    valid_until timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL
);


ALTER TABLE public.quotations OWNER TO neondb_owner;

--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotations_id_seq OWNER TO neondb_owner;

--
-- Name: quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.quotations_id_seq OWNED BY public.quotations.id;


--
-- Name: sales_order_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sales_order_items (
    id integer NOT NULL,
    sales_order_id integer NOT NULL,
    product_id integer NOT NULL,
    description text,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    tax numeric(5,2),
    subtotal numeric(10,2) NOT NULL,
    module_id integer
);


ALTER TABLE public.sales_order_items OWNER TO neondb_owner;

--
-- Name: sales_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sales_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_order_items_id_seq OWNER TO neondb_owner;

--
-- Name: sales_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sales_order_items_id_seq OWNED BY public.sales_order_items.id;


--
-- Name: sales_orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sales_orders (
    id integer NOT NULL,
    order_number text NOT NULL,
    quotation_id integer,
    opportunity_id integer,
    contact_id integer,
    company_id integer,
    subtotal numeric(10,2) NOT NULL,
    tax numeric(10,2),
    discount numeric(10,2),
    total numeric(10,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    order_date timestamp without time zone DEFAULT now(),
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL,
    invoice_date timestamp without time zone,
    payment_date timestamp without time zone
);


ALTER TABLE public.sales_orders OWNER TO neondb_owner;

--
-- Name: sales_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sales_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_orders_id_seq OWNER TO neondb_owner;

--
-- Name: sales_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sales_orders_id_seq OWNED BY public.sales_orders.id;


--
-- Name: sales_targets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sales_targets (
    id integer NOT NULL,
    user_id integer,
    company_id integer NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    year_type text DEFAULT 'calendar'::text NOT NULL,
    target_amount numeric(12,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL,
    notes text
);


ALTER TABLE public.sales_targets OWNER TO neondb_owner;

--
-- Name: sales_targets_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sales_targets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_targets_id_seq OWNER TO neondb_owner;

--
-- Name: sales_targets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sales_targets_id_seq OWNED BY public.sales_targets.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    due_date timestamp without time zone,
    priority text DEFAULT 'medium'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    assigned_to integer,
    related_to text,
    related_id integer,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL,
    contact_person_id integer,
    mobile_number text
);


ALTER TABLE public.tasks OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO neondb_owner;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer NOT NULL
);


ALTER TABLE public.teams OWNER TO neondb_owner;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO neondb_owner;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'sales_executive'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    manager_id integer,
    team_id integer,
    is_active boolean DEFAULT true
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendor_groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer DEFAULT 1,
    modified_at timestamp without time zone,
    modified_by integer
);


ALTER TABLE public.vendor_groups OWNER TO neondb_owner;

--
-- Name: vendor_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vendor_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendor_groups_id_seq OWNER TO neondb_owner;

--
-- Name: vendor_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vendor_groups_id_seq OWNED BY public.vendor_groups.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    name text NOT NULL,
    contact_person text,
    email text,
    phone text,
    website text,
    address text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    created_by integer DEFAULT 1,
    modified_at timestamp without time zone,
    modified_by integer,
    vendor_group_id integer
);


ALTER TABLE public.vendors OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: opportunities id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities ALTER COLUMN id SET DEFAULT nextval('public.opportunities_id_seq'::regclass);


--
-- Name: product_modules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_modules ALTER COLUMN id SET DEFAULT nextval('public.product_modules_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: quotation_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotation_items ALTER COLUMN id SET DEFAULT nextval('public.quotation_items_id_seq'::regclass);


--
-- Name: quotations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations ALTER COLUMN id SET DEFAULT nextval('public.quotations_id_seq'::regclass);


--
-- Name: sales_order_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales_order_items ALTER COLUMN id SET DEFAULT nextval('public.sales_order_items_id_seq'::regclass);


--
-- Name: sales_orders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales_orders ALTER COLUMN id SET DEFAULT nextval('public.sales_orders_id_seq'::regclass);


--
-- Name: sales_targets id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales_targets ALTER COLUMN id SET DEFAULT nextval('public.sales_targets_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendor_groups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_groups ALTER COLUMN id SET DEFAULT nextval('public.vendor_groups_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activities (id, type, title, description, completed_at, related_to, related_id, created_at, created_by) FROM stdin;
1	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-21 12:40:48.712	opportunity	2	2025-04-21 13:40:48.722601	2
2	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-21 10:40:48.712	opportunity	3	2025-04-21 13:40:48.757452	3
3	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-21 08:40:48.712	company	2	2025-04-21 13:40:48.787378	3
5	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-21 12:42:40.579	opportunity	6	2025-04-21 13:42:40.590471	2
6	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-21 10:42:40.58	opportunity	7	2025-04-21 13:42:40.621141	3
7	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-21 08:42:40.58	company	7	2025-04-21 13:42:40.651173	3
9	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-21 12:44:58.582	opportunity	10	2025-04-21 13:44:58.593714	2
10	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-21 10:44:58.582	opportunity	11	2025-04-21 13:44:58.62534	3
11	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-21 08:44:58.582	company	12	2025-04-21 13:44:58.656183	3
14	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 03:10:12.194	opportunity	14	2025-04-22 04:10:12.210711	2
15	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 01:10:12.194	opportunity	15	2025-04-22 04:10:12.246002	3
16	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-21 23:10:12.194	company	17	2025-04-22 04:10:12.27563	3
18	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 03:31:28.612	opportunity	18	2025-04-22 04:31:28.627879	2
19	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 01:31:28.612	opportunity	19	2025-04-22 04:31:28.664495	3
20	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-21 23:31:28.612	company	23	2025-04-22 04:31:28.694099	3
22	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 03:33:43.851	opportunity	22	2025-04-22 04:33:43.866126	2
23	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 01:33:43.851	opportunity	23	2025-04-22 04:33:43.89601	3
24	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-21 23:33:43.851	company	28	2025-04-22 04:33:43.926742	3
26	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 03:34:24.343	opportunity	26	2025-04-22 04:34:24.431663	2
27	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 01:34:24.343	opportunity	27	2025-04-22 04:34:24.462169	3
28	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-21 23:34:24.343	company	33	2025-04-22 04:34:24.490961	3
30	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 03:38:40.99	opportunity	30	2025-04-22 04:38:41.008786	2
31	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 01:38:40.99	opportunity	31	2025-04-22 04:38:41.044381	3
32	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-21 23:38:40.99	company	38	2025-04-22 04:38:41.074017	3
34	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 03:41:08.431	opportunity	34	2025-04-22 04:41:08.446931	2
35	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 01:41:08.431	opportunity	35	2025-04-22 04:41:08.478224	3
36	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-21 23:41:08.431	company	43	2025-04-22 04:41:08.508806	3
38	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 04:20:54.605	opportunity	38	2025-04-22 05:20:54.622575	2
39	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 02:20:54.605	opportunity	39	2025-04-22 05:20:54.655882	3
40	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 00:20:54.605	company	48	2025-04-22 05:20:54.684861	3
42	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 04:21:07.289	opportunity	42	2025-04-22 05:21:07.304593	2
43	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 02:21:07.289	opportunity	43	2025-04-22 05:21:07.33414	3
44	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 00:21:07.289	company	53	2025-04-22 05:21:07.362716	3
46	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	26	2025-04-22 05:27:03.995366	1
47	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 04:31:48.421	opportunity	46	2025-04-22 05:31:48.437834	2
48	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 02:31:48.421	opportunity	47	2025-04-22 05:31:48.473012	3
49	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 00:31:48.421	company	58	2025-04-22 05:31:48.504306	3
51	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 04:44:27.183	opportunity	50	2025-04-22 05:44:27.198962	2
52	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 02:44:27.183	opportunity	51	2025-04-22 05:44:27.230868	3
53	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 00:44:27.183	company	63	2025-04-22 05:44:27.262085	3
55	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 04:44:36.475	opportunity	54	2025-04-22 05:44:36.490615	2
56	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 02:44:36.475	opportunity	55	2025-04-22 05:44:36.520612	3
57	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 00:44:36.475	company	71	2025-04-22 05:44:36.550621	3
59	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 04:57:46.381	opportunity	58	2025-04-22 05:57:46.39784	34
60	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 02:57:46.381	opportunity	59	2025-04-22 05:57:46.43652	35
61	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 00:57:46.381	company	81	2025-04-22 05:57:46.466838	35
63	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 04:58:00.855	opportunity	62	2025-04-22 05:58:00.872164	34
64	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 02:58:00.855	opportunity	63	2025-04-22 05:58:00.902141	35
65	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 00:58:00.855	company	93	2025-04-22 05:58:00.933424	35
67	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 04:59:29.879	opportunity	66	2025-04-22 05:59:29.895441	34
68	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 02:59:29.879	opportunity	67	2025-04-22 05:59:29.925922	35
69	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 00:59:29.879	company	98	2025-04-22 05:59:29.955662	35
71	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:01:54.582	opportunity	82	2025-04-22 06:01:54.598814	34
72	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:01:54.582	opportunity	83	2025-04-22 06:01:54.630621	35
73	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:01:54.582	company	103	2025-04-22 06:01:54.662379	35
75	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:02:04.803	opportunity	86	2025-04-22 06:02:04.822063	34
76	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:02:04.803	opportunity	87	2025-04-22 06:02:04.852164	35
77	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:02:04.803	company	108	2025-04-22 06:02:04.882053	35
79	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:04:32.244	opportunity	90	2025-04-22 06:04:32.259256	34
80	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:04:32.244	opportunity	91	2025-04-22 06:04:32.289868	35
81	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:04:32.244	company	113	2025-04-22 06:04:32.320262	35
83	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:04:42.589	opportunity	94	2025-04-22 06:04:42.605246	34
84	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:04:42.589	opportunity	95	2025-04-22 06:04:42.636855	35
85	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:04:42.589	company	118	2025-04-22 06:04:42.667505	35
87	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:06:46.207	opportunity	98	2025-04-22 06:06:46.223659	34
88	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:06:46.207	opportunity	99	2025-04-22 06:06:46.254224	35
89	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:06:46.207	company	123	2025-04-22 06:06:46.284959	35
91	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:06:56.55	opportunity	102	2025-04-22 06:06:56.565906	34
92	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:06:56.55	opportunity	103	2025-04-22 06:06:56.598262	35
93	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:06:56.55	company	128	2025-04-22 06:06:56.629922	35
95	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:07:12.267	opportunity	106	2025-04-22 06:07:12.282293	34
96	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:07:12.267	opportunity	107	2025-04-22 06:07:12.311366	35
97	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:07:12.267	company	133	2025-04-22 06:07:12.341503	35
99	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:08:43.95	opportunity	110	2025-04-22 06:08:43.96743	34
100	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:08:43.95	opportunity	111	2025-04-22 06:08:43.998444	35
101	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:08:43.95	company	138	2025-04-22 06:08:44.030676	35
103	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:08:53.724	opportunity	114	2025-04-22 06:08:53.741033	34
104	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:08:53.724	opportunity	115	2025-04-22 06:08:53.771612	35
105	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:08:53.724	company	143	2025-04-22 06:08:53.800914	35
107	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:12:46.853	opportunity	118	2025-04-22 06:12:46.868913	34
108	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:12:46.853	opportunity	119	2025-04-22 06:12:46.899874	35
109	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:12:46.853	company	148	2025-04-22 06:12:46.93115	35
111	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:12:56.797	opportunity	122	2025-04-22 06:12:56.812945	34
112	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:12:56.797	opportunity	123	2025-04-22 06:12:56.843438	35
113	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:12:56.797	company	153	2025-04-22 06:12:56.873791	35
115	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:19:54.143	opportunity	126	2025-04-22 06:19:54.15888	34
116	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:19:54.143	opportunity	127	2025-04-22 06:19:54.188491	35
117	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:19:54.143	company	158	2025-04-22 06:19:54.217759	35
119	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:20:04.394	opportunity	130	2025-04-22 06:20:04.409111	34
120	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:20:04.394	opportunity	131	2025-04-22 06:20:04.438356	35
121	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:20:04.394	company	163	2025-04-22 06:20:04.467872	35
123	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:22:56.85	opportunity	134	2025-04-22 06:22:56.865341	34
124	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:22:56.85	opportunity	135	2025-04-22 06:22:56.897069	35
125	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:22:56.85	company	168	2025-04-22 06:22:56.929211	35
127	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:23:06.431	opportunity	138	2025-04-22 06:23:06.446963	34
128	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:23:06.431	opportunity	139	2025-04-22 06:23:06.476047	35
129	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:23:06.431	company	173	2025-04-22 06:23:06.506329	35
131	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:25:02.246	opportunity	142	2025-04-22 06:25:02.262077	34
132	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:25:02.246	opportunity	143	2025-04-22 06:25:02.291467	35
133	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:25:02.246	company	178	2025-04-22 06:25:02.320863	35
135	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:25:13.417	opportunity	146	2025-04-22 06:25:13.433555	34
136	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:25:13.417	opportunity	147	2025-04-22 06:25:13.463934	35
137	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:25:13.417	company	183	2025-04-22 06:25:13.494271	35
139	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:29:00.419	opportunity	150	2025-04-22 06:29:00.405205	34
140	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:29:00.419	opportunity	151	2025-04-22 06:29:00.442047	35
141	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:29:00.419	company	188	2025-04-22 06:29:00.472154	35
143	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:29:07.886	opportunity	154	2025-04-22 06:29:07.90204	34
144	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:29:07.886	opportunity	155	2025-04-22 06:29:07.931791	35
145	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:29:07.886	company	193	2025-04-22 06:29:07.961196	35
147	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:29:31.241	opportunity	158	2025-04-22 06:29:31.256766	34
148	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:29:31.241	opportunity	159	2025-04-22 06:29:31.287011	35
149	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:29:31.241	company	198	2025-04-22 06:29:31.316869	35
151	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:36:40.642	opportunity	162	2025-04-22 06:36:40.657755	34
152	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:36:40.642	opportunity	163	2025-04-22 06:36:40.695322	35
153	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:36:40.642	company	203	2025-04-22 06:36:40.724714	35
155	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:36:50.807	opportunity	166	2025-04-22 06:36:50.823129	34
156	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:36:50.807	opportunity	167	2025-04-22 06:36:50.853913	35
157	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:36:50.807	company	208	2025-04-22 06:36:50.884923	35
159	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:37:23.927	opportunity	170	2025-04-22 06:37:23.943049	34
160	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:37:23.927	opportunity	171	2025-04-22 06:37:23.973185	35
161	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:37:23.927	company	213	2025-04-22 06:37:24.00199	35
163	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:37:31.945	opportunity	174	2025-04-22 06:37:31.960999	34
164	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:37:31.945	opportunity	175	2025-04-22 06:37:31.990771	35
165	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:37:31.945	company	218	2025-04-22 06:37:32.020256	35
167	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:38:27.793	opportunity	178	2025-04-22 06:38:27.808367	34
168	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:38:27.793	opportunity	179	2025-04-22 06:38:27.839802	35
169	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:38:27.793	company	223	2025-04-22 06:38:27.869581	35
171	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:38:36.739	opportunity	182	2025-04-22 06:38:36.75455	34
172	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:38:36.739	opportunity	183	2025-04-22 06:38:36.783811	35
173	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:38:36.739	company	228	2025-04-22 06:38:36.812667	35
175	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:40:31.589	opportunity	186	2025-04-22 06:40:31.606375	34
176	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:40:31.59	opportunity	187	2025-04-22 06:40:31.639783	35
177	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:40:31.59	company	233	2025-04-22 06:40:31.669707	35
179	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:40:41.147	opportunity	190	2025-04-22 06:40:41.16265	34
180	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:40:41.147	opportunity	191	2025-04-22 06:40:41.195749	35
181	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:40:41.147	company	238	2025-04-22 06:40:41.227948	35
183	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:47:48.974	opportunity	194	2025-04-22 06:47:48.990055	34
184	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:47:48.974	opportunity	195	2025-04-22 06:47:49.024007	35
185	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:47:48.974	company	243	2025-04-22 06:47:49.05312	35
187	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:49:20.788	opportunity	198	2025-04-22 06:49:20.80336	34
188	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:49:20.788	opportunity	199	2025-04-22 06:49:20.832913	35
189	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:49:20.788	company	248	2025-04-22 06:49:20.861735	35
191	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:49:30.169	opportunity	202	2025-04-22 06:49:30.184927	34
192	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:49:30.169	opportunity	203	2025-04-22 06:49:30.214663	35
193	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:49:30.169	company	253	2025-04-22 06:49:30.244334	35
195	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:50:02.049	opportunity	206	2025-04-22 06:50:02.064912	34
196	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:50:02.049	opportunity	207	2025-04-22 06:50:02.095058	35
197	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:50:02.049	company	258	2025-04-22 06:50:02.124991	35
199	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:50:12.179	opportunity	210	2025-04-22 06:50:12.195556	34
200	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:50:12.179	opportunity	211	2025-04-22 06:50:12.22571	35
201	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:50:12.179	company	263	2025-04-22 06:50:12.255454	35
203	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:51:15.428	opportunity	214	2025-04-22 06:51:15.443935	34
204	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:51:15.428	opportunity	215	2025-04-22 06:51:15.477554	35
205	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:51:15.428	company	268	2025-04-22 06:51:15.506809	35
207	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:51:25.136	opportunity	218	2025-04-22 06:51:25.151892	34
208	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:51:25.136	opportunity	219	2025-04-22 06:51:25.183779	35
209	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:51:25.136	company	273	2025-04-22 06:51:25.215146	35
211	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:53:33.006	opportunity	222	2025-04-22 06:53:33.02232	34
212	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:53:33.006	opportunity	223	2025-04-22 06:53:33.05922	35
213	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:53:33.006	company	278	2025-04-22 06:53:33.089221	35
215	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:57:46.665	opportunity	226	2025-04-22 06:57:46.681607	34
216	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:57:46.665	opportunity	227	2025-04-22 06:57:46.719757	35
217	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:57:46.665	company	283	2025-04-22 06:57:46.750088	35
219	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:57:56.135	opportunity	230	2025-04-22 06:57:56.150744	34
220	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:57:56.135	opportunity	231	2025-04-22 06:57:56.185431	35
221	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:57:56.135	company	288	2025-04-22 06:57:56.219665	35
223	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:59:47.676	opportunity	234	2025-04-22 06:59:47.693047	34
224	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:59:47.676	opportunity	235	2025-04-22 06:59:47.723617	35
225	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:59:47.676	company	293	2025-04-22 06:59:47.753794	35
227	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 05:59:57.729	opportunity	238	2025-04-22 06:59:57.744648	34
228	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 03:59:57.729	opportunity	239	2025-04-22 06:59:57.774354	35
229	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 01:59:57.729	company	298	2025-04-22 06:59:57.804155	35
231	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:02:12.199	opportunity	242	2025-04-22 07:02:12.215732	34
232	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:02:12.199	opportunity	243	2025-04-22 07:02:12.250724	35
233	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:02:12.199	company	303	2025-04-22 07:02:12.281393	35
235	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:02:22.403	opportunity	246	2025-04-22 07:02:22.418965	34
236	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:02:22.403	opportunity	247	2025-04-22 07:02:22.448647	35
237	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:02:22.403	company	308	2025-04-22 07:02:22.479001	35
239	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:02:52.729	opportunity	250	2025-04-22 07:02:52.744741	34
240	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:02:52.729	opportunity	251	2025-04-22 07:02:52.773961	35
241	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:02:52.729	company	313	2025-04-22 07:02:52.803755	35
243	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:03:03.071	opportunity	254	2025-04-22 07:03:03.087471	34
244	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:03:03.071	opportunity	255	2025-04-22 07:03:03.117417	35
245	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:03:03.071	company	318	2025-04-22 07:03:03.149539	35
247	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:04:05.729	opportunity	258	2025-04-22 07:04:05.745609	34
248	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:04:05.729	opportunity	259	2025-04-22 07:04:05.776005	35
249	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:04:05.729	company	323	2025-04-22 07:04:05.805927	35
251	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:04:15.512	opportunity	262	2025-04-22 07:04:15.527645	34
252	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:04:15.512	opportunity	263	2025-04-22 07:04:15.556725	35
253	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:04:15.512	company	328	2025-04-22 07:04:15.585946	35
255	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:05:05.673	opportunity	266	2025-04-22 07:05:05.688873	34
256	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:05:05.673	opportunity	267	2025-04-22 07:05:05.718407	35
257	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:05:05.673	company	333	2025-04-22 07:05:05.748698	35
259	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:05:15.804	opportunity	270	2025-04-22 07:05:15.824844	34
260	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:05:15.804	opportunity	271	2025-04-22 07:05:15.857943	35
261	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:05:15.804	company	338	2025-04-22 07:05:15.888188	35
263	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:06:12.37	opportunity	274	2025-04-22 07:06:12.385701	34
264	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:06:12.37	opportunity	275	2025-04-22 07:06:12.414236	35
265	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:06:12.37	company	343	2025-04-22 07:06:12.442966	35
267	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:07:06.121	opportunity	278	2025-04-22 07:07:06.148862	34
268	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:07:06.121	opportunity	279	2025-04-22 07:07:06.178334	35
269	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:07:06.121	company	348	2025-04-22 07:07:06.207307	35
271	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:07:15.984	opportunity	282	2025-04-22 07:07:15.999878	34
272	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:07:15.984	opportunity	283	2025-04-22 07:07:16.030171	35
273	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:07:15.984	company	353	2025-04-22 07:07:16.060376	35
275	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:08:35.056	opportunity	286	2025-04-22 07:08:35.072279	34
276	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:08:35.056	opportunity	287	2025-04-22 07:08:35.102375	35
277	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:08:35.056	company	358	2025-04-22 07:08:35.13286	35
279	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:08:44.819	opportunity	290	2025-04-22 07:08:44.835408	34
280	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:08:44.819	opportunity	291	2025-04-22 07:08:44.865872	35
281	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:08:44.819	company	363	2025-04-22 07:08:44.896175	35
283	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:10:37.738	opportunity	294	2025-04-22 07:10:37.754057	34
284	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:10:37.738	opportunity	295	2025-04-22 07:10:37.792531	35
285	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:10:37.738	company	368	2025-04-22 07:10:37.822658	35
287	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:10:49.107	opportunity	298	2025-04-22 07:10:49.123825	34
288	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:10:49.107	opportunity	299	2025-04-22 07:10:49.154729	35
289	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:10:49.107	company	373	2025-04-22 07:10:49.184684	35
291	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:13:25.579	opportunity	302	2025-04-22 07:13:25.594907	34
292	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:13:25.579	opportunity	303	2025-04-22 07:13:25.633659	35
293	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:13:25.579	company	378	2025-04-22 07:13:25.663633	35
295	email	Sent proposal to TechGiant Inc	Sent the ERP implementation proposal	2025-04-22 06:13:35.176	opportunity	306	2025-04-22 07:13:35.191861	34
296	call	Call with SecureData LLC	Discussed security assessment requirements and timeline	2025-04-22 04:13:35.176	opportunity	307	2025-04-22 07:13:35.221531	35
297	task	Updated contact information	Updated contact information for all TechGiant contacts	2025-04-22 02:13:35.176	company	383	2025-04-22 07:13:35.2529	35
305	call	kims opp act	kims opp act	2025-04-23 08:39:33.019	opportunity	310	2025-04-23 08:39:53.381676	33
306	order	Invoice generated for order SO-2025-04440	Order SO-2025-04440 has been converted to an invoice	\N	order	149	2025-04-24 07:31:34.555175	33
307	payment	Payment received for Order SO-2025-04440	Order marked as paid by Admin User	\N	order	149	2025-04-24 07:33:24.815779	33
308	order	Invoice generated for order ORD-2023-002	Order ORD-2023-002 has been converted to an invoice	\N	order	148	2025-04-24 07:35:20.12721	33
310	order	Invoice generated for order SO-2025-04000	Order SO-2025-04000 has been converted to an invoice	\N	order	150	2025-04-24 09:07:53.368074	33
311	payment	Payment received for Order SO-2025-04000	Order marked as paid by Admin User	\N	order	150	2025-04-24 09:08:26.40404	33
312	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	33	2025-04-24 10:27:41.194952	33
313	team_assignment	User assigned to no team	User was removed from team by Admin User	\N	user	33	2025-04-24 10:27:45.391281	33
314	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	33	2025-04-24 10:28:27.014746	33
322	order	Invoice generated for order SO-2025-04000	Order SO-2025-04000 has been converted to an invoice	\N	order	150	2025-04-29 13:00:06.61081	33
326	order	Invoice generated for order SO-2025-04630	Order SO-2025-04630 has been converted to an invoice	\N	order	151	2025-04-30 05:10:43.897568	33
327	order	Invoice generated for order SO-2025-04630	Order SO-2025-04630 has been converted to an invoice	\N	order	151	2025-04-30 05:12:37.443764	33
328	order	Invoice generated for order SO-2025-04589	Order SO-2025-04589 has been converted to an invoice	\N	order	153	2025-04-30 05:15:34.92324	33
329	payment	Payment received for Order SO-2025-04589	Order marked as paid by Admin User	\N	order	153	2025-04-30 05:19:30.794942	33
345	order	Invoice generated for order SO-2025-04369	Order SO-2025-04369 has been converted to an invoice	\N	order	154	2025-04-30 05:50:51.624546	33
346	order	Invoice generated for order SO-2025-04369	Order SO-2025-04369 has been converted to an invoice	\N	order	154	2025-04-30 05:51:28.264368	33
347	payment	Payment received for Order SO-2025-04369	Order marked as paid by Admin User	\N	order	154	2025-04-30 05:51:44.692095	33
348	order	Invoice generated for order SO-2025-04369	Order SO-2025-04369 has been converted to an invoice	\N	order	154	2025-04-30 05:52:19.865456	33
349	payment	Payment received for Order SO-2025-04369	Order marked as paid by Admin User	\N	order	154	2025-04-30 05:52:36.142103	33
351	note	HIMS DEMO 	Meeting	2025-04-30 18:30:00	opportunity	317	2025-04-30 10:01:23.916197	33
353	meeting	PIMS Opportunity 	DEMO HMS	2025-04-30 18:30:00	opportunity	318	2025-04-30 11:47:40.494712	33
356	order	Invoice generated for order SO-2025-04369	Order SO-2025-04369 has been converted to an invoice	\N	order	154	2025-04-30 13:03:18.636376	33
361	meeting	HMS DEMO TO BLDE	HMS DEMO TO BLDE	2025-05-05 18:30:00	opportunity	325	2025-05-01 09:48:55.751113	89
362	order	Invoice generated for order SO-2025-05412	Order SO-2025-05412 has been converted to an invoice	\N	order	156	2025-05-01 09:50:59.569536	89
365	team_assignment	User assigned to no team	User was removed from team by Admin User	\N	user	73	2025-05-01 10:34:45.690506	33
366	team_assignment	User assigned to no team	User was removed from team by Admin User	\N	user	88	2025-05-01 10:35:09.09879	33
367	team_assignment	User assigned to no team	User was removed from team by Admin User	\N	user	82	2025-05-01 10:37:22.802637	33
369	order	Invoice generated for order SO-2025-05902	Order SO-2025-05902 has been converted to an invoice	\N	order	157	2025-05-05 04:54:37.063057	91
371	user_update	User information updated	User information was updated by Admin User	\N	user	91	2025-05-05 10:53:30.782178	33
372	user_status	User deactivated	User was deactivated by Admin User	\N	user	91	2025-05-05 10:53:30.827354	33
373	user_update	User information updated	User information was updated by Admin User	\N	user	91	2025-05-05 10:53:36.849318	33
374	user_status	User activated	User was activated by Admin User	\N	user	91	2025-05-05 10:53:36.881045	33
378	order	Invoice generated for order SO-2025-05434	Order SO-2025-05434 has been converted to an invoice	\N	order	160	2025-05-06 13:44:49.278998	33
379	payment	Payment received for Order SO-2025-05434	Order marked as paid by Admin User	\N	order	160	2025-05-06 13:45:28.463711	33
382	user_update	User information updated	User information was updated by Admin User	\N	user	91	2025-05-07 10:54:43.730129	33
383	user_update	User information updated	User information was updated by Admin User	\N	user	47	2025-05-07 10:57:03.699136	33
384	user_status	User deactivated	User was deactivated by Admin User	\N	user	47	2025-05-07 10:57:03.745389	33
385	user_update	User information updated	User information was updated by Admin User	\N	user	47	2025-05-07 10:57:04.19804	33
386	user_status	User deactivated	User was deactivated by Admin User	\N	user	47	2025-05-07 10:57:04.228388	33
387	user_update	User information updated	User information was updated by Admin User	\N	user	60	2025-05-07 10:57:11.608375	33
388	user_status	User deactivated	User was deactivated by Admin User	\N	user	60	2025-05-07 10:57:11.638639	33
389	user_update	User information updated	User information was updated by Admin User	\N	user	92	2025-05-07 10:57:29.979225	33
390	user_status	User deactivated	User was deactivated by Admin User	\N	user	92	2025-05-07 10:57:30.016291	33
391	user_update	User information updated	User information was updated by Admin User	\N	user	50	2025-05-07 10:58:02.390017	33
392	user_status	User deactivated	User was deactivated by Admin User	\N	user	50	2025-05-07 10:58:02.429771	33
393	user_update	User information updated	User information was updated by Admin User	\N	user	70	2025-05-07 10:58:06.499793	33
394	user_status	User deactivated	User was deactivated by Admin User	\N	user	70	2025-05-07 10:58:06.53141	33
395	user_update	User information updated	User information was updated by Admin User	\N	user	88	2025-05-07 10:58:10.421929	33
396	user_status	User deactivated	User was deactivated by Admin User	\N	user	88	2025-05-07 10:58:10.462938	33
397	user_update	User information updated	User information was updated by Admin User	\N	user	87	2025-05-07 10:58:20.371481	33
398	user_status	User deactivated	User was deactivated by Admin User	\N	user	87	2025-05-07 10:58:20.40272	33
399	user_update	User information updated	User information was updated by Admin User	\N	user	86	2025-05-07 10:58:25.22212	33
400	user_status	User deactivated	User was deactivated by Admin User	\N	user	86	2025-05-07 10:58:25.254819	33
401	user_update	User information updated	User information was updated by Admin User	\N	user	69	2025-05-07 10:58:40.708541	33
402	user_status	User deactivated	User was deactivated by Admin User	\N	user	69	2025-05-07 10:58:40.73954	33
403	user_update	User information updated	User information was updated by Admin User	\N	user	48	2025-05-07 10:58:49.424949	33
404	user_status	User deactivated	User was deactivated by Admin User	\N	user	48	2025-05-07 10:58:49.462806	33
405	user_update	User information updated	User information was updated by Admin User	\N	user	52	2025-05-07 10:58:53.470843	33
406	user_status	User deactivated	User was deactivated by Admin User	\N	user	52	2025-05-07 10:58:53.505475	33
407	user_update	User information updated	User information was updated by Admin User	\N	user	58	2025-05-07 10:58:57.619917	33
408	user_status	User deactivated	User was deactivated by Admin User	\N	user	58	2025-05-07 10:58:57.650252	33
409	user_update	User information updated	User information was updated by Admin User	\N	user	45	2025-05-07 10:59:01.308564	33
410	user_status	User deactivated	User was deactivated by Admin User	\N	user	45	2025-05-07 10:59:01.340393	33
411	user_update	User information updated	User information was updated by Admin User	\N	user	83	2025-05-07 10:59:04.418597	33
412	user_status	User deactivated	User was deactivated by Admin User	\N	user	83	2025-05-07 10:59:04.451936	33
413	user_update	User information updated	User information was updated by Admin User	\N	user	84	2025-05-07 10:59:09.6029	33
414	user_status	User deactivated	User was deactivated by Admin User	\N	user	84	2025-05-07 10:59:09.634736	33
415	user_update	User information updated	User information was updated by Admin User	\N	user	59	2025-05-07 10:59:17.387926	33
416	user_status	User deactivated	User was deactivated by Admin User	\N	user	59	2025-05-07 10:59:17.419596	33
417	user_update	User information updated	User information was updated by Admin User	\N	user	59	2025-05-07 10:59:18.071498	33
418	user_status	User deactivated	User was deactivated by Admin User	\N	user	59	2025-05-07 10:59:18.118716	33
419	user_update	User information updated	User information was updated by Admin User	\N	user	43	2025-05-07 10:59:22.079704	33
420	user_status	User deactivated	User was deactivated by Admin User	\N	user	43	2025-05-07 10:59:22.11005	33
421	user_update	User information updated	User information was updated by Admin User	\N	user	43	2025-05-07 10:59:23.338847	33
422	user_status	User activated	User was activated by Admin User	\N	user	43	2025-05-07 10:59:23.390547	33
423	user_update	User information updated	User information was updated by Admin User	\N	user	63	2025-05-07 10:59:25.620166	33
424	user_status	User deactivated	User was deactivated by Admin User	\N	user	63	2025-05-07 10:59:25.651963	33
425	user_update	User information updated	User information was updated by Admin User	\N	user	43	2025-05-07 10:59:29.630983	33
426	user_status	User deactivated	User was deactivated by Admin User	\N	user	43	2025-05-07 10:59:29.661749	33
427	user_update	User information updated	User information was updated by Admin User	\N	user	34	2025-05-07 10:59:32.173633	33
428	user_status	User deactivated	User was deactivated by Admin User	\N	user	34	2025-05-07 10:59:32.210069	33
429	user_update	User information updated	User information was updated by Admin User	\N	user	35	2025-05-07 10:59:33.61487	33
430	user_status	User deactivated	User was deactivated by Admin User	\N	user	35	2025-05-07 10:59:33.64787	33
431	user_update	User information updated	User information was updated by Admin User	\N	user	90	2025-05-07 10:59:35.144888	33
432	user_status	User deactivated	User was deactivated by Admin User	\N	user	90	2025-05-07 10:59:35.182967	33
433	user_update	User information updated	User information was updated by Admin User	\N	user	93	2025-05-07 10:59:36.469661	33
434	user_status	User deactivated	User was deactivated by Admin User	\N	user	93	2025-05-07 10:59:36.499983	33
435	user_update	User information updated	User information was updated by Admin User	\N	user	55	2025-05-07 10:59:39.397818	33
436	user_status	User deactivated	User was deactivated by Admin User	\N	user	55	2025-05-07 10:59:39.431118	33
437	user_update	User information updated	User information was updated by Admin User	\N	user	76	2025-05-07 10:59:44.153394	33
438	user_status	User deactivated	User was deactivated by Admin User	\N	user	76	2025-05-07 10:59:44.186806	33
439	user_update	User information updated	User information was updated by Admin User	\N	user	66	2025-05-07 10:59:45.314596	33
440	user_status	User deactivated	User was deactivated by Admin User	\N	user	66	2025-05-07 10:59:45.345897	33
441	user_update	User information updated	User information was updated by Admin User	\N	user	77	2025-05-07 10:59:46.634989	33
442	user_status	User deactivated	User was deactivated by Admin User	\N	user	77	2025-05-07 10:59:46.665548	33
443	user_update	User information updated	User information was updated by Admin User	\N	user	78	2025-05-07 10:59:48.498375	33
444	user_status	User deactivated	User was deactivated by Admin User	\N	user	78	2025-05-07 10:59:48.539327	33
445	user_update	User information updated	User information was updated by Admin User	\N	user	79	2025-05-07 10:59:49.401519	33
446	user_status	User deactivated	User was deactivated by Admin User	\N	user	79	2025-05-07 10:59:49.440401	33
447	user_update	User information updated	User information was updated by Admin User	\N	user	67	2025-05-07 10:59:51.046743	33
448	user_status	User deactivated	User was deactivated by Admin User	\N	user	67	2025-05-07 10:59:51.091665	33
449	user_update	User information updated	User information was updated by Admin User	\N	user	89	2025-05-07 10:59:53.747821	33
450	user_status	User deactivated	User was deactivated by Admin User	\N	user	89	2025-05-07 10:59:53.7776	33
451	user_update	User information updated	User information was updated by Admin User	\N	user	56	2025-05-07 10:59:54.49141	33
452	user_status	User deactivated	User was deactivated by Admin User	\N	user	56	2025-05-07 10:59:54.521794	33
453	user_update	User information updated	User information was updated by Admin User	\N	user	68	2025-05-07 10:59:59.792659	33
454	user_status	User deactivated	User was deactivated by Admin User	\N	user	68	2025-05-07 10:59:59.822844	33
455	user_update	User information updated	User information was updated by Admin User	\N	user	82	2025-05-07 11:00:00.98517	33
456	user_status	User deactivated	User was deactivated by Admin User	\N	user	82	2025-05-07 11:00:01.015829	33
457	user_update	User information updated	User information was updated by Admin User	\N	user	81	2025-05-07 11:00:10.392532	33
458	user_status	User deactivated	User was deactivated by Admin User	\N	user	81	2025-05-07 11:00:10.4343	33
459	user_update	User information updated	User information was updated by Admin User	\N	user	80	2025-05-07 11:00:13.561049	33
460	user_status	User deactivated	User was deactivated by Admin User	\N	user	80	2025-05-07 11:00:13.591436	33
461	user_update	User information updated	User information was updated by Admin User	\N	user	61	2025-05-07 11:00:16.747471	33
462	user_status	User deactivated	User was deactivated by Admin User	\N	user	61	2025-05-07 11:00:16.779001	33
463	user_update	User information updated	User information was updated by Admin User	\N	user	44	2025-05-07 11:00:49.976516	33
464	user_status	User deactivated	User was deactivated by Admin User	\N	user	44	2025-05-07 11:00:50.008614	33
465	user_update	User information updated	User information was updated by Admin User	\N	user	36	2025-05-07 11:00:54.706385	33
466	user_status	User deactivated	User was deactivated by Admin User	\N	user	36	2025-05-07 11:00:54.740799	33
467	user_update	User information updated	User information was updated by Admin User	\N	user	41	2025-05-07 11:00:56.653859	33
468	user_status	User deactivated	User was deactivated by Admin User	\N	user	41	2025-05-07 11:00:56.688181	33
469	user_update	User information updated	User information was updated by Admin User	\N	user	38	2025-05-07 11:00:58.347427	33
470	user_status	User deactivated	User was deactivated by Admin User	\N	user	38	2025-05-07 11:00:58.377834	33
471	user_update	User information updated	User information was updated by Admin User	\N	user	74	2025-05-07 11:00:59.746678	33
472	user_status	User deactivated	User was deactivated by Admin User	\N	user	74	2025-05-07 11:00:59.778315	33
473	user_update	User information updated	User information was updated by Admin User	\N	user	75	2025-05-07 11:01:01.778299	33
474	user_status	User deactivated	User was deactivated by Admin User	\N	user	75	2025-05-07 11:01:01.811943	33
475	user_update	User information updated	User information was updated by Admin User	\N	user	37	2025-05-07 11:01:05.899964	33
476	user_status	User deactivated	User was deactivated by Admin User	\N	user	37	2025-05-07 11:01:05.933843	33
477	user_update	User information updated	User information was updated by Admin User	\N	user	39	2025-05-07 11:01:07.674592	33
478	user_status	User deactivated	User was deactivated by Admin User	\N	user	39	2025-05-07 11:01:07.710384	33
479	user_update	User information updated	User information was updated by Admin User	\N	user	40	2025-05-07 11:01:09.663817	33
480	user_status	User deactivated	User was deactivated by Admin User	\N	user	40	2025-05-07 11:01:09.694332	33
481	user_update	User information updated	User information was updated by Admin User	\N	user	53	2025-05-07 11:01:14.782847	33
482	user_status	User deactivated	User was deactivated by Admin User	\N	user	53	2025-05-07 11:01:14.818102	33
483	user_update	User information updated	User information was updated by Admin User	\N	user	73	2025-05-07 11:01:19.686859	33
484	user_status	User deactivated	User was deactivated by Admin User	\N	user	73	2025-05-07 11:01:19.723047	33
485	user_update	User information updated	User information was updated by Admin User	\N	user	65	2025-05-07 11:01:21.405569	33
486	user_status	User deactivated	User was deactivated by Admin User	\N	user	65	2025-05-07 11:01:21.439568	33
487	user_update	User information updated	User information was updated by Admin User	\N	user	72	2025-05-07 11:01:26.38226	33
488	user_status	User deactivated	User was deactivated by Admin User	\N	user	72	2025-05-07 11:01:26.415873	33
489	user_update	User information updated	User information was updated by Admin User	\N	user	71	2025-05-07 11:01:28.480472	33
490	user_status	User deactivated	User was deactivated by Admin User	\N	user	71	2025-05-07 11:01:28.513257	33
491	user_update	User information updated	User information was updated by Admin User	\N	user	49	2025-05-07 11:01:32.472778	33
492	user_status	User deactivated	User was deactivated by Admin User	\N	user	49	2025-05-07 11:01:32.509953	33
493	user_update	User information updated	User information was updated by Admin User	\N	user	62	2025-05-07 11:01:35.110432	33
494	user_status	User deactivated	User was deactivated by Admin User	\N	user	62	2025-05-07 11:01:35.142468	33
495	user_update	User information updated	User information was updated by Admin User	\N	user	54	2025-05-07 11:01:37.207775	33
496	user_status	User deactivated	User was deactivated by Admin User	\N	user	54	2025-05-07 11:01:37.250657	33
497	user_update	User information updated	User information was updated by Admin User	\N	user	42	2025-05-07 11:01:50.400815	33
498	user_status	User deactivated	User was deactivated by Admin User	\N	user	42	2025-05-07 11:01:50.437115	33
499	user_update	User information updated	User information was updated by Admin User	\N	user	51	2025-05-07 11:01:52.904902	33
500	user_status	User deactivated	User was deactivated by Admin User	\N	user	51	2025-05-07 11:01:52.935262	33
501	user_update	User information updated	User information was updated by Admin User	\N	user	57	2025-05-07 11:01:54.972942	33
502	user_status	User deactivated	User was deactivated by Admin User	\N	user	57	2025-05-07 11:01:55.002731	33
503	user_update	User information updated	User information was updated by Admin User	\N	user	85	2025-05-07 11:02:14.405045	33
504	user_status	User deactivated	User was deactivated by Admin User	\N	user	85	2025-05-07 11:02:14.435495	33
505	user_update	User information updated	User information was updated by Admin User	\N	user	46	2025-05-07 11:02:28.527796	33
506	user_status	User deactivated	User was deactivated by Admin User	\N	user	46	2025-05-07 11:02:28.557638	33
507	user_update	User information updated	User information was updated by Admin User	\N	user	64	2025-05-07 11:02:30.380025	33
508	user_status	User deactivated	User was deactivated by Admin User	\N	user	64	2025-05-07 11:02:30.410389	33
509	order	Invoice generated for order SO-2025-05902	Order SO-2025-05902 has been converted to an invoice	\N	order	157	2025-05-07 13:02:57.817457	91
510	payment	Payment received for Order SO-2025-05902	Order marked as paid by AKSHAY KUMAR	\N	order	157	2025-05-07 13:03:06.077009	91
511	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-08 05:38:57.120912	33
512	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	93	2025-05-08 05:39:07.443178	33
513	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	33	2025-05-08 05:39:23.742583	33
514	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	91	2025-05-08 05:39:38.608007	33
515	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	91	2025-05-08 05:40:26.425153	33
516	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-08 05:40:33.933589	33
517	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	93	2025-05-08 05:41:02.238309	33
518	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-08 05:41:10.332713	33
519	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	33	2025-05-08 05:41:19.928103	33
520	user_update	User information updated	User information was updated by Admin User	\N	user	91	2025-05-08 06:08:54.652717	33
521	user_status	User deactivated	User was deactivated by Admin User	\N	user	91	2025-05-08 06:08:54.695824	33
522	user_update	User information updated	User information was updated by Admin User	\N	user	91	2025-05-08 06:09:11.877077	33
523	user_status	User activated	User was activated by Admin User	\N	user	91	2025-05-08 06:09:11.908546	33
524	user_update	User information updated	User information was updated by Admin User	\N	user	91	2025-05-08 06:10:18.217018	33
525	user_update	User information updated	User information was updated by Admin User	\N	user	81	2025-05-08 06:12:51.5662	33
526	user_status	User activated	User was activated by Admin User	\N	user	81	2025-05-08 06:12:51.598599	33
527	user_update	User information updated	User information was updated by Admin User	\N	user	81	2025-05-08 06:13:00.330499	33
528	user_status	User deactivated	User was deactivated by Admin User	\N	user	81	2025-05-08 06:13:00.36249	33
530	order	Invoice generated for order Rao Order 123	Order Rao Order 123 has been converted to an invoice	\N	order	162	2025-05-09 09:16:25.03582	33
531	payment	Payment received for Order Rao Order 123	Order marked as paid by Admin User	\N	order	162	2025-05-13 10:44:15.635192	33
532	payment	Payment received for Order SO-2025-05434	Order marked as paid by Admin User	\N	order	160	2025-05-13 10:44:21.030422	33
533	payment	Payment received for Order SO-2025-05412	Order marked as paid by Admin User	\N	order	156	2025-05-13 10:44:51.160029	33
534	payment	Payment received for Order SO-2025-04369	Order marked as paid by Admin User	\N	order	154	2025-05-13 10:44:54.201843	33
535	payment	Payment received for Order SO-2025-04630	Order marked as paid by Admin User	\N	order	151	2025-05-13 10:44:58.668709	33
536	payment	Payment received for Order SO-2025-04000	Order marked as paid by Admin User	\N	order	150	2025-05-13 10:45:06.180849	33
537	payment	Payment received for Order ORD-2023-002	Order marked as paid by Admin User	\N	order	148	2025-05-13 10:45:09.969517	33
538	user_update	User information updated	User information was updated by Admin User	\N	user	93	2025-05-13 10:51:31.104011	33
539	user_status	User activated	User was activated by Admin User	\N	user	93	2025-05-13 10:51:31.151655	33
540	user_update	User information updated	User information was updated by Admin User	\N	user	90	2025-05-13 10:51:35.485821	33
541	user_status	User activated	User was activated by Admin User	\N	user	90	2025-05-13 10:51:35.522619	33
542	user_update	User information updated	User information was updated by Admin User	\N	user	92	2025-05-13 10:51:50.759797	33
543	user_status	User activated	User was activated by Admin User	\N	user	92	2025-05-13 10:51:50.788187	33
544	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:50:19.79672	33
545	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:51:44.156382	33
546	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:51:44.513169	33
547	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:51:44.781293	33
548	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:51:44.796344	33
549	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:51:44.95421	33
550	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:51:44.978225	33
551	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:51:59.267456	33
552	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:52:08.248368	33
553	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 05:52:37.45868	33
554	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-14 06:00:02.023362	33
555	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	93	2025-05-14 06:00:12.510208	33
556	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	91	2025-05-14 06:00:19.641535	33
557	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	92	2025-05-14 06:00:36.589167	33
558	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-14 06:01:33.353181	33
559	team_assignment	User assigned to no team	User was removed from team by Admin User	\N	user	89	2025-05-14 06:04:41.492945	33
560	team_assignment	User assigned to no team	User was removed from team by Admin User	\N	user	91	2025-05-14 06:04:48.052984	33
561	user_update	User information updated	User information was updated by Admin User	\N	user	95	2025-05-14 06:08:10.043595	33
562	user_status	User deactivated	User was deactivated by Admin User	\N	user	95	2025-05-14 06:08:10.080384	33
563	user_update	User information updated	User information was updated by Admin User	\N	user	93	2025-05-14 06:10:28.669121	33
564	user_update	User information updated	User information was updated by Subbarao Kolla	\N	user	95	2025-05-14 06:12:01.413314	96
565	manager_assignment	User assigned to manager	User was assigned to a manager by Subbarao Kolla	\N	user	95	2025-05-14 06:12:23.510657	96
566	user_update	User information updated	User information was updated by Subbarao Kolla	\N	user	95	2025-05-14 06:12:51.995602	96
567	user_status	User activated	User was activated by Subbarao Kolla	\N	user	95	2025-05-14 06:12:52.028723	96
568	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	95	2025-05-14 06:19:19.06114	33
569	user_update	User information updated	User information was updated by Admin User	\N	user	95	2025-05-14 06:19:35.295999	33
570	user_update	User information updated	User information was updated by Admin User	\N	user	95	2025-05-14 06:19:48.503636	33
571	user_status	User deactivated	User was deactivated by Admin User	\N	user	95	2025-05-14 06:19:48.534706	33
572	team_assignment	User assigned to no team	User was removed from team by Admin User	\N	user	93	2025-05-14 06:20:04.689683	33
573	user_update	User information updated	User information was updated by Admin User	\N	user	95	2025-05-14 06:20:25.706144	33
574	user_status	User activated	User was activated by Admin User	\N	user	95	2025-05-14 06:20:25.736512	33
575	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-14 06:34:20.106733	33
576	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	93	2025-05-14 06:34:37.821166	33
577	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	93	2025-05-14 06:34:48.597228	33
578	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-14 06:34:59.385055	33
579	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-14 06:35:16.079049	33
580	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-14 06:36:03.367633	33
581	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	89	2025-05-14 06:36:21.645069	33
582	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-14 06:40:01.841673	33
583	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	93	2025-05-14 06:40:08.582795	33
584	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	93	2025-05-14 06:40:44.97968	33
585	team_assignment	User assigned to no team	User was removed from team by Admin User	\N	user	96	2025-05-14 06:40:55.083793	33
586	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-14 06:41:02.139568	33
587	team_assignment	User assigned to team	User was assigned to a team by Admin User	\N	user	90	2025-05-14 06:41:24.733597	33
588	manager_assignment	User assigned to no manager	User was removed from manager by Admin User	\N	user	97	2025-05-14 09:32:37.220999	33
590	call	BLDE HMS Demo Activity To be schedule on 14 th	BLDE HMS Demo Activity To be schedule on 14 th	2025-05-14 10:00:52.095	opportunity	343	2025-05-14 10:05:57.642965	98
591	order	Invoice generated for order SO-2025-05240	Order SO-2025-05240 has been converted to an invoice	\N	order	163	2025-05-14 10:08:55.077218	98
592	user_update	User information updated	User information was updated by Admin User	\N	user	91	2025-05-14 10:45:55.396345	33
594	user_update	User information updated	User information was updated by Admin User	\N	user	90	2025-05-14 10:50:27.936709	33
595	user_status	User deactivated	User was deactivated by Admin User	\N	user	90	2025-05-14 10:50:27.968724	33
596	payment	Payment received for Order SO-2025-05240	Order marked as paid by Admin User	\N	order	163	2025-05-14 13:10:06.844616	33
597	manager_assignment	User assigned to manager	User was assigned to a manager by Subbarao Kolla	\N	user	89	2025-05-15 11:40:37.045158	96
598	manager_assignment	User assigned to no manager	User was removed from manager by Subbarao Kolla	\N	user	89	2025-05-15 11:41:03.312946	96
599	user_update	User information updated	User information was updated by Admin User	\N	user	98	2025-05-15 11:45:54.796006	33
600	user_status	User deactivated	User was deactivated by Admin User	\N	user	98	2025-05-15 11:45:54.845084	33
601	user_update	User information updated	User information was updated by Suresh T	\N	user	96	2025-05-15 11:52:23.081194	99
602	user_update	User information updated	User information was updated by Suresh T	\N	user	99	2025-05-15 11:52:51.583644	99
603	manager_assignment	User assigned to manager	User was assigned to a manager by Admin User	\N	user	96	2025-05-15 11:55:18.784999	33
604	user_update	User information updated	User information was updated by Admin User	\N	user	89	2025-05-15 11:57:22.967318	33
605	user_status	User activated	User was activated by Admin User	\N	user	89	2025-05-15 11:57:23.01636	33
606	manager_assignment	User assigned to manager	User was assigned to a manager by Admin User	\N	user	89	2025-05-15 11:58:10.01823	33
607	user_update	User information updated	User information was updated by Admin User	\N	user	99	2025-05-15 11:58:11.718186	33
608	order	Invoice generated for order SO-2025-05418	Order SO-2025-05418 has been converted to an invoice	\N	order	165	2025-05-15 12:09:40.001361	96
609	meeting	Demo Activity To KIMS HOSPITALS	Demo Activity To KIMS HOSPITALS	2025-05-18 18:30:00	opportunity	347	2025-05-15 12:16:59.850009	90
610	assignment	Lead assigned to Akshay Kumar	Lead was assigned by Jagadeesh K	\N	lead	407	2025-05-15 13:19:26.259451	103
611	assignment	Lead assigned to Jagadeesh K	Lead was assigned by Admin User	\N	lead	406	2025-05-15 13:22:25.032958	33
612	user_update	User information updated	User information was updated by Admin User	\N	user	101	2025-05-16 05:02:28.632255	33
613	assignment	Lead assigned to Subbarao K	Lead was assigned by Suresh T	\N	lead	410	2025-05-16 05:12:48.096358	101
614	assignment	Lead assigned to Mayur M	Lead was assigned by Suresh T	\N	lead	411	2025-05-16 05:16:15.662801	101
615	order	Invoice generated for order SO-2025-05442	Order SO-2025-05442 has been converted to an invoice	\N	order	168	2025-05-16 05:24:50.191577	102
616	meeting	HIMS		2025-05-16 09:27:55.154	lead	410	2025-05-16 09:28:30.967722	101
617	call	HIMS		2025-05-16 09:29:25.029	lead	413	2025-05-16 09:29:31.70967	101
618	call	Task 		2025-05-16 09:30:13.353	lead	413	2025-05-16 09:30:27.096175	101
619	call	Activity		2025-05-16 09:30:37.769	lead	413	2025-05-16 09:30:47.794372	101
620	call	EMR DEMO		2025-05-16 09:46:35.503	lead	408	2025-05-16 09:46:54.26949	101
621	user_update	User information updated	User information was updated by Admin User	\N	user	101	2025-05-16 09:51:09.239127	33
622	manager_assignment	User assigned to manager	User was assigned to a manager by Admin User	\N	user	103	2025-05-16 09:51:18.731356	33
623	assignment	Lead assigned to Suresh T	Lead was assigned by Suresh T	\N	lead	414	2025-05-16 09:56:03.1612	101
624	assignment	Lead assigned to Mayur M	Lead was assigned by Admin User	\N	lead	415	2025-05-16 10:49:38.099863	33
625	assignment	Lead assigned to Akshay Kumar	Lead was assigned by Admin User	\N	lead	416	2025-05-16 10:57:26.631464	33
626	call	Akshay2 Activity		2025-05-16 18:30:00	lead	416	2025-05-16 11:03:59.817551	104
627	call	Mayur 3 Activity Created	Mayur 3 Activity Created	2025-05-16 11:07:13.97	lead	415	2025-05-16 11:07:14.348868	105
628	call	Akshay 3 Activity 	Akshay 3 Activity 	2025-05-16 11:09:45.072	lead	416	2025-05-16 11:09:45.494046	104
629	order	Invoice generated for order SO-2025-05364	Order SO-2025-05364 has been converted to an invoice	\N	order	171	2025-05-16 11:28:00.417374	104
630	order	Invoice generated for order SO-2025-05015	Order SO-2025-05015 has been converted to an invoice	\N	order	172	2025-05-16 11:29:39.945976	105
631	meeting	Jagadeesh Today's  Activity In Dy Patil Company		2025-05-16 12:18:37.987	lead	418	2025-05-16 12:19:35.324844	103
632	meeting	Subbarao Activity On Ramesh Hospitals		2025-05-16 18:30:00	lead	417	2025-05-16 12:22:50.06428	102
633	payment	Payment received for Order SO-2025-05015	Order marked as paid by Suresh T	\N	order	172	2025-05-16 12:35:33.959568	101
634	payment	Payment received for Order SO-2025-05364	Order marked as paid by Suresh T	\N	order	171	2025-05-16 12:35:37.506184	101
635	order	Invoice generated for order SO-2025-05042	Order SO-2025-05042 has been converted to an invoice	\N	order	176	2025-05-16 12:50:06.400895	103
636	user_update	User information updated	User information was updated by Admin User	\N	user	102	2025-05-16 13:54:54.268076	33
637	user_update	User information updated	User information was updated by Admin User	\N	user	102	2025-05-16 13:54:59.970863	33
638	user_update	User information updated	User information was updated by Admin User	\N	user	102	2025-05-16 13:55:01.259398	33
639	user_update	User information updated	User information was updated by Admin User	\N	user	102	2025-05-16 13:55:10.299116	33
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointments (id, title, description, start_time, end_time, location, attendee_type, attendee_id, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.companies (id, name, industry, website, phone, address, notes, created_at, created_by, required_size_of_hospital) FROM stdin;
187	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:28:58.922326	33	\N
188	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:28:58.972059	33	\N
189	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:28:59.002156	33	\N
190	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:28:59.032094	33	\N
191	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:28:59.063558	33	\N
222	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:38:26.315995	33	\N
223	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:38:26.346524	33	\N
224	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:38:26.377288	33	\N
225	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:38:26.407312	33	\N
226	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:38:26.437299	33	\N
337	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:05:14.445814	33	\N
338	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:05:14.475908	33	\N
202	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:36:39.197859	33	\N
203	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:36:39.247301	33	\N
204	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:36:39.278472	33	\N
205	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:36:39.308592	33	\N
206	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:36:39.338159	33	\N
339	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:05:14.505603	33	\N
340	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:05:14.535446	33	\N
341	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:05:14.56508	33	\N
100	Apollo Hospitals	Multi-specialty Hospital	apollohospitals.com	+91 44 2829 6000	Greams Road, Chennai	Leading private healthcare provider with hospitals across India	2025-04-22 05:59:28.578603	33	\N
82	Max Healthcare	Multi-specialty Hospital	maxhealthcare.in	+91 11 4055 4055	Saket District, New Delhi	Leading hospital chain in North India with super-specialty centers	2025-04-22 05:57:44.996477	33	\N
192	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:29:06.516628	33	\N
167	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:22:55.354828	33	\N
168	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:22:55.387087	33	\N
169	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:22:55.419833	33	\N
170	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:22:55.451765	33	\N
171	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:22:55.483934	33	\N
43	Manipal Hospitals	Multi-specialty Hospital	manipalhospitals.com	+91 80 2502 4444	HAL Airport Road, Bangalore	Tertiary care hospital chain with academic background	2025-04-22 04:41:07.06683	1	\N
193	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:29:06.549146	33	\N
194	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:29:06.578172	33	\N
195	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:29:06.608469	33	\N
196	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:29:06.638493	33	\N
227	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:38:35.403284	33	\N
228	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:38:35.431912	33	\N
229	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:38:35.461417	33	\N
230	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:38:35.490719	33	\N
231	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:38:35.51876	33	\N
207	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:36:49.392294	33	\N
208	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:36:49.423432	33	\N
209	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:36:49.456035	33	\N
210	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:36:49.486983	33	\N
211	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:36:49.517444	33	\N
342	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:06:11.051335	33	\N
343	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:06:11.080635	33	\N
344	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:06:11.11023	33	\N
345	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:06:11.139302	33	\N
346	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:06:11.168822	33	\N
110	SRL Diagnostics	Diagnostic Center	srlworld.com	+91 124 391 4848	Sector 44, Noida	India's largest diagnostics chain with over 400 laboratories	2025-04-22 06:02:03.492702	33	\N
105	Medanta Medicity	Multi-specialty Hospital	medanta.org	+91 124 441 4141	Sector 38, Gurugram	Multi-super specialty institute led by renowned physicians	2025-04-22 06:01:53.234795	33	\N
7	Kokilaben Hospital	Multi-specialty Hospital	kokilabenhospital.com	+91 22 4269 6969	Andheri West, Mumbai	Advanced multi-specialty tertiary care hospital	2025-04-21 13:42:39.222754	1	\N
94	Hinduja Hospital	Medical College	hindujahospital.com	+91 4164292563	Ansari Nagar, New Delhi	Cybersecurity and data protection solutions	2025-04-22 05:57:59.500516	33	\N
377	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:13:24.131737	33	\N
96	Christian Medical College	Medical College	cmch-vellore.edu	+91 416 222 2102	Vellore, Tamil Nadu	Leading medical college and teaching hospital in South India	2025-04-22 05:57:59.563228	33	\N
95	Tata Memorial Hospital	Specialty Hospital	tmc.gov.in	+91 22 2417 7000	Parel, Mumbai	India's premier cancer care and research center	2025-04-22 05:57:59.53157	33	\N
347	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:07:04.678008	33	\N
92	Thyrocare Technologies	Diagnostic Center	thyrocare.com	+91 22 2762 2762	D-37/1, TTC Industrial Area, Navi Mumbai	Specialized in preventive healthcare diagnostics	2025-04-22 05:57:59.438773	33	\N
348	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:07:04.70777	33	\N
103	Manipal Hospitals	Multi-specialty Hospital	manipalhospitals.com	+91 80 2502 4444	HAL Airport Road, Bangalore	Tertiary care hospital chain with academic background	2025-04-22 06:01:53.170795	33	\N
349	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:07:04.737469	33	\N
367	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:10:36.268898	33	\N
97	Columbia Asia Hospitals	Government Hospital	columbiaasiahospitals.com	+91 5476724390	Andheri West, Mumbai	Leading tech company in cloud solutions	2025-04-22 05:59:28.487188	33	\N
232	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:40:30.201115	33	\N
233	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:40:30.232539	33	\N
172	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:23:04.960862	33	\N
173	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:23:04.993495	33	\N
98	Care Hospitals	Specialty Hospital	carehospitals.com	+91 2619311746	Sector 12, Chandigarh	Enterprise software provider	2025-04-22 05:59:28.518225	33	\N
174	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:23:05.027685	33	\N
175	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:23:05.057741	33	\N
176	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:23:05.09334	33	\N
234	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:40:30.262465	33	\N
235	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:40:30.292664	33	\N
236	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:40:30.322456	33	\N
378	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:13:24.178232	33	\N
350	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:07:04.766795	33	\N
351	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:07:04.795885	33	\N
368	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:10:36.319552	33	\N
212	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:37:22.484682	33	\N
213	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:37:22.518385	33	\N
214	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:37:22.553673	33	\N
215	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:37:22.585263	33	\N
197	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:29:29.848863	33	\N
198	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:29:29.880025	33	\N
199	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:29:29.910194	33	\N
200	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:29:29.939003	33	\N
201	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:29:29.968204	33	\N
369	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:10:36.349811	33	\N
370	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:10:36.37984	33	\N
379	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:13:24.209755	33	\N
380	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:13:24.241851	33	\N
381	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:13:24.27173	33	\N
93	Metropolis Healthcare	Diagnostic Center	metropolisindia.com	+91 22 3399 3939	Andheri West, Mumbai	Leading diagnostics company with extensive network across India	2025-04-22 05:57:59.469091	33	\N
177	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:25:00.897704	33	\N
178	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:25:00.927815	33	\N
179	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:25:00.957742	33	\N
180	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:25:00.987474	33	\N
181	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:25:01.017048	33	\N
352	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:07:14.595853	33	\N
353	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:07:14.626738	33	\N
13	Metropolis Healthcare	Diagnostic Center	metropolisindia.com	+91 22 3399 3939	Andheri West, Mumbai	Leading diagnostics company with extensive network across India	2025-04-21 13:44:57.219759	1	\N
371	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:10:36.409939	33	\N
354	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:07:14.66074	33	\N
355	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:07:14.693118	33	\N
356	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:07:14.723995	33	\N
237	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:40:39.778818	33	\N
238	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:40:39.809441	33	\N
239	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:40:39.839558	33	\N
240	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:40:39.872156	33	\N
241	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:40:39.902424	33	\N
102	Max Healthcare	Multi-specialty Hospital	maxhealthcare.in	+91 11 4055 4055	Saket District, New Delhi	Leading hospital chain in North India with super-specialty centers	2025-04-22 06:01:53.138542	33	\N
10	SRL Diagnostics	Diagnostic Center	srlworld.com	+91 124 391 4848	Sector 44, Noida	India's largest diagnostics chain with over 400 laboratories	2025-04-21 13:42:39.314194	1	\N
104	AIIMS Delhi	Government Hospital	aiims.edu	+91 11 2658 8500	Ansari Nagar, New Delhi	Premier government medical institution and hospital	2025-04-22 06:01:53.203051	33	\N
216	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:37:22.615488	33	\N
8	PGIMER Chandigarh	Government Hospital	pgimer.edu.in	+91 172 2746018	Sector 12, Chandigarh	Premier medical and research institution in North India	2025-04-21 13:42:39.253299	1	\N
9	JIPMER Puducherry	Medical College	jipmerpuducherry.com	+91 7288029323	Gorimedu, Puducherry	Digital marketing and brand strategy	2025-04-21 13:42:39.28409	1	\N
11	Dr. Lal PathLabs	Diagnostic Center	lalpathlabs.com	+91 11 3988 7777	Block E, Sector 18, Noida	Diagnostic chain with over 200 clinical laboratories	2025-04-21 13:44:57.149676	1	\N
12	Thyrocare Technologies	Diagnostic Center	thyrocare.com	+91 22 2762 2762	D-37/1, TTC Industrial Area, Navi Mumbai	Specialized in preventive healthcare diagnostics	2025-04-21 13:44:57.187375	1	\N
14	Hinduja Hospital	Medical College	hindujahospital.com	+91 8524287981	Ansari Nagar, New Delhi	Digital marketing and brand strategy	2025-04-21 13:44:57.251694	1	\N
6	Narayana Health	Multi-specialty Hospital	narayanahealth.org	+91 80 2216 0361	Bommasandra, Bangalore	Affordable healthcare provider known for cardiac care	2025-04-21 13:42:39.186144	1	\N
3	Manipal Hospitals	Multi-specialty Hospital	manipalhospitals.com	+91 80 2502 4444	HAL Airport Road, Bangalore	Tertiary care hospital chain with academic background	2025-04-21 13:40:47.374403	1	\N
5	Medanta Medicity	Multi-specialty Hospital	medanta.org	+91 124 441 4141	Sector 38, Gurugram	Multi-super specialty institute led by renowned physicians	2025-04-21 13:40:47.433992	1	\N
382	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:13:33.778864	33	\N
357	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:08:33.646437	33	\N
277	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:53:31.552597	33	\N
278	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:53:31.602445	33	\N
279	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:53:31.633233	33	\N
302	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:02:10.74675	33	\N
372	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:10:47.625595	33	\N
280	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:53:31.663604	33	\N
281	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:53:31.693659	33	\N
242	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:47:47.578489	33	\N
243	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:47:47.617518	33	\N
244	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:47:47.647187	33	\N
245	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:47:47.676202	33	\N
282	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:57:45.142151	33	\N
283	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:57:45.194489	33	\N
284	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:57:45.226705	33	\N
182	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:25:11.965014	33	\N
183	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:25:11.995573	33	\N
184	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:25:12.026642	33	\N
185	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:25:12.057382	33	\N
186	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:25:12.089247	33	\N
285	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:57:45.258807	33	\N
217	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:37:30.552893	33	\N
358	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:08:33.677278	33	\N
373	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:10:47.655191	33	\N
286	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:57:45.294069	33	\N
246	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:47:47.705266	33	\N
359	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:08:33.707749	33	\N
360	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:08:33.73889	33	\N
218	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:37:30.587314	33	\N
219	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:37:30.620839	33	\N
220	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:37:30.652515	33	\N
303	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:02:10.785986	33	\N
304	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:02:10.817025	33	\N
305	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:02:10.847596	33	\N
306	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:02:10.878077	33	\N
374	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:10:47.685696	33	\N
221	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:37:30.687038	33	\N
247	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:49:19.378121	33	\N
248	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:49:19.408677	33	\N
249	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:49:19.440121	33	\N
250	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:49:19.474446	33	\N
251	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:49:19.506988	33	\N
287	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:57:54.705142	33	\N
288	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:57:54.739509	33	\N
289	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:57:54.770204	33	\N
290	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:57:54.801359	33	\N
291	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:57:54.832509	33	\N
307	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:02:21.048407	33	\N
308	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:02:21.078437	33	\N
309	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:02:21.114052	33	\N
310	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:02:21.144338	33	\N
311	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:02:21.174305	33	\N
361	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:08:33.769851	33	\N
2	Max Healthcare	Multi-specialty Hospital	maxhealthcare.in	+91 11 4055 4055	Saket District, New Delhi	Leading hospital chain in North India with super-specialty centers	2025-04-21 13:40:47.343774	1	\N
84	AIIMS Delhi	Government Hospital	aiims.edu	+91 11 2658 8500	Ansari Nagar, New Delhi	Premier government medical institution and hospital	2025-04-22 05:57:45.060195	33	\N
4	AIIMS Delhi	Government Hospital	aiims.edu	+91 11 2658 8500	Ansari Nagar, New Delhi	Premier government medical institution and hospital	2025-04-21 13:40:47.404119	1	\N
375	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:10:47.72572	33	\N
376	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:10:47.755154	33	\N
1	Fortis Healthcare	Multi-specialty Hospital	fortishealthcare.com	+91 11 4277 6222	Bandra Kurla Complex, Mumbai	Multi-specialty healthcare provider with presence in Delhi NCR and other metros	2025-04-21 13:40:47.305447	1	\N
21	Fortis Healthcare	Multi-specialty Hospital	fortishealthcare.com	+91 11 4277 6222	Bandra Kurla Complex, Mumbai	Multi-specialty healthcare provider with presence in Delhi NCR and other metros	2025-04-22 04:13:47.273942	1	\N
252	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:49:28.795241	33	\N
253	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:49:28.82616	33	\N
254	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:49:28.856783	33	\N
255	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:49:28.88697	33	\N
256	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:49:28.916068	33	\N
292	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:59:46.287594	33	\N
293	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:59:46.318619	33	\N
294	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:59:46.350057	33	\N
295	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:59:46.381527	33	\N
296	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:59:46.412432	33	\N
312	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:02:51.333665	33	\N
313	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:02:51.363992	33	\N
314	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:02:51.394293	33	\N
315	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:02:51.424236	33	\N
316	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:02:51.454215	33	\N
362	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:08:43.356309	33	\N
363	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:08:43.386907	33	\N
364	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:08:43.417946	33	\N
365	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:08:43.448219	33	\N
366	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:08:43.478336	33	\N
413	MMIMSR MULLANA	Medical College	www.mmimsr.com	8059931500	Mulllana Ambala	Sanjeev Kumar	2025-05-14 07:08:25.751088	97	400
414	BLDE	Health Care	www.bldehospitals.com	9716865147	Bangalore		2025-05-14 09:35:56.545712	98	1000
415	Ramesh Hospitals	Health Care	www.rameshhospitals.com	9701587412	Vijayawada	800	2025-05-15 04:12:32.797263	99	800
419	KIMS 	Health Care	www.kimshealthcare.com	9987894500	Hyderabad	KIMS SECURABAD	2025-05-15 12:13:29.064214	90	400
421	OMEGA HOSPITALS	Health care	www.omegahealthcare.com	8877665521	Hyderabad		2025-05-16 05:28:08.509489	101	100
422	ASRAM	Health care	www.asram.com	9900127895	Eluru		2025-05-16 12:59:48.180666	105	400
317	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:03:01.691245	33	\N
318	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:03:01.722484	33	\N
319	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:03:01.755572	33	\N
320	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:03:01.786765	33	\N
321	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:03:01.815908	33	\N
130	SRL Diagnostics	Diagnostic Center	srlworld.com	+91 124 391 4848	Sector 44, Noida	India's largest diagnostics chain with over 400 laboratories	2025-04-22 06:06:55.147903	33	\N
125	Medanta Medicity	Multi-specialty Hospital	medanta.org	+91 124 441 4141	Sector 38, Gurugram	Multi-super specialty institute led by renowned physicians	2025-04-22 06:06:44.91011	33	\N
257	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:50:00.558318	33	\N
258	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:50:00.593117	33	\N
259	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:50:00.626981	33	\N
260	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:50:00.659798	33	\N
261	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:50:00.691126	33	\N
126	Narayana Health	Multi-specialty Hospital	narayanahealth.org	+91 80 2216 0361	Bommasandra, Bangalore	Affordable healthcare provider known for cardiac care	2025-04-22 06:06:44.94118	33	\N
127	Kokilaben Hospital	Multi-specialty Hospital	kokilabenhospital.com	+91 22 4269 6969	Andheri West, Mumbai	Advanced multi-specialty tertiary care hospital	2025-04-22 06:06:55.05546	33	\N
128	PGIMER Chandigarh	Government Hospital	pgimer.edu.in	+91 172 2746018	Sector 12, Chandigarh	Premier medical and research institution in North India	2025-04-22 06:06:55.086683	33	\N
131	Dr. Lal PathLabs	Diagnostic Center	lalpathlabs.com	+91 11 3988 7777	Block E, Sector 18, Noida	Diagnostic chain with over 200 clinical laboratories	2025-04-22 06:06:55.177985	33	\N
132	Thyrocare Technologies	Diagnostic Center	thyrocare.com	+91 22 2762 2762	D-37/1, TTC Industrial Area, Navi Mumbai	Specialized in preventive healthcare diagnostics	2025-04-22 06:07:10.911976	33	\N
416	ASTER PRIME 	Health Care	www.asterprimehospitals.com	8064016627	Hyderabad	Hyderabad	2025-05-15 04:13:26.602968	99	400
420	Dy PATIL	Health Care	www.healthcare.com	9874567800	Mumbai	Dy Patil	2025-05-15 12:21:47.688982	89	10000
423	AVMC	Health care	www.avmc.com	8700129844	Chennai		2025-05-16 13:03:49.783854	104	800
297	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:59:56.392061	33	\N
298	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:59:56.422305	33	\N
299	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:59:56.451842	33	\N
300	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:59:56.480999	33	\N
301	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:59:56.52915	33	\N
129	JIPMER Puducherry	Medical College	jipmerpuducherry.com	+91 9345820910	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 06:06:55.117721	33	\N
262	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:50:10.764037	33	\N
263	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:50:10.799144	33	\N
264	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:50:10.829272	33	\N
265	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:50:10.882426	33	\N
266	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:50:10.913895	33	\N
15	Tata Memorial Hospital	Specialty Hospital	tmc.gov.in	+91 22 2417 7000	Parel, Mumbai	India's premier cancer care and research center	2025-04-21 13:44:57.282769	1	\N
322	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:04:04.3522	33	\N
323	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:04:04.383318	33	\N
324	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:04:04.413983	33	\N
325	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:04:04.444427	33	\N
267	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:51:14.099337	33	\N
268	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:51:14.128901	33	\N
269	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:51:14.158342	33	\N
270	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:51:14.187716	33	\N
271	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:51:14.217	33	\N
326	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:04:04.474031	33	\N
417	Bhatia Hospitals 	Health Care	www.bhatiahospitals.com	8895898725	mumbai	mumbai	2025-05-15 04:14:39.02077	99	800
424	Sunshine 	Health care	www.sunshine.com	9658097410	Vizag		2025-05-16 13:05:15.280728	103	400
156	Christian Medical College	Medical College	cmch-vellore.edu	+91 416 222 2102	Vellore, Tamil Nadu	Leading medical college and teaching hospital in South India	2025-04-22 06:12:55.557425	33	\N
418	PIMS	Health Care	www.pims.com	7064045987	Navi Mumbai	PIMS	2025-05-15 04:15:47.277638	99	1000
425	MRRCH	Health care	www.mrrch.com	9654563421	Mumbai	Mrrch	2025-05-16 13:09:41.179529	102	400
327	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:04:14.146501	33	\N
328	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:04:14.176426	33	\N
329	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:04:14.204613	33	\N
330	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:04:14.233898	33	\N
331	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:04:14.263193	33	\N
272	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:51:23.722863	33	\N
273	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:51:23.754079	33	\N
274	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:51:23.786963	33	\N
275	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:51:23.817842	33	\N
276	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:51:23.848925	33	\N
60	Apollo Hospitals	Multi-specialty Hospital	apollohospitals.com	+91 44 2829 6000	Greams Road, Chennai	Leading private healthcare provider with hospitals across India	2025-04-22 05:31:46.992053	1	\N
33	Metropolis Healthcare	Diagnostic Center	metropolisindia.com	+91 22 3399 3939	Andheri West, Mumbai	Leading diagnostics company with extensive network across India	2025-04-22 04:34:23.047851	1	\N
17	Columbia Asia Hospitals	Government Hospital	columbiaasiahospitals.com	+91 8808474493	Andheri West, Mumbai	Enterprise software provider	2025-04-22 04:10:10.772189	1	\N
18	Care Hospitals	Specialty Hospital	carehospitals.com	+91 9826284378	Sector 12, Chandigarh	Cybersecurity and data protection solutions	2025-04-22 04:10:10.801111	1	\N
19	Wockhardt Hospitals	Medical College	wockhardthospitals.com	+91 5863590210	Gorimedu, Puducherry	Digital marketing and brand strategy	2025-04-22 04:10:10.831763	1	\N
29	JIPMER Puducherry	Medical College	jipmerpuducherry.com	+91 3094647801	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 04:33:42.447112	1	\N
34	Hinduja Hospital	Medical College	hindujahospital.com	+91 7537315945	Ansari Nagar, New Delhi	Cybersecurity and data protection solutions	2025-04-22 04:34:23.076447	1	\N
28	PGIMER Chandigarh	Government Hospital	pgimer.edu.in	+91 172 2746018	Sector 12, Chandigarh	Premier medical and research institution in North India	2025-04-22 04:33:42.416938	1	\N
37	Columbia Asia Hospitals	Government Hospital	columbiaasiahospitals.com	+91 9465214821	Andheri West, Mumbai	Leading tech company in cloud solutions	2025-04-22 04:38:39.534899	1	\N
38	Care Hospitals	Specialty Hospital	carehospitals.com	+91 6768584984	Sector 12, Chandigarh	Enterprise software provider	2025-04-22 04:38:39.575622	1	\N
39	Wockhardt Hospitals	Medical College	wockhardthospitals.com	+91 5410084484	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 04:38:39.605698	1	\N
26	Narayana Health	Multi-specialty Hospital	narayanahealth.org	+91 80 2216 0361	Bommasandra, Bangalore	Affordable healthcare provider known for cardiac care	2025-04-22 04:31:27.340636	1	\N
25	Medanta Medicity	Multi-specialty Hospital	medanta.org	+91 124 441 4141	Sector 38, Gurugram	Multi-super specialty institute led by renowned physicians	2025-04-22 04:31:27.309991	1	\N
49	JIPMER Puducherry	Medical College	jipmerpuducherry.com	+91 1490705480	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 05:20:53.284484	1	\N
24	AIIMS Delhi	Government Hospital	aiims.edu	+91 11 2658 8500	Ansari Nagar, New Delhi	Premier government medical institution and hospital	2025-04-22 04:31:27.279936	1	\N
54	Hinduja Hospital	Medical College	hindujahospital.com	+91 6153061069	Ansari Nagar, New Delhi	Cybersecurity and data protection solutions	2025-04-22 05:21:05.996737	1	\N
332	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 07:05:04.321044	33	\N
57	Columbia Asia Hospitals	Government Hospital	columbiaasiahospitals.com	+91 4019073890	Andheri West, Mumbai	Leading tech company in cloud solutions	2025-04-22 05:31:46.883428	1	\N
58	Care Hospitals	Specialty Hospital	carehospitals.com	+91 1796377741	Sector 12, Chandigarh	Enterprise software provider	2025-04-22 05:31:46.926803	1	\N
59	Wockhardt Hospitals	Medical College	wockhardthospitals.com	+91 5654961506	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 05:31:46.960815	1	\N
32	Thyrocare Technologies	Diagnostic Center	thyrocare.com	+91 22 2762 2762	D-37/1, TTC Industrial Area, Navi Mumbai	Specialized in preventive healthcare diagnostics	2025-04-22 04:34:23.016745	1	\N
27	Kokilaben Hospital	Multi-specialty Hospital	kokilabenhospital.com	+91 22 4269 6969	Andheri West, Mumbai	Advanced multi-specialty tertiary care hospital	2025-04-22 04:33:42.386088	1	\N
35	Tata Memorial Hospital	Specialty Hospital	tmc.gov.in	+91 22 2417 7000	Parel, Mumbai	India's premier cancer care and research center	2025-04-22 04:34:23.105585	1	\N
23	Manipal Hospitals	Multi-specialty Hospital	manipalhospitals.com	+91 80 2502 4444	HAL Airport Road, Bangalore	Tertiary care hospital chain with academic background	2025-04-22 04:31:27.249267	1	\N
30	SRL Diagnostics	Diagnostic Center	srlworld.com	+91 124 391 4848	Sector 44, Noida	India's largest diagnostics chain with over 400 laboratories	2025-04-22 04:33:42.480193	1	\N
16	Christian Medical College	Medical College	cmch-vellore.edu	+91 416 222 2102	Vellore, Tamil Nadu	Leading medical college and teaching hospital in South India	2025-04-22 04:10:10.72466	1	\N
41	Fortis Healthcare	Multi-specialty Hospital	fortishealthcare.com	+91 11 4277 6222	Bandra Kurla Complex, Mumbai	Multi-specialty healthcare provider with presence in Delhi NCR and other metros	2025-04-22 04:38:39.665359	1	\N
22	Max Healthcare	Multi-specialty Hospital	maxhealthcare.in	+91 11 4055 4055	Saket District, New Delhi	Leading hospital chain in North India with super-specialty centers	2025-04-22 04:31:27.214438	1	\N
45	Medanta Medicity	Multi-specialty Hospital	medanta.org	+91 124 441 4141	Sector 38, Gurugram	Multi-super specialty institute led by renowned physicians	2025-04-22 04:41:07.130915	1	\N
31	Dr. Lal PathLabs	Diagnostic Center	lalpathlabs.com	+91 11 3988 7777	Block E, Sector 18, Noida	Diagnostic chain with over 200 clinical laboratories	2025-04-22 04:33:42.514654	1	\N
51	Dr. Lal PathLabs	Diagnostic Center	lalpathlabs.com	+91 11 3988 7777	Block E, Sector 18, Noida	Diagnostic chain with over 200 clinical laboratories	2025-04-22 05:20:53.342347	1	\N
47	Kokilaben Hospital	Multi-specialty Hospital	kokilabenhospital.com	+91 22 4269 6969	Andheri West, Mumbai	Advanced multi-specialty tertiary care hospital	2025-04-22 05:20:53.215516	1	\N
52	Thyrocare Technologies	Diagnostic Center	thyrocare.com	+91 22 2762 2762	D-37/1, TTC Industrial Area, Navi Mumbai	Specialized in preventive healthcare diagnostics	2025-04-22 05:21:05.93857	1	\N
333	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 07:05:04.351842	33	\N
44	AIIMS Delhi	Government Hospital	aiims.edu	+91 11 2658 8500	Ansari Nagar, New Delhi	Premier government medical institution and hospital	2025-04-22 04:41:07.100249	1	\N
46	Narayana Health	Multi-specialty Hospital	narayanahealth.org	+91 80 2216 0361	Bommasandra, Bangalore	Affordable healthcare provider known for cardiac care	2025-04-22 04:41:07.160477	1	\N
48	PGIMER Chandigarh	Government Hospital	pgimer.edu.in	+91 172 2746018	Sector 12, Chandigarh	Premier medical and research institution in North India	2025-04-22 05:20:53.255127	1	\N
334	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 07:05:04.381833	33	\N
74	Hinduja Hospital	Medical College	hindujahospital.com	+91 7383869514	Ansari Nagar, New Delhi	Industrial automation solutions	2025-04-22 05:44:35.217975	1	\N
69	JIPMER Puducherry	Medical College	jipmerpuducherry.com	+91 6440559408	Gorimedu, Puducherry	Leading IT consulting company	2025-04-22 05:44:32.556258	1	\N
78	Care Hospitals	Specialty Hospital	carehospitals.com	+91 5437522142	Sector 12, Chandigarh	EdTech company with learning apps	2025-04-22 05:44:42.251413	1	\N
79	Wockhardt Hospitals	Medical College	wockhardthospitals.com	+91 3040971432	Gorimedu, Puducherry	Largest commercial oil company in India	2025-04-22 05:44:42.313028	1	\N
62	Max Healthcare	Multi-specialty Hospital	maxhealthcare.in	+91 11 4055 4055	Saket District, New Delhi	Leading hospital chain in North India with super-specialty centers	2025-04-22 05:44:25.826511	1	\N
70	SRL Diagnostics	Diagnostic Center	srlworld.com	+91 124 391 4848	Sector 44, Noida	India's largest diagnostics chain with over 400 laboratories	2025-04-22 05:44:35.095308	1	\N
75	Tata Memorial Hospital	Specialty Hospital	tmc.gov.in	+91 22 2417 7000	Parel, Mumbai	India's premier cancer care and research center	2025-04-22 05:44:42.070758	1	\N
99	Wockhardt Hospitals	Medical College	wockhardthospitals.com	+91 5655570087	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 05:59:28.548477	33	\N
63	Manipal Hospitals	Multi-specialty Hospital	manipalhospitals.com	+91 80 2502 4444	HAL Airport Road, Bangalore	Tertiary care hospital chain with academic background	2025-04-22 05:44:25.859777	1	\N
71	Dr. Lal PathLabs	Diagnostic Center	lalpathlabs.com	+91 11 3988 7777	Block E, Sector 18, Noida	Diagnostic chain with over 200 clinical laboratories	2025-04-22 05:44:35.127379	1	\N
77	Columbia Asia Hospitals	Government Hospital	columbiaasiahospitals.com	+91 3705008871	Andheri West, Mumbai	Leading private healthcare provider with hospitals across India	2025-04-22 05:44:42.192564	1	\N
89	JIPMER Puducherry	Medical College	jipmerpuducherry.com	+91 6490732928	Gorimedu, Puducherry	Premier government medical institution and hospital	2025-04-22 05:57:50.115937	1	\N
109	JIPMER Puducherry	Medical College	jipmerpuducherry.com	+91 1867366882	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 06:02:03.461817	33	\N
65	Medanta Medicity	Multi-specialty Hospital	medanta.org	+91 124 441 4141	Sector 38, Gurugram	Multi-super specialty institute led by renowned physicians	2025-04-22 05:44:25.919007	1	\N
114	Hinduja Hospital	Medical College	hindujahospital.com	+91 3633522054	Ansari Nagar, New Delhi	Cybersecurity and data protection solutions	2025-04-22 06:04:30.889675	33	\N
64	AIIMS Delhi	Government Hospital	aiims.edu	+91 11 2658 8500	Ansari Nagar, New Delhi	Premier government medical institution and hospital	2025-04-22 05:44:25.889762	1	\N
72	Thyrocare Technologies	Diagnostic Center	thyrocare.com	+91 22 2762 2762	D-37/1, TTC Industrial Area, Navi Mumbai	Specialized in preventive healthcare diagnostics	2025-04-22 05:44:35.157736	1	\N
66	Narayana Health	Multi-specialty Hospital	narayanahealth.org	+91 80 2216 0361	Bommasandra, Bangalore	Affordable healthcare provider known for cardiac care	2025-04-22 05:44:25.948049	1	\N
20	Apollo Hospitals	Multi-specialty Hospital	apollohospitals.com	+91 44 2829 6000	Greams Road, Chennai	Leading private healthcare provider with hospitals across India	2025-04-22 04:10:10.86137	1	\N
68	PGIMER Chandigarh	Government Hospital	pgimer.edu.in	+91 172 2746018	Sector 12, Chandigarh	Premier medical and research institution in North India	2025-04-22 05:44:32.499697	1	\N
76	Christian Medical College	Medical College	cmch-vellore.edu	+91 416 222 2102	Vellore, Tamil Nadu	Leading medical college and teaching hospital in South India	2025-04-22 05:44:42.133157	1	\N
335	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 07:05:04.412209	33	\N
67	Kokilaben Hospital	Multi-specialty Hospital	kokilabenhospital.com	+91 22 4269 6969	Andheri West, Mumbai	Advanced multi-specialty tertiary care hospital	2025-04-22 05:44:32.440357	1	\N
73	Metropolis Healthcare	Diagnostic Center	metropolisindia.com	+91 22 3399 3939	Andheri West, Mumbai	Leading diagnostics company with extensive network across India	2025-04-22 05:44:35.187561	1	\N
91	Dr. Lal PathLabs	Diagnostic Center	lalpathlabs.com	+91 11 3988 7777	Block E, Sector 18, Noida	Diagnostic chain with over 200 clinical laboratories	2025-04-22 05:57:50.236285	1	\N
336	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 07:05:04.44212	33	\N
85	Medanta Medicity	Multi-specialty Hospital	medanta.org	+91 124 441 4141	Sector 38, Gurugram	Multi-super specialty institute led by renowned physicians	2025-04-22 05:57:49.878823	1	\N
90	SRL Diagnostics	Diagnostic Center	srlworld.com	+91 124 391 4848	Sector 44, Noida	India's largest diagnostics chain with over 400 laboratories	2025-04-22 05:57:50.176806	1	\N
112	Thyrocare Technologies	Diagnostic Center	thyrocare.com	+91 22 2762 2762	D-37/1, TTC Industrial Area, Navi Mumbai	Specialized in preventive healthcare diagnostics	2025-04-22 06:04:30.829543	33	\N
106	Narayana Health	Multi-specialty Hospital	narayanahealth.org	+91 80 2216 0361	Bommasandra, Bangalore	Affordable healthcare provider known for cardiac care	2025-04-22 06:01:53.266058	33	\N
87	Kokilaben Hospital	Multi-specialty Hospital	kokilabenhospital.com	+91 22 4269 6969	Andheri West, Mumbai	Advanced multi-specialty tertiary care hospital	2025-04-22 05:57:49.996594	1	\N
88	PGIMER Chandigarh	Government Hospital	pgimer.edu.in	+91 172 2746018	Sector 12, Chandigarh	Premier medical and research institution in North India	2025-04-22 05:57:50.056414	1	\N
83	Manipal Hospitals	Multi-specialty Hospital	manipalhospitals.com	+91 80 2502 4444	HAL Airport Road, Bangalore	Tertiary care hospital chain with academic background	2025-04-22 05:57:45.029805	33	\N
107	Kokilaben Hospital	Multi-specialty Hospital	kokilabenhospital.com	+91 22 4269 6969	Andheri West, Mumbai	Advanced multi-specialty tertiary care hospital	2025-04-22 06:02:03.400163	33	\N
108	PGIMER Chandigarh	Government Hospital	pgimer.edu.in	+91 172 2746018	Sector 12, Chandigarh	Premier medical and research institution in North India	2025-04-22 06:02:03.431033	33	\N
86	Narayana Health	Multi-specialty Hospital	narayanahealth.org	+91 80 2216 0361	Bommasandra, Bangalore	Affordable healthcare provider known for cardiac care	2025-04-22 05:57:49.938231	1	\N
111	Dr. Lal PathLabs	Diagnostic Center	lalpathlabs.com	+91 11 3988 7777	Block E, Sector 18, Noida	Diagnostic chain with over 200 clinical laboratories	2025-04-22 06:02:03.523326	33	\N
117	Columbia Asia Hospitals	Government Hospital	columbiaasiahospitals.com	+91 9196570074	Andheri West, Mumbai	Leading tech company in cloud solutions	2025-04-22 06:04:41.092899	33	\N
118	Care Hospitals	Specialty Hospital	carehospitals.com	+91 5322708329	Sector 12, Chandigarh	Enterprise software provider	2025-04-22 06:04:41.125965	33	\N
119	Wockhardt Hospitals	Medical College	wockhardthospitals.com	+91 3877466884	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 06:04:41.15914	33	\N
124	AIIMS Delhi	Government Hospital	aiims.edu	+91 11 2658 8500	Ansari Nagar, New Delhi	Premier government medical institution and hospital	2025-04-22 06:06:44.879481	33	\N
134	Hinduja Hospital	Medical College	hindujahospital.com	+91 9418483589	Ansari Nagar, New Delhi	Cybersecurity and data protection solutions	2025-04-22 06:07:10.977277	33	\N
148	PGIMER Chandigarh	Government Hospital	pgimer.edu.in	+91 172 2746018	Sector 12, Chandigarh	Premier medical and research institution in North India	2025-04-22 06:12:45.462144	33	\N
137	Columbia Asia Hospitals	Government Hospital	columbiaasiahospitals.com	+91 4214891976	Andheri West, Mumbai	Leading tech company in cloud solutions	2025-04-22 06:08:42.538573	33	\N
138	Care Hospitals	Specialty Hospital	carehospitals.com	+91 3835589999	Sector 12, Chandigarh	Enterprise software provider	2025-04-22 06:08:42.569566	33	\N
139	Wockhardt Hospitals	Medical College	wockhardthospitals.com	+91 4720405933	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 06:08:42.600469	33	\N
116	Christian Medical College	Medical College	cmch-vellore.edu	+91 416 222 2102	Vellore, Tamil Nadu	Leading medical college and teaching hospital in South India	2025-04-22 06:04:30.949969	33	\N
152	Thyrocare Technologies	Diagnostic Center	thyrocare.com	+91 22 2762 2762	D-37/1, TTC Industrial Area, Navi Mumbai	Specialized in preventive healthcare diagnostics	2025-04-22 06:12:55.440431	33	\N
149	JIPMER Puducherry	Medical College	jipmerpuducherry.com	+91 6277321985	Gorimedu, Puducherry	Cybersecurity and data protection solutions	2025-04-22 06:12:45.493293	33	\N
121	Fortis Healthcare	Multi-specialty Hospital	fortishealthcare.com	+91 11 4277 6222	Bandra Kurla Complex, Mumbai	Multi-specialty healthcare provider with presence in Delhi NCR and other metros	2025-04-22 06:04:41.284194	33	\N
154	Hinduja Hospital	Medical College	hindujahospital.com	+91 7807885197	Ansari Nagar, New Delhi	Cybersecurity and data protection solutions	2025-04-22 06:12:55.498737	33	\N
150	SRL Diagnostics	Diagnostic Center	srlworld.com	+91 124 391 4848	Sector 44, Noida	India's largest diagnostics chain with over 400 laboratories	2025-04-22 06:12:45.524766	33	\N
157	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:19:52.734476	33	\N
158	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:19:52.763706	33	\N
159	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:19:52.794214	33	\N
160	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:19:52.823825	33	\N
161	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:19:52.853846	33	\N
122	Max Healthcare	Multi-specialty Hospital	maxhealthcare.in	+91 11 4055 4055	Saket District, New Delhi	Leading hospital chain in North India with super-specialty centers	2025-04-22 06:06:44.816335	33	\N
115	Tata Memorial Hospital	Specialty Hospital	tmc.gov.in	+91 22 2417 7000	Parel, Mumbai	India's premier cancer care and research center	2025-04-22 06:04:30.919366	33	\N
145	Medanta Medicity	Multi-specialty Hospital	medanta.org	+91 124 441 4141	Sector 38, Gurugram	Multi-super specialty institute led by renowned physicians	2025-04-22 06:08:52.475869	33	\N
40	Apollo Hospitals	Multi-specialty Hospital	apollohospitals.com	+91 44 2829 6000	Greams Road, Chennai	Leading private healthcare provider with hospitals across India	2025-04-22 04:38:39.635686	1	\N
123	Manipal Hospitals	Multi-specialty Hospital	manipalhospitals.com	+91 80 2502 4444	HAL Airport Road, Bangalore	Tertiary care hospital chain with academic background	2025-04-22 06:06:44.848401	33	\N
147	Kokilaben Hospital	Multi-specialty Hospital	kokilabenhospital.com	+91 22 4269 6969	Andheri West, Mumbai	Advanced multi-specialty tertiary care hospital	2025-04-22 06:12:45.430527	33	\N
146	Narayana Health	Multi-specialty Hospital	narayanahealth.org	+91 80 2216 0361	Bommasandra, Bangalore	Affordable healthcare provider known for cardiac care	2025-04-22 06:08:52.505526	33	\N
151	Dr. Lal PathLabs	Diagnostic Center	lalpathlabs.com	+91 11 3988 7777	Block E, Sector 18, Noida	Diagnostic chain with over 200 clinical laboratories	2025-04-22 06:12:45.555722	33	\N
133	Metropolis Healthcare	Diagnostic Center	metropolisindia.com	+91 22 3399 3939	Andheri West, Mumbai	Leading diagnostics company with extensive network across India	2025-04-22 06:07:10.947889	33	\N
61	Fortis Healthcare	Multi-specialty Hospital	fortishealthcare.com	+91 11 4277 6222	Bandra Kurla Complex, Mumbai	Multi-specialty healthcare provider with presence in Delhi NCR and other metros	2025-04-22 05:31:47.023277	1	\N
50	SRL Diagnostics	Diagnostic Center	srlworld.com	+91 124 391 4848	Sector 44, Noida	India's largest diagnostics chain with over 400 laboratories	2025-04-22 05:20:53.313078	1	\N
113	Metropolis Healthcare	Diagnostic Center	metropolisindia.com	+91 22 3399 3939	Andheri West, Mumbai	Leading diagnostics company with extensive network across India	2025-04-22 06:04:30.859258	33	\N
142	Max Healthcare	Multi-specialty Hospital	maxhealthcare.in	+91 11 4055 4055	Saket District, New Delhi	Leading hospital chain in North India with super-specialty centers	2025-04-22 06:08:52.388068	33	\N
143	Manipal Hospitals	Multi-specialty Hospital	manipalhospitals.com	+91 80 2502 4444	HAL Airport Road, Bangalore	Tertiary care hospital chain with academic background	2025-04-22 06:08:52.417484	33	\N
80	Apollo Hospitals	Multi-specialty Hospital	apollohospitals.com	+91 44 2829 6000	Greams Road, Chennai	Leading private healthcare provider with hospitals across India	2025-04-22 05:57:44.925621	33	\N
162	Acme Corp	Technology	https://acme.example.com	123-456-7890	123 Tech Blvd, San Francisco, CA 94107	Leading tech company in cloud solutions	2025-04-22 06:20:03.056112	33	\N
163	TechGiant Inc	Technology	https://techgiant.example.com	555-123-4567	555 Market St, San Francisco, CA 94105	Enterprise software provider	2025-04-22 06:20:03.089403	33	\N
164	SecureData LLC	Cybersecurity	https://securedata.example.com	888-555-1234	888 Security Rd, Boston, MA 02110	Cybersecurity and data protection solutions	2025-04-22 06:20:03.118864	33	\N
165	DigiFuture Co	Digital Marketing	https://digifuture.example.com	777-888-9999	777 Innovation Dr, Austin, TX 78701	Digital marketing and brand strategy	2025-04-22 06:20:03.148535	33	\N
166	GlobalTech Inc	Manufacturing	https://globaltech.example.com	222-333-4444	222 Industry Ave, Detroit, MI 48226	Industrial automation solutions	2025-04-22 06:20:03.177576	33	\N
120	Apollo Hospitals	Multi-specialty Hospital	apollohospitals.com	+91 44 2829 6000	Greams Road, Chennai	Leading private healthcare provider with hospitals across India	2025-04-22 06:04:41.19063	33	\N
140	Apollo Hospitals	Multi-specialty Hospital	apollohospitals.com	+91 44 2829 6000	Greams Road, Chennai	Leading private healthcare provider with hospitals across India	2025-04-22 06:08:42.630194	33	\N
81	Fortis Healthcare	Multi-specialty Hospital	fortishealthcare.com	+91 11 4277 6222	Bandra Kurla Complex, Mumbai	Multi-specialty healthcare provider with presence in Delhi NCR and other metros	2025-04-22 05:57:44.965433	33	\N
55	Tata Memorial Hospital	Specialty Hospital	tmc.gov.in	+91 22 2417 7000	Parel, Mumbai	India's premier cancer care and research center	2025-04-22 05:21:06.026207	1	\N
135	Tata Memorial Hospital	Specialty Hospital	tmc.gov.in	+91 22 2417 7000	Parel, Mumbai	India's premier cancer care and research center	2025-04-22 06:07:11.006669	33	\N
155	Tata Memorial Hospital	Specialty Hospital	tmc.gov.in	+91 22 2417 7000	Parel, Mumbai	India's premier cancer care and research center	2025-04-22 06:12:55.527966	33	\N
101	Fortis Healthcare	Multi-specialty Hospital	fortishealthcare.com	+91 11 4277 6222	Bandra Kurla Complex, Mumbai	Multi-specialty healthcare provider with presence in Delhi NCR and other metros	2025-04-22 05:59:28.608892	33	\N
141	Fortis Healthcare	Multi-specialty Hospital	fortishealthcare.com	+91 11 4277 6222	Bandra Kurla Complex, Mumbai	Multi-specialty healthcare provider with presence in Delhi NCR and other metros	2025-04-22 06:08:42.661146	33	\N
42	Max Healthcare	Multi-specialty Hospital	maxhealthcare.in	+91 11 4055 4055	Saket District, New Delhi	Leading hospital chain in North India with super-specialty centers	2025-04-22 04:41:07.033242	1	\N
53	Metropolis Healthcare	Diagnostic Center	metropolisindia.com	+91 22 3399 3939	Andheri West, Mumbai	Leading diagnostics company with extensive network across India	2025-04-22 05:21:05.968368	1	\N
153	Metropolis Healthcare	Diagnostic Center	metropolisindia.com	+91 22 3399 3939	Andheri West, Mumbai	Leading diagnostics company with extensive network across India	2025-04-22 06:12:55.470196	33	\N
144	AIIMS Delhi	Government Hospital	aiims.edu	+91 11 2658 8500	Ansari Nagar, New Delhi	Premier government medical institution and hospital	2025-04-22 06:08:52.446835	33	\N
36	Christian Medical College	Medical College	cmch-vellore.edu	+91 416 222 2102	Vellore, Tamil Nadu	Leading medical college and teaching hospital in South India	2025-04-22 04:34:23.134378	1	\N
56	Christian Medical College	Medical College	cmch-vellore.edu	+91 416 222 2102	Vellore, Tamil Nadu	Leading medical college and teaching hospital in South India	2025-04-22 05:21:06.055757	1	\N
136	Christian Medical College	Medical College	cmch-vellore.edu	+91 416 222 2102	Vellore, Tamil Nadu	Leading medical college and teaching hospital in South India	2025-04-22 06:07:11.035862	33	\N
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contacts (id, first_name, last_name, email, phone, title, company_id, notes, created_at, created_by) FROM stdin;
228	Priya	Patel	priya.patel@https://techgiant.example.com	+91 9871234567	Chief Medical Officer	188	Board-certified physician with focus on healthcare quality management	2025-04-22 06:40:40.054551	33
193	Meera	Krishnan	meera.krishnan@https://acme.example.com	+91 9867234515	Hospital Administrator	202	Focused on operational efficiency and process improvement	2025-04-22 06:36:39.496231	33
226	Vikram	Singh	vikram.singh@https://securedata.example.com	+91 9832456781	IT Director	189	Technology expert specializing in healthcare systems integration	2025-04-22 06:40:39.993343	33
174	Anita	Reddy	anita.reddy@https://digifuture.example.com	+91 9645123789	Head of Radiology	190	Radiology specialist interested in digital imaging solutions	2025-04-22 06:28:59.132847	33
231	Sanjay	Gupta	sanjay.gupta@https://globaltech.example.com	+91 9712385460	Lab Director	191	Pathology expert looking for laboratory information systems	2025-04-22 06:47:47.800704	33
191	Meera	Krishnan	meera.krishnan@https://acme.example.com	+91 9867234515	Hospital Administrator	222	Focused on operational efficiency and process improvement	2025-04-22 06:36:39.436641	33
264	Ravi	Mehta	ravi.mehta@https://techgiant.example.com	+91 9934217865	Procurement Manager	223	Manages procurement for medical equipment and IT systems	2025-04-22 06:53:31.724132	33
265	Sunita	Joshi	sunita.joshi@https://securedata.example.com	+91 9756431280	Senior Doctor	224	Physician interested in telemedicine solutions	2025-04-22 06:53:31.763114	33
266	Kiran	Kumar	kiran.kumar@https://digifuture.example.com	+91 9834567210	CTO	225	Technology leader with experience in healthcare digital transformation	2025-04-22 06:53:31.793593	33
267	Deepa	Nair	deepa.nair@https://globaltech.example.com	+91 9976541230	Medical Superintendent	226	Oversees hospital operations and patient care quality	2025-04-22 06:53:31.823702	33
268	Amit	Verma	amit.verma@https://acme.example.com	+91 9865432107	Finance Director	337	Financial planning expert for healthcare institutions	2025-04-22 06:53:31.854073	33
227	Neha	Agarwal	neha.agarwal@https://techgiant.example.com	+91 9745321890	Quality Manager	338	Specialist in healthcare accreditation and quality control	2025-04-22 06:40:40.02389	33
225	Arjun	Patel	arjun.patel@https://acme.example.com	+91 9877454584	Doctor	187	Technology expert specializing in healthcare systems integration	2025-04-22 06:40:39.963403	33
176	Deepak	Sharma	deepak.sharma@https://techgiant.example.com	+91 9836408266	Head Nurse	188	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:28:59.191312	33
155	Rahul	Singh	rahul.singh@https://securedata.example.com	+91 9844545882	Medical Officer	189	Board-certified physician with focus on healthcare quality management	2025-04-22 06:22:55.580825	33
229	Sunil	Kumar	sunil.kumar@https://digifuture.example.com	+91 9835633918	Resident Doctor	190	Technology leader with experience in healthcare digital transformation	2025-04-22 06:47:47.734484	33
233	Anil	Reddy	anil.reddy@https://globaltech.example.com	+91 9842695607	IT Manager	191	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:47:47.858462	33
153	Nikhil	Shah	nikhil.shah@https://acme.example.com	+91 9855566971	Administrative Officer	222	Radiology specialist interested in digital imaging solutions	2025-04-22 06:22:55.516392	33
156	Vivek	Joshi	vivek.joshi@https://techgiant.example.com	+91 9841445945	Facility Manager	223	Pathology expert looking for laboratory information systems	2025-04-22 06:22:55.612766	33
21	Rohit	Nair	rohit.nair@https://securedata.example.com	+91 9882425695	Doctor	224	Pathology expert looking for laboratory information systems	2025-04-22 04:12:10.849793	1
230	Ajay	Mehta	ajay.mehta@https://digifuture.example.com	+91 9865846167	Head Nurse	225	Focused on operational efficiency and process improvement	2025-04-22 06:47:47.770656	33
269	Vinod	Verma	vinod.verma@https://globaltech.example.com	+91 9862563397	Medical Officer	226	Technical decision maker, interested in cloud solutions	2025-04-22 06:57:45.330548	33
270	Arjun	Patel	arjun.patel@https://acme.example.com	+91 9845033688	Resident Doctor	337	Key stakeholder for enterprise software decisions	2025-04-22 06:57:45.371736	33
271	Deepak	Sharma	deepak.sharma@https://techgiant.example.com	+91 9845502561	IT Manager	338	Primary contact for security-related decisions	2025-04-22 06:57:45.405324	33
232	Sunil	Kumar	sunil.kumar@https://techgiant.example.com	+91 9855401202	Facility Manager	203	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:47:47.830207	33
190	Anil	Reddy	anil.reddy@https://securedata.example.com	+91 9834292240	Doctor	204	Technology expert specializing in healthcare systems integration	2025-04-22 06:36:39.407005	33
157	Nikhil	Shah	nikhil.shah@https://digifuture.example.com	+91 9844280311	Head Nurse	205	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:22:55.644523	33
289	Vivek	Joshi	vivek.joshi@https://globaltech.example.com	+91 9886384988	Medical Officer	206	Technical decision maker, interested in cloud solutions	2025-04-22 07:02:10.908788	33
290	Rohit	Nair	rohit.nair@https://securedata.example.com	+91 9891338839	Resident Doctor	339	Key stakeholder for enterprise software decisions	2025-04-22 07:02:10.946176	33
291	Ajay	Mehta	ajay.mehta@https://digifuture.example.com	+91 9876215806	IT Manager	340	Primary contact for security-related decisions	2025-04-22 07:02:10.977038	33
175	Vinod	Verma	vinod.verma@https://globaltech.example.com	+91 9820213490	Administrative Officer	341	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:28:59.162002	33
177	Arjun	Patel	arjun.patel@apollohospitals.com	+91 9871310513	Facility Manager	100	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:28:59.226108	33
224	Deepak	Sharma	deepak.sharma@maxhealthcare.in	+91 9810300618	Doctor	82	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:40:39.93245	33
154	Rahul	Singh	rahul.singh@https://acme.example.com	+91 9866710900	Head Nurse	192	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:22:55.548996	33
192	Sunil	Kumar	sunil.kumar@https://acme.example.com	+91 9893276112	Medical Officer	167	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:36:39.466574	33
189	Anil	Reddy	anil.reddy@https://techgiant.example.com	+91 9825865184	Resident Doctor	168	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:36:39.366924	33
173	Nikhil	Shah	nikhil.shah@https://securedata.example.com	+91 9846498123	IT Manager	169	Senior administrator with 15+ years of experience in hospital management	2025-04-22 06:28:59.093326	33
161	Rahul	Singh	rahul.singh@https://globaltech.example.com	+91 9879853752	IT Manager	196	Specialist in healthcare accreditation and quality control	2025-04-22 06:23:05.223767	33
320	Sunil	Kumar	sunil.kumar@https://acme.example.com	+91 9899864465	Administrative Officer	227	Key stakeholder for enterprise software decisions	2025-04-22 07:05:04.501216	33
321	Ajay	Mehta	ajay.mehta@https://acme.example.com	+91 9899642831	Resident Doctor	207	Primary contact for security-related decisions	2025-04-22 07:05:04.530928	33
322	Vinod	Verma	vinod.verma@https://techgiant.example.com	+91 9814637327	IT Manager	208	Interested in digital marketing strategies	2025-04-22 07:05:04.562085	33
178	Arjun	Patel	arjun.patel@https://securedata.example.com	+91 9837024830	Administrative Officer	209	Technical decision maker, interested in cloud solutions	2025-04-22 06:29:06.669245	33
181	Deepak	Sharma	deepak.sharma@https://digifuture.example.com	+91 9857636040	Facility Manager	210	Interested in digital marketing strategies	2025-04-22 06:29:06.75927	33
158	Rahul	Singh	rahul.singh@https://globaltech.example.com	+91 9826457561	Doctor	211	Manages procurement for medical equipment and IT systems	2025-04-22 06:23:05.125913	33
196	Sunil	Kumar	sunil.kumar@https://acme.example.com	+91 9881788759	Head Nurse	342	Primary contact for security-related decisions	2025-04-22 06:36:49.614138	33
234	Anil	Reddy	anil.reddy@https://techgiant.example.com	+91 9838753502	Medical Officer	343	Technical decision maker, interested in cloud solutions	2025-04-22 06:49:19.542805	33
236	Nikhil	Shah	nikhil.shah@https://securedata.example.com	+91 9855523504	Resident Doctor	344	Primary contact for security-related decisions	2025-04-22 06:49:19.60939	33
238	Vivek	Joshi	vivek.joshi@https://digifuture.example.com	+91 9855811736	IT Manager	345	Technical evaluator for cloud solutions	2025-04-22 06:49:19.675037	33
293	Rohit	Nair	rohit.nair@https://globaltech.example.com	+91 9824902279	Administrative Officer	346	Technical evaluator for cloud solutions	2025-04-22 07:02:11.039759	33
179	Ajay	Mehta	ajay.mehta@srlworld.com	+91 9896829804	Facility Manager	110	Key stakeholder for enterprise software decisions	2025-04-22 06:29:06.69913	33
162	Vinod	Verma	vinod.verma@medanta.org	+91 9841203720	Doctor	105	Technology leader with experience in healthcare digital transformation	2025-04-22 06:23:05.253567	33
237	Arjun	Patel	arjun.patel@kokilabenhospital.com	+91 9845252936	Head Nurse	7	Interested in digital marketing strategies	2025-04-22 06:49:19.642571	33
273	Rahul	Singh	rahul.singh@https://acme.example.com	+91 9821950677	Resident Doctor	377	Technical evaluator for cloud solutions	2025-04-22 06:57:45.472642	33
195	Sunil	Kumar	sunil.kumar@cmch-vellore.edu	+91 9845788059	IT Manager	96	Key stakeholder for enterprise software decisions	2025-04-22 06:36:49.583432	33
194	Anil	Reddy	anil.reddy@tmc.gov.in	+91 9848069098	Administrative Officer	95	Technical decision maker, interested in cloud solutions	2025-04-22 06:36:49.547255	33
235	Vivek	Joshi	vivek.joshi@thyrocare.com	+91 9896385566	Doctor	92	Key stakeholder for enterprise software decisions	2025-04-22 06:49:19.574837	33
180	Rohit	Nair	rohit.nair@https://techgiant.example.com	+91 9883465596	Head Nurse	348	Primary contact for security-related decisions	2025-04-22 06:29:06.72899	33
182	Vivek	Joshi	vivek.joshi@https://digifuture.example.com	+91 9889584667	Administrative Officer	170	Technical evaluator for cloud solutions	2025-04-22 06:29:06.789705	33
160	Rohit	Nair	rohit.nair@https://globaltech.example.com	+91 9817485171	Facility Manager	171	Financial planning expert for healthcare institutions	2025-04-22 06:23:05.193493	33
159	Ajay	Mehta	ajay.mehta@manipalhospitals.com	+91 9834959346	Doctor	43	Specialist in healthcare accreditation and quality control	2025-04-22 06:23:05.15846	33
197	Vinod	Verma	vinod.verma@https://techgiant.example.com	+91 9851432524	Head Nurse	193	Interested in digital marketing strategies	2025-04-22 06:36:49.645027	33
292	Ajay	Mehta	ajay.mehta@manipalhospitals.com	+91 9849078726	Medical Officer	103	Interested in digital marketing strategies	2025-04-22 07:02:11.007778	33
198	Deepak	Sharma	deepak.sharma@https://digifuture.example.com	+91 9853446669	Resident Doctor	195	Technical evaluator for cloud solutions	2025-04-22 06:36:49.676016	33
409	Mukesh	Takur	mukesh@gmail.com	9886580014	IT Manager	\N	\N	2025-05-16 13:08:46.81296	102
276	Arjun	Patel	arjun.patel@https://acme.example.com	+91 9850389983	IT Manager	367	Primary contact for security-related decisions	2025-04-22 06:57:54.927113	33
277	Deepak	Sharma	deepak.sharma@columbiaasiahospitals.com	+91 9853286780	Administrative Officer	97	Interested in digital marketing strategies	2025-04-22 06:57:54.957115	33
400	Sanjeev	K	sanjeevkumar@gmail.com	8895898714	IT 	\N	\N	2025-05-14 08:17:06.785741	33
240	Sunil	Kumar	sunil.kumar@https://techgiant.example.com	+91 9887265373	Doctor	233	Key stakeholder for enterprise software decisions	2025-04-22 06:49:28.977126	33
274	Anil	Reddy	anil.reddy@https://acme.example.com	+91 9857354048	Head Nurse	172	Technical decision maker, interested in cloud solutions	2025-04-22 06:57:54.863955	33
202	Nikhil	Shah	nikhil.shah@https://techgiant.example.com	+91 9820747668	Medical Officer	173	Interested in digital marketing strategies	2025-04-22 06:37:22.736444	33
164	Vivek	Joshi	vivek.joshi@carehospitals.com	+91 9842732120	Resident Doctor	98	Key stakeholder for enterprise software decisions	2025-04-22 06:25:01.076971	33
187	Rohit	Nair	rohit.nair@https://securedata.example.com	+91 9848843827	IT Manager	174	Technical evaluator for cloud solutions	2025-04-22 06:29:30.128079	33
199	Ajay	Mehta	ajay.mehta@https://digifuture.example.com	+91 9870963023	Administrative Officer	175	Technical decision maker, interested in cloud solutions	2025-04-22 06:37:22.646414	33
200	Vinod	Verma	vinod.verma@https://globaltech.example.com	+91 9882381470	Facility Manager	176	Key stakeholder for enterprise software decisions	2025-04-22 06:37:22.676867	33
167	Arjun	Patel	arjun.patel@https://securedata.example.com	+91 9832613169	Doctor	234	Technical evaluator for cloud solutions	2025-04-22 06:25:01.166518	33
241	Deepak	Sharma	deepak.sharma@https://digifuture.example.com	+91 9823918118	Head Nurse	235	Primary contact for security-related decisions	2025-04-22 06:49:29.007202	33
298	Rahul	Singh	rahul.singh@https://globaltech.example.com	+91 9848592750	Medical Officer	236	Technical evaluator for cloud solutions	2025-04-22 07:02:21.326547	33
242	Sunil	Kumar	sunil.kumar@https://techgiant.example.com	+91 9869440894	Resident Doctor	378	Interested in digital marketing strategies	2025-04-22 06:49:29.03776	33
401	Somesh	S	bldehospitals@gmail.com	9716865147	IT Manager	\N	\N	2025-05-14 09:36:39.745416	98
402	Ramesh	H	rameshhospitals@co.in	7064045123	IT Manager	\N	\N	2025-05-15 04:17:16.767495	99
403	SRIKANTH	K	kimssecurabad@gmail.com	9989782541	IT	\N	\N	2025-05-15 12:14:12.944505	90
405	Chandu	M	chandu@gmail.com	9872580014	IT Manager	\N	\N	2025-05-16 05:29:07.456931	101
406	Naresh	Kumar	naresh@asram.co.in	801239058749	IT Manager	\N	\N	2025-05-16 13:00:54.43895	105
163	Vinod	Verma	vinod.verma@https://securedata.example.com	+91 9859805517	Medical Officer	214	Specialist in healthcare accreditation and quality control	2025-04-22 06:25:01.046786	33
294	Arjun	Patel	arjun.patel@https://digifuture.example.com	+91 9866969522	Resident Doctor	215	Technical decision maker, interested in cloud solutions	2025-04-22 07:02:21.205016	33
295	Deepak	Sharma	deepak.sharma@https://acme.example.com	+91 9829548777	IT Manager	197	Key stakeholder for enterprise software decisions	2025-04-22 07:02:21.237243	33
296	Rahul	Singh	rahul.singh@https://techgiant.example.com	+91 9840332691	Administrative Officer	198	Primary contact for security-related decisions	2025-04-22 07:02:21.267005	33
297	Sunil	Kumar	sunil.kumar@https://securedata.example.com	+91 9884173450	Facility Manager	199	Interested in digital marketing strategies	2025-04-22 07:02:21.296555	33
183	Anil	Reddy	anil.reddy@https://digifuture.example.com	+91 9831140202	Doctor	200	Technical decision maker, interested in cloud solutions	2025-04-22 06:29:30.003413	33
184	Nikhil	Shah	nikhil.shah@https://globaltech.example.com	+91 9824681401	Head Nurse	201	Key stakeholder for enterprise software decisions	2025-04-22 06:29:30.035706	33
243	Rohit	Nair	rohit.nair@https://digifuture.example.com	+91 9848748714	Resident Doctor	370	Technical evaluator for cloud solutions	2025-04-22 06:49:29.066946	33
239	Vinod	Verma	vinod.verma@https://digifuture.example.com	+91 9848064302	Administrative Officer	380	Technical decision maker, interested in cloud solutions	2025-04-22 06:49:28.946749	33
165	Arjun	Patel	arjun.patel@https://globaltech.example.com	+91 9884669090	Facility Manager	381	Primary contact for security-related decisions	2025-04-22 06:25:01.106972	33
186	Deepak	Sharma	deepak.sharma@metropolisindia.com	+91 9814772043	Doctor	93	Interested in digital marketing strategies	2025-04-22 06:29:30.096633	33
166	Rahul	Singh	rahul.singh@https://acme.example.com	+91 9897756451	Head Nurse	177	Interested in digital marketing strategies	2025-04-22 06:25:01.136707	33
185	Vivek	Joshi	vivek.joshi@https://globaltech.example.com	+91 9893068967	Administrative Officer	181	Primary contact for security-related decisions	2025-04-22 06:29:30.065987	33
201	Rohit	Nair	rohit.nair@https://acme.example.com	+91 9893219227	Facility Manager	352	Primary contact for security-related decisions	2025-04-22 06:37:22.706359	33
275	Vinod	Verma	vinod.verma@https://securedata.example.com	+91 9841741625	Resident Doctor	349	Key stakeholder for enterprise software decisions	2025-04-22 06:57:54.896983	33
302	Deepak	Sharma	deepak.sharma@https://securedata.example.com	+91 9847962796	Resident Doctor	354	Interested in digital marketing strategies	2025-04-22 07:02:51.576046	33
280	Rahul	Singh	rahul.singh@https://digifuture.example.com	+91 9810471442	IT Manager	355	Key stakeholder for enterprise software decisions	2025-04-22 06:59:46.474051	33
281	Sunil	Kumar	sunil.kumar@https://globaltech.example.com	+91 9832098562	Administrative Officer	356	Primary contact for security-related decisions	2025-04-22 06:59:46.504316	33
169	Rahul	Singh	rahul.singh@https://globaltech.example.com	+91 9871806792	Doctor	216	Key stakeholder for enterprise software decisions	2025-04-22 06:25:12.150936	33
170	Sunil	Kumar	sunil.kumar@pgimer.edu.in	+91 9824051066	Head Nurse	8	Primary contact for security-related decisions	2025-04-22 06:25:12.181632	33
188	Anil	Reddy	anil.reddy@jipmerpuducherry.com	+91 9810004640	Medical Officer	9	\N	2025-04-22 06:32:29.679688	33
78	Nikhil	Shah	nikhil.shah@lalpathlabs.com	+91 9822177733	Resident Doctor	11	Technical decision maker, interested in cloud solutions	2025-04-22 05:57:59.594539	33
172	Vivek	Joshi	vivek.joshi@thyrocare.com	+91 9882622138	IT Manager	12	Technical evaluator for cloud solutions	2025-04-22 06:25:12.283341	33
246	Ajay	Mehta	ajay.mehta@narayanahealth.org	+91 9864913869	Facility Manager	6	Primary contact for security-related decisions	2025-04-22 06:50:00.807426	33
299	Vinod	Verma	vinod.verma@manipalhospitals.com	+91 9859781116	Doctor	3	Technical decision maker, interested in cloud solutions	2025-04-22 07:02:51.484786	33
247	Rahul	Singh	rahul.singh@https://acme.example.com	+91 9839693882	Resident Doctor	357	Interested in digital marketing strategies	2025-04-22 06:50:00.852206	33
279	Vivek	Joshi	vivek.joshi@https://acme.example.com	+91 9877454965	Doctor	302	Technical decision maker, interested in cloud solutions	2025-04-22 06:59:46.443532	33
300	Rohit	Nair	rohit.nair@https://acme.example.com	+91 9824606448	Head Nurse	372	Key stakeholder for enterprise software decisions	2025-04-22 07:02:51.515284	33
404	Jyoti	Patil	dypatiljyoti@gmail.com	9989782541	IT Manager	\N	\N	2025-05-15 12:22:53.165497	89
407	Sandeep	M	sandeep@gmail.com	9858108500	IT Manager	\N	\N	2025-05-16 13:02:45.529332	104
203	Vinod	Verma	vinod.verma@metropolisindia.com	+91 9875162961	Head Nurse	13	Technical evaluator for cloud solutions	2025-04-22 06:37:22.766292	33
282	Anil	Reddy	anil.reddy@https://acme.example.com	+91 9837582168	Facility Manager	237	Interested in digital marketing strategies	2025-04-22 06:59:46.534135	33
303	Nikhil	Shah	nikhil.shah@https://techgiant.example.com	+91 9829879431	Doctor	238	Technical evaluator for cloud solutions	2025-04-22 07:02:51.606059	33
283	Vivek	Joshi	vivek.joshi@https://securedata.example.com	+91 9872691204	Head Nurse	239	Technical evaluator for cloud solutions	2025-04-22 06:59:46.5645	33
171	Rohit	Nair	rohit.nair@https://digifuture.example.com	+91 9897555836	Medical Officer	240	Interested in digital marketing strategies	2025-04-22 06:25:12.252134	33
244	Ajay	Mehta	ajay.mehta@https://globaltech.example.com	+91 9872638624	Resident Doctor	241	Technical decision maker, interested in cloud solutions	2025-04-22 06:50:00.729725	33
245	Vinod	Verma	vinod.verma@maxhealthcare.in	+91 9821363440	IT Manager	102	Key stakeholder for enterprise software decisions	2025-04-22 06:50:00.771871	33
248	Arjun	Patel	arjun.patel@srlworld.com	+91 9889021937	Administrative Officer	10	Technical evaluator for cloud solutions	2025-04-22 06:50:00.886588	33
168	Deepak	Sharma	deepak.sharma@aiims.edu	+91 9883827696	Facility Manager	104	Technical decision maker, interested in cloud solutions	2025-04-22 06:25:12.120198	33
301	Arjun	Patel	arjun.patel@https://globaltech.example.com	+91 9883027775	Medical Officer	371	Primary contact for security-related decisions	2025-04-22 07:02:51.545311	33
250	Vinod	Verma	vinod.verma@https://securedata.example.com	+91 9867267422	Facility Manager	184	Key stakeholder for enterprise software decisions	2025-04-22 06:50:10.97619	33
251	Arjun	Patel	arjun.patel@https://digifuture.example.com	+91 9835276540	Doctor	185	Primary contact for security-related decisions	2025-04-22 06:50:11.007933	33
252	Deepak	Sharma	deepak.sharma@https://globaltech.example.com	+91 9827217956	Head Nurse	186	Interested in digital marketing strategies	2025-04-22 06:50:11.038262	33
253	Rahul	Singh	rahul.singh@https://digifuture.example.com	+91 9833329427	Medical Officer	285	Technical evaluator for cloud solutions	2025-04-22 06:50:11.068699	33
205	Sunil	Kumar	sunil.kumar@https://acme.example.com	+91 9873123715	Resident Doctor	217	Key stakeholder for enterprise software decisions	2025-04-22 06:37:30.753194	33
207	Anil	Reddy	anil.reddy@https://techgiant.example.com	+91 9890829077	IT Manager	358	Interested in digital marketing strategies	2025-04-22 06:37:30.816228	33
286	Nikhil	Shah	nikhil.shah@https://techgiant.example.com	+91 9822958453	Administrative Officer	373	Primary contact for security-related decisions	2025-04-22 06:59:56.616116	33
284	Vivek	Joshi	vivek.joshi@https://globaltech.example.com	+91 9854759231	Facility Manager	286	Technical decision maker, interested in cloud solutions	2025-04-22 06:59:56.558161	33
206	Ajay	Mehta	ajay.mehta@https://digifuture.example.com	+91 9896551284	Medical Officer	280	Primary contact for security-related decisions	2025-04-22 06:37:30.786092	33
208	Vinod	Verma	vinod.verma@https://globaltech.example.com	+91 9891702856	Resident Doctor	281	Technical evaluator for cloud solutions	2025-04-22 06:37:30.852368	33
249	Arjun	Patel	arjun.patel@https://acme.example.com	+91 9846478122	IT Manager	242	Technical decision maker, interested in cloud solutions	2025-04-22 06:50:10.945476	33
304	Deepak	Sharma	deepak.sharma@https://techgiant.example.com	+91 9857576637	Administrative Officer	243	Technical decision maker, interested in cloud solutions	2025-04-22 07:03:01.84597	33
307	Rahul	Singh	rahul.singh@https://securedata.example.com	+91 9869139257	Facility Manager	244	Interested in digital marketing strategies	2025-04-22 07:03:01.936255	33
305	Rahul	Singh	rahul.singh@https://digifuture.example.com	+91 9881041791	Administrative Officer	220	Key stakeholder for enterprise software decisions	2025-04-22 07:03:01.876402	33
306	Sunil	Kumar	sunil.kumar@https://techgiant.example.com	+91 9889166588	Facility Manager	303	Primary contact for security-related decisions	2025-04-22 07:03:01.906353	33
285	Anil	Reddy	anil.reddy@https://securedata.example.com	+91 9816908117	Doctor	304	Key stakeholder for enterprise software decisions	2025-04-22 06:59:56.587443	33
287	Nikhil	Shah	nikhil.shah@https://digifuture.example.com	+91 9842421777	Head Nurse	305	Interested in digital marketing strategies	2025-04-22 06:59:56.644944	33
288	Vivek	Joshi	vivek.joshi@https://globaltech.example.com	+91 9866857294	Medical Officer	306	Technical evaluator for cloud solutions	2025-04-22 06:59:56.673964	33
204	Rohit	Nair	rohit.nair@https://securedata.example.com	+91 9880912222	Resident Doctor	374	Technical decision maker, interested in cloud solutions	2025-04-22 06:37:30.721577	33
254	Deepak	Sharma	deepak.sharma@https://securedata.example.com	+91 9853962848	Resident Doctor	309	Technical decision maker, interested in cloud solutions	2025-04-22 06:51:14.247014	33
255	Rahul	Singh	rahul.singh@https://digifuture.example.com	+91 9821774655	IT Manager	310	Key stakeholder for enterprise software decisions	2025-04-22 06:51:14.275408	33
408	Bhavani	S	bhavani12@gmail.com	8877015521	IT Manager	\N	\N	2025-05-16 13:06:27.858115	103
256	Anil	Reddy	anil.reddy@https://acme.example.com	+91 9873686283	Resident Doctor	287	Primary contact for security-related decisions	2025-04-22 06:51:14.304063	33
257	Nikhil	Shah	nikhil.shah@https://techgiant.example.com	+91 9866735511	IT Manager	288	Interested in digital marketing strategies	2025-04-22 06:51:14.333271	33
258	Vivek	Joshi	vivek.joshi@https://securedata.example.com	+91 9855720576	Administrative Officer	289	Technical evaluator for cloud solutions	2025-04-22 06:51:14.362196	33
310	Ajay	Mehta	ajay.mehta@https://globaltech.example.com	+91 9815378572	Doctor	291	Key stakeholder for enterprise software decisions	2025-04-22 07:04:04.535436	33
209	Ajay	Mehta	ajay.mehta@https://techgiant.example.com	+91 9834925353	Resident Doctor	383	Technical decision maker, interested in cloud solutions	2025-04-22 06:38:26.466919	33
210	Vinod	Verma	vinod.verma@https://securedata.example.com	+91 9846294181	IT Manager	384	Key stakeholder for enterprise software decisions	2025-04-22 06:38:26.497297	33
211	Arjun	Patel	arjun.patel@https://digifuture.example.com	+91 9817926680	Administrative Officer	385	Primary contact for security-related decisions	2025-04-22 06:38:26.527148	33
212	Deepak	Sharma	deepak.sharma@https://digifuture.example.com	+91 9878772855	Facility Manager	375	Interested in digital marketing strategies	2025-04-22 06:38:26.555839	33
213	Rahul	Singh	rahul.singh@https://globaltech.example.com	+91 9842335054	Doctor	376	Technical evaluator for cloud solutions	2025-04-22 06:38:26.585569	33
31	Ajay	Mehta	ajay.mehta@https://securedata.example.com	+91 9846757260	Facility Manager	254	Interested in digital marketing strategies	2025-04-22 04:33:42.646701	1
136	Arjun	Patel	arjun.patel@https://globaltech.example.com	+91 9849236889	Head Nurse	256	Interested in digital marketing strategies	2025-04-22 06:12:45.681255	33
138	Deepak	Sharma	deepak.sharma@https://acme.example.com	+91 9843741836	Medical Officer	292	Technical decision maker, interested in cloud solutions	2025-04-22 06:12:55.590942	33
139	Rahul	Singh	rahul.singh@https://techgiant.example.com	+91 9889192498	Resident Doctor	293	Key stakeholder for enterprise software decisions	2025-04-22 06:12:55.620541	33
140	Sunil	Kumar	sunil.kumar@https://securedata.example.com	+91 9845265929	IT Manager	294	Primary contact for security-related decisions	2025-04-22 06:12:55.649547	33
6	Vivek	Joshi	vivek.joshi@https://acme.example.com	+91 9876994864	Doctor	312	Technical decision maker, interested in cloud solutions	2025-04-21 13:42:39.34448	1
137	Arjun	Patel	arjun.patel@https://globaltech.example.com	+91 9845229951	IT Manager	316	Technical evaluator for cloud solutions	2025-04-22 06:12:45.712698	33
141	Deepak	Sharma	deepak.sharma@https://acme.example.com	+91 9853928115	Administrative Officer	362	Interested in digital marketing strategies	2025-04-22 06:12:55.679173	33
214	Anil	Reddy	anil.reddy@https://digifuture.example.com	+91 9855990134	Head Nurse	365	Technical decision maker, interested in cloud solutions	2025-04-22 06:38:35.548364	33
217	Vinod	Verma	vinod.verma@https://digifuture.example.com	+91 9881983199	Facility Manager	320	Interested in digital marketing strategies	2025-04-22 06:38:35.637291	33
215	Arjun	Patel	arjun.patel@https://globaltech.example.com	+91 9838201662	Doctor	321	Key stakeholder for enterprise software decisions	2025-04-22 06:38:35.577927	33
216	Ajay	Mehta	ajay.mehta@thyrocare.com	+91 9887039228	Medical Officer	132	Primary contact for security-related decisions	2025-04-22 06:38:35.607833	33
218	Arjun	Patel	arjun.patel@medanta.org	+91 9821016356	IT Manager	125	Technical evaluator for cloud solutions	2025-04-22 06:38:35.667292	33
52	Nikhil	Shah	nikhil.shah@https://acme.example.com	+91 9859160742	Administrative Officer	322	Technical evaluator for cloud solutions	2025-04-22 05:20:53.50309	1
53	Vivek	Joshi	vivek.joshi@https://techgiant.example.com	+91 9843431241	Facility Manager	323	Technical decision maker, interested in cloud solutions	2025-04-22 05:21:06.085538	1
54	Rohit	Nair	rohit.nair@https://securedata.example.com	+91 9831074469	Doctor	324	Key stakeholder for enterprise software decisions	2025-04-22 05:21:06.115153	1
55	Ajay	Mehta	ajay.mehta@https://digifuture.example.com	+91 9827529880	Head Nurse	325	Primary contact for security-related decisions	2025-04-22 05:21:06.143742	1
56	Vinod	Verma	vinod.verma@https://acme.example.com	+91 9818305547	Medical Officer	267	Interested in digital marketing strategies	2025-04-22 05:21:06.17316	1
57	Arjun	Patel	arjun.patel@https://techgiant.example.com	+91 9886435714	Resident Doctor	268	Technical evaluator for cloud solutions	2025-04-22 05:21:06.20315	1
59	Deepak	Sharma	deepak.sharma@https://securedata.example.com	+91 9822462733	IT Manager	269	Key stakeholder for enterprise software decisions	2025-04-22 05:31:47.091051	1
60	Rahul	Singh	rahul.singh@https://digifuture.example.com	+91 9861195542	Administrative Officer	270	Primary contact for security-related decisions	2025-04-22 05:31:47.123591	1
61	Sunil	Kumar	sunil.kumar@https://globaltech.example.com	+91 9837312730	Facility Manager	271	Interested in digital marketing strategies	2025-04-22 05:31:47.15478	1
62	Anil	Reddy	anil.reddy@https://globaltech.example.com	+91 9865170488	Doctor	326	Technical evaluator for cloud solutions	2025-04-22 05:31:47.191573	1
63	Nikhil	Shah	nikhil.shah@https://acme.example.com	+91 9828607834	Head Nurse	327	Technical decision maker, interested in cloud solutions	2025-04-22 05:44:25.975789	1
64	Vivek	Joshi	vivek.joshi@https://techgiant.example.com	+91 9878658901	Medical Officer	328	Key stakeholder for enterprise software decisions	2025-04-22 05:44:26.009259	1
65	Rohit	Nair	rohit.nair@https://securedata.example.com	+91 9872715532	Resident Doctor	329	Primary contact for security-related decisions	2025-04-22 05:44:26.037942	1
66	Ajay	Mehta	ajay.mehta@https://digifuture.example.com	+91 9884803340	IT Manager	330	Interested in digital marketing strategies	2025-04-22 05:44:26.066748	1
67	Vinod	Verma	vinod.verma@https://globaltech.example.com	+91 9832905272	Administrative Officer	331	Technical evaluator for cloud solutions	2025-04-22 05:44:26.096356	1
68	Arjun	Patel	arjun.patel@apollohospitals.com	+91 9856789527	Facility Manager	60	Technical decision maker, interested in cloud solutions	2025-04-22 05:44:35.249224	1
69	Deepak	Sharma	deepak.sharma@https://acme.example.com	+91 9813057286	Doctor	272	Key stakeholder for enterprise software decisions	2025-04-22 05:44:35.279334	1
70	Rahul	Singh	rahul.singh@https://techgiant.example.com	+91 9881427668	Head Nurse	273	Primary contact for security-related decisions	2025-04-22 05:44:35.309741	1
71	Sunil	Kumar	sunil.kumar@https://securedata.example.com	+91 9828522423	Medical Officer	274	Interested in digital marketing strategies	2025-04-22 05:44:35.339649	1
72	Anil	Reddy	anil.reddy@https://digifuture.example.com	+91 9895107061	Resident Doctor	275	Technical evaluator for cloud solutions	2025-04-22 05:44:35.369486	1
74	Nikhil	Shah	nikhil.shah@https://globaltech.example.com	+91 9889958969	IT Manager	276	Key stakeholder for enterprise software decisions	2025-04-22 05:57:45.127345	33
75	Vivek	Joshi	vivek.joshi@cmch-vellore.edu	+91 9862679019	Administrative Officer	156	Primary contact for security-related decisions	2025-04-22 05:57:45.158086	33
76	Rohit	Nair	rohit.nair@cmch-vellore.edu	+91 9852117022	Facility Manager	16	Interested in digital marketing strategies	2025-04-22 05:57:45.188578	33
77	Ajay	Mehta	ajay.mehta@columbiaasiahospitals.com	+91 9856285329	Doctor	17	Technical evaluator for cloud solutions	2025-04-22 05:57:45.218654	33
36	Deepak	Sharma	deepak.sharma@jipmerpuducherry.com	+91 9861477661	Resident Doctor	29	Interested in digital marketing strategies	2025-04-22 04:34:23.251462	1
40	Nikhil	Shah	nikhil.shah@carehospitals.com	+91 9884902498	Doctor	38	Primary contact for security-related decisions	2025-04-22 04:38:39.763029	1
44	Vivek	Joshi	vivek.joshi@wockhardthospitals.com	+91 9870771862	Head Nurse	39	Key stakeholder for enterprise software decisions	2025-04-22 04:41:07.222188	1
41	Rohit	Nair	rohit.nair@aiims.edu	+91 9882821881	Medical Officer	24	Interested in digital marketing strategies	2025-04-22 04:38:39.792755	1
259	Ajay	Mehta	ajay.mehta@maxhealthcare.in	+91 9822073018	Resident Doctor	22	Technical decision maker, interested in cloud solutions	2025-04-22 06:51:23.87912	33
42	Vinod	Verma	vinod.verma@jipmerpuducherry.com	+91 9898272787	IT Manager	49	Technical evaluator for cloud solutions	2025-04-22 04:38:39.827087	1
45	Arjun	Patel	arjun.patel@tmc.gov.in	+91 9858036328	Administrative Officer	35	Primary contact for security-related decisions	2025-04-22 04:41:07.252459	1
46	Deepak	Sharma	deepak.sharma@hindujahospital.com	+91 9892697434	Facility Manager	54	Interested in digital marketing strategies	2025-04-22 04:41:07.282821	1
47	Rahul	Singh	rahul.singh@https://acme.example.com	+91 9893554807	Doctor	332	Technical evaluator for cloud solutions	2025-04-22 04:41:07.313055	1
48	Sunil	Kumar	sunil.kumar@columbiaasiahospitals.com	+91 9894374162	Head Nurse	57	Technical decision maker, interested in cloud solutions	2025-04-22 05:20:53.372373	1
49	Anil	Reddy	anil.reddy@carehospitals.com	+91 9886029283	Medical Officer	58	Key stakeholder for enterprise software decisions	2025-04-22 05:20:53.407037	1
50	Nikhil	Shah	nikhil.shah@wockhardthospitals.com	+91 9820750359	Resident Doctor	59	Primary contact for security-related decisions	2025-04-22 05:20:53.436696	1
51	Anil	Reddy	anil.reddy@https://globaltech.example.com	+91 9838237075	IT Manager	266	Interested in digital marketing strategies	2025-04-22 05:20:53.466958	1
94	Rohit	Nair	rohit.nair@narayanahealth.org	+91 9867242186	Administrative Officer	26	Key stakeholder for enterprise software decisions	2025-04-22 06:02:03.584763	33
95	Ajay	Mehta	ajay.mehta@fortishealthcare.com	+91 9845345399	Facility Manager	41	Primary contact for security-related decisions	2025-04-22 06:02:03.614753	33
96	Vinod	Verma	vinod.verma@medanta.org	+91 9878466335	Doctor	25	Interested in digital marketing strategies	2025-04-22 06:02:03.646726	33
97	Arjun	Patel	arjun.patel@thyrocare.com	+91 9851838049	Head Nurse	32	Technical evaluator for cloud solutions	2025-04-22 06:02:03.677709	33
98	Deepak	Sharma	deepak.sharma@srlworld.com	+91 9820352679	Medical Officer	30	Technical decision maker, interested in cloud solutions	2025-04-22 06:04:30.982211	33
99	Sunil	Kumar	sunil.kumar@thyrocare.com	+91 9846587562	Head Nurse	52	Key stakeholder for enterprise software decisions	2025-04-22 06:04:31.012858	33
100	Anil	Reddy	anil.reddy@fortishealthcare.com	+91 9840145692	Medical Officer	41	Primary contact for security-related decisions	2025-04-22 06:04:31.04412	33
101	Nikhil	Shah	nikhil.shah@manipalhospitals.com	+91 9869570119	Resident Doctor	23	Interested in digital marketing strategies	2025-04-22 06:04:31.076853	33
102	Vivek	Joshi	vivek.joshi@narayanahealth.org	+91 9854736108	IT Manager	46	Technical evaluator for cloud solutions	2025-04-22 06:04:31.10706	33
103	Rohit	Nair	rohit.nair@aiims.edu	+91 9880704790	Administrative Officer	44	Technical decision maker, interested in cloud solutions	2025-04-22 06:04:41.320087	33
104	Ajay	Mehta	ajay.mehta@kokilabenhospital.com	+91 9893096845	Facility Manager	47	Key stakeholder for enterprise software decisions	2025-04-22 06:04:41.354599	33
105	Vinod	Verma	vinod.verma@https://techgiant.example.com	+91 9867612331	Doctor	333	Primary contact for security-related decisions	2025-04-22 06:04:41.388261	33
106	Arjun	Patel	arjun.patel@pgimer.edu.in	+91 9821072054	Head Nurse	48	Interested in digital marketing strategies	2025-04-22 06:04:41.41933	33
107	Deepak	Sharma	deepak.sharma@lalpathlabs.com	+91 9899285816	Medical Officer	51	Technical evaluator for cloud solutions	2025-04-22 06:04:41.450391	33
108	Rahul	Singh	rahul.singh@medanta.org	+91 9875176105	Resident Doctor	45	Technical decision maker, interested in cloud solutions	2025-04-22 06:06:44.972814	33
109	Sunil	Kumar	sunil.kumar@https://securedata.example.com	+91 9869742063	IT Manager	334	Key stakeholder for enterprise software decisions	2025-04-22 06:06:45.003745	33
110	Anil	Reddy	anil.reddy@hindujahospital.com	+91 9890684494	Administrative Officer	74	Primary contact for security-related decisions	2025-04-22 06:06:45.034955	33
111	Nikhil	Shah	nikhil.shah@jipmerpuducherry.com	+91 9835689050	Facility Manager	69	Interested in digital marketing strategies	2025-04-22 06:06:45.064429	33
112	Vivek	Joshi	vivek.joshi@carehospitals.com	+91 9834888141	Doctor	78	Technical evaluator for cloud solutions	2025-04-22 06:06:45.094766	33
113	Rohit	Nair	rohit.nair@wockhardthospitals.com	+91 9865209416	Head Nurse	79	Technical decision maker, interested in cloud solutions	2025-04-22 06:06:55.208376	33
114	Ajay	Mehta	ajay.mehta@apollohospitals.com	+91 9844298476	Medical Officer	20	Key stakeholder for enterprise software decisions	2025-04-22 06:06:55.238548	33
115	Vinod	Verma	vinod.verma@lalpathlabs.com	+91 9816613157	Resident Doctor	71	Primary contact for security-related decisions	2025-04-22 06:06:55.281362	33
116	Arjun	Patel	arjun.patel@cmch-vellore.edu	+91 9852304949	IT Manager	76	Interested in digital marketing strategies	2025-04-22 06:06:55.321711	33
117	Deepak	Sharma	deepak.sharma@wockhardthospitals.com	+91 9818188488	Administrative Officer	99	Technical evaluator for cloud solutions	2025-04-22 06:06:55.354576	33
118	Rahul	Singh	rahul.singh@aiims.edu	+91 9840161689	Facility Manager	64	Technical decision maker, interested in cloud solutions	2025-04-22 06:07:11.065407	33
119	Sunil	Kumar	sunil.kumar@manipalhospitals.com	+91 9834860118	Doctor	63	Key stakeholder for enterprise software decisions	2025-04-22 06:07:11.096341	33
120	Anil	Reddy	anil.reddy@columbiaasiahospitals.com	+91 9871818939	Head Nurse	77	Primary contact for security-related decisions	2025-04-22 06:07:11.125642	33
121	Nikhil	Shah	nikhil.shah@jipmerpuducherry.com	+91 9827881245	Medical Officer	89	Interested in digital marketing strategies	2025-04-22 06:07:11.155691	33
79	Vivek	Joshi	vivek.joshi@jipmerpuducherry.com	+91 9871928957	Resident Doctor	109	Key stakeholder for enterprise software decisions	2025-04-22 05:57:59.625621	33
80	Rohit	Nair	rohit.nair@tmc.gov.in	+91 9880114845	IT Manager	75	Primary contact for security-related decisions	2025-04-22 05:57:59.657264	33
81	Ajay	Mehta	ajay.mehta@hindujahospital.com	+91 9859014837	Administrative Officer	114	Interested in digital marketing strategies	2025-04-22 05:57:59.689051	33
82	Vinod	Verma	vinod.verma@metropolisindia.com	+91 9816346067	Facility Manager	73	Technical evaluator for cloud solutions	2025-04-22 05:57:59.719845	33
83	Arjun	Patel	arjun.patel@kokilabenhospital.com	+91 9873965182	Doctor	67	Technical decision maker, interested in cloud solutions	2025-04-22 05:59:28.638307	33
84	Deepak	Sharma	deepak.sharma@maxhealthcare.in	+91 9857710824	Head Nurse	62	Key stakeholder for enterprise software decisions	2025-04-22 05:59:28.66909	33
85	Rahul	Singh	rahul.singh@narayanahealth.org	+91 9878147828	Medical Officer	66	Primary contact for security-related decisions	2025-04-22 05:59:28.701618	33
86	Sunil	Kumar	sunil.kumar@thyrocare.com	+91 9872008305	Resident Doctor	72	Interested in digital marketing strategies	2025-04-22 05:59:28.731815	33
93	Vivek	Joshi	vivek.joshi@pgimer.edu.in	+91 9883084541	IT Manager	28	Technical decision maker, interested in cloud solutions	2025-04-22 06:02:03.554233	33
260	Deepak	Sharma	deepak.sharma@cmch-vellore.edu	+91 9862465270	Administrative Officer	76	Key stakeholder for enterprise software decisions	2025-04-22 06:51:23.910543	33
90	Rahul	Singh	rahul.singh@narayanahealth.org	+91 9877438953	Facility Manager	106	Primary contact for security-related decisions	2025-04-22 06:01:53.361126	33
261	Sunil	Kumar	sunil.kumar@https://globaltech.example.com	+91 9893632959	Doctor	336	Primary contact for security-related decisions	2025-04-22 06:51:23.945686	33
88	Anil	Reddy	anil.reddy@lalpathlabs.com	+91 9845023193	Head Nurse	91	Technical decision maker, interested in cloud solutions	2025-04-22 06:01:53.297652	33
89	Nikhil	Shah	nikhil.shah@pgimer.edu.in	+91 9879215973	Medical Officer	88	Key stakeholder for enterprise software decisions	2025-04-22 06:01:53.32968	33
92	Vivek	Joshi	vivek.joshi@kokilabenhospital.com	+91 9825737834	Head Nurse	27	Technical evaluator for cloud solutions	2025-04-22 06:01:53.423815	33
91	Rahul	Singh	rahul.singh@maxhealthcare.in	+91 9858238276	Head Nurse	22	Interested in digital marketing strategies	2025-04-22 06:01:53.392363	33
126	Ajay	Mehta	ajay.mehta@thyrocare.com	+91 9884947441	Administrative Officer	112	Interested in digital marketing strategies	2025-04-22 06:08:42.786462	33
87	Vinod	Verma	vinod.verma@metropolisindia.com	+91 9893828439	Facility Manager	73	Technical evaluator for cloud solutions	2025-04-22 05:59:28.761874	33
148	Arjun	Patel	arjun.patel@medanta.org	+91 9829239678	Doctor	85	Technical decision maker, interested in cloud solutions	2025-04-22 06:20:03.206841	33
149	Deepak	Sharma	deepak.sharma@pgimer.edu.in	+91 9850826253	Head Nurse	108	Key stakeholder for enterprise software decisions	2025-04-22 06:20:03.236063	33
219	Rahul	Singh	rahul.singh@lalpathlabs.com	+91 9891684612	Medical Officer	111	Technical decision maker, interested in cloud solutions	2025-04-22 06:40:30.352489	33
143	Sunil	Kumar	sunil.kumar@kokilabenhospital.com	+91 9872588212	Resident Doctor	107	Technical decision maker, interested in cloud solutions	2025-04-22 06:19:52.889533	33
145	Anil	Reddy	anil.reddy@srlworld.com	+91 9817266987	IT Manager	90	Primary contact for security-related decisions	2025-04-22 06:19:52.949582	33
220	Nikhil	Shah	nikhil.shah@narayanahealth.org	+91 9881466734	Administrative Officer	86	Key stakeholder for enterprise software decisions	2025-04-22 06:40:30.382619	33
221	Vivek	Joshi	vivek.joshi@columbiaasiahospitals.com	+91 9864215107	Facility Manager	117	Primary contact for security-related decisions	2025-04-22 06:40:30.412514	33
122	Arjun	Patel	arjun.patel@columbiaasiahospitals.com	+91 9845803641	Doctor	117	Technical evaluator for cloud solutions	2025-04-22 06:07:11.1851	33
123	Deepak	Sharma	deepak.sharma@carehospitals.com	+91 9890829235	Head Nurse	118	Technical decision maker, interested in cloud solutions	2025-04-22 06:08:42.69254	33
223	Rahul	Singh	rahul.singh@wockhardthospitals.com	+91 9896177728	Medical Officer	119	Technical evaluator for cloud solutions	2025-04-22 06:40:30.472659	33
142	Sunil	Kumar	sunil.kumar@kokilabenhospital.com	+91 9865409573	Resident Doctor	147	Technical evaluator for cloud solutions	2025-04-22 06:12:55.708521	33
222	Anil	Reddy	anil.reddy@hindujahospital.com	+91 9827273944	IT Manager	134	Interested in digital marketing strategies	2025-04-22 06:40:30.442404	33
124	Nikhil	Shah	nikhil.shah@aiims.edu	+91 9857535848	Administrative Officer	124	Key stakeholder for enterprise software decisions	2025-04-22 06:08:42.724801	33
125	Vivek	Joshi	vivek.joshi@columbiaasiahospitals.com	+91 9823460564	Facility Manager	137	Primary contact for security-related decisions	2025-04-22 06:08:42.755627	33
151	Rohit	Nair	rohit.nair@carehospitals.com	+91 9822223411	Doctor	138	Interested in digital marketing strategies	2025-04-22 06:20:03.294651	33
132	Vivek	Joshi	vivek.joshi@kokilabenhospital.com	+91 9888343865	Resident Doctor	87	Technical evaluator for cloud solutions	2025-04-22 06:08:52.651527	33
150	Rohit	Nair	rohit.nair@manipalhospitals.com	+91 9887735328	IT Manager	83	Primary contact for security-related decisions	2025-04-22 06:20:03.265374	33
152	Deepak	Sharma	deepak.sharma@fortishealthcare.com	+91 9836988837	Administrative Officer	121	Technical evaluator for cloud solutions	2025-04-22 06:20:03.324441	33
133	Rahul	Singh	rahul.singh@kokilabenhospital.com	+91 9825575076	Facility Manager	147	Technical decision maker, interested in cloud solutions	2025-04-22 06:12:45.587665	33
134	Sunil	Kumar	sunil.kumar@apollohospitals.com	+91 9881369812	Doctor	40	Key stakeholder for enterprise software decisions	2025-04-22 06:12:45.618915	33
135	Anil	Reddy	anil.reddy@srlworld.com	+91 9823367386	Head Nurse	150	Primary contact for security-related decisions	2025-04-22 06:12:45.65005	33
131	Nikhil	Shah	nikhil.shah@tmc.gov.in	+91 9859461966	Medical Officer	135	Interested in digital marketing strategies	2025-04-22 06:08:52.622125	33
73	Anil	Reddy	anil.reddy@https://securedata.example.com	+91 9896688454	Head Nurse	274	Technical decision maker, interested in cloud solutions	2025-04-22 05:57:45.091722	33
263	Rohit	Nair	rohit.nair@srlworld.com	+91 9836219870	Head Nurse	70	Technical evaluator for cloud solutions	2025-04-22 06:51:24.007342	33
144	Vivek	Joshi	vivek.joshi@kokilabenhospital.com	+91 9837916203	Resident Doctor	107	Key stakeholder for enterprise software decisions	2025-04-22 06:19:52.919994	33
128	Rahul	Singh	rahul.singh@manipalhospitals.com	+91 9876270828	IT Manager	83	Technical decision maker, interested in cloud solutions	2025-04-22 06:08:52.533657	33
129	Sunil	Kumar	sunil.kumar@metropolisindia.com	+91 9853016123	Administrative Officer	113	Key stakeholder for enterprise software decisions	2025-04-22 06:08:52.563174	33
130	Anil	Reddy	anil.reddy@srlworld.com	+91 9820648421	Facility Manager	90	Primary contact for security-related decisions	2025-04-22 06:08:52.592128	33
146	Arjun	Patel	arjun.patel@carehospitals.com	+91 9862961541	Administrative Officer	118	Interested in digital marketing strategies	2025-04-22 06:19:52.979917	33
127	Deepak	Sharma	deepak.sharma@wockhardthospitals.com	+91 9885252269	Facility Manager	119	Technical evaluator for cloud solutions	2025-04-22 06:08:42.818073	33
147	Rahul	Singh	rahul.singh@aiims.edu	+91 9843782777	Doctor	124	Technical evaluator for cloud solutions	2025-04-22 06:19:53.009593	33
58	Sunil	Kumar	sunil.kumar@hindujahospital.com	+91 9890324481	Head Nurse	134	Technical decision maker, interested in cloud solutions	2025-04-22 05:31:47.055013	1
262	Nikhil	Shah	nikhil.shah@lalpathlabs.com	+91 9854682341	Doctor	111	Interested in digital marketing strategies	2025-04-22 06:51:23.976593	33
316	Michael	Brown	michael.brown@securedata.example.com	888-222-3333	CISO	329	Primary contact for security-related decisions	2025-04-22 07:04:14.352485	33
317	Sarah	Davis	sarah.davis@digifuture.example.com	777-444-5555	Marketing Director	330	Interested in digital marketing strategies	2025-04-22 07:04:14.381668	33
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.leads (id, name, source, status, email, phone, company_name, notes, assigned_to, created_at, created_by, team_id, company_id, contact_id) FROM stdin;
407	Jawahar 	other	new	jawahar@gmail.com	9701785679	KIMS 	When Added  Website in lead source column in created lead  source name not showing in Leads List	104	2025-05-15 13:17:22.367848	102	\N	419	\N
406	Praveen Lead 	other	converted	praveen@gmail.com	9874561254	PIMS	Praveen lead	103	2025-05-15 13:11:57.123847	104	\N	418	\N
409	Akshay Lead 	referral	new	askhay@gmail.com	8877665544	BLDE	Lead To Askhay	104	2025-05-16 05:08:59.433263	101	\N	414	\N
411	Mayur Lead	referral	new	mayur@gmail.com	9872580012	MMIMSR MULLANA		105	2025-05-16 05:15:22.43608	105	\N	413	\N
410	subbarao	referral	converted	subbarao@gmail.com	9872580012	MMIMSR MULLANA	Lead Creation to Subbarao 	102	2025-05-16 05:11:55.834755	102	\N	413	\N
408	Sagar Lead  	social	converted	rameshhospitals@co.in	7064045789	KIMS 	Demo To PIMS On 16 th	102	2025-05-16 04:09:12.284133	102	\N	419	\N
412	Sunshine Hospital	website	new	contact@sunshinehospital.com	9876543210	\N	\N	35	2025-05-16 09:15:09.097718	33	\N	\N	\N
413	City Diagnostics	referral	contacted	info@citydiagnostics.com	8765432109	\N	\N	35	2025-05-16 09:15:09.097718	33	\N	\N	\N
414	suresh Lead	other	new	suresh@gmail.com	8877665533	Bhatia Hospitals 		101	2025-05-16 09:55:49.228214	101	\N	417	\N
415	Mayur2	referral	converted	mayur@gmail.com	9872580000	BLDE		105	2025-05-16 10:48:45.028042	105	\N	414	\N
416	Akshay 2	referral	converted	akshay@gmail.com	9872582212	Acme Corp		104	2025-05-16 10:56:56.178997	104	\N	382	\N
418	Jagadeesh Lead	referral	converted	jagadeesh@gmail.com	90008174100	Dy PATIL		103	2025-05-16 12:17:54.65257	103	\N	420	\N
417	Subbarao 1 Lead	referral	converted	subbarao@gmail.com	9874158000	Ramesh Hospitals		102	2025-05-16 12:13:16.772445	102	\N	415	\N
419	Suresh	referral	new	suresh@gmail.com	9988877666	KIMS 		101	2025-05-16 14:30:21.682295	101	\N	419	\N
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.modules (id, name, description, code, is_active, created_at, created_by, modified_at, modified_by, price) FROM stdin;
5	Appointment Scheduling	Advanced appointment scheduling with doctor availability, online booking, and SMS/email notifications.	APT-005	t	2025-05-06 12:59:26.821	33	\N	\N	\N
1	Front Office Management	Complete front desk solution for patient registration, admission, discharge, and transfer with queue management.	FO-001	t	2025-05-06 12:59:26.821	33	\N	\N	125000.00
2	Billing & Finance	Comprehensive billing system with insurance claim processing, package management, and financial reporting.	BL-002	t	2025-05-06 12:59:26.821	33	\N	\N	195000.00
3	Laboratory Information System	End-to-end lab management solution with sample tracking, automated result integration, and report generation.	LIS-003	t	2025-05-06 12:59:26.821	33	\N	\N	175000.00
7	Radiology Information System	Specialized system for radiology departments with DICOM integration and reporting capabilities.	RIS-007	t	2025-05-06 12:59:26.821	33	\N	\N	150000.00
4	Patient EMR	Electronic Medical Record system with clinical documentation, medical history, test results, and treatment plans.	EMR-004	t	2025-05-06 12:59:26.821	33	\N	\N	225000.00
6	Pharmacy Management	Complete pharmacy inventory management with prescription tracking, drug interactions, and stock alerts.	PH-006	t	2025-05-06 12:59:26.821	33	\N	\N	135000.00
8	Ward Management	In-patient ward management with bed allocation, patient tracking, and nursing station controls.	WD-008	t	2025-05-06 12:59:26.821	33	\N	\N	125000.00
9	OT Management	Operation theater scheduling, resource allocation, and procedure documentation system.	OT-009	t	2025-05-06 12:59:26.821	33	\N	\N	185000.00
10	Mobile Patient App	Branded mobile application for patients with appointment booking, report access, and telemedicine features.	APP-010	t	2025-05-06 12:59:26.821	33	\N	\N	175000.00
11	DOCUMENT MANAGEMENT SYSTEM	DMS001	DMS001	t	2025-05-07 06:05:46.358482	33	\N	\N	100000.00
12	ASSETMANGEMENT		ASSETMANGEMENT	t	2025-05-07 07:31:03.484456	33	\N	\N	\N
13	New Module		MD123	t	2025-05-09 05:39:42.664201	33	\N	\N	999.00
\.


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.opportunities (id, name, stage, value, probability, expected_close_date, notes, contact_id, company_id, lead_id, assigned_to, created_at, created_by, team_id) FROM stdin;
351	PIMS Opportunity	qualification	150000.00	30	2025-05-16 00:00:00	Praveen lead	\N	418	406	102	2025-05-16 03:58:32.704658	102	\N
352	MMIMSR MULLANA Opportunity	closing	100000.00	30	2025-05-16 00:00:00	Lead Creation to Subbarao 	\N	413	410	102	2025-05-16 05:17:39.749517	102	\N
353	KIMS  Opportunity	negotiation	10000.00	30	2025-05-16 00:00:00	Demo To PIMS On 16 th	\N	419	408	102	2025-05-16 05:22:48.537683	102	\N
354	BLDE Opportunity	proposal	200000.00	30	2025-05-16 00:00:00	\N	\N	414	415	105	2025-05-16 11:15:30.214609	105	\N
355	Acme Corp Opportunity	qualification	200000.00	30	2025-05-16 00:00:00	\N	\N	382	416	104	2025-05-16 11:17:58.240473	104	\N
356	Ramesh Hospitals Opportunity	proposal	500000.00	30	2025-05-16 00:00:00	\N	\N	415	417	102	2025-05-16 12:14:34.590554	102	\N
357	Dy PATIL Opportunity	qualification	300000.00	30	2025-05-17 00:00:00	Jagadeesh HMS Demo to Dy Patil Hospitals	\N	420	418	103	2025-05-16 12:26:44.878011	103	\N
358	Ramesh Hospitals Opportunity	qualification	10000.00	30	2025-05-16 00:00:00	\N	\N	421	417	101	2025-05-16 14:06:10.663331	101	\N
\.


--
-- Data for Name: product_modules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_modules (id, product_id, module_id, created_at, created_by) FROM stdin;
38	388	2	2025-05-09 05:45:45.256328	33
39	388	5	2025-05-09 05:45:45.688758	33
43	389	5	2025-05-09 05:55:02.795624	33
44	390	12	2025-05-09 12:52:50.998941	33
46	391	3	2025-05-16 05:31:47.497275	33
47	391	1	2025-05-16 05:31:47.976368	33
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, description, sku, price, tax, is_active, created_at, created_by, vendor_id) FROM stdin;
46	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 05:20:53.653209	1	\N
47	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 05:20:53.687452	1	\N
48	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 05:20:53.71578	1	\N
49	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 05:20:53.744574	1	\N
50	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 05:20:53.773924	1	\N
51	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 05:21:06.349708	1	\N
2	HospitalCore EHR - Enterprise	Advanced EHR system for large hospitals and multi-facility networks with comprehensive modules, custom workflows, and advanced analytics. Includes 24/7 premium support.	HC-EHR-ENT	1499999.00	18.00	t	2025-04-21 13:40:47.777445	1	\N
4	PACS Imaging Solution	Picture Archiving and Communication System for radiology departments. Includes image storage, retrieval, and viewing capabilities with web and mobile access.	PACS-IMG-001	599999.00	18.00	t	2025-04-21 13:40:47.836625	1	\N
6	HospitalCore EHR - Standard	Complete electronic health records system for small to medium hospitals with patient management, clinical documentation, and basic reporting. Includes 1 year support.	HC-EHR-STD	499999.00	18.00	t	2025-04-21 13:42:39.621144	1	\N
8	DiagnosticsLab LIS	Laboratory Information System for diagnostic centers with specimen tracking, test ordering, result reporting, and billing integration. Supports barcode scanning and equipment integrations.	DL-LIS-001	349999.00	18.00	t	2025-04-21 13:42:39.680701	1	\N
9	PACS Imaging Solution	Picture Archiving and Communication System for radiology departments. Includes image storage, retrieval, and viewing capabilities with web and mobile access.	PACS-IMG-001	599999.00	18.00	t	2025-04-21 13:42:39.710525	1	\N
11	PatientConnect Portal	Patient engagement portal with appointment scheduling, medical record access, bill payment, and secure messaging with healthcare providers.	PC-PRT-001	149999.00	18.00	t	2025-04-21 13:44:57.59372	1	\N
13	TeleCare Platform	Telemedicine solution for virtual consultations, remote monitoring, and integrated scheduling with EHR. Supports video, audio, and chat-based interactions.	TC-PLT-001	299999.00	18.00	t	2025-04-21 13:44:57.654309	1	\N
14	HealthAnalytics Pro	Advanced healthcare analytics platform with operational, clinical, and financial dashboards, custom reporting, and predictive analytics.	HA-PRO-001	399999.00	18.00	t	2025-04-21 13:44:57.684244	1	\N
16	HospitalCore EHR - Standard	Complete electronic health records system for small to medium hospitals with patient management, clinical documentation, and basic reporting. Includes 1 year support.	HC-EHR-STD	499999.00	18.00	t	2025-04-22 04:10:11.180768	1	\N
18	DiagnosticsLab LIS	Laboratory Information System for diagnostic centers with specimen tracking, test ordering, result reporting, and billing integration. Supports barcode scanning and equipment integrations.	DL-LIS-001	349999.00	18.00	t	2025-04-22 04:10:11.246737	1	\N
19	PACS Imaging Solution	Picture Archiving and Communication System for radiology departments. Includes image storage, retrieval, and viewing capabilities with web and mobile access.	PACS-IMG-001	599999.00	18.00	t	2025-04-22 04:10:11.275061	1	\N
21	PatientConnect Portal	Patient engagement portal with appointment scheduling, medical record access, bill payment, and secure messaging with healthcare providers.	PC-PRT-001	149999.00	18.00	t	2025-04-22 04:31:27.644977	1	\N
23	TeleCare Platform	Telemedicine solution for virtual consultations, remote monitoring, and integrated scheduling with EHR. Supports video, audio, and chat-based interactions.	TC-PLT-001	299999.00	18.00	t	2025-04-22 04:31:27.709661	1	\N
24	HealthAnalytics Pro	Advanced healthcare analytics platform with operational, clinical, and financial dashboards, custom reporting, and predictive analytics.	HA-PRO-001	399999.00	18.00	t	2025-04-22 04:31:27.739535	1	\N
26	Implementation Services - Basic	Basic implementation package including system setup, data migration, and standard training for core staff. 90-day implementation timeline.	SRV-IMP-BAS	399999.00	18.00	t	2025-04-22 04:33:42.894926	1	\N
28	Annual Support & Maintenance - Standard	Standard annual support and maintenance package with 12x5 helpdesk access, system updates, and quarterly health checks.	SRV-SUP-STD	149999.00	18.00	t	2025-04-22 04:33:42.963134	1	\N
29	Annual Support & Maintenance - Premium	Premium annual support and maintenance with 24x7 helpdesk access, priority issue resolution, monthly system reviews, and dedicated support manager.	SRV-SUP-PRE	299999.00	18.00	t	2025-04-22 04:33:42.997371	1	\N
31	HospitalCore EHR - Standard	Comprehensive electronic health record system for small to medium hospitals with up to 100 beds. Includes patient management, clinical documentation, order management, and basic reporting.	HC-EHR-STD	850000.00	18.00	t	2025-04-22 04:34:23.424221	1	\N
33	DiagnosticsLab LIS	Laboratory information system for diagnostic centers and hospital labs. Features include specimen tracking, test catalog management, quality control, and integration with diagnostic equipment.	DL-LIS-001	550000.00	18.00	t	2025-04-22 04:34:23.48343	1	\N
35	PharmacyManager Module	Pharmacy management system for hospital pharmacies. Features include inventory management, drug interactions, e-prescribing, and automated dispensing integration.	PM-001	350000.00	18.00	t	2025-04-22 04:34:23.539705	1	\N
36	PatientConnect Portal	Patient engagement portal allowing online appointment scheduling, test results access, prescription refills, and secure messaging with healthcare providers.	PC-001	250000.00	18.00	t	2025-04-22 04:38:39.982576	1	\N
38	TeleCare Platform	Telemedicine solution enabling virtual consultations, remote patient monitoring, and online healthcare delivery with integrated EHR and billing.	TC-001	480000.00	18.00	t	2025-04-22 04:38:40.047933	1	\N
39	HealthAnalytics Pro	Healthcare analytics platform providing dashboards and insights for clinical quality, operational efficiency, and financial performance.	HA-001	350000.00	18.00	t	2025-04-22 04:38:40.077174	1	\N
41	Implementation Services - Basic	Basic implementation package including system setup, data migration, and core user training for single-facility deployments.	IS-BAS-001	150000.00	18.00	t	2025-04-22 04:41:07.468318	1	\N
43	Annual Support & Maintenance - Standard	Standard support package including software updates, help desk access during business hours, and system monitoring for one year.	SM-STD-001	120000.00	18.00	t	2025-04-22 04:41:07.528879	1	\N
44	Annual Support & Maintenance - Premium	Premium support package including software updates, 24/7 help desk access, system monitoring, quarterly health checks, and priority resolution for one year.	SM-PRE-001	280000.00	18.00	t	2025-04-22 04:41:07.559534	1	\N
52	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 05:21:06.382696	1	\N
53	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 05:21:06.421076	1	\N
54	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 05:21:06.450379	1	\N
55	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 05:21:06.480282	1	\N
56	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 05:31:47.369385	1	\N
57	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 05:31:47.407174	1	\N
58	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 05:31:47.437951	1	\N
59	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 05:31:47.468764	1	\N
60	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 05:31:47.499441	1	\N
61	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 05:44:26.244579	1	\N
62	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 05:44:26.276971	1	\N
63	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 05:44:26.304742	1	\N
64	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 05:44:26.333463	1	\N
65	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 05:44:26.364532	1	\N
66	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 05:44:35.519813	1	\N
67	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 05:44:35.549403	1	\N
68	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 05:44:35.578661	1	\N
69	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 05:44:35.607795	1	\N
70	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 05:44:35.637715	1	\N
71	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 05:57:45.377978	33	\N
72	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 05:57:45.417491	33	\N
73	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 05:57:45.448025	33	\N
74	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 05:57:45.477253	33	\N
75	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 05:57:45.507187	33	\N
76	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 05:57:59.874639	33	\N
77	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 05:57:59.905603	33	\N
78	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 05:57:59.936229	33	\N
79	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 05:57:59.967087	33	\N
80	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 05:57:59.999273	33	\N
81	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 05:59:28.912994	33	\N
82	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 05:59:28.943545	33	\N
83	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 05:59:28.973415	33	\N
84	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 05:59:29.003087	33	\N
85	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 05:59:29.033434	33	\N
98	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:01:53.58129	33	\N
99	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:01:53.613112	33	\N
100	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:01:53.643528	33	\N
101	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:01:53.677806	33	\N
102	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:01:53.709698	33	\N
86	MediTrack EHR	Electronic Health Record system for hospitals and clinics	HIMS-EHR-001	1500000.00	18.00	t	2025-04-22 05:59:33.648931	1	\N
88	MediTrack LIS	Laboratory Information System for diagnostic labs	HIMS-LIS-001	1800000.00	18.00	t	2025-04-22 05:59:33.765332	1	\N
89	MediTrack RIS	Radiology Information System for diagnostic centers	HIMS-RIS-001	1600000.00	18.00	t	2025-04-22 05:59:33.824217	1	\N
87	MediTrack PACS	Picture Archiving and Communication System for radiology	HIMS-PACS-001	2200000.00	18.00	t	2025-04-22 05:59:33.708528	1	\N
91	MediTrack Telemedicine	Integrated telemedicine platform for remote consultations	HIMS-TELE-001	1200000.00	18.00	t	2025-04-22 05:59:33.941444	1	\N
92	MediTrack Mobile	Mobile app for doctors and patients	HIMS-MOB-001	800000.00	18.00	t	2025-04-22 05:59:34.000494	1	\N
93	MediTrack Analytics	Healthcare analytics and reporting platform	HIMS-ANLY-001	1200000.00	18.00	t	2025-04-22 05:59:34.058718	1	\N
94	MediTrack Cloud	Cloud hosting for HIMS systems	HIMS-CLD-001	600000.00	18.00	t	2025-04-22 05:59:34.117549	1	\N
95	MediTrack Implementation	Professional implementation services	HIMS-IMPL-001	500000.00	18.00	t	2025-04-22 05:59:34.17624	1	\N
96	MediTrack Training	Staff training program	HIMS-TRN-001	300000.00	18.00	t	2025-04-22 05:59:34.234092	1	\N
90	MediTrack HMS	Complete Hospital Management System	HIMS-HMS-001	3500000.00	18.00	t	2025-04-22 05:59:33.883255	1	\N
103	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:02:03.828927	33	\N
97	MediTrack Support Premium	Premium 24/7 support package	HIMS-SUP-001	450000.00	18.00	t	2025-04-22 05:59:34.293297	1	\N
104	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:02:03.858961	33	\N
105	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:02:03.890312	33	\N
106	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:02:03.920242	33	\N
107	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:02:03.950264	33	\N
108	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:04:31.26431	33	\N
109	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:04:31.295071	33	\N
110	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:04:31.324281	33	\N
111	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:04:31.361495	33	\N
112	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:04:31.392667	33	\N
113	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:04:41.60646	33	\N
114	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:04:41.637026	33	\N
115	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:04:41.667715	33	\N
116	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:04:41.698317	33	\N
117	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:04:41.729162	33	\N
118	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:06:45.246053	33	\N
119	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:06:45.276119	33	\N
120	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:06:45.306006	33	\N
121	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:06:45.335911	33	\N
122	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:06:45.366562	33	\N
123	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:06:55.533697	33	\N
124	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:06:55.56499	33	\N
125	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:06:55.598161	33	\N
126	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:06:55.634974	33	\N
127	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:06:55.667435	33	\N
128	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:07:11.332919	33	\N
129	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:07:11.362318	33	\N
130	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:07:11.395019	33	\N
131	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:07:11.424829	33	\N
132	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:07:11.454069	33	\N
133	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:08:42.974369	33	\N
134	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:08:43.005262	33	\N
135	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:08:43.035675	33	\N
136	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:08:43.066438	33	\N
137	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:08:43.096764	33	\N
138	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:08:52.798402	33	\N
139	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:08:52.827356	33	\N
140	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:08:52.856564	33	\N
141	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:08:52.885771	33	\N
142	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:08:52.915402	33	\N
143	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:12:45.869031	33	\N
144	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:12:45.900565	33	\N
145	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:12:45.930987	33	\N
146	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:12:45.962119	33	\N
147	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:12:45.992573	33	\N
148	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:12:55.854892	33	\N
149	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:12:55.883808	33	\N
150	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:12:55.912905	33	\N
151	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:12:55.942163	33	\N
152	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:12:55.970937	33	\N
153	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:19:53.157264	33	\N
154	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:19:53.185555	33	\N
155	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:19:53.259718	33	\N
156	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:19:53.289404	33	\N
157	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:19:53.31866	33	\N
158	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:20:03.471093	33	\N
159	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:20:03.500345	33	\N
160	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:20:03.5294	33	\N
161	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:20:03.559168	33	\N
162	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:20:03.592176	33	\N
163	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:22:55.807274	33	\N
164	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:22:55.856713	33	\N
165	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:22:55.890811	33	\N
166	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:22:55.923409	33	\N
167	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:22:55.958764	33	\N
168	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:23:05.428599	33	\N
169	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:23:05.461409	33	\N
170	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:23:05.492306	33	\N
171	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:23:05.522738	33	\N
172	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:23:05.555141	33	\N
173	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:25:01.314636	33	\N
174	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:25:01.344392	33	\N
175	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:25:01.373912	33	\N
176	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:25:01.404934	33	\N
177	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:25:01.434207	33	\N
178	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:25:12.435315	33	\N
179	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:25:12.470965	33	\N
180	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:25:12.501872	33	\N
181	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:25:12.534327	33	\N
182	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:25:12.565765	33	\N
183	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:28:59.396221	33	\N
184	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:28:59.434806	33	\N
185	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:28:59.465183	33	\N
186	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:28:59.494194	33	\N
187	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:28:59.523703	33	\N
188	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:29:06.939983	33	\N
189	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:29:06.971027	33	\N
190	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:29:07.000678	33	\N
191	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:29:07.030281	33	\N
192	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:29:07.059732	33	\N
193	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:29:30.285606	33	\N
194	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:29:30.315463	33	\N
195	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:29:30.346051	33	\N
196	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:29:30.375729	33	\N
197	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:29:30.405919	33	\N
198	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:36:39.656112	33	\N
199	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:36:39.695732	33	\N
200	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:36:39.725216	33	\N
201	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:36:39.754588	33	\N
202	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:36:39.783699	33	\N
203	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:36:49.836767	33	\N
204	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:36:49.867468	33	\N
205	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:36:49.898092	33	\N
206	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:36:49.929387	33	\N
207	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:36:49.960975	33	\N
208	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:37:22.920125	33	\N
209	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:37:22.950076	33	\N
210	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:37:22.979996	33	\N
211	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:37:23.009683	33	\N
212	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:37:23.039696	33	\N
213	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:37:31.006283	33	\N
214	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:37:31.036599	33	\N
215	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:37:31.066746	33	\N
216	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:37:31.096377	33	\N
217	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:37:31.125943	33	\N
218	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:38:26.73675	33	\N
219	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:38:26.766435	33	\N
220	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:38:26.795759	33	\N
221	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:38:26.826104	33	\N
222	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:38:26.856237	33	\N
223	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:38:35.822292	33	\N
224	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:38:35.851727	33	\N
225	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:38:35.880798	33	\N
226	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:38:35.909926	33	\N
227	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:38:35.938935	33	\N
1	HospitalCore EHR - Standard	Complete electronic health records system for small to medium hospitals with patient management, clinical documentation, and basic reporting. Includes 1 year support.	HC-EHR-STD	499999.00	18.00	t	2025-04-21 13:40:47.742195	1	\N
3	DiagnosticsLab LIS	Laboratory Information System for diagnostic centers with specimen tracking, test ordering, result reporting, and billing integration. Supports barcode scanning and equipment integrations.	DL-LIS-001	349999.00	18.00	t	2025-04-21 13:40:47.806948	1	\N
5	PharmacyManager Module	Comprehensive pharmacy management system with inventory tracking, e-prescriptions, drug interactions checking, and automated dispensing cabinet integration.	PM-MOD-001	199999.00	18.00	t	2025-04-21 13:40:47.865412	1	\N
7	HospitalCore EHR - Enterprise	Advanced EHR system for large hospitals and multi-facility networks with comprehensive modules, custom workflows, and advanced analytics. Includes 24/7 premium support.	HC-EHR-ENT	1499999.00	18.00	t	2025-04-21 13:42:39.651004	1	\N
10	PharmacyManager Module	Comprehensive pharmacy management system with inventory tracking, e-prescriptions, drug interactions checking, and automated dispensing cabinet integration.	PM-MOD-001	199999.00	18.00	t	2025-04-21 13:42:39.740361	1	\N
12	MobileDoc Physician App	Mobile application for physicians to access patient records, document care, order tests, and view results from iOS and Android devices.	MD-APP-001	99999.00	18.00	t	2025-04-21 13:44:57.62391	1	\N
15	ClaimsMaster Billing System	Medical billing and claims management system with insurance verification, claim submission, payment posting, and denial management.	CM-BIL-001	249999.00	18.00	t	2025-04-21 13:44:57.714265	1	\N
228	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:40:30.623603	33	\N
229	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:40:30.653927	33	\N
230	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:40:30.683835	33	\N
231	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:40:30.713695	33	\N
232	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:40:30.743631	33	\N
233	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:40:40.204671	33	\N
234	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:40:40.234596	33	\N
235	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:40:40.264202	33	\N
236	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:40:40.293615	33	\N
237	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:40:40.323115	33	\N
238	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:47:48.010006	33	\N
239	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:47:48.047047	33	\N
240	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:47:48.076439	33	\N
241	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:47:48.105299	33	\N
242	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:47:48.133423	33	\N
17	HospitalCore EHR - Enterprise	Advanced EHR system for large hospitals and multi-facility networks with comprehensive modules, custom workflows, and advanced analytics. Includes 24/7 premium support.	HC-EHR-ENT	1499999.00	18.00	t	2025-04-22 04:10:11.217108	1	\N
327	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:04:14.674787	33	\N
20	PharmacyManager Module	Comprehensive pharmacy management system with inventory tracking, e-prescriptions, drug interactions checking, and automated dispensing cabinet integration.	PM-MOD-001	199999.00	18.00	t	2025-04-22 04:10:11.304718	1	\N
22	MobileDoc Physician App	Mobile application for physicians to access patient records, document care, order tests, and view results from iOS and Android devices.	MD-APP-001	99999.00	18.00	t	2025-04-22 04:31:27.679832	1	\N
25	ClaimsMaster Billing System	Medical billing and claims management system with insurance verification, claim submission, payment posting, and denial management.	CM-BIL-001	249999.00	18.00	t	2025-04-22 04:31:27.769134	1	\N
27	Implementation Services - Premium	Premium implementation with extensive customization, comprehensive data migration, on-site training, and go-live support. 180-day implementation timeline.	SRV-IMP-PRE	999999.00	18.00	t	2025-04-22 04:33:42.931171	1	\N
30	Healthcare Interoperability Module	Interoperability module supporting FHIR, HL7, DICOM standards for seamless integration with national health information networks and other healthcare systems.	HIM-INT-001	199999.00	18.00	t	2025-04-22 04:33:43.026624	1	\N
243	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:49:19.838133	33	\N
244	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:49:19.867582	33	\N
245	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:49:19.902926	33	\N
246	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:49:19.937447	33	\N
247	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:49:19.967634	33	\N
248	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:49:29.218671	33	\N
249	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:49:29.255777	33	\N
250	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:49:29.286086	33	\N
251	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:49:29.315753	33	\N
252	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:49:29.345243	33	\N
253	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:50:01.072098	33	\N
254	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:50:01.102286	33	\N
255	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:50:01.132279	33	\N
256	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:50:01.163358	33	\N
257	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:50:01.193854	33	\N
258	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:50:11.225775	33	\N
259	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:50:11.25528	33	\N
260	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:50:11.285228	33	\N
261	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:50:11.315097	33	\N
262	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:50:11.345631	33	\N
263	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:51:14.508898	33	\N
264	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:51:14.537986	33	\N
265	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:51:14.566873	33	\N
266	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:51:14.595698	33	\N
267	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:51:14.625399	33	\N
268	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:51:24.160992	33	\N
269	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:51:24.191935	33	\N
270	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:51:24.222557	33	\N
271	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:51:24.253773	33	\N
272	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:51:24.285584	33	\N
273	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:53:32.014588	33	\N
274	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:53:32.053751	33	\N
275	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:53:32.082823	33	\N
276	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:53:32.113124	33	\N
277	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:53:32.143221	33	\N
32	HospitalCore EHR - Enterprise	Advanced electronic health record system for large hospitals with 100+ beds. Includes all standard features plus multi-facility management, advanced analytics, and API integrations.	HC-EHR-ENT	1850000.00	18.00	t	2025-04-22 04:34:23.45425	1	\N
34	PACS Imaging Solution	Picture archiving and communication system for radiology departments. Includes image storage, viewing, distribution, and integration with radiology information systems.	PACS-001	750000.00	18.00	t	2025-04-22 04:34:23.511117	1	\N
37	MobileDoc Physician App	Mobile application for physicians to access patient records, document notes, place orders, and review results from smartphones and tablets.	MD-001	180000.00	18.00	t	2025-04-22 04:38:40.019558	1	\N
40	ClaimsMaster Billing System	Medical billing and claims management system with insurance verification, coding assistance, and revenue cycle management features.	CM-001	400000.00	18.00	t	2025-04-22 04:38:40.106375	1	\N
42	Implementation Services - Premium	Premium implementation package including system setup, comprehensive data migration, workflow optimization, advanced training, and go-live support for multi-facility deployments.	IS-PRE-001	450000.00	18.00	t	2025-04-22 04:41:07.498494	1	\N
45	Healthcare Interoperability Module	Integration module enabling data exchange with other healthcare systems using FHIR, HL7, and other healthcare data standards. Compliant with national health digitization initiatives.	HI-001	320000.00	18.00	t	2025-04-22 04:41:07.589686	1	\N
278	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:57:45.6452	33	\N
279	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:57:45.688082	33	\N
280	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:57:45.717898	33	\N
281	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:57:45.747791	33	\N
282	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:57:45.778184	33	\N
283	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:57:55.145564	33	\N
284	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:57:55.176881	33	\N
285	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:57:55.207928	33	\N
286	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:57:55.238861	33	\N
287	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:57:55.26974	33	\N
288	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:59:46.717462	33	\N
289	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:59:46.748017	33	\N
290	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:59:46.778243	33	\N
291	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:59:46.808395	33	\N
292	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:59:46.83847	33	\N
293	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 06:59:56.818943	33	\N
294	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 06:59:56.846435	33	\N
295	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 06:59:56.875131	33	\N
296	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 06:59:56.903758	33	\N
297	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 06:59:56.932354	33	\N
298	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:02:11.197392	33	\N
299	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:02:11.23302	33	\N
300	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:02:11.261991	33	\N
301	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:02:11.29152	33	\N
302	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:02:11.32164	33	\N
303	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:02:21.473857	33	\N
304	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:02:21.503616	33	\N
305	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:02:21.532925	33	\N
306	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:02:21.562402	33	\N
307	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:02:21.591957	33	\N
308	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:02:51.757436	33	\N
309	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:02:51.78762	33	\N
310	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:02:51.817294	33	\N
311	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:02:51.849249	33	\N
312	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:02:51.888661	33	\N
313	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:03:02.12068	33	\N
314	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:03:02.150253	33	\N
315	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:03:02.182452	33	\N
316	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:03:02.213139	33	\N
317	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:03:02.242933	33	\N
318	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:04:04.777426	33	\N
319	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:04:04.807369	33	\N
320	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:04:04.837149	33	\N
321	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:04:04.866963	33	\N
322	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:04:04.896721	33	\N
323	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:04:14.557926	33	\N
324	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:04:14.587405	33	\N
325	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:04:14.616398	33	\N
326	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:04:14.645621	33	\N
328	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:05:04.740088	33	\N
329	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:05:04.76992	33	\N
330	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:05:04.798474	33	\N
331	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:05:04.828225	33	\N
332	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:05:04.857445	33	\N
333	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:05:14.861401	33	\N
334	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:05:14.891092	33	\N
335	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:05:14.921563	33	\N
336	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:05:14.950857	33	\N
337	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:05:14.98003	33	\N
338	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:06:11.461236	33	\N
339	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:06:11.490712	33	\N
340	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:06:11.519627	33	\N
341	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:06:11.549043	33	\N
342	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:06:11.577944	33	\N
343	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:07:05.096568	33	\N
344	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:07:05.130426	33	\N
345	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:07:05.166827	33	\N
346	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:07:05.197359	33	\N
347	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:07:05.230075	33	\N
348	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:07:15.026869	33	\N
349	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:07:15.057411	33	\N
350	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:07:15.08738	33	\N
351	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:07:15.117103	33	\N
352	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:07:15.146886	33	\N
353	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:08:34.077471	33	\N
354	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:08:34.108358	33	\N
355	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:08:34.138437	33	\N
356	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:08:34.168779	33	\N
357	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:08:34.200775	33	\N
358	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:08:43.781783	33	\N
359	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:08:43.811969	33	\N
360	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:08:43.912695	33	\N
361	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:08:43.94206	33	\N
362	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:08:43.972353	33	\N
363	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:10:36.734296	33	\N
364	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:10:36.774557	33	\N
365	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:10:36.804291	33	\N
366	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:10:36.833895	33	\N
367	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:10:36.864082	33	\N
368	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:10:48.142838	33	\N
369	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:10:48.172254	33	\N
370	Security Audit Service	Comprehensive security audit and vulnerability assessment	SEC-AUD-001	499.99	10.00	t	2025-04-22 07:10:48.202658	33	\N
371	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:10:48.233746	33	\N
372	Mobile App Development	Custom mobile application development for iOS and Android	MOB-DEV-001	1499.99	10.00	f	2025-04-22 07:10:48.263709	33	\N
373	Cloud Storage Plan - Basic	Basic cloud storage plan with 100GB storage	CLD-BAS-001	99.99	10.00	t	2025-04-22 07:13:24.592227	33	\N
374	Cloud Storage Plan - Premium	Premium cloud storage plan with 1TB storage and advanced security features	CLD-PRE-002	199.99	10.00	t	2025-04-22 07:13:24.629357	33	\N
376	Website Development	Custom website development with responsive design	WEB-DEV-001	999.99	10.00	t	2025-04-22 07:13:24.689998	33	\N
383	WEB AND MOBILE APP DEVLOPEMNT	WEB AND MOBILE APP DEVLOPEMNT	WEN N MOBILE	999.00	18.00	t	2025-05-05 04:47:03.529991	1	\N
385	LIMS Client Product			999.00	18.00	t	2025-05-08 05:35:20.620493	33	5
388	SLIMS WEB 999			999.00	18.00	t	2025-05-08 07:14:00.985292	33	1
389	your product	your product		999.00	18.00	t	2025-05-09 05:54:17.459769	33	6
390	Bio-Medical	Bio-Medical		1000000.00	18.00	t	2025-05-09 12:52:50.494621	33	1
391	SLIMS	SLIMS Product		1000000.00	18.00	t	2025-05-16 05:31:22.870681	33	1
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quotation_items (id, quotation_id, product_id, description, quantity, unit_price, tax, subtotal, module_id) FROM stdin;
645	262	373	Basic cloud storage plan with 100GB storage	1	50000.00	0.00	50000.00	\N
646	262	376	Custom website development with responsive design	1	50000.00	0.00	50000.00	\N
647	266	376	Custom website development with responsive design	1	100000.00	0.00	100000.00	\N
648	266	373	Basic cloud storage plan with 100GB storage	1	100000.00	0.00	100000.00	\N
649	267	373	Basic cloud storage plan with 100GB storage	1	100000.00	0.00	100000.00	\N
650	267	372	Custom mobile application development for iOS and Android	1	100000.00	0.00	100000.00	\N
651	268	391	SLIMS Product	1	1000000.00	0.00	1000000.00	\N
652	268	372	Custom mobile application development for iOS and Android	1	250000.00	0.00	250000.00	\N
653	269	376	Custom website development with responsive design	1	150000.00	0.00	150000.00	\N
654	269	373	Basic cloud storage plan with 100GB storage	1	150000.00	0.00	150000.00	\N
655	270	391	SLIMS Product	1	1000000.00	0.00	1000000.00	\N
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.quotations (id, quotation_number, opportunity_id, contact_id, company_id, subtotal, tax, discount, total, status, valid_until, notes, created_at, created_by) FROM stdin;
264	QT-2025-05247	352	\N	413	100000.00	0.00	0.00	100000.00	draft	2025-06-16 00:00:00		2025-05-16 05:19:13.174076	101
265	QT-2025-05735	353	\N	419	100000.00	0.00	0.00	100000.00	accepted	2025-06-16 00:00:00		2025-05-16 05:23:49.81209	102
266	QT-2025-05172	355	\N	382	200000.00	0.00	0.00	200000.00	draft	2025-06-16 00:00:00		2025-05-16 11:23:58.708028	104
267	QT-2025-05270	354	\N	414	200000.00	0.00	0.00	200000.00	accepted	2025-06-16 00:00:00		2025-05-16 11:28:59.243715	105
268	QT-2025-05260	356	\N	415	1250000.00	0.00	0.00	1250000.00	accepted	2025-06-16 00:00:00		2025-05-16 12:15:46.121137	102
269	QT-2025-05974	357	\N	420	300000.00	0.00	0.00	300000.00	accepted	2025-06-16 00:00:00		2025-05-16 12:28:29.714802	103
263	QT-2025-05409	351	\N	418	150000.00	0.00	0.00	150000.00	accepted	2025-06-16 00:00:00		2025-05-16 03:58:57.781769	102
270	QT-2025-05822	358	\N	421	1000000.00	0.00	0.00	1000000.00	accepted	2025-06-16 00:00:00		2025-05-16 14:14:16.001105	101
\.


--
-- Data for Name: sales_order_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sales_order_items (id, sales_order_id, product_id, description, quantity, unit_price, tax, subtotal, module_id) FROM stdin;
472	173	373	Basic cloud storage plan with 100GB storage	1	100000.00	0.00	100000.00	\N
473	173	372	Custom mobile application development for iOS and Android	1	100000.00	0.00	100000.00	\N
474	176	376	Custom website development with responsive design	1	150000.00	0.00	150000.00	\N
475	176	373	Basic cloud storage plan with 100GB storage	1	150000.00	0.00	150000.00	\N
476	177	391	SLIMS Product	1	1000000.00	0.00	1000000.00	\N
\.


--
-- Data for Name: sales_orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sales_orders (id, order_number, quotation_id, opportunity_id, contact_id, company_id, subtotal, tax, discount, total, status, order_date, notes, created_at, created_by, invoice_date, payment_date) FROM stdin;
169	SO-2025-05841	\N	352	\N	413	100000.00	0.00	0.00	100000.00	pending	2025-05-16 00:00:00	Sales order created from opportunity: MMIMSR MULLANA Opportunity	2025-05-16 05:19:30.962445	101	\N	\N
170	SO-2025-05241	265	353	\N	419	100000.00	0.00	0.00	100000.00	processing	2025-05-16 00:00:00	Based on quotation #QT-2025-05735. 	2025-05-16 05:24:39.737116	102	\N	\N
173	SO-2025-05952	267	354	\N	414	200000.00	0.00	0.00	200000.00	pending	2025-05-16 00:00:00	Based on quotation #QT-2025-05270. 	2025-05-16 11:29:28.943639	105	\N	\N
168	SO-2025-05442	\N	350	\N	418	250000.00	0.00	0.00	250000.00	completed	2025-05-15 00:00:00	Sales order created from opportunity: PIMS Opportunity\n\nCANCELLATION REASON: cancelled\n\nCANCELLATION REASON: cancelled	2025-05-15 14:13:48.54989	103	2025-05-16 05:24:50.141	\N
174	SO-2025-05038	\N	356	\N	415	500000.00	0.00	0.00	500000.00	pending	2025-05-16 00:00:00	Sales order created from opportunity: Ramesh Hospitals Opportunity	2025-05-16 12:14:57.255399	102	\N	\N
175	SO-2025-05943	\N	357	\N	420	10000.00	0.00	0.00	10000.00	pending	2025-05-17 00:00:00	Sales order created from opportunity: Dy PATIL Opportunity	2025-05-16 12:27:18.667703	103	\N	\N
172	SO-2025-05015	\N	354	\N	414	200000.00	0.00	0.00	200000.00	completed	2025-05-16 00:00:00	Sales order created from opportunity: BLDE Opportunity	2025-05-16 11:29:16.372499	105	2025-05-16 11:29:39.888	2025-05-16 12:35:33.911
171	SO-2025-05364	\N	355	\N	382	200000.00	0.00	0.00	200000.00	completed	2025-05-16 00:00:00	Sales order created from opportunity: Acme Corp Opportunity	2025-05-16 11:25:59.564014	104	2025-05-16 11:28:00.351	2025-05-16 12:35:37.452
176	SO-2025-05042	269	357	\N	420	300000.00	0.00	0.00	300000.00	processing	2025-05-16 00:00:00	Based on quotation #QT-2025-05974. 	2025-05-16 12:49:34.266829	103	2025-05-16 12:50:06.338	\N
177	SO-2025-05883	270	358	\N	421	1000000.00	0.00	0.00	1000000.00	pending	2025-05-16 00:00:00	Based on quotation #QT-2025-05822. 	2025-05-16 14:18:19.3409	101	\N	\N
\.


--
-- Data for Name: sales_targets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sales_targets (id, user_id, company_id, month, year, year_type, target_amount, created_at, created_by, notes) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
w62o355V7tTHtRO87vmajLYZ-GywY87U	{"cookie":{"originalMaxAge":86400000,"expires":"2025-05-24T08:51:02.741Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"}}	2025-05-24 08:51:04
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tasks (id, title, description, due_date, priority, status, assigned_to, related_to, related_id, created_at, created_by, contact_person_id, mobile_number) FROM stdin;
9	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-22 13:44:58.455	high	pending	3	opportunity	9	2025-04-21 13:44:58.467827	1	\N	\N
10	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-23 13:44:58.455	medium	pending	2	opportunity	10	2025-04-21 13:44:58.499223	1	\N	\N
23	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 04:33:43.733	medium	pending	3	quotation	18	2025-04-22 04:33:43.807778	1	\N	\N
48	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 05:31:48.292	medium	pending	2	\N	\N	2025-04-22 05:31:48.406956	1	\N	\N
71	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:01:54.453	medium	pending	35	quotation	54	2025-04-22 06:01:54.536018	33	\N	\N
77	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:04:32.123	high	pending	35	opportunity	89	2025-04-22 06:04:32.139574	33	\N	\N
79	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:04:32.123	medium	pending	35	quotation	60	2025-04-22 06:04:32.199782	33	\N	\N
80	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:04:32.123	medium	pending	34	\N	\N	2025-04-22 06:04:32.230035	33	\N	\N
81	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:04:42.464	high	pending	35	opportunity	93	2025-04-22 06:04:42.480131	33	\N	\N
82	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:04:42.464	medium	pending	34	opportunity	94	2025-04-22 06:04:42.51116	33	\N	\N
83	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:04:42.464	medium	pending	35	quotation	63	2025-04-22 06:04:42.541795	33	\N	\N
84	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:04:42.464	medium	pending	34	\N	\N	2025-04-22 06:04:42.573286	33	\N	\N
85	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:06:46.085	high	pending	35	opportunity	97	2025-04-22 06:06:46.101282	33	\N	\N
86	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:06:46.085	medium	pending	34	opportunity	98	2025-04-22 06:06:46.131489	33	\N	\N
87	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:06:46.085	medium	pending	35	quotation	66	2025-04-22 06:06:46.161684	33	\N	\N
88	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:06:46.085	medium	pending	34	\N	\N	2025-04-22 06:06:46.193255	33	\N	\N
89	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:06:56.421	high	pending	35	opportunity	101	2025-04-22 06:06:56.436682	33	\N	\N
90	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:06:56.421	medium	pending	34	opportunity	102	2025-04-22 06:06:56.467015	33	\N	\N
91	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:06:56.421	medium	pending	35	quotation	69	2025-04-22 06:06:56.502377	33	\N	\N
92	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:06:56.421	medium	pending	34	\N	\N	2025-04-22 06:06:56.535808	33	\N	\N
93	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:07:12.148	high	pending	35	opportunity	105	2025-04-22 06:07:12.163923	33	\N	\N
94	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:07:12.148	medium	pending	34	opportunity	106	2025-04-22 06:07:12.193221	33	\N	\N
95	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:07:12.148	medium	pending	35	quotation	72	2025-04-22 06:07:12.222262	33	\N	\N
96	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:07:12.148	medium	pending	34	\N	\N	2025-04-22 06:07:12.253028	33	\N	\N
97	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:08:43.825	high	pending	35	opportunity	109	2025-04-22 06:08:43.841112	33	\N	\N
98	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:08:43.825	medium	pending	34	opportunity	110	2025-04-22 06:08:43.875282	33	\N	\N
99	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:08:43.825	medium	pending	35	quotation	75	2025-04-22 06:08:43.905581	33	\N	\N
100	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:08:43.825	medium	pending	34	\N	\N	2025-04-22 06:08:43.93583	33	\N	\N
101	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:08:53.607	high	pending	35	opportunity	113	2025-04-22 06:08:53.622286	33	\N	\N
102	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:08:53.607	medium	pending	34	opportunity	114	2025-04-22 06:08:53.651406	33	\N	\N
103	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:08:53.607	medium	pending	35	quotation	78	2025-04-22 06:08:53.681944	33	\N	\N
104	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:08:53.607	medium	pending	34	\N	\N	2025-04-22 06:08:53.710644	33	\N	\N
105	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:12:46.73	high	pending	35	opportunity	117	2025-04-22 06:12:46.746608	33	\N	\N
106	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:12:46.73	medium	pending	34	opportunity	118	2025-04-22 06:12:46.777281	33	\N	\N
107	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:12:46.73	medium	pending	35	quotation	81	2025-04-22 06:12:46.808346	33	\N	\N
108	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:12:46.73	medium	pending	34	\N	\N	2025-04-22 06:12:46.838196	33	\N	\N
109	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:12:56.676	high	pending	35	opportunity	121	2025-04-22 06:12:56.691457	33	\N	\N
110	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:12:56.676	medium	pending	34	opportunity	122	2025-04-22 06:12:56.722852	33	\N	\N
111	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:12:56.676	medium	pending	35	quotation	84	2025-04-22 06:12:56.751956	33	\N	\N
112	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:12:56.676	medium	pending	34	\N	\N	2025-04-22 06:12:56.783435	33	\N	\N
113	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:19:54.023	high	pending	35	opportunity	125	2025-04-22 06:19:54.038933	33	\N	\N
114	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:19:54.023	medium	pending	34	opportunity	126	2025-04-22 06:19:54.070261	33	\N	\N
115	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:19:54.023	medium	pending	35	quotation	87	2025-04-22 06:19:54.099499	33	\N	\N
116	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:19:54.023	medium	pending	34	\N	\N	2025-04-22 06:19:54.129029	33	\N	\N
117	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:20:04.277	high	pending	35	opportunity	129	2025-04-22 06:20:04.292436	33	\N	\N
118	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:20:04.277	medium	pending	34	opportunity	130	2025-04-22 06:20:04.32189	33	\N	\N
119	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:20:04.277	medium	pending	35	quotation	90	2025-04-22 06:20:04.351223	33	\N	\N
120	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:20:04.277	medium	pending	34	\N	\N	2025-04-22 06:20:04.379961	33	\N	\N
121	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:22:56.722	high	pending	35	opportunity	133	2025-04-22 06:22:56.738844	33	\N	\N
122	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:22:56.722	medium	pending	34	opportunity	134	2025-04-22 06:22:56.770653	33	\N	\N
123	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:22:56.722	medium	pending	35	quotation	93	2025-04-22 06:22:56.802614	33	\N	\N
124	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:22:56.722	medium	pending	34	\N	\N	2025-04-22 06:22:56.835001	33	\N	\N
125	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:23:06.303	high	pending	35	opportunity	137	2025-04-22 06:23:06.31992	33	\N	\N
126	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:23:06.303	medium	pending	34	opportunity	138	2025-04-22 06:23:06.357759	33	\N	\N
127	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:23:06.303	medium	pending	35	quotation	96	2025-04-22 06:23:06.388006	33	\N	\N
128	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:23:06.303	medium	pending	34	\N	\N	2025-04-22 06:23:06.416953	33	\N	\N
129	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:25:02.128	high	pending	35	opportunity	141	2025-04-22 06:25:02.143664	33	\N	\N
130	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:25:02.128	medium	pending	34	opportunity	142	2025-04-22 06:25:02.173284	33	\N	\N
131	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:25:02.128	medium	pending	35	quotation	99	2025-04-22 06:25:02.202938	33	\N	\N
132	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:25:02.128	medium	pending	34	\N	\N	2025-04-22 06:25:02.232477	33	\N	\N
133	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:25:13.294	high	pending	35	opportunity	145	2025-04-22 06:25:13.310753	33	\N	\N
134	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:25:13.294	medium	pending	34	opportunity	146	2025-04-22 06:25:13.341332	33	\N	\N
135	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:25:13.294	medium	pending	35	quotation	102	2025-04-22 06:25:13.37185	33	\N	\N
136	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:25:13.294	medium	pending	34	\N	\N	2025-04-22 06:25:13.402538	33	\N	\N
137	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:29:00.292	high	pending	35	opportunity	149	2025-04-22 06:29:00.272697	33	\N	\N
138	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:29:00.292	medium	pending	34	opportunity	150	2025-04-22 06:29:00.30811	33	\N	\N
139	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:29:00.292	medium	pending	35	quotation	105	2025-04-22 06:29:00.33836	33	\N	\N
140	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:29:00.292	medium	pending	34	\N	\N	2025-04-22 06:29:00.369337	33	\N	\N
141	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:29:07.765	high	pending	35	opportunity	153	2025-04-22 06:29:07.780719	33	\N	\N
142	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:29:07.765	medium	pending	34	opportunity	154	2025-04-22 06:29:07.81254	33	\N	\N
143	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:29:07.765	medium	pending	35	quotation	108	2025-04-22 06:29:07.842565	33	\N	\N
144	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:29:07.765	medium	pending	34	\N	\N	2025-04-22 06:29:07.872345	33	\N	\N
145	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:29:31.117	high	pending	35	opportunity	157	2025-04-22 06:29:31.132918	33	\N	\N
146	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:29:31.117	medium	pending	34	opportunity	158	2025-04-22 06:29:31.168286	33	\N	\N
147	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:29:31.117	medium	pending	35	quotation	111	2025-04-22 06:29:31.197029	33	\N	\N
148	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:29:31.117	medium	pending	34	\N	\N	2025-04-22 06:29:31.226741	33	\N	\N
149	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:36:40.517	high	pending	35	opportunity	161	2025-04-22 06:36:40.533379	33	\N	\N
150	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:36:40.517	medium	pending	34	opportunity	162	2025-04-22 06:36:40.570052	33	\N	\N
151	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:36:40.517	medium	pending	35	quotation	114	2025-04-22 06:36:40.59926	33	\N	\N
152	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:36:40.517	medium	pending	34	\N	\N	2025-04-22 06:36:40.628351	33	\N	\N
153	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:36:50.684	high	pending	35	opportunity	165	2025-04-22 06:36:50.700282	33	\N	\N
154	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:36:50.684	medium	pending	34	opportunity	166	2025-04-22 06:36:50.731453	33	\N	\N
155	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:36:50.684	medium	pending	35	quotation	117	2025-04-22 06:36:50.761794	33	\N	\N
156	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:36:50.684	medium	pending	34	\N	\N	2025-04-22 06:36:50.792378	33	\N	\N
157	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:37:23.808	high	pending	35	opportunity	169	2025-04-22 06:37:23.823471	33	\N	\N
158	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:37:23.808	medium	pending	34	opportunity	170	2025-04-22 06:37:23.853382	33	\N	\N
159	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:37:23.808	medium	pending	35	quotation	120	2025-04-22 06:37:23.88338	33	\N	\N
160	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:37:23.808	medium	pending	34	\N	\N	2025-04-22 06:37:23.913082	33	\N	\N
161	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:37:31.826	high	pending	35	opportunity	173	2025-04-22 06:37:31.8422	33	\N	\N
162	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:37:31.826	medium	pending	34	opportunity	174	2025-04-22 06:37:31.872149	33	\N	\N
163	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:37:31.826	medium	pending	35	quotation	123	2025-04-22 06:37:31.901596	33	\N	\N
164	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:37:31.826	medium	pending	34	\N	\N	2025-04-22 06:37:31.931483	33	\N	\N
165	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:38:27.674	high	pending	35	opportunity	177	2025-04-22 06:38:27.689146	33	\N	\N
166	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:38:27.674	medium	pending	34	opportunity	178	2025-04-22 06:38:27.719112	33	\N	\N
167	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:38:27.674	medium	pending	35	quotation	126	2025-04-22 06:38:27.74877	33	\N	\N
168	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:38:27.674	medium	pending	34	\N	\N	2025-04-22 06:38:27.778496	33	\N	\N
169	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:38:36.623	high	pending	35	opportunity	181	2025-04-22 06:38:36.637676	33	\N	\N
170	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:38:36.623	medium	pending	34	opportunity	182	2025-04-22 06:38:36.666917	33	\N	\N
171	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:38:36.623	medium	pending	35	quotation	129	2025-04-22 06:38:36.695924	33	\N	\N
172	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:38:36.623	medium	pending	34	\N	\N	2025-04-22 06:38:36.725438	33	\N	\N
173	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:40:31.452	high	pending	35	opportunity	185	2025-04-22 06:40:31.468122	33	\N	\N
174	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:40:31.452	medium	pending	34	opportunity	186	2025-04-22 06:40:31.504086	33	\N	\N
175	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:40:31.452	medium	pending	35	quotation	132	2025-04-22 06:40:31.535379	33	\N	\N
176	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:40:31.452	medium	pending	34	\N	\N	2025-04-22 06:40:31.570862	33	\N	\N
177	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:40:41.027	high	pending	35	opportunity	189	2025-04-22 06:40:41.042843	33	\N	\N
178	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:40:41.027	medium	pending	34	opportunity	190	2025-04-22 06:40:41.07304	33	\N	\N
179	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:40:41.027	medium	pending	35	quotation	135	2025-04-22 06:40:41.103512	33	\N	\N
180	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:40:41.027	medium	pending	34	\N	\N	2025-04-22 06:40:41.132762	33	\N	\N
181	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:47:48.853	high	pending	35	opportunity	193	2025-04-22 06:47:48.869439	33	\N	\N
182	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:47:48.853	medium	pending	34	opportunity	194	2025-04-22 06:47:48.902497	33	\N	\N
183	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:47:48.853	medium	pending	35	quotation	138	2025-04-22 06:47:48.931032	33	\N	\N
184	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:47:48.853	medium	pending	34	\N	\N	2025-04-22 06:47:48.960862	33	\N	\N
185	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:49:20.671	high	pending	35	opportunity	197	2025-04-22 06:49:20.686353	33	\N	\N
186	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:49:20.671	medium	pending	34	opportunity	198	2025-04-22 06:49:20.715937	33	\N	\N
187	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:49:20.671	medium	pending	35	quotation	141	2025-04-22 06:49:20.745078	33	\N	\N
188	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:49:20.671	medium	pending	34	\N	\N	2025-04-22 06:49:20.774126	33	\N	\N
189	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:49:30.049	high	pending	35	opportunity	201	2025-04-22 06:49:30.065554	33	\N	\N
190	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:49:30.049	medium	pending	34	opportunity	202	2025-04-22 06:49:30.095423	33	\N	\N
191	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:49:30.049	medium	pending	35	quotation	144	2025-04-22 06:49:30.125227	33	\N	\N
192	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:49:30.049	medium	pending	34	\N	\N	2025-04-22 06:49:30.154806	33	\N	\N
193	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:50:01.93	high	pending	35	opportunity	205	2025-04-22 06:50:01.946546	33	\N	\N
194	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:50:01.93	medium	pending	34	opportunity	206	2025-04-22 06:50:01.976525	33	\N	\N
195	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:50:01.93	medium	pending	35	quotation	147	2025-04-22 06:50:02.004983	33	\N	\N
196	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:50:01.93	medium	pending	34	\N	\N	2025-04-22 06:50:02.034963	33	\N	\N
197	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:50:12.058	high	pending	35	opportunity	209	2025-04-22 06:50:12.075463	33	\N	\N
198	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:50:12.058	medium	pending	34	opportunity	210	2025-04-22 06:50:12.105753	33	\N	\N
199	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:50:12.058	medium	pending	35	quotation	150	2025-04-22 06:50:12.135468	33	\N	\N
200	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:50:12.058	medium	pending	34	\N	\N	2025-04-22 06:50:12.165645	33	\N	\N
201	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:51:15.311	high	pending	35	opportunity	213	2025-04-22 06:51:15.327416	33	\N	\N
202	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:51:15.312	medium	pending	34	opportunity	214	2025-04-22 06:51:15.356484	33	\N	\N
203	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:51:15.312	medium	pending	35	quotation	153	2025-04-22 06:51:15.385498	33	\N	\N
204	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:51:15.312	medium	pending	34	\N	\N	2025-04-22 06:51:15.414789	33	\N	\N
205	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:51:25.012	high	pending	35	opportunity	217	2025-04-22 06:51:25.028339	33	\N	\N
206	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:51:25.012	medium	pending	34	opportunity	218	2025-04-22 06:51:25.060453	33	\N	\N
207	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:51:25.012	medium	pending	35	quotation	156	2025-04-22 06:51:25.091163	33	\N	\N
208	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:51:25.012	medium	pending	34	\N	\N	2025-04-22 06:51:25.121171	33	\N	\N
209	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:53:32.881	high	pending	35	opportunity	221	2025-04-22 06:53:32.896531	33	\N	\N
210	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:53:32.881	medium	pending	34	opportunity	222	2025-04-22 06:53:32.932085	33	\N	\N
211	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:53:32.881	medium	pending	35	quotation	159	2025-04-22 06:53:32.961986	33	\N	\N
212	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:53:32.881	medium	pending	34	\N	\N	2025-04-22 06:53:32.992078	33	\N	\N
213	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:57:46.535	high	pending	35	opportunity	225	2025-04-22 06:57:46.551222	33	\N	\N
214	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:57:46.535	medium	pending	34	opportunity	226	2025-04-22 06:57:46.589999	33	\N	\N
215	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:57:46.535	medium	pending	35	quotation	162	2025-04-22 06:57:46.620119	33	\N	\N
216	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:57:46.535	medium	pending	34	\N	\N	2025-04-22 06:57:46.650422	33	\N	\N
217	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:57:56.008	high	pending	35	opportunity	229	2025-04-22 06:57:56.02471	33	\N	\N
218	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:57:56.008	medium	pending	34	opportunity	230	2025-04-22 06:57:56.055894	33	\N	\N
219	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:57:56.008	medium	pending	35	quotation	165	2025-04-22 06:57:56.086913	33	\N	\N
220	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:57:56.008	medium	pending	34	\N	\N	2025-04-22 06:57:56.119034	33	\N	\N
221	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:59:47.555	high	pending	35	opportunity	233	2025-04-22 06:59:47.571756	33	\N	\N
222	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:59:47.555	medium	pending	34	opportunity	234	2025-04-22 06:59:47.601974	33	\N	\N
223	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:59:47.555	medium	pending	35	quotation	168	2025-04-22 06:59:47.632007	33	\N	\N
224	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:59:47.555	medium	pending	34	\N	\N	2025-04-22 06:59:47.662164	33	\N	\N
225	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 06:59:57.613	high	pending	35	opportunity	237	2025-04-22 06:59:57.628941	33	\N	\N
226	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 06:59:57.613	medium	pending	34	opportunity	238	2025-04-22 06:59:57.657776	33	\N	\N
227	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 06:59:57.613	medium	pending	35	quotation	171	2025-04-22 06:59:57.686393	33	\N	\N
228	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 06:59:57.613	medium	pending	34	\N	\N	2025-04-22 06:59:57.715155	33	\N	\N
229	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:02:12.07	high	pending	35	opportunity	241	2025-04-22 07:02:12.088619	33	\N	\N
230	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:02:12.07	medium	pending	34	opportunity	242	2025-04-22 07:02:12.123588	33	\N	\N
231	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:02:12.07	medium	pending	35	quotation	174	2025-04-22 07:02:12.153841	33	\N	\N
232	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:02:12.07	medium	pending	34	\N	\N	2025-04-22 07:02:12.185329	33	\N	\N
233	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:02:22.286	high	pending	35	opportunity	245	2025-04-22 07:02:22.302063	33	\N	\N
234	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:02:22.286	medium	pending	34	opportunity	246	2025-04-22 07:02:22.330685	33	\N	\N
235	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:02:22.286	medium	pending	35	quotation	177	2025-04-22 07:02:22.36017	33	\N	\N
236	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:02:22.286	medium	pending	34	\N	\N	2025-04-22 07:02:22.389474	33	\N	\N
237	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:02:52.608	high	pending	35	opportunity	249	2025-04-22 07:02:52.623636	33	\N	\N
238	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:02:52.608	medium	pending	34	opportunity	250	2025-04-22 07:02:52.65366	33	\N	\N
239	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:02:52.608	medium	pending	35	quotation	180	2025-04-22 07:02:52.683962	33	\N	\N
240	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:02:52.608	medium	pending	34	\N	\N	2025-04-22 07:02:52.714129	33	\N	\N
241	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:03:02.951	high	pending	35	opportunity	253	2025-04-22 07:03:02.967295	33	\N	\N
242	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:03:02.951	medium	pending	34	opportunity	254	2025-04-22 07:03:02.997207	33	\N	\N
243	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:03:02.951	medium	pending	35	quotation	183	2025-04-22 07:03:03.026908	33	\N	\N
244	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:03:02.951	medium	pending	34	\N	\N	2025-04-22 07:03:03.057021	33	\N	\N
245	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:04:05.609	high	pending	35	opportunity	257	2025-04-22 07:04:05.625175	33	\N	\N
246	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:04:05.609	medium	pending	34	opportunity	258	2025-04-22 07:04:05.655308	33	\N	\N
247	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:04:05.609	medium	pending	35	quotation	186	2025-04-22 07:04:05.685035	33	\N	\N
248	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:04:05.609	medium	pending	34	\N	\N	2025-04-22 07:04:05.715236	33	\N	\N
249	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:04:15.394	high	pending	35	opportunity	261	2025-04-22 07:04:15.410055	33	\N	\N
250	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:04:15.394	medium	pending	34	opportunity	262	2025-04-22 07:04:15.440169	33	\N	\N
251	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:04:15.394	medium	pending	35	quotation	189	2025-04-22 07:04:15.469249	33	\N	\N
252	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:04:15.394	medium	pending	34	\N	\N	2025-04-22 07:04:15.498366	33	\N	\N
253	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:05:05.555	high	pending	35	opportunity	265	2025-04-22 07:05:05.571067	33	\N	\N
254	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:05:05.555	medium	pending	34	opportunity	266	2025-04-22 07:05:05.599427	33	\N	\N
255	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:05:05.555	medium	pending	35	quotation	192	2025-04-22 07:05:05.629392	33	\N	\N
256	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:05:05.555	medium	pending	34	\N	\N	2025-04-22 07:05:05.658887	33	\N	\N
257	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:05:15.673	high	pending	35	opportunity	269	2025-04-22 07:05:15.690741	33	\N	\N
258	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:05:15.673	medium	pending	34	opportunity	270	2025-04-22 07:05:15.721389	33	\N	\N
259	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:05:15.673	medium	pending	35	quotation	195	2025-04-22 07:05:15.75165	33	\N	\N
260	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:05:15.673	medium	pending	34	\N	\N	2025-04-22 07:05:15.787127	33	\N	\N
261	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:06:12.251	high	pending	35	opportunity	273	2025-04-22 07:06:12.267206	33	\N	\N
262	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:06:12.251	medium	pending	34	opportunity	274	2025-04-22 07:06:12.296294	33	\N	\N
263	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:06:12.251	medium	pending	35	quotation	198	2025-04-22 07:06:12.325035	33	\N	\N
264	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:06:12.251	medium	pending	34	\N	\N	2025-04-22 07:06:12.357055	33	\N	\N
265	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:07:06.005	high	pending	35	opportunity	277	2025-04-22 07:07:06.020615	33	\N	\N
266	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:07:06.005	medium	pending	34	opportunity	278	2025-04-22 07:07:06.049801	33	\N	\N
267	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:07:06.005	medium	pending	35	quotation	201	2025-04-22 07:07:06.079615	33	\N	\N
268	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:07:06.005	medium	pending	34	\N	\N	2025-04-22 07:07:06.107573	33	\N	\N
269	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:07:15.862	high	pending	35	opportunity	281	2025-04-22 07:07:15.877618	33	\N	\N
270	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:07:15.862	medium	pending	34	opportunity	282	2025-04-22 07:07:15.908201	33	\N	\N
271	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:07:15.862	medium	pending	35	quotation	204	2025-04-22 07:07:15.939292	33	\N	\N
272	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:07:15.862	medium	pending	34	\N	\N	2025-04-22 07:07:15.969479	33	\N	\N
273	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:08:34.934	high	pending	35	opportunity	285	2025-04-22 07:08:34.950298	33	\N	\N
274	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:08:34.934	medium	pending	34	opportunity	286	2025-04-22 07:08:34.981183	33	\N	\N
275	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:08:34.934	medium	pending	35	quotation	207	2025-04-22 07:08:35.011366	33	\N	\N
276	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:08:34.934	medium	pending	34	\N	\N	2025-04-22 07:08:35.04194	33	\N	\N
277	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:08:44.696	high	pending	35	opportunity	289	2025-04-22 07:08:44.712288	33	\N	\N
278	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:08:44.696	medium	pending	34	opportunity	290	2025-04-22 07:08:44.742701	33	\N	\N
279	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:08:44.696	medium	pending	35	quotation	210	2025-04-22 07:08:44.77311	33	\N	\N
280	Update sales forecast for Q3	Compile all ongoing opportunities and create a forecast for Q3	2025-04-27 07:08:44.696	medium	pending	34	\N	\N	2025-04-22 07:08:44.804993	33	\N	\N
281	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:10:37.61	high	pending	35	opportunity	293	2025-04-22 07:10:37.625908	33	\N	\N
282	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:10:37.61	medium	pending	34	opportunity	294	2025-04-22 07:10:37.661951	33	\N	\N
283	Follow up with Security lead	Follow up on the sent quotation for security assessment	2025-04-25 07:10:37.61	medium	pending	35	quotation	213	2025-04-22 07:10:37.693527	33	\N	\N
286	Prepare proposal for TechGiant	Finalize the ERP implementation proposal with updated pricing	2025-04-24 07:10:48.986	medium	pending	34	opportunity	298	2025-04-22 07:10:49.03228	33	\N	\N
289	Call with Acme Corp about renewal	Discuss cloud storage renewal and potential upgrade	2025-04-23 07:13:25.454	high	pending	35	opportunity	301	2025-04-22 07:13:25.469841	33	\N	\N
298	kims oppt task	sfdsf	2025-04-18 18:30:00	medium	pending	\N	opportunity	310	2025-04-23 08:40:18.690821	33	\N	\N
311	HMS Demo Task On 13th	HMS Demo Task On 13th	2025-05-12 18:30:00	medium	in_progress	\N	opportunity	343	2025-05-14 10:07:10.880251	98	\N	\N
313	HIMS AND EMR DEMo		\N	medium	completed	\N	lead	411	2025-05-16 09:44:23.773441	101	\N	\N
314	Requirements		2025-05-15 18:30:00	medium	in_progress	\N	lead	408	2025-05-16 09:47:26.327865	101	\N	\N
315	Akshay Task		\N	medium	pending	\N	lead	409	2025-05-16 10:06:32.013225	104	\N	\N
312	HIMS		\N	medium	completed	\N	lead	413	2025-05-16 09:29:16.861227	101	\N	\N
316	Mayur2 Task 		\N	medium	in_progress	\N	lead	415	2025-05-16 10:59:36.84513	105	\N	\N
317	akshay2 Task		\N	medium	pending	\N	lead	416	2025-05-16 11:03:00.840462	104	\N	\N
318	Mayur 3 Task Created	Mayur 3 Task Created	2025-05-15 18:30:00	medium	pending	\N	lead	415	2025-05-16 11:06:14.282659	105	\N	\N
319	Akshay 3 Task		2025-05-15 18:30:00	medium	in_progress	\N	lead	416	2025-05-16 11:10:09.689642	104	\N	\N
320	Jagadeesh HIMS Demo to Dy Patil 		2025-05-15 18:30:00	medium	in_progress	\N	lead	418	2025-05-16 12:20:28.819943	103	\N	\N
321	Subbarao HMS Demo to Ramesh Hospitals	Subbarao HMS Demo to Ramesh Hospitals	2025-05-16 18:30:00	medium	in_progress	\N	lead	417	2025-05-16 12:23:37.924367	102	\N	\N
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teams (id, name, description, created_at, created_by) FROM stdin;
14	HMS TEAM	HMS TEAM	2025-05-05 09:47:02.315767	33
17	DMS AND DICOM	DMS AND DICOM	2025-05-14 05:46:28.64346	33
19	EMR TEAM	EMR TEAM	2025-05-14 05:47:34.705117	33
18	EduCare Team 	EduCare Team 	2025-05-14 05:47:12.486479	33
16	SLIMS	SLIMS	2025-05-14 05:46:14.593442	33
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, full_name, email, role, created_at, manager_id, team_id, is_active) FROM stdin;
104	akshay	cb11dfe13e8523becefff5cc32f693af5030899a2e447bacc7e8490b8a577a52e5025ed0a237d8ec444ca2c1c9250d4ab768b534429bf02e81adaaa900ffeede.dfc2fe6863ea6ef494c39c87e5c42c64	Akshay Kumar	akshay@gmail.com	sales_executive	2025-05-15 13:10:18.425446	103	\N	t
105	mayur	c83b597478192a6491bd7ad16e40784e357fb8402e5b6912824dd5d5167ec33bed77321d513bf9f9e18aef1c8dbad59d4fa58166d44e948e6ebf65f572b1f60d.236e5bb343c9cbba021c3332f2eadbfd	Mayur M	mayur@gmail.com	sales_executive	2025-05-16 05:03:40.35034	102	\N	t
101	suresh	10fd2c9845fe2d057a86a91551898580f8233aa43250a370a7b90cd86038ef2339dead3c253e13d920622dced99045f9ea9339bc6cbeebe5f4531f8a3e8aeb9e.41b0d19e60e001aaff6af58fdab4df6a	Suresh T	suresh@suvarna.co.in	sales_manager	2025-05-15 13:05:50.870047	\N	\N	t
103	jagadeesh	73042baa956f0b38812e8f7934de01d1cb558abc7ce80392dc40727b558b13d47ecbbe803952b296b3f2909182ee70690123d961d129efc0ca4b42581d6819bf.f7548bfb72f4daee895e0ce472c5c08b	Jagadeesh K	jagadeesh@co.in	sales_manager	2025-05-15 13:09:25.503823	101	\N	t
102	subbarao	5293f00e67cb644746365d5f30965c39b990bfa7f625d155432c273dda1cf8eb18120342a40f6cc26b76fd740a95399f94524e7b7c0a236c90857f35fbce5bfe.06f6dcd58a48c42bb5d91bd026a8cfed	Subbarao K	subbaraokolla@suvarna.co.in	sales_manager	2025-05-15 13:06:50.297559	101	\N	t
33	admin	b778ffd4d74e54db5b946fae86c6f1b584ce836cae48ac980fabb40f6cfacc259ef058bccf7d2f280836e77c530d6634b1132ceb3873b9d5c278fc73cee13bcd.21bac1a841aeb089bc4d9178dfff9009	Admin User	admin@example.com	admin	2025-04-22 05:57:44.761649	\N	8	t
34	manager	625e21b419aa6f2478164f737c50dff5e636eb3363f212c087c2a88b843b3fd40350ba625944f7ed3d048486631603de524e48dc008b5758a6fe512c3825940b.c6338acca579c46a127942b62bb4b1ac	Sales Manager	manager@example.com	sales_manager	2025-04-22 05:57:44.833961	\N	\N	f
35	sales	dfab842b4f6b9acd09efef293c1b620f9612c14afdbc99791ad4c97dc52737a48508cff7b27c3e9f7ba2447605e4b196096f4604a6c13ff89632d3ca0ad74763.6b7c63d96508fb78c4a88afeef01d738	Sales Executive	sales@example.com	sales_executive	2025-04-22 05:57:44.894849	\N	\N	f
\.


--
-- Data for Name: vendor_groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendor_groups (id, name, description, is_active, created_at, created_by, modified_at, modified_by) FROM stdin;
1	Suvarna Group of Companies	Suvarna Group of Companies	t	2025-05-08 10:45:05.383602	33	2025-05-08 10:45:27.289	33
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendors (id, name, contact_person, email, phone, website, address, is_active, created_at, created_by, modified_at, modified_by, vendor_group_id) FROM stdin;
1	Suvarna Technologies	Rahul Mehta	rahul@suvarnatech.com	+91 98765 43210	https://www.suvarnatech.com	201, Tech Park	t	2025-05-06 12:59:26.627	33	\N	\N	\N
2	Softhealth Systems	Priya Sharma	priya@softhealth.in	+91 87654 32109	https://www.softhealth.in	42, Cyber Tower	t	2025-05-06 12:59:26.627	33	\N	\N	\N
3	Medprecinct Solutions	Arjun Kumar	arjun@medprecinct.com	+91 76543 21098	https://www.medprecinct.com	304, Innovation Hub	t	2025-05-06 12:59:26.627	33	\N	\N	\N
5	HealthcareTech India	Anita Desai	anita@healthcaretech.in	+91 54321 09876	https://www.healthcaretech.in	55, Medical Square	t	2025-05-06 12:59:26.627	33	\N	\N	\N
6	Talent Times	srinivas	srinivas@suvarna.co.in	9080134567	\N	somajiguda	t	2025-05-07 06:08:33.170461	1	\N	\N	\N
9	Drug Detail	Prasad	prasad@suvarna.co.in	9912399123	\N	Somajiguga	t	2025-05-09 11:55:17.284144	1	\N	\N	1
10	HEALMAX	RAJASHAKER	RAJA@GMAIL.COM	8877665544	https://healmax.in	ameerpet	t	2025-05-16 09:00:50.059886	1	2025-05-16 09:01:10.039	\N	1
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.activities_id_seq', 639, true);


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.appointments_id_seq', 6, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.companies_id_seq', 425, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contacts_id_seq', 409, true);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.leads_id_seq', 419, true);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.modules_id_seq', 13, true);


--
-- Name: opportunities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.opportunities_id_seq', 358, true);


--
-- Name: product_modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.product_modules_id_seq', 47, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 391, true);


--
-- Name: quotation_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.quotation_items_id_seq', 655, true);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.quotations_id_seq', 270, true);


--
-- Name: sales_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sales_order_items_id_seq', 476, true);


--
-- Name: sales_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sales_orders_id_seq', 177, true);


--
-- Name: sales_targets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sales_targets_id_seq', 5, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tasks_id_seq', 321, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.teams_id_seq', 19, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 105, true);


--
-- Name: vendor_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vendor_groups_id_seq', 2, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vendors_id_seq', 10, true);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: opportunities opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_pkey PRIMARY KEY (id);


--
-- Name: product_modules product_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_modules
    ADD CONSTRAINT product_modules_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: sales_order_items sales_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_pkey PRIMARY KEY (id);


--
-- Name: sales_orders sales_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_pkey PRIMARY KEY (id);


--
-- Name: sales_targets sales_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vendor_groups vendor_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_groups
    ADD CONSTRAINT vendor_groups_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: appointments appointments_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: quotation_items fk_quotation_items_module; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT fk_quotation_items_module FOREIGN KEY (module_id) REFERENCES public.modules(id);


--
-- Name: sales_order_items fk_sales_order_items_module; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT fk_sales_order_items_module FOREIGN KEY (module_id) REFERENCES public.modules(id);


--
-- Name: leads leads_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: leads leads_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: product_modules product_modules_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_modules
    ADD CONSTRAINT product_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id);


--
-- Name: product_modules product_modules_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_modules
    ADD CONSTRAINT product_modules_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: products products_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: sales_targets sales_targets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- Name: sales_targets sales_targets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales_targets
    ADD CONSTRAINT sales_targets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_contact_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_contact_person_id_fkey FOREIGN KEY (contact_person_id) REFERENCES public.contacts(id);


--
-- Name: vendors vendors_vendor_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_vendor_group_id_fkey FOREIGN KEY (vendor_group_id) REFERENCES public.vendor_groups(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

