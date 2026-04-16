/**
 * Filter items by name using a case-insensitive substring match.
 *
 * Returns all items when the search term is empty or whitespace-only.
 */
export function filterByName<T>(
	items: T[],
	searchTerm: string,
	nameAccessor: (item: T) => string
): T[] {
	const trimmed = searchTerm.trim();
	if (trimmed === "") {
		return items;
	}
	const lower = trimmed.toLowerCase();
	return items.filter((item) =>
		nameAccessor(item).toLowerCase().includes(lower)
	);
}

/**
 * Sort items alphabetically by name (case-insensitive, using localeCompare).
 *
 * Returns a new array — does not mutate the original.
 */
export function sortAlphabetically<T>(
	items: T[],
	nameAccessor: (item: T) => string
): T[] {
	return [...items].sort((a, b) =>
		nameAccessor(a).localeCompare(nameAccessor(b), undefined, {
			sensitivity: "base",
		})
	);
}
