/**
 * Project Color Constants
 * 
 * Color mappings from the original SPMS application.
 * These colors are used for project kind and status badges.
 */

/**
 * Project Kind Colors (from original CreateProject page)
 */
export const PROJECT_KIND_COLORS = {
	science: "#2A6096", // Blue
	core_function: "#01A7B2", // Teal/Cyan
	student: "#FFC530", // Yellow/Gold
	external: "#1E5456", // Dark Green
} as const;

/**
 * Project Status Colors (from original ModernProjectCard)
 * Using Chakra UI color values converted to hex approximations
 */
export const PROJECT_STATUS_COLORS = {
	new: "#718096", // gray.500
	pending: "#ECC94B", // yellow.500
	active: "#48BB78", // green.500
	updating: "#ECC94B", // yellow.500
	closure_requested: "#ED8936", // orange.500
	closing: "#F56565", // red.500
	final_update: "#F56565", // red.500
	completed: "#F56565", // red.500
	terminated: "#1A202C", // gray.800
	suspended: "#718096", // gray.500
} as const;

/**
 * Confetti Color Schemes
 */
export const CONFETTI_COLOR_SCHEMES = {
	DBCA_COLOURS: [
		PROJECT_KIND_COLORS.science,      // Blue
		PROJECT_KIND_COLORS.core_function, // Teal/Cyan
		PROJECT_KIND_COLORS.student,       // Yellow/Gold
		PROJECT_KIND_COLORS.external,      // Dark Green
	],
	FUN_COLOURS: [
		"#10b981", // Emerald green
		"#3b82f6", // Bright blue
		"#8b5cf6", // Purple
		"#f59e0b", // Amber
		"#ef4444", // Red
		"#ec4899", // Pink
	],
} as const;

/**
 * Active confetti color scheme
 * Change this to switch between color schemes
 */
export const ACTIVE_CONFETTI_SCHEME: keyof typeof CONFETTI_COLOR_SCHEMES = "FUN_COLOURS";

export type ProjectKindColorKey = keyof typeof PROJECT_KIND_COLORS;
export type ProjectStatusColorKey = keyof typeof PROJECT_STATUS_COLORS;
export type ConfettiColorScheme = keyof typeof CONFETTI_COLOR_SCHEMES;
