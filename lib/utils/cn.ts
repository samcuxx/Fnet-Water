import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, resolving conflicting Tailwind utilities so that a
 * caller-supplied `className` reliably overrides a component default.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
