import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, Download } from "lucide-react";

import { EASE, transition } from "@/lib/motion";
import { usePress } from "@/components/motion/reveal";
import type { Profile, Resume } from "@/lib/content";
import { HeroVisual } from "./hero-visual";

/** Word-by-word reveal, initial page load only (~700ms total). */
function HeadlineWords({ text, reduced }: { text: string; reduced: boolean }) {
  const words = text.split(" ");
  return (
    <span className="inline-block">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: reduced ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: EASE,
            delay: reduced ? 0 : index * (0.35 / Math.max(words.length, 1)),
          }}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero({ profile, resume }: { profile: Profile | null; resume: Resume | null }) {
  const reduced = useReducedMotion() ?? false;
  const press = usePress();
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE, delay: reduced ? 0 : delay },
  });

  return (
    <section
      id="home"
      className="relative mx-auto flex min-h-screen max-w-5xl scroll-mt-16 flex-col justify-center px-6 pb-20 pt-24"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p
            {...fade(0)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 label-mono"
          >
            <span className="size-1.5 rounded-full bg-accent" />
            {profile?.title ?? "Java Full-Stack Developer"}
          </motion.p>
          <h1 className="mt-6 text-h1">
            <HeadlineWords text={profile?.fullName ?? "Portfolio"} reduced={reduced} />
            {profile?.tagline && (
              <motion.span
                {...fade(0.45)}
                className="mt-3 block text-h3 font-medium text-muted-foreground"
              >
                {profile.tagline}
              </motion.span>
            )}
          </h1>
          {profile?.bio && (
            <motion.p {...fade(0.55)} className="mt-6 max-w-md text-muted-foreground">
              {profile.bio.split(". ").slice(0, 2).join(". ")}
            </motion.p>
          )}
          <motion.div {...fade(0.65)} className="mt-8 flex flex-wrap items-center gap-4">
            <motion.a
              {...press}
              href="#projects"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-small font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              View Projects
              <ArrowRight className="size-4" />
            </motion.a>
            {resume && (
              <motion.a
                {...press}
                href={resume.fileUrl}
                download
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-surface px-5 text-small font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Download className="size-4" />
                Download Resume
              </motion.a>
            )}
            <motion.a
              {...press}
              href="#contact"
              className="text-small font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              Contact
            </motion.a>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduced ? 0 : 0.3 }}
          className="relative"
        >
          <HeroVisual />
          {profile?.avatarUrl && (
            <motion.div
              {...fade(0.75)}
              className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-full border border-border bg-surface/90 py-1.5 pl-1.5 pr-4 shadow-lg backdrop-blur-sm"
            >
              <img
                src={profile.avatarUrl}
                alt={profile.fullName ?? "Profile photo"}
                width={40}
                height={40}
                className="size-10 rounded-full border border-accent/40 object-cover"
                loading="eager"
              />
              <span className="text-small font-medium text-foreground">
                {profile.fullName ?? "Hi, I'm here"}
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        {...fade(0.8)}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="label-mono text-[0.6rem]">scroll</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
