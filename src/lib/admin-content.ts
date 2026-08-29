/**
 * Admin data access for every content table other than projects.
 *
 * Everything goes through the authenticated browser client, so Postgres RLS
 * (admin allowlist policies) is the authorization boundary.
 */
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

export const SKILL_CATEGORIES = ["Backend", "Frontend", "DevOps", "Database", "Tools"] as const;

export const ICON_KEYS = [
  "code",
  "server",
  "database",
  "cloud",
  "container",
  "terminal",
  "git-branch",
  "cpu",
  "layers",
  "boxes",
  "shield",
  "wrench",
] as const;

export const SOCIAL_PLATFORMS = [
  "GitHub",
  "LinkedIn",
  "LeetCode",
  "Codeforces",
  "Twitter/X",
  "Email",
  "Other",
] as const;

export const CODING_PLATFORMS = [
  "LeetCode",
  "Codeforces",
  "CodeChef",
  "HackerRank",
  "GeeksforGeeks",
  "AtCoder",
  "Other",
] as const;

const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v), {
    message: "Enter a valid URL starting with http:// or https://",
  });

const requiredUrl = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(500)
  .refine((v) => /^(https?:\/\/\S+\.\S+|mailto:\S+@\S+\.\S+)$/.test(v), {
    message: "Enter a valid https:// URL (or mailto: address)",
  });

const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker (YYYY-MM-DD)");

/* ------------------------------------------------------------------ shared */

export function translate(error: { code?: string; message: string }): Error {
  if (error.code === "23505") return new Error("That entry already exists.");
  return new Error(error.message);
}

async function reorder(table: "experience" | "skills" | "social_links" | "coding_stats", rows: { id: string; display_order: number }[]) {
  for (const row of rows) {
    const { error } = await supabase
      .from(table)
      .update({ display_order: row.display_order })
      .eq("id", row.id);
    if (error) throw translate(error);
  }
}

async function setPublished(
  table: "experience" | "skills" | "social_links" | "coding_stats",
  id: string,
  value: boolean,
) {
  const { error } = await supabase.from(table).update({ is_published: value }).eq("id", id);
  if (error) throw translate(error);
}

async function removeRow(
  table: "experience" | "skills" | "social_links" | "coding_stats" | "resume_versions",
  id: string,
) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw translate(error);
}

export const reorderRows = reorder;
export const togglePublished = setPublished;
export const deleteRow = removeRow;

/* -------------------------------------------------------------- experience */

export const experienceSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(120),
  location: z.string().trim().max(120).default(""),
  startDate: isoDate,
  endDate: z.string().trim().default(""),
  description: z.string().max(4000).default(""),
  stackTags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  isPublished: z.boolean().default(true),
  displayOrder: z.number().int().min(0).max(9999).default(0),
});
export type ExperienceValues = z.infer<typeof experienceSchema>;

export type ExperienceRow = {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  description: string[];
  stack_tags: string[];
  is_published: boolean;
  display_order: number;
};

export function emptyExperience(displayOrder = 0): ExperienceValues {
  return {
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
    stackTags: [],
    isPublished: true,
    displayOrder,
  };
}

export function experienceToForm(row: ExperienceRow): ExperienceValues {
  return {
    company: row.company,
    role: row.role,
    location: row.location ?? "",
    startDate: row.start_date,
    endDate: row.end_date ?? "",
    description: (row.description ?? []).join("\n"),
    stackTags: row.stack_tags ?? [],
    isPublished: row.is_published,
    displayOrder: row.display_order,
  };
}

export async function listExperience(): Promise<ExperienceRow[]> {
  const { data, error } = await supabase
    .from("experience")
    .select("id,company,role,location,start_date,end_date,description,stack_tags,is_published,display_order")
    .order("display_order", { ascending: true });
  if (error) throw translate(error);
  return (data ?? []) as unknown as ExperienceRow[];
}

export async function saveExperience(id: string | null, values: ExperienceValues) {
  const payload = {
    company: values.company,
    role: values.role,
    location: values.location || null,
    start_date: values.startDate,
    end_date: values.endDate || null,
    description: values.description
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    stack_tags: values.stackTags,
    is_published: values.isPublished,
    display_order: values.displayOrder,
  };
  const { error } = id
    ? await supabase.from("experience").update(payload).eq("id", id)
    : await supabase.from("experience").insert(payload);
  if (error) throw translate(error);
}

/* ------------------------------------------------------------------ skills */

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  category: z.enum(SKILL_CATEGORIES),
  proficiency: z.number().int().min(1).max(5),
  iconKey: z.string().trim().max(40).default(""),
  isPublished: z.boolean().default(true),
  displayOrder: z.number().int().min(0).max(9999).default(0),
});
export type SkillValues = z.infer<typeof skillSchema>;

export type SkillRow = {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon_key: string | null;
  is_published: boolean;
  display_order: number;
};

export function emptySkill(displayOrder = 0): SkillValues {
  return {
    name: "",
    category: "Backend",
    proficiency: 3,
    iconKey: "code",
    isPublished: true,
    displayOrder,
  };
}

export function skillToForm(row: SkillRow): SkillValues {
  const category = (SKILL_CATEGORIES as readonly string[]).includes(row.category)
    ? (row.category as SkillValues["category"])
    : "Tools";
  return {
    name: row.name,
    category,
    proficiency: Math.min(5, Math.max(1, row.proficiency || 3)),
    iconKey: row.icon_key ?? "",
    isPublished: row.is_published,
    displayOrder: row.display_order,
  };
}

export async function listSkills(): Promise<SkillRow[]> {
  const { data, error } = await supabase
    .from("skills")
    .select("id,name,category,proficiency,icon_key,is_published,display_order")
    .order("category", { ascending: true })
    .order("display_order", { ascending: true });
  if (error) throw translate(error);
  return (data ?? []) as unknown as SkillRow[];
}

export async function saveSkill(id: string | null, values: SkillValues) {
  const payload = {
    name: values.name,
    category: values.category,
    proficiency: values.proficiency,
    icon_key: values.iconKey || null,
    is_published: values.isPublished,
    display_order: values.displayOrder,
  };
  const { error } = id
    ? await supabase.from("skills").update(payload).eq("id", id)
    : await supabase.from("skills").insert(payload);
  if (error) throw translate(error);
}

/* ------------------------------------------------------------ social links */

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  url: requiredUrl,
  isPublished: z.boolean().default(true),
  displayOrder: z.number().int().min(0).max(9999).default(0),
});
export type SocialLinkValues = z.infer<typeof socialLinkSchema>;

export type SocialLinkRow = {
  id: string;
  platform: string;
  url: string;
  is_published: boolean;
  display_order: number;
};

export function emptySocialLink(displayOrder = 0): SocialLinkValues {
  return { platform: "GitHub", url: "", isPublished: true, displayOrder };
}

export function socialLinkToForm(row: SocialLinkRow): SocialLinkValues {
  const platform = (SOCIAL_PLATFORMS as readonly string[]).includes(row.platform)
    ? (row.platform as SocialLinkValues["platform"])
    : "Other";
  return {
    platform,
    url: row.url,
    isPublished: row.is_published,
    displayOrder: row.display_order,
  };
}

export async function listSocialLinks(): Promise<SocialLinkRow[]> {
  const { data, error } = await supabase
    .from("social_links")
    .select("id,platform,url,is_published,display_order")
    .order("display_order", { ascending: true });
  if (error) throw translate(error);
  return (data ?? []) as unknown as SocialLinkRow[];
}

export async function saveSocialLink(id: string | null, values: SocialLinkValues) {
  const payload = {
    platform: values.platform,
    url: values.url,
    is_published: values.isPublished,
    display_order: values.displayOrder,
  };
  const { error } = id
    ? await supabase.from("social_links").update(payload).eq("id", id)
    : await supabase.from("social_links").insert(payload);
  if (error) throw translate(error);
}

/* ------------------------------------------------------------ coding stats */

const optionalCount = z
  .union([z.number().int().min(0).max(1000000), z.null()])
  .default(null);

export const codingStatSchema = z.object({
  platform: z.enum(CODING_PLATFORMS),
  handle: z.string().trim().min(1, "Handle is required").max(80),
  rating: optionalCount,
  rankLabel: z.string().trim().max(80).default(""),
  problemsSolved: optionalCount,
  profileUrl: url.default(""),
  isPublished: z.boolean().default(true),
  displayOrder: z.number().int().min(0).max(9999).default(0),
});
export type CodingStatValues = z.infer<typeof codingStatSchema>;

export type CodingStatRow = {
  id: string;
  platform: string;
  handle: string;
  rating: number | null;
  rank_label: string | null;
  problems_solved: number | null;
  profile_url: string | null;
  is_published: boolean;
  display_order: number;
};

export function emptyCodingStat(displayOrder = 0): CodingStatValues {
  return {
    platform: "LeetCode",
    handle: "",
    rating: null,
    rankLabel: "",
    problemsSolved: null,
    profileUrl: "",
    isPublished: true,
    displayOrder,
  };
}

export function codingStatToForm(row: CodingStatRow): CodingStatValues {
  const platform = (CODING_PLATFORMS as readonly string[]).includes(row.platform)
    ? (row.platform as CodingStatValues["platform"])
    : "Other";
  return {
    platform,
    handle: row.handle,
    rating: row.rating,
    rankLabel: row.rank_label ?? "",
    problemsSolved: row.problems_solved,
    profileUrl: row.profile_url ?? "",
    isPublished: row.is_published,
    displayOrder: row.display_order,
  };
}

export async function listCodingStats(): Promise<CodingStatRow[]> {
  const { data, error } = await supabase
    .from("coding_stats")
    .select("id,platform,handle,rating,rank_label,problems_solved,profile_url,is_published,display_order")
    .order("display_order", { ascending: true });
  if (error) throw translate(error);
  return (data ?? []) as unknown as CodingStatRow[];
}

export async function saveCodingStat(id: string | null, values: CodingStatValues) {
  const payload = {
    platform: values.platform,
    handle: values.handle,
    rating: values.rating,
    rank_label: values.rankLabel || null,
    problems_solved: values.problemsSolved,
    profile_url: values.profileUrl || null,
    is_published: values.isPublished,
    display_order: values.displayOrder,
  };
  const { error } = id
    ? await supabase.from("coding_stats").update(payload).eq("id", id)
    : await supabase.from("coding_stats").insert(payload);
  if (error) throw translate(error);
}

/* ----------------------------------------------------------------- profile */

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  title: z.string().trim().min(1, "Title is required").max(120),
  tagline: z.string().trim().max(200).default(""),
  bio: z.string().trim().max(4000).default(""),
  email: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || /^\S+@\S+\.\S+$/.test(v), { message: "Enter a valid email" })
    .default(""),
  location: z.string().trim().max(120).default(""),
  avatarUrl: z.string().nullable().default(null),
  seoTitle: z.string().trim().max(70).default(""),
  seoDescription: z.string().trim().max(200).default(""),
  seoOgImageUrl: z.string().nullable().default(null),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export type ProfileRow = {
  id: string;
  full_name: string;
  title: string;
  tagline: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  location: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image_url: string | null;
};

export function profileToForm(row: ProfileRow | null): ProfileValues {
  return {
    fullName: row?.full_name ?? "",
    title: row?.title ?? "",
    tagline: row?.tagline ?? "",
    bio: row?.bio ?? "",
    email: row?.email ?? "",
    location: row?.location ?? "",
    avatarUrl: row?.avatar_url ?? null,
    seoTitle: row?.seo_title ?? "",
    seoDescription: row?.seo_description ?? "",
    seoOgImageUrl: row?.seo_og_image_url ?? null,
  };
}

export async function getProfile(): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profile")
    .select(
      "id,full_name,title,tagline,bio,avatar_url,email,location,seo_title,seo_description,seo_og_image_url",
    )
    .limit(1)
    .maybeSingle();
  if (error) throw translate(error);
  return (data as unknown as ProfileRow) ?? null;
}

export async function saveProfile(id: string | null, values: ProfileValues) {
  const payload = {
    full_name: values.fullName,
    title: values.title,
    tagline: values.tagline || null,
    bio: values.bio || null,
    email: values.email || null,
    location: values.location || null,
    avatar_url: values.avatarUrl,
    seo_title: values.seoTitle || null,
    seo_description: values.seoDescription || null,
    seo_og_image_url: values.seoOgImageUrl,
  };
  const { error } = id
    ? await supabase.from("profile").update(payload).eq("id", id)
    : await supabase.from("profile").insert(payload);
  if (error) throw translate(error);
}

/* ------------------------------------------------------------------ resume */

export type ResumeRow = {
  id: string;
  file_url: string;
  version_label: string | null;
  file_size_label: string | null;
  is_active: boolean;
  created_at: string;
};

export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

export function validatePdf(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files can be uploaded.";
  if (file.size > MAX_RESUME_BYTES) return "PDF must be smaller than 10MB.";
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function listResumes(): Promise<ResumeRow[]> {
  const { data, error } = await supabase
    .from("resume_versions")
    .select("id,file_url,version_label,file_size_label,is_active,created_at")
    .order("created_at", { ascending: false });
  if (error) throw translate(error);
  return (data ?? []) as unknown as ResumeRow[];
}

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadResume(file: File, versionLabel: string, makeActive: boolean) {
  const path = `${crypto.randomUUID()}.pdf`;
  const upload = await supabase.storage
    .from("resumes")
    .upload(path, file, { contentType: "application/pdf", cacheControl: "3600", upsert: false });
  if (upload.error) throw new Error(upload.error.message);

  const signed = await supabase.storage.from("resumes").createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data?.signedUrl) {
    throw new Error(signed.error?.message ?? "Could not create a download link.");
  }

  const { data, error } = await supabase
    .from("resume_versions")
    .insert({
      file_url: signed.data.signedUrl,
      version_label: versionLabel || null,
      file_size_label: formatBytes(file.size),
      is_active: false,
    })
    .select("id")
    .single();
  if (error) throw translate(error);

  if (makeActive) await setActiveResume(data.id as string);
}

/** Exactly one resume row may be active at a time. */
export async function setActiveResume(id: string) {
  const clear = await supabase
    .from("resume_versions")
    .update({ is_active: false })
    .neq("id", id);
  if (clear.error) throw translate(clear.error);

  const { error } = await supabase
    .from("resume_versions")
    .update({ is_active: true })
    .eq("id", id);
  if (error) throw translate(error);
}

export async function deleteResume(id: string) {
  const { error } = await supabase.from("resume_versions").delete().eq("id", id);
  if (error) throw translate(error);
}

/* --------------------------------------------------------------- dashboard */

export type DashboardStats = {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  experience: number;
  skills: number;
  socialLinks: number;
  codingStats: number;
  lastUpdated: string | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const count = (table: "projects" | "experience" | "skills" | "social_links" | "coding_stats", published?: boolean) => {
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    if (published !== undefined) query = query.eq("is_published", published);
    return query;
  };

  const [projects, published, experience, skills, socials, coding, latestProject, latestProfile] =
    await Promise.all([
      count("projects"),
      count("projects", true),
      count("experience"),
      count("skills"),
      count("social_links"),
      count("coding_stats"),
      supabase.from("projects").select("created_at").order("created_at", { ascending: false }).limit(1),
      supabase.from("profile").select("updated_at").order("updated_at", { ascending: false }).limit(1),
    ]);

  const errors = [projects, published, experience, skills, socials, coding, latestProject, latestProfile]
    .map((r) => r.error)
    .filter(Boolean);
  if (errors[0]) throw translate(errors[0]);

  const timestamps = [
    latestProject.data?.[0]?.created_at,
    latestProfile.data?.[0]?.updated_at,
  ].filter(Boolean) as string[];

  const total = projects.count ?? 0;
  const pub = published.count ?? 0;

  return {
    totalProjects: total,
    publishedProjects: pub,
    draftProjects: total - pub,
    experience: experience.count ?? 0,
    skills: skills.count ?? 0,
    socialLinks: socials.count ?? 0,
    codingStats: coding.count ?? 0,
    lastUpdated: timestamps.sort().at(-1) ?? null,
  };
}
