import { useEffect } from "react";
import { useSearchParams } from "react-router";

/**
 * Generic interface for search stores
 * TFilters: The specific filter type for this store (e.g., UserSearchFilters, ProjectSearchFilters)
 */
interface SearchStore<TFilters = Record<string, unknown>> {
	clearState: () => void;
	state: {
		saveSearch: boolean;
	};
	setSearchTerm: (term: string) => void;
	setCurrentPage: (page: number) => void;
	setFilters: (filters: Partial<TFilters>) => void;
}

/**
 * Options for useSearchStoreInit hook
 * TFilters: The specific filter type for this store
 */
interface UseSearchStoreInitOptions<TFilters = Record<string, unknown>> {
	store: SearchStore<TFilters>;
	storageKey: string;
	urlParamMapping: Record<string, (value: string) => unknown>;
}

/**
 * Shared hook for initializing search stores from localStorage and URL params
 * 
 * @template TFilters - The filter type specific to the store (inferred from store parameter)
 * 
 * Handles the common pattern of:
 * 1. Loading from localStorage if saveSearch is enabled
 * 2. Clearing state if saveSearch was disabled
 * 3. Reading URL params and updating store
 * 
 * @example
 * // UserListPage
 * useSearchStoreInit({
 *   store: userSearchStore,
 *   storageKey: "userSearchState",
 *   urlParamMapping: {
 *     staff: (v) => v === "true",
 *     businessArea: (v) => Number(v),
 *   },
 * });
 * 
 * @example
 * // ProjectListPage
 * useSearchStoreInit({
 *   store: projectSearchStore,
 *   storageKey: "projectSearchState",
 *   urlParamMapping: {
 *     projectKind: (v) => v,
 *     year: (v) => Number(v),
 *   },
 * });
 */
export const useSearchStoreInit = <TFilters = Record<string, unknown>>({
	store,
	storageKey,
	urlParamMapping,
}: UseSearchStoreInitOptions<TFilters>) => {
	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		// Check if saveSearch is disabled in localStorage
		const storedState = localStorage.getItem(storageKey);
		let shouldClearState = false;

		if (storedState) {
			try {
				const parsed = JSON.parse(storedState);
				if (parsed.saveSearch === false) {
					shouldClearState = true;
				}
			} catch {
				// Invalid JSON, ignore
			}
		}

		if (shouldClearState) {
			// User disabled persistence - clear store state and URL params
			store.clearState();
			store.state.saveSearch = false;
			setSearchParams(new URLSearchParams(), { replace: true });
			return;
		}

		// Read from URL params
		const search = searchParams.get("search");
		const page = searchParams.get("page");

		if (search) store.setSearchTerm(search);
		if (page) store.setCurrentPage(Number(page));

		// Process custom URL params
		const filters: Partial<TFilters> = {};
		let hasFilters = false;

		for (const [paramName, converter] of Object.entries(urlParamMapping)) {
			const value = searchParams.get(paramName);
			if (value !== null) {
				// Type assertion is safe here because we're building a Partial<TFilters>
				// and the caller is responsible for providing correct converters
				(filters as Record<string, unknown>)[paramName] = converter(value);
				hasFilters = true;
			}
		}

		if (hasFilters) {
			store.setFilters(filters);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
};
