-- =====================================================================
-- 04_admin_user.sql — grant admin access to your login
-- Run AFTER creating your user in Dashboard → Authentication → Users
-- (Add user → email + password, "Auto Confirm User" checked).
-- Copy that user's UUID and paste it below.
-- =====================================================================

INSERT INTO public.admin_allowlist (user_id, note)
VALUES ('Enter User UUID', 'site owner')
ON CONFLICT DO NOTHING;

-- Verify:
-- SELECT * FROM public.admin_allowlist;
