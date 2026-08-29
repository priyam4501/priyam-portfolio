-- =====================================================================
-- 01_schema.sql — full database schema for the portfolio site
-- Target: a fresh Supabase project (run in the SQL Editor, top to bottom)
-- Contains: tables, grants, RLS policies, helper function, trigger.
-- No data. Run 03_data.sql afterwards to load content.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tables + grants + RLS (public read policies)
-- ---------------------------------------------------------------------

CREATE TABLE public.profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  title text NOT NULL,
  tagline text,
  bio text,
  avatar_url text,
  email text,
  location text,
  seo_title text,
  seo_description text,
  seo_og_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile TO authenticated;
GRANT ALL ON public.profile TO service_role;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profile is publicly readable" ON public.profile
  FOR SELECT TO anon, authenticated USING (true);

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
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published projects are publicly readable" ON public.projects
  FOR SELECT TO anon, authenticated USING (is_published);

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
GRANT SELECT ON public.experience TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience TO authenticated;
GRANT ALL ON public.experience TO service_role;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published experience is publicly readable" ON public.experience
  FOR SELECT TO anon, authenticated USING (is_published);

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
GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published skills are publicly readable" ON public.skills
  FOR SELECT TO anon, authenticated USING (is_published);

CREATE TABLE public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published social links are publicly readable" ON public.social_links
  FOR SELECT TO anon, authenticated USING (is_published);

CREATE TABLE public.resume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url text NOT NULL,
  version_label text,
  file_size_label text,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.resume_versions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_versions TO authenticated;
GRANT ALL ON public.resume_versions TO service_role;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active resume is publicly readable" ON public.resume_versions
  FOR SELECT TO anon, authenticated USING (is_active);

CREATE TABLE public.coding_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  handle text NOT NULL,
  rating integer,
  rank_label text,
  problems_solved integer,
  profile_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coding_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coding_stats TO authenticated;
GRANT ALL ON public.coding_stats TO service_role;
ALTER TABLE public.coding_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published coding stats are publicly readable" ON public.coding_stats
  FOR SELECT TO anon, authenticated USING (is_published);

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
CREATE POLICY "Anyone can send a contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 200
    AND char_length(message) BETWEEN 1 AND 5000
  );

-- ---------------------------------------------------------------------
-- 2. Admin allowlist + is_admin() helper
-- ---------------------------------------------------------------------

CREATE TABLE public.admin_allowlist (
  user_id uuid PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_allowlist TO authenticated;
GRANT ALL ON public.admin_allowlist TO service_role;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own allowlist entry" ON public.admin_allowlist
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_allowlist WHERE user_id = _user_id)
$$;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

-- ---------------------------------------------------------------------
-- 3. Admin write policies (all content tables)
-- ---------------------------------------------------------------------

CREATE POLICY "Admins can read all projects" ON public.projects FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can read all experience" ON public.experience FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert experience" ON public.experience FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update experience" ON public.experience FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete experience" ON public.experience FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can read all skills" ON public.skills FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update skills" ON public.skills FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete skills" ON public.skills FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can read all social links" ON public.social_links FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert social links" ON public.social_links FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update social links" ON public.social_links FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete social links" ON public.social_links FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can read all resume versions" ON public.resume_versions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert resume versions" ON public.resume_versions FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update resume versions" ON public.resume_versions FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete resume versions" ON public.resume_versions FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can read all coding stats" ON public.coding_stats FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert coding stats" ON public.coding_stats FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update coding stats" ON public.coding_stats FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete coding stats" ON public.coding_stats FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profile" ON public.profile FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update profile" ON public.profile FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- 4. updated_at trigger
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_coding_stats_updated_at
  BEFORE UPDATE ON public.coding_stats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
