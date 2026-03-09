/**
 * Formats project year range from start and end dates
 *
 * Returns a formatted year string:
 * - "2024-2026" if start and end years differ
 * - "2024" if start and end years are the same
 * - "2024-" if no end date
 *
 * @param startDate - Project start date
 * @param endDate - Project end date (optional)
 * @returns Formatted year range string
 *
 * @example
 * formatYearRange(new Date("2024-01-01"), new Date("2026-12-31")); // "2024-2026"
 * formatYearRange(new Date("2024-01-01"), new Date("2024-12-31")); // "2024"
 * formatYearRange(new Date("2024-01-01"), null); // "2024-"
 */
export function formatYearRange(
	startDate: Date | string,
	endDate: Date | string | null | undefined
): string {
	// Parse start date
	const start = startDate instanceof Date ? startDate : new Date(startDate);
	const startYear = start.getFullYear();

	// Parse end date if provided
	if (!endDate) {
		return `${startYear}-`;
	}

	const end = endDate instanceof Date ? endDate : new Date(endDate);
	const endYear = end.getFullYear();

	// Return range or single year
	if (startYear === endYear) {
		return `${startYear}`;
	}

	return `${startYear}-${endYear}`;
}
