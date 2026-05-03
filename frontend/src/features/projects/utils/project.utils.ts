import type { ProjectStatus } from "@/shared/types/project.types";

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
