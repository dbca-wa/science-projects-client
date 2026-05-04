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
	"modal-lg": 1140, // Custom breakpoint for modal layout
	xl: 1600,
	"2xl": 1880, // Tailwind default - maintains 3 columns
	"3xl": 2200, // 2K standard - transition to 4 columns
	"4xl": 3200, // Ultra-wide - transition to 6 columns
} as const;
