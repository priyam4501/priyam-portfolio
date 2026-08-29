CREATE TABLE public.admin_allowlist (
  user_id uuid PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_allowlist TO authenticated;
GRANT ALL ON public.admin_allowlist TO service_role;

ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own allowlist entry"
ON public.admin_allowlist
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_allowlist WHERE user_id = _user_id)
$$;