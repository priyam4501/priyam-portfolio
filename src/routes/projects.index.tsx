import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProjectCard } from "@/components/projects/project-card";
import { categoriesOf, stackTagsOf, type Project } from "@/lib/content";
import { getProjectsData } from "@/lib/content.functions";

export const Route = createFileRoute("/projects/")({
  loader: () => getProjectsData(),
  head: () => ({
    meta: [
      { title: "Projects — Priyam Singh" },
      {
        name: "description",
        content:
          "All projects by Priyam Singh: full-stack applications, backend APIs, and developer tools built with Java, Spring Boot, and React.",
      },
      { property: "og:title", content: "Projects — Priyam Singh" },
      {
        property: "og:description",
        content:
          "All projects by Priyam Singh: full-stack applications, backend APIs, and developer tools built with Java, Spring Boot, and React.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-muted-foreground">
      Couldn't load projects: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-muted-foreground">No projects published yet.</div>
  ),
  component: ProjectsPage,
});

function FilterBar({ projects }: { projects: Project[] }) {
  // Visual only — filtering is wired up later.
  return (
    <div className="mt-8 flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="label-mono mr-1">Category</span>
        {["All", ...categoriesOf(projects)].map((c, i) => (
          <button
            key={c}
            className={`h-8 rounded-md border px-3 text-[0.72rem] font-medium transition-colors ${
              i === 0
                ? "border-accent/60 bg-surface text-accent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="label-mono mr-1">Stack</span>
        <select
          aria-label="Filter by stack tag"
          className="h-8 rounded-md border border-border bg-surface px-2 text-[0.72rem] text-muted-foreground"
          defaultValue=""
        >
          <option value="">All technologies</option>
          {stackTagsOf(projects).map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Pagination() {
  // Visual only.
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-2"
    >
      <button
        disabled
        className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>
      {[1, 2, 3].map((page) => (
        <button
          key={page}
          aria-current={page === 1 ? "page" : undefined}
          className={`size-8 rounded-md border text-small font-medium transition-colors ${
            page === 1
              ? "border-accent/60 bg-surface text-accent"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

function ProjectsPage() {
  const { projects } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <p className="label-mono">Index / Work</p>
        <h1 className="mt-3 text-h2">All Projects</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Full-stack applications, backend services, and developer tools —
          each with a write-up covering the problem, the approach, and what
          happened after launch.
        </p>
        <FilterBar projects={projects} />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} variant="compact" />
          ))}
        </div>
        <Pagination />
        <p className="mt-10 text-center">
          <Link
            to="/"
            className="text-small text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            ← Back to home
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
