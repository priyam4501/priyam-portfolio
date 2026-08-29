/**
 * Admin-side projects data access.
 *
 * All mutations run through the authenticated browser client, so Postgres RLS
 * (admin allowlist policies) is the authorization boundary. No service-role
 * key is ever used here.
 */
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

export const PROJECT_CATEGORIES = [
  { value: "Full-Stack App", label: "Full-Stack App" },
  { value: "Backend API", label: "Backend API" },
  { value: "Tool", label: "Tool" },
  { value: "Other", label: "Other" },
] as const;

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v), {
    message: "Enter a valid URL starting with http:// or https://",
  });

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only"),
  summary: z.string().trim().max(400).default(""),
  narrative: z.string().max(20000).default(""),
  stackTags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  category: z.string().trim().min(1, "Category is required"),
  timeframe: z.string().trim().max(80).default(""),
  role: z.string().trim().max(120).default(""),
  liveUrl: optionalUrl.default(""),
  repoUrl: optionalUrl.default(""),
  caseStudyUrl: optionalUrl.default(""),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  coverImageUrl: z.string().nullable().default(null),
  galleryUrls: z.array(z.string()).default([]),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export type AdminProjectRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  narrative: any;
  category: string;
  timeframe: string | null;
  role: string | null;
  stack_tags: string[];
  live_url: string | null;
  repo_url: string | null;
  case_study_url: string | null;
  cover_image_url: string | null;
  gallery_urls: string[];
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
};

const ADMIN_COLUMNS =
  "id,slug,title,summary,narrative,category,timeframe,role,stack_tags,live_url,repo_url,case_study_url,cover_image_url,gallery_urls,is_published,is_featured,display_order";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

/** Narrative is stored as jsonb; the admin edits it as one markdown body. */
export function narrativeToText(narrative: any): string {
  if (!narrative) return "";
  if (typeof narrative === "string") return narrative;
  if (typeof narrative === "object") {
    if (typeof narrative.body === "string") return narrative.body;
    const sections = ["problem", "approach", "architecture", "outcome"] as const;
    const parts = sections
      .filter((key) => typeof narrative[key] === "string" && narrative[key])
      .map((key) => `## ${key[0]!.toUpperCase()}${key.slice(1)}\n\n${narrative[key]}`);
    if (parts.length) return parts.join("\n\n");
  }
  return "";
}

/** Splits the markdown body back into the narrative sections the site renders. */
export function textToNarrative(text: string): Record<string, string> {
  const out: Record<string, string> = { body: text };
  const known = ["problem", "approach", "architecture", "outcome"];
  const blocks = text.split(/^##\s+/m).filter(Boolean);
  for (const block of blocks) {
    const [heading, ...rest] = block.split("\n");
    const key = (heading ?? "").trim().toLowerCase();
    if (known.includes(key)) out[key] = rest.join("\n").trim();
  }
  return out;
}

export function rowToForm(row: AdminProjectRow): ProjectFormValues {
  return {
    title: row.title,
    slug: row.slug,
    summary: row.summary ?? "",
    narrative: narrativeToText(row.narrative),
    stackTags: row.stack_tags ?? [],
    category: row.category ?? "Other",
    timeframe: row.timeframe ?? "",
    role: row.role ?? "",
    liveUrl: row.live_url ?? "",
    repoUrl: row.repo_url ?? "",
    caseStudyUrl: row.case_study_url ?? "",
    isPublished: row.is_published,
    isFeatured: row.is_featured,
    displayOrder: row.display_order,
    coverImageUrl: row.cover_image_url,
    galleryUrls: row.gallery_urls ?? [],
  };
}

export function emptyForm(displayOrder = 0): ProjectFormValues {
  return {
    title: "",
    slug: "",
    summary: "",
    narrative: "",
    stackTags: [],
    category: "Full-Stack App",
    timeframe: "",
    role: "",
    liveUrl: "",
    repoUrl: "",
    caseStudyUrl: "",
    isPublished: false,
    isFeatured: false,
    displayOrder,
    coverImageUrl: null,
    galleryUrls: [],
  };
}

function toRow(values: ProjectFormValues) {
  return {
    title: values.title,
    slug: values.slug,
    summary: values.summary,
    narrative: textToNarrative(values.narrative),
    stack_tags: values.stackTags,
    category: values.category,
    timeframe: values.timeframe || null,
    role: values.role || null,
    live_url: values.liveUrl || null,
    repo_url: values.repoUrl || null,
    case_study_url: values.caseStudyUrl || null,
    is_published: values.isPublished,
    is_featured: values.isFeatured,
    display_order: values.displayOrder,
    cover_image_url: values.coverImageUrl,
    gallery_urls: values.galleryUrls,
  };
}

export class DuplicateSlugError extends Error {
  constructor() {
    super("That slug is already used by another project.");
  }
}

function translate(error: { code?: string; message: string }): Error {
  if (error.code === "23505") return new DuplicateSlugError();
  return new Error(error.message);
}

export async function listAdminProjects(): Promise<AdminProjectRow[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(ADMIN_COLUMNS)
    .order("display_order", { ascending: true })
    .order("title", { ascending: true });
  if (error) throw translate(error);
  return (data ?? []) as unknown as AdminProjectRow[];
}

export async function getAdminProject(id: string): Promise<AdminProjectRow | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(ADMIN_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw translate(error);
  return (data as unknown as AdminProjectRow) ?? null;
}

export async function createProject(values: ProjectFormValues) {
  const { data, error } = await supabase
    .from("projects")
    .insert(toRow(values))
    .select("id")
    .single();
  if (error) throw translate(error);
  return data.id as string;
}

export async function updateProject(id: string, values: ProjectFormValues) {
  const { error } = await supabase.from("projects").update(toRow(values)).eq("id", id);
  if (error) throw translate(error);
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw translate(error);
}

export async function setProjectFlag(
  id: string,
  field: "is_published" | "is_featured",
  value: boolean,
) {
  const { error } = await supabase
    .from("projects")
    .update(
      field === "is_published" ? { is_published: value } : { is_featured: value },
    )
    .eq("id", id);
  if (error) throw translate(error);
}

export async function setDisplayOrder(rows: { id: string; display_order: number }[]) {
  for (const row of rows) {
    const { error } = await supabase
      .from("projects")
      .update({ display_order: row.display_order })
      .eq("id", row.id);
    if (error) throw translate(error);
  }
}

export function validateImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name}: only image files are allowed.`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: must be smaller than 5MB.`;
  return null;
}

/**
 * Uploads to the private "project-images" bucket and returns a long-lived
 * signed URL that public pages can render directly.
 */
export async function uploadProjectImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("project-images")
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);

  const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
  const signed = await supabase.storage
    .from("project-images")
    .createSignedUrl(path, TEN_YEARS);
  if (signed.error || !signed.data?.signedUrl) {
    throw new Error(signed.error?.message ?? "Could not create image URL.");
  }
  return signed.data.signedUrl;
}
