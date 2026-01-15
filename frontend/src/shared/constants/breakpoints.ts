export const breakpoints = {
	xs: 400,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;
