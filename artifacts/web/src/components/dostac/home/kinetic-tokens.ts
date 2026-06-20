/**
 * Shared design tokens for the kinetic typography homepage.
 * All kinetic components import from here to maintain visual consistency.
 */

export const CREAM = "#F5F0E8" as const;
export const DARK  = "#2D2D2D" as const;
export const TERRA = "#8B5E3C" as const;

/** Apple/Linear-style deceleration easing */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Single element fade-up — used as a child in stagger containers */
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT_EXPO },
  },
} as const;

/** Container stagger — children animate sequentially */
export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
} as const;

/** Section heading group stagger (eyebrow → h2 → sub) */
export const sectionHeaderStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
} as const;

/** Single word reveal — used as child in wordStagger containers */
export const wordReveal = {
  hidden: { opacity: 0, y: "0.3em" },
  show: {
    opacity: 1,
    y: "0em",
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
} as const;

/** Stagger container for word-by-word headline reveal */
export const wordStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
} as const;
