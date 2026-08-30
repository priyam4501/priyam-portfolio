import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";

import { getSocialLinks } from "@/lib/content.functions";
import { socialIcon } from "@/components/home/contact-cta";
import { usePress } from "@/components/motion/reveal";
import { fadeUp, viewportOnce } from "@/lib/motion";

/**
 * Footer self-fetches real social links so it works consistently across
 * every route (home, projects, experience, contact) without each page's
 * loader needing to carry socials just for this. Falls back to nothing
 * rendered (not a placeholder) if none are published yet.
 */
export function Footer() {
  const press = usePress();
  const { data } = useQuery({
    queryKey: ["footer-social-links"],
    queryFn: () => getSocialLinks(),
    staleTime: 5 * 60 * 1000,
  });
  const socials = data?.socials ?? [];

  return (
    <footer className="border-t border-border">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        variants={fadeUp(10, false)}
        className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10"
      >
        {socials.length > 0 && (
          <ul className="flex items-center gap-5">
            {socials.map(({ platform, url }) => {
              const Icon = socialIcon(platform);
              const external = !url.startsWith("mailto:");
              return (
                <li key={platform}>
                  <motion.a
                    {...press}
                    href={url}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    aria-label={platform}
                    className="text-muted-foreground transition-colors hover:text-accent"
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </motion.a>
                </li>
              );
            })}
          </ul>
        )}
        <p className="label-mono normal-case tracking-normal">
          © {new Date().getFullYear()} Priyam Singh — Java Full-Stack Developer
        </p>
      </motion.div>
    </footer>
  );
}
