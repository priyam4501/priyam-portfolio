/**
 * Browser-safe view types + row mappers for the portfolio content tables.
 * Server functions in `content.functions.ts` return these DTOs.
 */

export type Profile = {
  fullName: string;
  title: string;
  tagline: string;
  bio: string;
  avatarUrl: string | null;
  email: string | null;
  location: string | null;
};

export type Project = {
  slug: string;
  title: string;
  impact: string;
  category: string;
  stack: string[];
  coverImageUrl: string | null;
  galleryUrls: string[];
  liveUrl?: string;
  repoUrl?: string;
  caseStudyUrl?: string;
  timeframe: string;
  role: string;
  featured: boolean;
  narrative: {
    problem: string;
    approach: string;
    architecture: string;
    outcome: string;
  };
};

export type Role = {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  highlights: string[];
  stack: string[];
};

export type Skill = {
  name: string;
  category: string;
  level: number;
  iconKey: string | null;
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type Resume = {
  fileUrl: string;
  versionLabel: string | null;
  fileSizeLabel: string | null;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2024-03-01" -> "Mar 2024" (date-only, no timezone shifting). */
export function formatMonthYear(value: string | null): string | null {
  if (!value) return null;
  const [year, month] = value.split("-");
  const index = Number(month) - 1;
  if (!year || Number.isNaN(index) || !MONTHS[index]) return value;
  return `${MONTHS[index]} ${year}`;
}

type NarrativeShape = Partial<Project["narrative"]>;

export function mapProject(row: any): Project {
  const narrative = (row.narrative ?? {}) as NarrativeShape;
  return {
    slug: row.slug,
    title: row.title,
    impact: row.summary ?? "",
    category: row.category ?? "",
    stack: row.stack_tags ?? [],
    coverImageUrl: row.cover_image_url ?? null,
    galleryUrls: row.gallery_urls ?? [],
    liveUrl: row.live_url ?? undefined,
    repoUrl: row.repo_url ?? undefined,
    caseStudyUrl: row.case_study_url ?? undefined,
    timeframe: row.timeframe ?? "",
    role: row.role ?? "",
    featured: Boolean(row.is_featured),
    narrative: {
      problem: narrative.problem ?? "",
      approach: narrative.approach ?? "",
      architecture: narrative.architecture ?? "",
      outcome: narrative.outcome ?? "",
    },
  };
}

export function mapRole(row: any): Role {
  return {
    id: row.id,
    company: row.company,
    title: row.role,
    location: row.location ?? "",
    startDate: formatMonthYear(row.start_date) ?? "",
    endDate: formatMonthYear(row.end_date),
    highlights: row.description ?? [],
    stack: row.stack_tags ?? [],
  };
}

export function mapSkill(row: any): Skill {
  return {
    name: row.name,
    category: row.category,
    level: Math.min(5, Math.max(1, Number(row.proficiency) || 3)),
    iconKey: row.icon_key ?? null,
  };
}

export function groupSkills(skills: Skill[]): {
  categories: string[];
  byCategory: Record<string, Skill[]>;
} {
  const byCategory: Record<string, Skill[]> = {};
  for (const skill of skills) {
    (byCategory[skill.category] ??= []).push(skill);
  }
  return { categories: Object.keys(byCategory), byCategory };
}

export function relatedProjects(
  all: Project[],
  slug: string,
  count = 2,
): Project[] {
  const current = all.find((p) => p.slug === slug);
  return all
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const sharedA = a.stack.filter((t) => current?.stack.includes(t)).length;
      const sharedB = b.stack.filter((t) => current?.stack.includes(t)).length;
      return sharedB - sharedA;
    })
    .slice(0, count);
}

export function stackTagsOf(projects: Project[]): string[] {
  return Array.from(new Set(projects.flatMap((p) => p.stack))).sort();
}

export function categoriesOf(projects: Project[]): string[] {
  return Array.from(new Set(projects.map((p) => p.category))).sort();
}
