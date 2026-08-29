import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Github, Globe, Linkedin, Mail } from "lucide-react";

import { Reveal, RevealItem, usePress } from "@/components/motion/reveal";
import type { SocialLink } from "@/lib/content";

export function socialIcon(platform: string) {
  const key = platform.toLowerCase();
  if (key.includes("mail")) return Mail;
  if (key.includes("linkedin")) return Linkedin;
  if (key.includes("github")) return Github;
  return Globe;
}

const MotionLink = motion.create(Link);

export function ContactCta({ socials }: { socials: SocialLink[] }) {
  const press = usePress();

  return (
    <Reveal as="section" id="contact" className="mx-auto max-w-5xl scroll-mt-16 px-6 py-24">
      <div className="rounded-xl border border-border bg-card px-6 py-14 text-center sm:px-12">
        <RevealItem as="p" className="label-mono">
          05 / Say hello
        </RevealItem>
        <RevealItem as="h2" className="mt-3 text-h2">
          Let's build something reliable
        </RevealItem>
        <RevealItem
          as="p"
          className="mx-auto mt-4 max-w-xl text-small leading-relaxed text-muted-foreground"
        >
          I'm currently open to full-time Java full-stack roles. If you have a
          position or project in mind, I'd love to hear about it.
        </RevealItem>

        <RevealItem className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <MotionLink
            {...press}
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-small font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get in Touch
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </MotionLink>
          {socials.map(({ platform, url }) => {
            const Icon = socialIcon(platform);
            const external = !url.startsWith("mailto:");
            return (
              <motion.a
                {...press}
                key={platform}
                href={url}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                aria-label={platform}
                className="flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Icon className="size-4" />
              </motion.a>
            );
          })}
        </RevealItem>
      </div>
    </Reveal>
  );
}
