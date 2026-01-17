/**
 * Breakpoint constants aligned with Tailwind CSS
 * Single source of truth for responsive behavior
 */

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): BreakpointKey {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'sm'; // Default to smallest
}

/**
 * Check if width is at or above a breakpoint
 */
export function isAtLeast(width: number, breakpoint: BreakpointKey): boolean {
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Check if width is below a breakpoint
 */
export function isBelow(width: number, breakpoint: BreakpointKey): boolean {
  return width < BREAKPOINTS[breakpoint];
}
