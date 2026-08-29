import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Braces,
  Cloud,
  Coffee,
  Container,
  Database,
  GitBranch,
  Leaf,
  Layers,
  Server,
  TerminalSquare,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { Reveal, RevealItem, usePress } from "@/components/motion/reveal";
import { EASE, fadeUp, staggerContainer } from "@/lib/motion";
import { groupSkills, type Skill } from "@/lib/content";

const ICONS: Record<string, LucideIcon> = {
  coffee: Coffee,
  leaf: Leaf,
  layers: Layers,
  workflow: Workflow,
  server: Server,
  braces: Braces,
  container: Container,
  cloud: Cloud,
  terminal: TerminalSquare,
  database: Database,
  git: GitBranch,
};

function ProficiencyDots({ level }: { level: number }) {
  return (
    <span
      className="flex items-center gap-1"
      aria-label={`Proficiency ${level} of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`size-1 rounded-full ${i < level ? "bg-accent" : "bg-border"}`}
        />
      ))}
    </span>
  );
}

export function Skills({ skills }: { skills: Skill[] }) {
  const { categories, byCategory } = groupSkills(skills);
  const [active, setActive] = useState<string | null>(null);
  const current = active && byCategory[active] ? active : categories[0];
  const reduced = useReducedMotion() ?? false;
  const press = usePress();

  if (categories.length === 0) return null;

  return (
    <Reveal as="section" id="skills" className="mx-auto max-w-5xl scroll-mt-16 px-6 py-24">
      <RevealItem as="p" className="label-mono">02 / Skills</RevealItem>
      <RevealItem as="h2" className="mt-3 text-h2">Skills</RevealItem>

      <RevealItem
        role="tablist"
        aria-label="Skill categories"
        className="mt-8 flex flex-wrap gap-2"
      >
        {categories.map((category) => (
          <motion.button
            {...press}
            key={category}
            role="tab"
            aria-selected={current === category}
            onClick={() => setActive(category)}
            className={`h-9 rounded-md border px-4 text-small font-medium transition-colors ${
              current === category
                ? "border-accent/60 bg-surface text-accent"
                : "border-border bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {category}
          </motion.button>
        ))}
      </RevealItem>

      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={current}
          role="tabpanel"
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          variants={staggerContainer(0.04)}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE } }}
        >
          {(byCategory[current!] ?? []).map((skill) => {
          const Icon = ICONS[skill.iconKey ?? ""] ?? Layers;
          return (
            <motion.li
              key={skill.name}
              variants={fadeUp(10, reduced)}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface/60 px-4 py-3"
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4 text-accent" strokeWidth={1.75} />
                <span className="text-small font-medium text-foreground">
                  {skill.name}
                </span>
              </span>
              <ProficiencyDots level={skill.level} />
            </motion.li>
          );
        })}
        </motion.ul>
      </AnimatePresence>
    </Reveal>
  );
}
