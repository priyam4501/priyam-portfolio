import { createClient } from "@supabase/supabase-js";

import {
  mapProject,
  mapRole,
  mapSkill,
  relatedProjects,
  type Profile,
  type Resume,
  type SocialLink,
} from "./content";

function client() {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

function mapProfile(row: any | null): Profile | null {
  if (!row) return null;
  return {
    fullName: row.full_name,
    title: row.title,
    tagline: row.tagline ?? "",
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url ?? null,
    email: row.email ?? null,
    location: row.location ?? null,
  };
}

function mapSocials(rows: any[]): SocialLink[] {
  return rows.map((r) => ({ platform: r.platform, url: r.url }));
}

function mapResume(row: any | null): Resume | null {
  if (!row) return null;
  return {
    fileUrl: row.file_url,
    versionLabel: row.version_label ?? null,
    fileSizeLabel: row.file_size_label ?? null,
  };
}

const PROJECT_COLUMNS =
  "slug,title,summary,narrative,cover_image_url,gallery_urls,stack_tags,live_url,repo_url,case_study_url,category,timeframe,role,is_featured,display_order";

export async function fetchHomeData() {
  const db = client();
  const [profile, projects, skills, experience, socials, resume, total] = await Promise.all([
    db.from("profile").select("*").limit(1).maybeSingle(),
    db
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .limit(3),
    db
      .from("skills")
      .select("name,category,proficiency,icon_key")
      .eq("is_published", true)
      .order("display_order", { ascending: true }),
    db
      .from("experience")
      .select("id,company,role,location,start_date,end_date,description,stack_tags")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .limit(3),
    db
      .from("social_links")
      .select("platform,url")
      .eq("is_published", true)
      .order("display_order", { ascending: true }),
    db
      .from("resume_versions")
      .select("file_url,version_label,file_size_label")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    db.from("projects").select("slug", { count: "exact", head: true }).eq("is_published", true),
  ]);

  if (profile.error) throw new Error(profile.error.message);
  if (resume.error) throw new Error(resume.error.message);

  return {
    profile: mapProfile(profile.data),
    featured: unwrap<any[]>(projects).map(mapProject),
    skills: unwrap<any[]>(skills).map(mapSkill),
    roles: unwrap<any[]>(experience).map(mapRole),
    socials: mapSocials(unwrap<any[]>(socials)),
    resume: mapResume(resume.data),
    projectCount: total.count ?? 0,
  };
}

export async function fetchProjectsData() {
  const db = client();
  const res = await db
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  return { projects: unwrap<any[]>(res).map(mapProject) };
}

export async function fetchSocialLinks() {
  const db = client();
  const res = await db
    .from("social_links")
    .select("platform,url")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  return { socials: mapSocials(unwrap<any[]>(res)) };
}

export async function fetchProjectDetail(slug: string) {
  const db = client();
  const res = await db
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  const all = unwrap<any[]>(res).map(mapProject);
  const project = all.find((p) => p.slug === slug) ?? null;
  return { project, related: project ? relatedProjects(all, slug) : [] };
}

export async function fetchExperienceData() {
  const db = client();
  const res = await db
    .from("experience")
    .select("id,company,role,location,start_date,end_date,description,stack_tags")
    .eq("is_published", true)
    .order("display_order", { ascending: true });
  return { roles: unwrap<any[]>(res).map(mapRole) };
}

export async function fetchContactData() {
  const db = client();
  const [profile, socials, resume] = await Promise.all([
    db.from("profile").select("*").limit(1).maybeSingle(),
    db
      .from("social_links")
      .select("platform,url")
      .eq("is_published", true)
      .order("display_order", { ascending: true }),
    db
      .from("resume_versions")
      .select("file_url,version_label,file_size_label")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  if (profile.error) throw new Error(profile.error.message);
  if (resume.error) throw new Error(resume.error.message);

  return {
    profile: mapProfile(profile.data),
    socials: mapSocials(unwrap<any[]>(socials)),
    resume: mapResume(resume.data),
  };
}
