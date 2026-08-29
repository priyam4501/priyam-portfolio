import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { ExternalLink, Github } from "lucide-react";

import { transition, useHoverCapable } from "@/lib/motion";

import type { Project } from "@/lib/content";

/** Placeholder cover until real screenshots exist. */
export function ProjectCover({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={`visual-shell relative overflow-hidden border-b border-border ${className}`}
      aria-hidden="true"
    >
      <div className="visual-grid absolute inset-0" />
      <span className="label-mono absolute bottom-3 left-4 text-[0.6rem]">
        {title.toLowerCase().replace(/\s+/g, "_")} // cover
      </span>
    </div>
  );
}

export function StackTags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[0.68rem] text-muted-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

export function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-2">
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
        >
          <ExternalLink className="size-3" />
          Live
        </a>
      )}
      {project.repoUrl && (
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Github className="size-3" />
          Code
        </a>
      )}
    </div>
  );
}

export function ProjectCard({
  project,
  variant = "featured",
}: {
  project: Project;
  variant?: "featured" | "compact";
}) {
  const featured = variant === "featured";
  const hoverable = useHoverCapable();
  const reduced = useReducedMotion();
  const lift =
    hoverable && !reduced
      ? {
          whileHover: {
            scale: 1.02,
            boxShadow: "0 18px 40px -18px rgba(0, 0, 0, 0.75)",
          },
          transition,
        }
      : {};

  return (
    <motion.article
      {...lift}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface/60 transition-colors hover:border-accent/40"
    >
      <Link to="/projects/$slug" params={{ slug: project.slug }}>
        <ProjectCover
          title={project.title}
          className={featured ? "aspect-[16/9]" : "aspect-[16/8]"}
        />
      </Link>
      <div className={`flex flex-1 flex-col ${featured ? "p-6" : "p-4"}`}>
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          className={`font-display font-semibold text-foreground transition-colors group-hover:text-accent ${
            featured ? "text-h4" : "text-h6"
          }`}
        >
          {project.title}
        </Link>
        <p className="mt-2 text-small text-muted-foreground">
          {project.impact}
        </p>
        <div className={featured ? "mt-4" : "mt-3"}>
          <StackTags tags={project.stack.slice(0, 4)} />
        </div>
        <div className={`mt-auto ${featured ? "pt-5" : "pt-4"}`}>
          <ProjectLinks project={project} />
        </div>
      </div>
    </motion.article>
  );
}
