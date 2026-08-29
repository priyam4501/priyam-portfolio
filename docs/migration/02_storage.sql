-- =====================================================================
-- 02_storage.sql — storage buckets + policies
-- IMPORTANT: create the buckets FIRST in Supabase Dashboard → Storage
--   1. "project-images"  → Private
--   2. "resumes"         → Private (allowed MIME type: application/pdf)
-- Then run this file in the SQL Editor.
-- =====================================================================

-- project-images
CREATE POLICY "Admins can read project images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can upload project images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update project images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-images' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'project-images' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete project images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-images' AND public.is_admin(auth.uid()));

-- resumes
CREATE POLICY "Admins can read resume files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can upload resume files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update resume files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'resumes' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete resume files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND public.is_admin(auth.uid()));
