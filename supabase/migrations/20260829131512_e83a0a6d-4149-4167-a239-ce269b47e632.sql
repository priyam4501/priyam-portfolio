CREATE POLICY "Admins can read project images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-images' AND public.is_admin(auth.uid()));