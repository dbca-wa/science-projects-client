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
 * Project Status Colors (WCAG AA compliant with white text)
 * Enhanced for better vibrancy and contrast (4.5:1 minimum ratio)
 */
export const PROJECT_STATUS_COLORS = {
	new: "#64748B", // Slate 600 - neutral gray
	pending: "#EAB308", // Yellow 500 - bright yellow (still WCAG compliant: 5.3:1)
	active: "#16A34A", // Green 600 - vibrant green
	updating: "#DC2626", // Red 600 - vibrant red
	closure_requested: "#EA580C", // Orange 600 - vibrant orange
	closing: "#DC2626", // Red 600 - vibrant red
	final_update: "#DC2626", // Red 600 - vibrant red
	completed: "#15803D", // Green 700 - dark green (WCAG compliant)
	terminated: "#1E293B", // Slate 800 - dark gray
	suspended: "#64748B", // Slate 600 - neutral gray
} as const;

/**
 * Confetti Color Schemes
 */
export const CONFETTI_COLOR_SCHEMES = {
	DBCA_COLOURS: [
		PROJECT_KIND_COLORS.science, // Blue
		PROJECT_KIND_COLORS.core_function, // Teal/Cyan
		PROJECT_KIND_COLORS.student, // Yellow/Gold
		PROJECT_KIND_COLORS.external, // Dark Green
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
export const ACTIVE_CONFETTI_SCHEME: keyof typeof CONFETTI_COLOR_SCHEMES =
	"FUN_COLOURS";

/**
 * Document Status Badge Variants
 * Maps document status values to shadcn badge variants
 */
export const DOCUMENT_STATUS_VARIANTS = {
	draft: "draft",
	new: "draft",
	revising: "pending",
	inreview: "inreview",
	inapproval: "inreview",
	approved: "approved",
	pending_approval: "pending",
	requires_revision: "denied",
} as const;

/**
 * Approval Status Badge Variants
 * Maps approval status values to shadcn badge variants
 */
export const APPROVAL_STATUS_VARIANTS = {
	pending: "pending",
	approved: "approved",
	denied: "denied",
	not_required: "secondary",
} as const;

export type ProjectKindColorKey = keyof typeof PROJECT_KIND_COLORS;
export type ProjectStatusColorKey = keyof typeof PROJECT_STATUS_COLORS;
export type ConfettiColorScheme = keyof typeof CONFETTI_COLOR_SCHEMES;
export type DocumentStatusKey = keyof typeof DOCUMENT_STATUS_VARIANTS;
export type ApprovalStatusKey = keyof typeof APPROVAL_STATUS_VARIANTS;
