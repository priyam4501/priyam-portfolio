import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Reveal, RevealItem } from "@/components/motion/reveal";
import type { Project } from "@/lib/content";
import { ProjectCard } from "@/components/projects/project-card";

export function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <Reveal as="section" id="projects" className="mx-auto max-w-5xl scroll-mt-16 px-6 py-24">
      <RevealItem as="p" className="label-mono">
        03 / Work
      </RevealItem>
      <RevealItem className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-h2">Featured Projects</h2>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-small font-medium text-muted-foreground transition-colors hover:text-accent"
        >
          View All Projects
          <ArrowRight className="size-3.5" />
        </Link>
      </RevealItem>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <RevealItem key={project.slug} className="h-full" distance={16}>
            <ProjectCard project={project} />
          </RevealItem>
        ))}
      </div>
    </Reveal>
  );
}
