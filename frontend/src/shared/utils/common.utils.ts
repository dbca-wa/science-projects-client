/**
 * Common utility functions used across the application
 */

import { format, isPast } from "date-fns";

/**
 * Debounce utility function
 * Delays the execution of a function until after a specified delay has elapsed
 * since the last time it was invoked.
 * 
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 * 
 * @example
 * const debouncedSearch = debounce((term: string) => search(term), 300);
 */
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Format a date string or Date object to a readable format
 * 
 * @param dateString - Date string or Date object to format
 * @param formatString - date-fns format string (default: "PPP" - e.g., "April 29, 2023")
 * @returns Formatted date string or original string if parsing fails
 * 
 * @example
 * formatDate("2023-04-29") // "April 29, 2023"
 * formatDate("2023-04-29", "MMM d, yyyy") // "Apr 29, 2023"
 */
export function formatDate(
  dateString: string | Date,
  formatString: string = "PPP"
): string {
  try {
    return format(new Date(dateString), formatString);
  } catch {
    return String(dateString);
  }
}

/**
 * Check if a date has passed (is in the past)
 * 
 * @param endDate - Date string, Date object, or null/undefined
 * @returns true if the date is in the past, false otherwise
 * 
 * @example
 * isDateExpired("2020-01-01") // true
 * isDateExpired("2030-01-01") // false
 * isDateExpired(null) // false
 */
export function isDateExpired(endDate?: string | Date | null): boolean {
  return endDate ? isPast(new Date(endDate)) : false;
}
