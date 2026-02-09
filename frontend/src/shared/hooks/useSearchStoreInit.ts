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
		let savedData: unknown = null;

		if (storedState) {
			try {
				savedData = JSON.parse(storedState);
				// Type guard: check if savedData has saveSearch property
				if (
					typeof savedData === 'object' &&
					savedData !== null &&
					'saveSearch' in savedData
				) {
					const data = savedData as { saveSearch: boolean; [key: string]: unknown };
					
					if (data.saveSearch === false) {
						// User disabled persistence - clear store state and URL params
						store.clearState();
						if (store.setSaveSearch) {
							store.setSaveSearch(false);
						}
						setSearchParams(new URLSearchParams(), { replace: true });
						return;
					} else if (data.saveSearch === true) {
						// Load saved state
						shouldLoadFromStorage = true;
					}
				}
			} catch {
				// Invalid JSON, ignore
			}
		}

		// Load from localStorage first (if enabled)
		if (shouldLoadFromStorage && savedData) {
			// Type guard: ensure savedData is an object
			if (typeof savedData !== 'object' || savedData === null) {
				return;
			}
			
			const data = savedData as Record<string, unknown>;
			
			if (typeof data.searchTerm === 'string') {
				store.setSearchTerm(data.searchTerm);
			}
			
			// Build filters object for setFilters
			const savedFilters: Partial<TFilters> = {};
			let hasSavedFilters = false;

			// Support both old flat structure and new nested structure
			const filtersData = (typeof data.filters === 'object' && data.filters !== null) 
				? data.filters as Record<string, unknown>
				: data;

			// Map saved data to filter format expected by store
			// Business areas (check both old and new field names)
			const businessAreas = filtersData.selectedBusinessAreas || data.selectedBusinessAreas;
			if (businessAreas && Array.isArray(businessAreas) && businessAreas.length > 0) {
				(savedFilters as Record<string, unknown>).businessAreas = businessAreas;
				hasSavedFilters = true;
			}
			
			// User filter (check both old and new field names, allow null)
			const userFilter = filtersData.user !== undefined ? filtersData.user : data.filterUser;
			if (userFilter !== undefined) {
				(savedFilters as Record<string, unknown>).user = userFilter;
				hasSavedFilters = true;
			}
			
			// Status filter (check both old and new field names)
			const statusFilter = filtersData.status !== undefined ? filtersData.status : data.filterStatus;
			if (statusFilter !== undefined) {
				(savedFilters as Record<string, unknown>).status = statusFilter;
				hasSavedFilters = true;
			}
			
			// Kind filter (check both old and new field names)
			const kindFilter = filtersData.kind !== undefined ? filtersData.kind : data.filterKind;
			if (kindFilter !== undefined) {
				(savedFilters as Record<string, unknown>).kind = kindFilter;
				hasSavedFilters = true;
			}
			
			// Year filter (check both old and new field names)
			const yearFilter = filtersData.year !== undefined ? filtersData.year : data.filterYear;
			if (yearFilter !== undefined) {
				(savedFilters as Record<string, unknown>).year = yearFilter;
				hasSavedFilters = true;
			}
			
			// Only active (check both old and new field names)
			const onlyActive = filtersData.onlyActive !== undefined ? filtersData.onlyActive : data.onlyActive;
			if (onlyActive !== undefined) {
				(savedFilters as Record<string, unknown>).onlyActive = onlyActive;
				hasSavedFilters = true;
			}
			
			// Only inactive (check both old and new field names)
			const onlyInactive = filtersData.onlyInactive !== undefined ? filtersData.onlyInactive : data.onlyInactive;
			if (onlyInactive !== undefined) {
				(savedFilters as Record<string, unknown>).onlyInactive = onlyInactive;
				hasSavedFilters = true;
			}

			if (hasSavedFilters) {
				store.setFilters(savedFilters);
			}

			// Set saveSearch state
			if (store.setSaveSearch && typeof data.saveSearch === 'boolean') {
				store.setSaveSearch(data.saveSearch);
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
