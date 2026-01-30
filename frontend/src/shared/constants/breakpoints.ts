/**
 * Breakpoint constants aligned with Tailwind CSS
 * Single source of truth for responsive behavior
 * 
 * Custom breakpoints:
 * - 2xl: 1536px (Tailwind default) - Maintains 3-column layout
 * - 3xl: 2048px (2K standard) - Transition to 4 columns
 * - 4xl: 3200px (ultra-wide) - Transition to 6 columns
 */

export const BREAKPOINTS = {
	"2xs": 0,
	xs: 320,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1600,
	"2xl": 1880,  // Tailwind default - maintains 3 columns
	"3xl": 2200,  // 2K standard - transition to 4 columns
	"4xl": 3200,  // Ultra-wide - transition to 6 columns
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): BreakpointKey {
	if (width >= BREAKPOINTS["4xl"]) return "4xl";
	if (width >= BREAKPOINTS["3xl"]) return "3xl";
	if (width >= BREAKPOINTS["2xl"]) return "2xl";
	if (width >= BREAKPOINTS.xl) return "xl";
	if (width >= BREAKPOINTS.lg) return "lg";
	if (width >= BREAKPOINTS.md) return "md";
	if (width >= BREAKPOINTS.sm) return "sm";
	if (width >= BREAKPOINTS["2xs"]) return "2xs";
	return "2xs"; // Default to smallest
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
