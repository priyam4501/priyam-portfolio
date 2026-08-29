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