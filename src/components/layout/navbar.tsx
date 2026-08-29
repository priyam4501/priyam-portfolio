import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { EASE } from "@/lib/motion";

const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("home");
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const line = window.innerHeight * 0.4;
      let current: string = NAV_LINKS[0].id;
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.id);
        if (el && el.getBoundingClientRect().top <= line) current = link.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={false}
      animate={{
        backgroundColor: scrolled ? "rgba(8, 10, 13, 0.8)" : "rgba(8, 10, 13, 0)",
        borderBottomColor: scrolled ? "var(--color-border)" : "rgba(0, 0, 0, 0)",
        backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
      }}
      transition={{ duration: 0.3, ease: EASE }}
      className="fixed inset-x-0 top-0 z-50 border-b"
    >
      <motion.nav
        initial={false}
        animate={{ height: scrolled ? 56 : 64 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mx-auto flex max-w-5xl items-center justify-between px-6"
      >
        <a
          href="#home"
          className="font-display text-h6 font-semibold tracking-tight text-foreground"
        >
          Priyam<span className="text-accent">.</span>Singh
        </a>
        <ul className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                aria-current={active === link.id ? "true" : undefined}
                className={`relative block px-3 py-2 text-small transition-colors ${
                  active === link.id
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {active === link.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-px bg-accent"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.35, ease: EASE }
                    }
                  />
                )}
              </a>
            </li>
          ))}
        </ul>
      </motion.nav>
    </motion.header>
  );
}
