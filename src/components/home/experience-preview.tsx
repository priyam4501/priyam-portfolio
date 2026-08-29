import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Reveal, RevealItem } from "@/components/motion/reveal";
import { Timeline } from "@/components/experience/timeline";
import type { Role } from "@/lib/content";

export function ExperiencePreview({ roles }: { roles: Role[] }) {
  return (
    <Reveal as="section" id="experience" className="mx-auto max-w-5xl scroll-mt-16 px-6 py-24">
      <RevealItem as="p" className="label-mono">
        04 / Career
      </RevealItem>
      <RevealItem as="h2" className="mt-3 text-h2">
        Experience
      </RevealItem>

      <RevealItem className="mt-12" distance={16}>
        <Timeline roles={roles} />
      </RevealItem>

      <RevealItem>
        <Link
          to="/experience"
          className="group inline-flex items-center gap-2 text-small font-medium text-accent transition-colors hover:text-foreground"
        >
          View Full Experience
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </RevealItem>
    </Reveal>
  );
}
