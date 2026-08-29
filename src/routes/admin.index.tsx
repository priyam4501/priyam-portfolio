import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { AdminPageHeader } from "@/components/admin/form-kit";
import { getDashboardStats } from "@/lib/admin-content";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Priyam Singh" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private content dashboard for the portfolio." },
    ],
  }),
});

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 p-5">
      <p className="label-mono text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

const SHORTCUTS = [
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/experience", label: "Experience" },
  { to: "/admin/skills", label: "Skills" },
  { to: "/admin/social-links", label: "Social Links" },
  { to: "/admin/coding-stats", label: "Coding Stats" },
  { to: "/admin/profile", label: "Profile" },
  { to: "/admin/resume", label: "Resume" },
] as const;

function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboardStats,
  });

  const dash = isLoading ? "…" : "—";
  const lastUpdated = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : dash;

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="Live counts across your content tables." />

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          {(error as Error).message}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total projects"
          value={data ? String(data.totalProjects) : dash}
          hint="All rows in the projects table"
        />
        <StatCard
          label="Published / Draft"
          value={data ? `${data.publishedProjects} / ${data.draftProjects}` : dash}
          hint="Only published projects appear publicly"
        />
        <StatCard label="Last updated" value={lastUpdated} hint="Latest change across content" />
        <StatCard
          label="Experience"
          value={data ? String(data.experience) : dash}
          hint="Roles on the timeline"
        />
        <StatCard label="Skills" value={data ? String(data.skills) : dash} hint="Across all categories" />
        <StatCard
          label="Links & stats"
          value={data ? `${data.socialLinks} / ${data.codingStats}` : dash}
          hint="Social links / coding stats"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.to}
            to={shortcut.to}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:border-accent hover:text-accent"
          >
            {shortcut.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
