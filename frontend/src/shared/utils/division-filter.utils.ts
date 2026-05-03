import type { IBusinessArea, IDivision } from "@/shared/types/org.types";

/**
 * Checks whether a division has at least one approver or a key stakeholder.
 */
export const divisionHasApprovers = (division: IDivision): boolean => {
	return !!(division.key_stakeholder || division.approvers.length > 0);
};

/**
 * Checks whether a division has a key stakeholder assigned.
 */
export const divisionHasKeyStakeholder = (division: IDivision): boolean => {
	return !!division.key_stakeholder;
};

/**
 * Filters business areas to only include those whose division has at least
 * one approver or key stakeholder. Falls back to the full list if no
 * division data is provided.
 *
 * @param businessAreas - All active business areas
 * @param divisions - Division data for filtering
 * @returns Filtered business areas
 */
export const filterBusinessAreasByApprovers = (
	businessAreas: IBusinessArea[],
	divisions: IDivision[] | undefined
): IBusinessArea[] => {
	if (!divisions || divisions.length === 0) {
		return businessAreas;
	}

	const divisionMap = new Map<number, IDivision>();
	for (const div of divisions) {
		divisionMap.set(div.id, div);
	}

	return businessAreas.filter((ba) => {
		const divId =
			typeof ba.division === "object" ? ba.division?.id : ba.division;
		if (!divId) return false;
		const division = divisionMap.get(divId);
		if (!division) return false;
		return divisionHasApprovers(division);
	});
};

/**
 * Filters business areas to only include those whose division has a key
 * stakeholder assigned. Falls back to the full list if no division data
 * is provided.
 *
 * @param businessAreas - All business areas
 * @param divisions - Division data for filtering
 * @returns Filtered business areas
 */
export const filterBusinessAreasByKeyStakeholder = (
	businessAreas: IBusinessArea[],
	divisions: IDivision[] | undefined
): IBusinessArea[] => {
	if (!divisions || divisions.length === 0) {
		return businessAreas;
	}

	const divisionMap = new Map<number, IDivision>();
	for (const div of divisions) {
		divisionMap.set(div.id, div);
	}

	return businessAreas.filter((ba) => {
		const divId =
			typeof ba.division === "object" ? ba.division?.id : ba.division;
		if (!divId) return false;
		const division = divisionMap.get(divId);
		if (!division) return false;
		return divisionHasKeyStakeholder(division);
	});
};

/**
 * Sorts divisions alphabetically by name.
 * Useful for rendering division lists outside of Select components.
 */
export const sortDivisionsAlphabetically = (
	divisions: IDivision[]
): IDivision[] => {
	return [...divisions].sort((a, b) => a.name.localeCompare(b.name));
};
