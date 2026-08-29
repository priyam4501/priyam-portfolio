import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { fadeUp, staggerContainer, transition, viewportOnce } from "@/lib/motion";

/**
 * Staggered section entry: children fade in with a small upward slide the
 * first time the group scrolls into view. Reduced motion → opacity only.
 */
export function Reveal({
  children,
  className,
  id,
  as = "div",
  stagger = 0.07,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "div" | "section" | "ul" | "ol" | "header";
  stagger?: number;
  delay?: number;
}) {
  const Component = motion[as];
  return (
    <Component
      id={id}
      className={className}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </Component>
  );
}

/** A single staggered child inside <Reveal>. */
export function RevealItem({
  children,
  className,
  as = "div",
  distance = 12,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "p" | "h2" | "article" | "span";
  distance?: number;
  role?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];
  return (
    <Component {...rest} className={className} variants={fadeUp(distance, reduced ?? false)}>
      {children}
    </Component>
  );
}

/** Small press feedback for CTAs; disabled under reduced motion. */
export function usePress() {
  const reduced = useReducedMotion();
  return reduced ? {} : { whileTap: { scale: 0.97 }, transition };
}
