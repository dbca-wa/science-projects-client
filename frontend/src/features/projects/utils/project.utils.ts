import type {
	ProjectStatus,
	ProjectKind,
	IProjectData,
} from "@/shared/types/project.types";

/**
 * Project Utility Functions
 *
 * Pure functions for formatting and transforming project data.
 */

/**
 * Get display text for project status
 */
export const getProjectStatusDisplay = (
	status: ProjectStatus | string | null | undefined
): string => {
	if (!status) return "";

	const statusMap: Record<ProjectStatus, string> = {
		new: "New",
		pending: "Pending",
		active: "Active",
		updating: "Updating",
		closure_requested: "Closure Requested",
		closing: "Closing",
		final_update: "Final Update",
		completed: "Completed",
		terminated: "Terminated",
		suspended: "Suspended",
	};

	return statusMap[status as ProjectStatus] || status;
};

/**
 * Get display text for project kind
 */
export const getProjectKindDisplay = (
	kind: ProjectKind | string | null | undefined
): string => {
	if (!kind) return "";

	const kindMap: Record<ProjectKind, string> = {
		core_function: "Core Function",
		science: "Science",
		student: "Student",
		external: "External Partnership",
	};

	return kindMap[kind as ProjectKind] || kind;
};

/**
 * Get formatted year display for a project
 */
export const getProjectYearDisplay = (
	project: IProjectData | null | undefined
): string => {
	if (!project) return "";

	return project.year ? project.year.toString() : "";
};

/**
 * Parse keyword string into array of keywords
 */
export const parseProjectKeywords = (
	keywords: string | null | undefined
): string[] => {
	if (!keywords) return [];

	// Split by comma, trim whitespace, filter empty strings
	return keywords
		.split(",")
		.map((keyword) => keyword.trim())
		.filter((keyword) => keyword.length > 0);
};

/**
 * Format project number with year prefix
 */
export const formatProjectNumber = (
	year: number | null | undefined,
	number: number | null | undefined
): string => {
	if (!year || !number) return "";

	// Format as "YYYY-NNN" (e.g., "2024-001")
	const paddedNumber = number.toString().padStart(3, "0");
	return `${year}-${paddedNumber}`;
};

/**
 * Get project tag (formatted project number)
 * Alias for formatProjectNumber for consistency with original app
 */
export const getProjectTag = (
	project: IProjectData | null | undefined
): string => {
	if (!project) return "";

	return formatProjectNumber(project.year, project.number);
};

/**
 * Get project status color for badges
 */
export const getProjectStatusColor = (
	status: ProjectStatus | string | null | undefined
): string => {
	if (!status) return "gray";

	const colorMap: Record<ProjectStatus, string> = {
		new: "blue",
		pending: "yellow",
		active: "green",
		updating: "orange",
		closure_requested: "purple",
		closing: "purple",
		final_update: "purple",
		completed: "gray",
		terminated: "red",
		suspended: "red",
	};

	return colorMap[status as ProjectStatus] || "gray";
};

/**
 * Get project kind color for badges
 */
export const getProjectKindColor = (
	kind: ProjectKind | string | null | undefined
): string => {
	if (!kind) return "gray";

	const colorMap: Record<ProjectKind, string> = {
		core_function: "blue",
		science: "green",
		student: "purple",
		external: "orange",
	};

	return colorMap[kind as ProjectKind] || "gray";
};
