-- profile (singleton)
CREATE TABLE public.profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  title text NOT NULL,
  tagline text,
  bio text,
  avatar_url text,
  email text,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile TO anon, authenticated;
GRANT ALL ON public.profile TO service_role;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile is publicly readable" ON public.profile FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  narrative jsonb NOT NULL DEFAULT '{}'::jsonb,
  cover_image_url text,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  stack_tags text[] NOT NULL DEFAULT '{}',
  live_url text,
  repo_url text,
  case_study_url text,
  category text NOT NULL DEFAULT 'Full-Stack App',
  timeframe text,
  role text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published projects are publicly readable" ON public.projects FOR SELECT TO anon, authenticated USING (is_published);

CREATE TABLE public.experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  role text NOT NULL,
  location text,
  start_date date NOT NULL,
  end_date date,
  description text[] NOT NULL DEFAULT '{}',
  stack_tags text[] NOT NULL DEFAULT '{}',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experience TO anon, authenticated;
GRANT ALL ON public.experience TO service_role;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published experience is publicly readable" ON public.experience FOR SELECT TO anon, authenticated USING (is_published);

CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  proficiency smallint NOT NULL DEFAULT 3,
  icon_key text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published skills are publicly readable" ON public.skills FOR SELECT TO anon, authenticated USING (is_published);

CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon, authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published social links are publicly readable" ON public.social_links FOR SELECT TO anon, authenticated USING (is_published);

CREATE TABLE public.resume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url text NOT NULL,
  version_label text,
  file_size_label text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resume_versions TO anon, authenticated;
GRANT ALL ON public.resume_versions TO service_role;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active resume is publicly readable" ON public.resume_versions FOR SELECT TO anon, authenticated USING (is_active);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a contact message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (
  char_length(name) BETWEEN 1 AND 120
  AND char_length(email) BETWEEN 3 AND 200
  AND char_length(message) BETWEEN 1 AND 5000
);

-- Seed content
INSERT INTO public.profile (full_name, title, tagline, bio, email, location) VALUES (
  'Priyam Singh',
  'Java Full-Stack Developer',
  'Reliable backends. Thoughtful frontends. Systems that hold up in production.',
  'I''m a full-stack developer with five years of experience building production systems in Java and Spring Boot, paired with modern React frontends. I''ve shipped everything from internal tooling to customer-facing platforms handling thousands of daily users, and I''m most at home working across the whole stack — designing schemas, writing APIs, and polishing the interfaces on top of them. I care about boring reliability: clear error handling, tested code paths, and deployments that don''t surprise anyone. Currently exploring distributed systems patterns and deepening my cloud architecture practice on AWS.',
  'priyam.singh@example.com',
  'Bengaluru, IN'
);

INSERT INTO public.social_links (platform, url, display_order) VALUES
  ('Email', 'mailto:priyam.singh@example.com', 1),
  ('LinkedIn', 'https://linkedin.com/in/priyamsingh', 2),
  ('GitHub', 'https://github.com/priyamsingh', 3);

INSERT INTO public.resume_versions (file_url, version_label, file_size_label, is_active) VALUES
  ('/resume.pdf', 'Updated Aug 2026', 'PDF · 184 KB', true);

INSERT INTO public.skills (name, category, proficiency, icon_key, display_order) VALUES
  ('Java','Backend',5,'coffee',1),
  ('Spring Boot','Backend',5,'leaf',2),
  ('Hibernate / JPA','Backend',4,'layers',3),
  ('REST APIs','Backend',5,'workflow',4),
  ('Microservices','Backend',4,'server',5),
  ('React','Frontend',4,'braces',1),
  ('TypeScript','Frontend',4,'braces',2),
  ('Next.js','Frontend',3,'layers',3),
  ('Tailwind CSS','Frontend',4,'layers',4),
  ('Docker','DevOps',4,'container',1),
  ('AWS','DevOps',3,'cloud',2),
  ('CI/CD','DevOps',4,'workflow',3),
  ('Linux','DevOps',4,'terminal',4),
  ('PostgreSQL','Database',4,'database',1),
  ('MySQL','Database',4,'database',2),
  ('Redis','Database',3,'database',3),
  ('Git','Tools',5,'git',1),
  ('Maven / Gradle','Tools',4,'terminal',2),
  ('IntelliJ IDEA','Tools',5,'terminal',3),
  ('Postman','Tools',4,'workflow',4);

INSERT INTO public.experience (company, role, location, start_date, end_date, description, stack_tags, display_order) VALUES
  ('NovaTech Solutions','Senior Software Engineer','Bengaluru, IN','2024-03-01',NULL,
   ARRAY['Own the order-processing platform (Spring Boot, Kafka) handling ~2M events/day; cut p95 latency 38% via batching and cache rework.','Led migration of a legacy monolith module into 4 Spring services behind an API gateway with zero-downtime cutover.','Mentor two junior engineers; introduced contract testing with Pact across service boundaries.'],
   ARRAY['Java 21','Spring Boot','Kafka','PostgreSQL','AWS','Docker'],1),
  ('Vertex Systems','Software Development Engineer II','Hyderabad, IN','2022-06-01','2024-02-29',
   ARRAY['Built a multi-tenant billing API (Spring Boot, Hibernate) adopted by 40+ enterprise customers.','Shipped a React/TypeScript admin console that replaced a legacy JSP UI, halving support tickets.','Set up CI/CD pipelines (GitHub Actions, Docker) reducing release time from hours to ~15 minutes.'],
   ARRAY['Java','Spring Boot','Hibernate','React','TypeScript','GitHub Actions'],2),
  ('CodeLab Technologies','Software Development Engineer','Pune, IN','2021-07-01','2022-05-31',
   ARRAY['Developed REST APIs for an inventory management product serving 200+ retail clients.','Optimized slow PostgreSQL queries (indexing, query rewrites), improving report generation 5x.','Wrote integration tests with Testcontainers, raising coverage from 30% to 75%.'],
   ARRAY['Java','Spring MVC','PostgreSQL','Redis','JUnit','Testcontainers'],3),
  ('ByteBase Software','Software Engineering Intern','Remote','2021-01-01','2021-06-30',
   ARRAY['Built internal tooling in Java and React to automate QA data seeding, saving the team ~6 hrs/week.','Contributed bug fixes to a Spring Boot microservices codebase under code review.'],
   ARRAY['Java','Spring Boot','React','MySQL','Git'],4);

INSERT INTO public.projects (slug, title, summary, narrative, category, timeframe, role, stack_tags, live_url, repo_url, case_study_url, is_featured, display_order) VALUES
('orderflow','OrderFlow','Order management platform processing 40k orders/day for a retail chain.',
 jsonb_build_object(
  'problem','The client''s order pipeline ran on spreadsheets and a legacy desktop app. Orders were lost between departments, inventory drifted from reality daily, and staff reconciled records by hand every evening. They needed a single system that could intake orders from three sales channels and keep inventory consistent in real time.',
  'approach','I started with a two-week discovery phase, shadowing the warehouse and sales teams to map the actual order lifecycle before writing any code. We agreed on an event-sourced core: every state change (order placed, stock reserved, shipment dispatched) became an immutable event, which gave us an audit trail for free and made the reconciliation problem disappear by construction.',
  'architecture','The backend is a modular Spring Boot service split along domain boundaries — orders, inventory, fulfillment — communicating through a transactional outbox into RabbitMQ. PostgreSQL holds the event store with optimistic locking on aggregate roots. The React frontend consumes a read-optimized projection API, so UI queries never touch the write model. Deployed on ECS behind an ALB, with blue-green deployments via CodeDeploy.',
  'outcome','Order loss dropped to zero in the first month. End-of-day reconciliation went from 90 minutes of manual work to an automated report. The system absorbed a 6x traffic spike during a holiday sale without intervention, and the event log later let the analytics team answer questions nobody had thought to ask at design time.'),
 'Full-Stack App','2024 — 2025','Lead Full-Stack Developer',
 ARRAY['Java','Spring Boot','React','PostgreSQL'],'https://example.com','https://github.com',NULL,true,1),
('authkit','AuthKit','Drop-in authentication service handling 2M tokens/month across 12 internal apps.',
 jsonb_build_object(
  'problem','Twelve internal applications each implemented login differently — three session models, two token formats, and password policies that disagreed with each other. Rolling out a security requirement meant touching twelve codebases, and onboarding a new app took weeks.',
  'approach','I designed AuthKit as a standalone identity service implementing OAuth2/OIDC with refresh-token rotation. The guiding constraint was adoption cost: each app integrated by adding a single Spring Security starter dependency and three config values. I wrote the migration guide alongside the code and onboarded the first two apps myself to prove the path.',
  'architecture','Stateless JWT access tokens signed with rotating RSA keys (JWKS endpoint), refresh tokens stored in Redis with per-device family tracking for reuse detection. Spring Boot service, Postgres for identities, Redis for token state, horizontal scaling behind an internal load balancer. Rate limiting and anomaly flags live in a filter chain ahead of the token endpoint.',
  'outcome','All twelve apps migrated in one quarter. New-app onboarding dropped from weeks to under a day. Refresh-token reuse detection caught two leaked tokens in the wild, both revoked before misuse. The security team now ships policy changes in one place.'),
 'Backend API','2024','Backend Developer',
 ARRAY['Java','Spring Security','Redis','Docker'],'https://example.com','https://github.com',NULL,true,2),
('schemadiff','SchemaDiff','CLI tool that catches breaking database migrations before they reach CI.',
 jsonb_build_object(
  'problem','Our team kept shipping migrations that broke staging — a dropped column here, a tightened constraint there — each discovered only after a failed deploy. Reviews caught some, but humans are bad at simulating DDL in their heads.',
  'approach','I built SchemaDiff as a Gradle plugin plus CLI that spins up an ephemeral Postgres in Docker, applies the migration chain from main and from the PR branch, and diffs the resulting catalogs. Anything destructive or type-changing gets flagged with the exact statement that caused it.',
  'architecture','The tool parses migration files in order, executes them against Testcontainers-managed Postgres instances, then queries information_schema and pg_catalog to build a normalized model of tables, columns, constraints, and indexes. The differ compares models and classifies changes by risk tier. A GitHub Action posts the report as a PR comment.',
  'outcome','Breaking migrations reaching CI dropped to zero within a month of adoption. Three other teams adopted it, and the risk-tier classification became part of the team''s migration review checklist.'),
 'Tool','2023','Solo Developer',
 ARRAY['Java','PostgreSQL','Gradle','GitHub Actions'],NULL,'https://github.com',NULL,true,3),
('fleetpulse','FleetPulse','Real-time telemetry dashboard for a 300-vehicle logistics fleet.',
 jsonb_build_object(
  'problem','Dispatchers tracked vehicles through phone calls and a map that refreshed every five minutes. During incidents, they were always working from stale data.',
  'approach','Built a streaming pipeline: GPS pings ingest over MQTT, get enriched and fanned out through Redis Streams, and push to the dashboard over WebSocket. The UI renders 300 live positions with sub-second latency.',
  'architecture','Spring WebFlux for the reactive ingest path, Redis Streams as the buffer, Postgres for historical trips. React frontend with a canvas-based map layer, virtualized lists, and server-driven alert rules.',
  'outcome','Average incident response time fell from 12 minutes to under 3. Dispatchers stopped making status calls entirely within two weeks.'),
 'Full-Stack App','2023','Full-Stack Developer',
 ARRAY['Java','Spring WebFlux','React','Redis'],'https://example.com','https://github.com',NULL,false,4),
('reportforge','ReportForge','Scheduled reporting API generating 5k PDF reports weekly for finance teams.',
 jsonb_build_object(
  'problem','Finance teams assembled weekly reports by exporting CSVs and formatting them manually — roughly four hours of work per report, every week, across nine teams.',
  'approach','I built a report-definition API where teams declare queries, layout templates, and schedules. A batch cluster renders PDFs overnight and delivers them to S3 with signed links.',
  'architecture','Spring Batch jobs partitioned by report definition, PostgreSQL for definitions and run history, S3 for artifacts. Idempotent job design with checkpointing so a failed render resumes rather than restarts.',
  'outcome','Around 36 team-hours of manual work eliminated weekly. Report errors from manual formatting disappeared, and audit got a complete run history.'),
 'Backend API','2022 — 2023','Backend Developer',
 ARRAY['Java','Spring Batch','PostgreSQL','AWS S3'],NULL,'https://github.com',NULL,false,5),
('loglens','LogLens','Lightweight log search CLI used daily by a 15-person engineering team.',
 jsonb_build_object(
  'problem','Grepping gigabytes of structured JSON logs was slow and the queries were unrepeatable — everyone had their own incantation, and nobody remembered anyone else''s.',
  'approach','LogLens indexes JSON logs into a local SQLite FTS index and exposes a small query language for common filters (service, level, trace ID, time range). Compiled to a native binary with GraalVM so it starts instantly.',
  'architecture','Streaming parser with backpressure, incremental indexing so repeat queries over the same files are instant, and shareable named queries stored in a team config file.',
  'outcome','Median time-to-answer during incidents dropped visibly; the shared query file became living documentation of how the team debugs.'),
 'Tool','2022','Solo Developer',
 ARRAY['Java','GraalVM','SQLite'],NULL,'https://github.com',NULL,false,6);