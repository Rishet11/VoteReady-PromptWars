import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the number of days remaining until the deadline.
 * If the deadline has passed, it returns a negative number.
 */
export function calculateDaysRemaining(deadlineDateString: string): number {
  const deadline = new Date(deadlineDateString);
  const today = new Date();
  
  // Set time to midnight for accurate day comparison
  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Formats a date string to a more readable format.
 * Example: "2026-05-24" -> "May 24, 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
