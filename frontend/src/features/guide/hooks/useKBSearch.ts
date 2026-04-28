/**
 * Knowledge Base Search Hook
 *
 * Client-side search with debounce across all article titles and content.
 * Strips HTML tags from content before matching.
 */
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import type { IGuideSection, IContentField } from "../types/guide.types";

export interface KBSearchResult {
	section: IGuideSection;
	matchingFields: IContentField[];
}

/** Strip HTML tags for plain-text search matching */
const stripHtml = (html: string): string => {
	const div = document.createElement("div");
	div.innerHTML = html;
	return div.textContent ?? "";
};

/** Check if a content field matches the search query */
const fieldMatchesQuery = (
	field: IContentField,
	lowerQuery: string
): boolean => {
	const titleMatch = field.title?.toLowerCase().includes(lowerQuery) ?? false;
	const descMatch =
		stripHtml(field.description ?? "")
			.toLowerCase()
			.includes(lowerQuery) ?? false;
	return titleMatch || descMatch;
};

export const useKBSearch = (sections: IGuideSection[] | undefined) => {
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedQuery = useDebouncedValue(searchQuery, 250);

	const results = useMemo<KBSearchResult[]>(() => {
		if (!debouncedQuery.trim() || !sections) return [];

		const lowerQuery = debouncedQuery.toLowerCase();

		return sections
			.map((section) => ({
				section,
				matchingFields: section.content_fields.filter((field) =>
					fieldMatchesQuery(field, lowerQuery)
				),
			}))
			.filter((result) => result.matchingFields.length > 0);
	}, [debouncedQuery, sections]);

	const isSearching = searchQuery.trim().length > 0;
	const isDebouncing = isSearching && searchQuery !== debouncedQuery;

	return {
		searchQuery,
		setSearchQuery,
		debouncedQuery,
		results,
		isSearching,
		isDebouncing,
	};
};
