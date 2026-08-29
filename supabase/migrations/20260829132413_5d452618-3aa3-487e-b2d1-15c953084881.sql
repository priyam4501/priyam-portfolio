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

CREATE POLICY "Published coding stats are publicly readable"
  ON public.coding_stats FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Admins can read all coding stats"
  ON public.coding_stats FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert coding stats"
  ON public.coding_stats FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update coding stats"
  ON public.coding_stats FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete coding stats"
  ON public.coding_stats FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

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

ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_og_image_url text;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.experience TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile TO authenticated;
GRANT ALL ON public.experience TO service_role;
GRANT ALL ON public.skills TO service_role;
GRANT ALL ON public.social_links TO service_role;
GRANT ALL ON public.resume_versions TO service_role;
GRANT ALL ON public.profile TO service_role;

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

CREATE POLICY "Admins can insert profile" ON public.profile FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update profile" ON public.profile FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));