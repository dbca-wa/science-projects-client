/**
 * Keyword parsing and merging utilities.
 *
 * Shared between KeywordInput component and its tests.
 */

/**
 * Parses a raw input string into an array of trimmed, non-empty keyword segments.
 * Splits on semicolons so users can enter multiple keywords at once.
 */
export const parseKeywords = (input: string): string[] => {
	return input
		.split(";")
		.map((segment) => segment.trim())
		.filter((segment) => segment.length > 0);
};

/**
 * Merges new keywords into an existing list, skipping duplicates.
 * Returns the combined array with no duplicate entries.
 */
export const mergeKeywords = (
	existing: string[],
	incoming: string[]
): string[] => {
	const merged = [...existing];
	for (const keyword of incoming) {
		if (!merged.includes(keyword)) {
			merged.push(keyword);
		}
	}
	return merged;
};
