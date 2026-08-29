-- Admins need to actually read submitted contact messages through the app.
-- Insert-only policy already exists (public form submissions); this adds the
-- missing read side, gated by the same is_admin() allowlist check used
-- everywhere else.
CREATE POLICY "Admins can read contact messages"
ON public.contact_messages FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Optional but reasonable: let admins delete spam/handled messages too.
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));