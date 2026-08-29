CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_allowlist WHERE user_id = _user_id)
$$;

CREATE POLICY "Admins can read all projects"
ON public.projects FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert projects"
ON public.projects FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update projects"
ON public.projects FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

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