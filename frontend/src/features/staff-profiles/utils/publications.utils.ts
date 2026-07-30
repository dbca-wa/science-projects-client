import type { ILibraryPublication } from "../types/staff-profile.types";

/**
 * Extract visible text from an HTML string so entries compare on their displayed content.
 * Uses the DOM parser rather than a regex, which reliably handles malformed or nested markup.
 */
export const stripHtml = (value: string): string => {
	const parsed = new DOMParser().parseFromString(value, "text/html");
	const text = parsed.body.textContent ?? "";
	return text.replace(/\s+/g, " ").trim();
};

/** The author text is the portion of the entry before the "(YYYY)" year marker */
export const getAuthorKey = (pub: ILibraryPublication): string => {
	const plain = stripHtml(pub.BiblioText ?? "");
	const yearMatch = plain.match(/\(\d{4}[a-z]?\)/i);
	return yearMatch ? plain.slice(0, yearMatch.index).trim() : plain;
};

/** Order by author text, then fall back to title for entries sharing the same lead author */
export const comparePublications = (
	a: ILibraryPublication,
	b: ILibraryPublication
): number => {
	const options: Intl.CollatorOptions = {
		sensitivity: "base",
		numeric: true,
	};
	const authorComparison = getAuthorKey(a).localeCompare(
		getAuthorKey(b),
		undefined,
		options
	);
	if (authorComparison !== 0) return authorComparison;
	return (a.title ?? "").localeCompare(b.title ?? "", undefined, options);
};
