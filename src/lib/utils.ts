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

/**
 * Validates and normalizes a LinkedIn profile URL, rejecting empty values,
 * placeholders, and accidentally pasted email addresses.
 */
export function normalizeLinkedInUrl(raw?: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let url = raw.trim();
  if (!url || url === '#' || url.includes('placeholder')) return null;
  if (url.startsWith('https://cct.neduet.edu.pk/www.linkedin.com')) {
    url = url.replace('https://cct.neduet.edu.pk/www.linkedin.com', 'https://www.linkedin.com');
  }
  // Reject email addresses or non-LinkedIn strings
  if (url.includes('@') && !url.toLowerCase().includes('linkedin.com/')) return null;
  if (!/^https?:\/\//i.test(url)) {
    if (!/linkedin\.com\//i.test(url)) return null;
    url = `https://${url.replace(/^\/+/, '')}`;
  }
  if (!/linkedin\.com\//i.test(url)) return null;
  return url;
}
