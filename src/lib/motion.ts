import { useEffect, useState } from "react";
import type { Transition, Variants } from "motion/react";

/** One easing curve for the entire site. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const transition: Transition = { duration: 0.5, ease: EASE };

/** Container that staggers its direct motion children. */
export function staggerContainer(stagger = 0.07, delay = 0): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
}

/**
 * Fade + upward slide. With reduced motion the slide is dropped and only
 * opacity animates.
 */
export function fadeUp(distance = 12, reduced = false): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : distance },
    show: { opacity: 1, y: 0, transition },
  };
}

export const viewportOnce = { once: true, amount: 0.2 } as const;

/** True only on devices with a real hover-capable pointer (desktop). */
export function useHoverCapable(): boolean {
  const [hoverable, setHoverable] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHoverable(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return hoverable;
}
