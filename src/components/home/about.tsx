import { Reveal, RevealItem } from "@/components/motion/reveal";
import type { Profile, Project, Role, Skill } from "@/lib/content";

export function About({
  profile,
  roles,
  projectCount,
  skills,
}: {
  profile: Profile | null;
  roles: Role[];
  projectCount: number;
  skills: Skill[];
}) {
  const earliest = roles[roles.length - 1]?.startDate;
  const startYear = earliest ? Number(earliest.split(" ")[1]) : null;
  const years =
    startYear && !Number.isNaN(startYear)
      ? `${Math.max(1, new Date().getFullYear() - startYear)}+`
      : "—";

  const topSkills = skills
    .filter((s) => s.level >= 4)
    .slice(0, 3)
    .map((s) => s.name)
    .join(" · ");

  const stats = [
    { value: years, label: "Years experience" },
    { value: `${projectCount}+`, label: "Projects shipped" },
    { value: topSkills || "Full-stack", label: "Core stack" },
    { value: profile?.location ?? "Remote", label: "Based in" },
  ];

  return (
    <Reveal as="section" id="about" className="mx-auto max-w-5xl scroll-mt-16 px-6 py-24">
      <RevealItem as="p" className="label-mono">
        01 / About
      </RevealItem>
      <RevealItem as="h2" className="mt-3 text-h2">
        About
      </RevealItem>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <RevealItem as="p" className="max-w-xl text-muted-foreground">
          {profile?.bio}
        </RevealItem>
        <ul className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <RevealItem
              as="li"
              key={stat.label}
              className="rounded-lg border border-border bg-surface/60 p-4 backdrop-blur-sm"
            >
              <p className="font-display text-h5 font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 label-mono text-[0.65rem]">{stat.label}</p>
            </RevealItem>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

export type { Project };
