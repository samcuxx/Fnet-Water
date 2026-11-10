import type { TargetAndTransition, Transition, Variants } from "framer-motion";

/**
 * High-end Stagger Container for dashboard card grids and lists
 */
export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

/**
 * Smooth upward fade-in entry for metric cards, charts, and sections
 */
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

/**
 * Gentle scale-in for badges, pills, and status tags
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },
};

/**
 * Modal dialog entry with spring physics
 */
export const modalDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 26,
      stiffness: 340,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: {
      duration: 0.18,
      ease: "easeIn",
    },
  },
};

/**
 * Modal backdrop fade
 */
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

/**
 * Interactive card hover micro-interaction
 */
export const cardHoverMotion = {
  whileHover: {
    y: -3,
  } as TargetAndTransition,
  whileTap: {
    scale: 0.995,
  } as TargetAndTransition,
  transition: {
    duration: 0.18,
    ease: "easeOut",
  } as Transition,
};

/**
 * Snappy button hover and active tap
 */
export const buttonTapMotion = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.14 },
  } as TargetAndTransition,
  whileTap: {
    scale: 0.97,
    transition: { duration: 0.08 },
  } as TargetAndTransition,
};
