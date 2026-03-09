import type { ProjectStatus, ProjectKind } from "@/shared/types/project.types";

/**
 * Project Display Utility Functions
 *
 * Pure functions for formatting project display text.
 * These are shared across features for consistent project display.
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
		pending: "Pending Project Plan",
		active: "Active (Approved)",
		updating: "Update Requested",
		closure_requested: "Closure Requested",
		closing: "Closure Pending Final Update",
		final_update: "Final Update Requested",
		completed: "Completed and Closed",
		terminated: "Terminated and Closed",
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
