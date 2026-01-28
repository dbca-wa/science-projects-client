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
	setSaveSearch?: (value: boolean) => void; // Optional method for setting saveSearch
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
		// First, try to load from localStorage if saveSearch is enabled
		const storedState = localStorage.getItem(storageKey);
		let shouldLoadFromStorage = false;
		let savedData: any = null;

		if (storedState) {
			try {
				savedData = JSON.parse(storedState);
				if (savedData.saveSearch === false) {
					// User disabled persistence - clear store state and URL params
					store.clearState();
					if (store.setSaveSearch) {
						store.setSaveSearch(false);
					} else {
						store.state.saveSearch = false;
					}
					setSearchParams(new URLSearchParams(), { replace: true });
					return;
				} else if (savedData.saveSearch === true) {
					// Load saved state
					shouldLoadFromStorage = true;
				}
			} catch {
				// Invalid JSON, ignore
			}
		}

		// Load from localStorage first (if enabled)
		if (shouldLoadFromStorage && savedData) {
			if (savedData.searchTerm) {
				store.setSearchTerm(savedData.searchTerm);
			}
			
			// Build filters object for setFilters
			const savedFilters: Partial<TFilters> = {};
			let hasSavedFilters = false;

			// Map saved data to filter format expected by store
			if (savedData.selectedBusinessAreas && Array.isArray(savedData.selectedBusinessAreas) && savedData.selectedBusinessAreas.length > 0) {
				(savedFilters as any).businessAreas = savedData.selectedBusinessAreas;
				hasSavedFilters = true;
			}
			if (savedData.filterUser) {
				(savedFilters as any).user = savedData.filterUser;
				hasSavedFilters = true;
			}

			if (hasSavedFilters) {
				store.setFilters(savedFilters);
			}

			// Set saveSearch state
			if (store.setSaveSearch) {
				store.setSaveSearch(savedData.saveSearch);
			} else {
				store.state.saveSearch = savedData.saveSearch;
			}
		}

		// Then, read from URL params (URL params override localStorage)
		const search = searchParams.get("search");
		const page = searchParams.get("page");

		if (search) store.setSearchTerm(search);
		if (page) store.setCurrentPage(Number(page));

		// Process custom URL params
		const urlFilters: Partial<TFilters> = {};
		let hasUrlFilters = false;

		for (const [paramName, converter] of Object.entries(urlParamMapping)) {
			const value = searchParams.get(paramName);
			if (value !== null) {
				// Type assertion is safe here because we're building a Partial<TFilters>
				// and the caller is responsible for providing correct converters
				(urlFilters as Record<string, unknown>)[paramName] = converter(value);
				hasUrlFilters = true;
			}
		}

		if (hasUrlFilters) {
			store.setFilters(urlFilters);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
};
