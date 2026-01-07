import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to generate framer-motion animation props for page transitions.
 * Uses a simple "page flip" effect (rotateY) with a 0.6s duration.
 */
export const animatePageTransition = {
  initial: { opacity: 0, rotateY: -180 },
  animate: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: 180 },
  transition: { duration: 0.6 },
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
