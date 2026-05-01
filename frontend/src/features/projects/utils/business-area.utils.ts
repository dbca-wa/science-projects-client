import type { IBusinessArea, IDivision } from "@/shared/types/org.types";

/**
 * Format a business area name for display in dropdowns.
 *
 * Active BAs show: [SLUG] Name (e.g. "[BCS] Biodiversity Office")
 * Inactive BAs are excluded from dropdowns (filter them out before calling this).
 *
 * @param ba - The business area to format
 * @returns Formatted display string
 */
export const formatBusinessAreaName = (ba: IBusinessArea): string => {
	const divisionSlug =
		typeof ba.division === "object" && ba.division
			? (ba.division as IDivision).slug?.toUpperCase()
			: null;

	if (divisionSlug) {
		return `[${divisionSlug}] ${ba.name}`;
	}

	return ba.name;
};

/**
 * Sort business areas by their formatted display name.
 * Ensures [BCS] items come before [RMFS] items since the slug
 * prefix drives the alphabetical order.
 */
export const sortBusinessAreasByDisplayName = (
	businessAreas: IBusinessArea[]
): IBusinessArea[] => {
	return [...businessAreas].sort((a, b) => {
		const displayA = formatBusinessAreaName(a);
		const displayB = formatBusinessAreaName(b);
		return displayA.localeCompare(displayB);
	});
};

/**
 * Filter and sort business areas for dropdown display.
 * Removes inactive BAs and sorts by display name.
 */
export const getDropdownBusinessAreas = (
	businessAreas: IBusinessArea[]
): IBusinessArea[] => {
	return sortBusinessAreasByDisplayName(
		businessAreas.filter((ba) => ba.is_active)
	);
};
