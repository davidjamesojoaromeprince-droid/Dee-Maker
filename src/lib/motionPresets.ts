import { Variants, Transition } from 'motion/react';

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 24,
  mass: 0.8
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 22
};

export const liquidTransition: Transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1]
};

export const fadeInReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

export const hoverScale = {
  scale: 1.025,
  y: -2,
  transition: springTransition
};

export const tapScale = {
  scale: 0.96,
  transition: { type: 'spring', stiffness: 500, damping: 25 }
};

export const liquidHover = {
  y: -6,
  scale: 1.015,
  boxShadow: '0 20px 35px -10px rgba(37, 99, 235, 0.16), 0 4px 12px -2px rgba(245, 158, 11, 0.06)',
  transition: springTransition
};

export const liquidHoverCoral = {
  y: -6,
  scale: 1.015,
  boxShadow: '0 20px 35px -10px rgba(244, 63, 94, 0.16), 0 4px 12px -2px rgba(37, 99, 235, 0.06)',
  transition: springTransition
};

export const liquidHoverTeal = {
  y: -6,
  scale: 1.015,
  boxShadow: '0 20px 35px -10px rgba(13, 148, 136, 0.16), 0 4px 12px -2px rgba(37, 99, 235, 0.06)',
  transition: springTransition
};

export const buttonLiquidHover = {
  scale: 1.03,
  y: -2,
  boxShadow: '0 12px 24px -6px rgba(37, 99, 235, 0.35)',
  transition: springTransition
};

export const pageFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};


