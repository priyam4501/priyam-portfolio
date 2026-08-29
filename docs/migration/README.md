# Database migration to your own Supabase project

Run these files in order in the new project's **SQL Editor**.

| File | What it does | When |
| --- | --- | --- |
| `01_schema.sql` | All tables, grants, RLS policies, `is_admin()`, `set_updated_at()` trigger | First |
| `02_storage.sql` | Storage policies for `project-images` and `resumes` | After creating the two buckets in Dashboard → Storage (both **Private**; `resumes` restricted to `application/pdf`) |
| `03_data.sql` | Current site content (profile, projects, experience, skills, social links, resume versions, coding stats) | After `01` |
| `04_admin_user.sql` | Adds your auth user to the admin allowlist | After creating your user in Dashboard → Authentication → Users |

## Full sequence

1. Create a new project at supabase.com and wait for it to provision.
2. SQL Editor → paste `01_schema.sql` → Run.
3. Storage → New bucket `project-images` (private) and `resumes` (private, MIME `application/pdf`).
4. SQL Editor → paste `02_storage.sql` → Run.
5. SQL Editor → paste `03_data.sql` → Run. (Edit or trim rows first if you want a clean slate.)
6. Authentication → Users → Add user (email + password, Auto Confirm). Copy the UUID.
7. Paste that UUID into `04_admin_user.sql` and Run.
8. Re-upload any files that lived in the old storage buckets (cover images, resume PDF) and fix the stored URLs in `projects.cover_image_url` / `resume_versions.file_url`.
9. Update env vars locally (`.env`) and in Vercel:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`
   (Project URL and the publishable/anon key come from Settings → API.)
10. Run `bun run dev` locally, verify the public pages and `/admin/login`, then redeploy on Vercel.

## Notes

- `03_data.sql` uses `json_populate_recordset`, so it survives column-order differences and needs no escaping fixes.
- `contact_messages` is intentionally not exported — it starts empty.
- Every table keeps RLS on: anonymous visitors can only read published rows and insert contact messages; all writes require an allowlisted admin.
