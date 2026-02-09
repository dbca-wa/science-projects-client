/**
 * TanStack Query Configuration Constants
 * Centralized stale time values for consistent caching behavior
 */

/**
 * Stale time durations in milliseconds
 * Determines how long cached data is considered fresh before refetching
 */
export const STALE_TIME = {
  /** 2 minutes - For frequently changing data (tasks, notifications) */
  SHORT: 2 * 60_000,
  
  /** 5 minutes - For moderately changing data (user details, search results) */
  MEDIUM: 5 * 60_000,
  
  /** 10 minutes - For slowly changing data (branches, affiliations) */
  LONG: 10 * 60_000,
  
  /** 30 minutes - For rarely changing data (business areas, system config) */
  VERY_LONG: 30 * 60_000,
} as const;

/**
 * API timeout durations in milliseconds
 */
export const TIMEOUT = {
  /** 10 seconds - Default API request timeout */
  DEFAULT: 10_000,
  
  /** 30 seconds - For long-running operations */
  LONG: 30_000,
  
  /** 60 seconds - For file uploads or heavy operations */
  VERY_LONG: 60_000,
} as const;
