import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, ExternalLink, Github } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ProjectCard,
  ProjectCover,
  StackTags,
} from "@/components/projects/project-card";
import { getProjectDetail } from "@/lib/content.functions";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const { project, related } = await getProjectDetail({
      data: { slug: params.slug },
    });
    if (!project) throw notFound();
    return { project, related };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.title} — Priyam Singh` },
          { name: "description", content: loaderData.project.impact },
          {
            property: "og:title",
            content: `${loaderData.project.title} — Priyam Singh`,
          },
          { property: "og:description", content: loaderData.project.impact },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary" },
        ]
      : [
          { title: "Project not found — Priyam Singh" },
          { name: "robots", content: "noindex" },
        ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-muted-foreground">
      Couldn't load this project: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        <p className="label-mono">404</p>
        <h1 className="mt-3 text-h2">Project not found</h1>
        <p className="mt-3 text-muted-foreground">
          This project doesn't exist or isn't published.
        </p>
        <Link
          to="/projects"
          className="mt-6 inline-block text-small text-accent underline-offset-4 hover:underline"
        >
          ← All projects
        </Link>
      </main>
      <Footer />
    </div>
  ),
  component: ProjectDetailPage,
});

function MetaLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof ExternalLink;
  label: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-4 text-small font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
    >
      <Icon className="size-3.5" />
      {label}
    </a>
  );
}

function NarrativeBlock({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  if (!body) return null;
  return (
    <section>
      <h3 className="flex items-baseline gap-3 text-h4">
        <span className="label-mono text-[0.6rem] text-accent">
          {heading.slice(0, 2).toUpperCase()}
        </span>
        {heading}
      </h3>
      <p className="mt-4 leading-[1.85] text-muted-foreground">{body}</p>
    </section>
  );
}

function ProjectDetailPage() {
  const { project, related } = Route.useLoaderData();
  const gallery =
    project.galleryUrls.length > 0
      ? project.galleryUrls
      : ["dashboard", "api_view", "deploy_flow"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-32">
        {/* Hero */}
        <nav className="label-mono text-[0.65rem]" aria-label="Breadcrumb">
          <Link to="/projects" className="transition-colors hover:text-accent">
            Projects
          </Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-foreground">{project.slug}</span>
        </nav>
        <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="text-h1">{project.title}</h1>
            <p className="mt-4 max-w-lg text-muted-foreground">
              {project.impact}
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <dt className="label-mono text-[0.6rem]">Timeframe</dt>
                <dd className="mt-1 text-small font-medium text-foreground">
                  {project.timeframe || "—"}
                </dd>
              </div>
              <div>
                <dt className="label-mono text-[0.6rem]">Role</dt>
                <dd className="mt-1 text-small font-medium text-foreground">
                  {project.role || "—"}
                </dd>
              </div>
              <div>
                <dt className="label-mono text-[0.6rem]">Category</dt>
                <dd className="mt-1 text-small font-medium text-foreground">
                  {project.category}
                </dd>
              </div>
            </dl>
          </div>
          {project.coverImageUrl ? (
            <img
              src={project.coverImageUrl}
              alt={`${project.title} cover`}
              loading="lazy"
              className="aspect-[16/10] w-full rounded-xl border border-border object-cover"
            />
          ) : (
            <ProjectCover
              title={project.title}
              className="aspect-[16/10] rounded-xl border border-border"
            />
          )}
        </div>

        {/* Meta row */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
          <StackTags tags={project.stack} />
          <div className="flex flex-wrap gap-2">
            {project.liveUrl && (
              <MetaLink href={project.liveUrl} icon={ExternalLink} label="Live Demo" />
            )}
            {project.repoUrl && (
              <MetaLink href={project.repoUrl} icon={Github} label="GitHub Repo" />
            )}
            {project.caseStudyUrl && (
              <MetaLink href={project.caseStudyUrl} icon={BookOpen} label="Case Study" />
            )}
          </div>
        </div>

        {/* Narrative */}
        <div className="mx-auto mt-16 max-w-2xl space-y-14">
          <NarrativeBlock heading="Problem" body={project.narrative.problem} />
          <NarrativeBlock heading="Approach" body={project.narrative.approach} />
          <NarrativeBlock
            heading="Architecture"
            body={project.narrative.architecture}
          />
          <NarrativeBlock heading="Outcome" body={project.narrative.outcome} />
        </div>

        {/* Gallery */}
        <section className="mt-20">
          <h3 className="label-mono">Gallery</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {gallery.map((shot) =>
              shot.startsWith("http") ? (
                <img
                  key={shot}
                  src={shot}
                  alt={`${project.title} screenshot`}
                  loading="lazy"
                  className="aspect-video w-full rounded-lg border border-border object-cover"
                />
              ) : (
                <ProjectCover
                  key={shot}
                  title={`${project.slug}_${shot}`}
                  className="aspect-video rounded-lg border border-border"
                />
              ),
            )}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-border pt-12">
            <h3 className="text-h4">Related Projects</h3>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={p} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
