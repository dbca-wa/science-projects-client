import type { IProjectData } from "@/shared/types/project.types";

/**
 * Marker colors
 */
export const MARKER_COLORS = {
	green: "#10b981", // Selected/active
	gray: "#6b7280", // Not selected
} as const;

/**
 * Get marker color based on business area selection
 *
 * Logic:
 * - If no business areas are selected: green (all projects shown)
 * - If project is in a selected business area: green
 * - Otherwise: gray
 *
 * @param project - Project data
 * @param selectedBusinessAreas - Array of selected business area IDs
 * @returns Hex color string
 */
export function getMarkerColor(
	project: IProjectData,
	selectedBusinessAreas: number[]
): string {
	// No business areas selected - show all projects as green
	if (selectedBusinessAreas.length === 0) {
		return MARKER_COLORS.green;
	}

	// Check if project's business area is in selected list
	if (project.business_area) {
		const isSelected = selectedBusinessAreas.includes(
			project.business_area.id!
		);
		return isSelected ? MARKER_COLORS.green : MARKER_COLORS.gray;
	}

	// Project has no business area - show as gray when filters are active
	return MARKER_COLORS.gray;
}
