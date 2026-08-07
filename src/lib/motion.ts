import type { Transition } from "framer-motion";

/**
 * Shared motion vocabulary.
 *
 * Comedic timing is the whole medium here, so springs are tuned by feel rather
 * than by round numbers: `bouncy` overshoots enough to read as a physical
 * object, `snappy` is what buttons and toasts use so the UI still feels fast,
 * and `heavy` is for anything that should land with weight (modals, the trust
 * slider recoiling). Nothing linear. Linear is what a joke looks like when it
 * isn't funny yet.
 */
export const spring = {
  bouncy: { type: "spring", stiffness: 420, damping: 18, mass: 0.9 },
  snappy: { type: "spring", stiffness: 560, damping: 34, mass: 0.6 },
  gentle: { type: "spring", stiffness: 220, damping: 26, mass: 1 },
  heavy: { type: "spring", stiffness: 300, damping: 30, mass: 1.6 },
  recoil: { type: "spring", stiffness: 700, damping: 12, mass: 0.7 },
} satisfies Record<string, Transition>;

/** Ease curves for the handful of things that shouldn't be springs. */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  anticipate: [0.68, -0.55, 0.27, 1.55],
} as const;

/** Stagger container/child pair used by most page sections. */
export const stagger = (delayChildren = 0.06, staggerChildren = 0.055) => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

export const riseIn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: spring.gentle },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: ease.out } },
};
