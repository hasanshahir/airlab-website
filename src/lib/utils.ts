import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a priority rank for lead faculty/PIs so Prof. Dr. Muhammad Mubashir Khan
 * consistently sorts above Dr. Murk Marvi across team, project, and grant listings.
 */
export function getFacultyPriority(nameOrRole?: string, id?: string): number {
  const lower = (nameOrRole || '').toLowerCase();
  if (id === 'f2' || lower.includes('mubashir')) return 2;
  if (id === 'f1' || lower.includes('marvi')) return 1;
  return 0;
}
