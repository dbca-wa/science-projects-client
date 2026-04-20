import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { makeObservable, computed, action } from "mobx";

export type RoleFilter =
	| "all"
	| "external"
	| "staff"
	| "ba_lead"
	| "approver"
	| "key_stakeholder"
	| "admin";

export interface UserSearchFilters {
	roleFilter?: RoleFilter;
	businessArea?: string | number;
}

interface UserSearchStoreState extends BaseStoreState {
	searchTerm: string;
	filters: UserSearchFilters;
	currentPage: number;
	saveSearch: boolean;
	totalResults: number;
}

const STORAGE_KEY = "userSearchState";

const DEFAULT_FILTERS: UserSearchFilters = {
	roleFilter: "all",
	businessArea: undefined,
};

export class UserSearchStore extends BaseStore<UserSearchStoreState> {
	constructor() {
		super({
			searchTerm: "",
			filters: { ...DEFAULT_FILTERS },
			currentPage: 1,
			saveSearch: true,
			totalResults: 0,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			setSearchTerm: action,
			setFilters: action,
			setCurrentPage: action,
			toggleSaveSearch: action,
			setSaveSearch: action,
			resetFilters: action,
			clearSearchAndFilters: action,
			clearState: action,
			setTotalResults: action,
			reset: action,
			hasActiveFilters: computed,
			filterCount: computed,
			searchParams: computed,
		});
	}

	/**
	 * Initialises the store by loading saved search state from localStorage.
	 */
	async initialise() {
		this.loadFromStorage();
		this.state.initialised = true;
		logger.info("UserSearch store initialized", {
			saveSearch: this.state.saveSearch,
			hasFilters: this.hasActiveFilters,
		});
	}

	/**
	 * Sets the search term and resets to page 1.
	 */
	setSearchTerm(term: string) {
		this.state.searchTerm = term;
		this.state.currentPage = 1;
		if (this.state.saveSearch) {
			this.saveToStorage();
		}
	}

	/**
	 * Updates filters and resets to page 1.
	 */
	setFilters(filters: Partial<UserSearchFilters>) {
		this.state.filters = { ...this.state.filters, ...filters };
		this.state.currentPage = 1;
		if (this.state.saveSearch) {
			this.saveToStorage();
		}
	}

	/**
	 * Sets the current page number.
	 */
	setCurrentPage(page: number) {
		this.state.currentPage = page;
		if (this.state.saveSearch) {
			this.saveToStorage();
		}
	}

	/**
	 * Toggles whether search state should be saved to localStorage.
	 */
	toggleSaveSearch() {
		this.state.saveSearch = !this.state.saveSearch;
		if (this.state.saveSearch) {
			this.saveToStorage();
		} else {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ saveSearch: false }));
		}
		logger.info("Save search toggled", { saveSearch: this.state.saveSearch });
	}

	/**
	 * Sets whether search state should be saved to localStorage (action for MobX strict mode).
	 */
	setSaveSearch(value: boolean) {
		this.state.saveSearch = value;
		if (value) {
			this.saveToStorage();
		} else {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ saveSearch: false }));
		}
		logger.info("Save search set", { saveSearch: value });
	}

	/**
	 * Resets filters and search term to defaults.
	 */
	resetFilters() {
		this.state.filters = { ...DEFAULT_FILTERS };
		this.state.searchTerm = "";
		this.state.currentPage = 1;
		if (this.state.saveSearch) {
			this.saveToStorage();
		}
	}

	/**
	 * Clears all search state including filters and results.
	 */
	clearSearchAndFilters() {
		const currentSaveSearch = this.state.saveSearch;
		this.state.searchTerm = "";
		this.state.filters = { ...DEFAULT_FILTERS };
		this.state.currentPage = 1;
		this.state.totalResults = 0;

		if (currentSaveSearch) {
			this.saveToStorage();
		} else {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ saveSearch: false }));
		}

		logger.info("Cleared search and filters", {
			saveSearch: currentSaveSearch,
		});
	}

	/**
	 * Clears search state without affecting localStorage.
	 */
	clearState() {
		this.state.searchTerm = "";
		this.state.filters = { ...DEFAULT_FILTERS };
		this.state.currentPage = 1;
		this.state.totalResults = 0;
	}

	/**
	 * Sets the total number of search results.
	 */
	setTotalResults(count: number) {
		this.state.totalResults = count;
	}

	/**
	 * @returns True if any filters or search term are active
	 */
	get hasActiveFilters(): boolean {
		return (
			(this.state.filters.roleFilter !== undefined &&
				this.state.filters.roleFilter !== "all") ||
			this.state.filters.businessArea !== undefined ||
			this.state.searchTerm.length > 0
		);
	}

	/**
	 * @returns The number of active filters
	 */
	get filterCount(): number {
		let count = 0;
		if (this.state.searchTerm.length > 0) count++;
		if (
			this.state.filters.roleFilter &&
			this.state.filters.roleFilter !== "all"
		)
			count++;
		if (this.state.filters.businessArea !== undefined) count++;
		return count;
	}

	/**
	 * @returns URLSearchParams object constructed from current search state
	 */
	get searchParams(): URLSearchParams {
		const params = new URLSearchParams();

		if (this.state.searchTerm) {
			params.set("search", this.state.searchTerm);
		}
		if (this.state.currentPage > 1) {
			params.set("page", this.state.currentPage.toString());
		}

		// Map roleFilter to the appropriate URL param
		const roleFilter = this.state.filters.roleFilter;
		if (roleFilter && roleFilter !== "all") {
			params.set("roleFilter", roleFilter);
		}

		if (this.state.filters.businessArea) {
			params.set("businessArea", this.state.filters.businessArea.toString());
		}

		return params;
	}

	/**
	 * Loads search state from localStorage if saveSearch is enabled.
	 */
	private loadFromStorage() {
		if (typeof window === "undefined") return;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Use action to update state
				this.restoreFromStorage(parsed);
			}
		} catch (error) {
			logger.warn("Failed to load search state from storage", { error });
		}
	}

	/**
	 * Restores state from parsed storage data (action).
	 */
	private restoreFromStorage = action((parsed: unknown) => {
		// Type guard: ensure parsed is an object with expected properties
		if (typeof parsed !== "object" || parsed === null) {
			return;
		}

		const data = parsed as Record<string, unknown>;

		this.state.saveSearch =
			typeof data.saveSearch === "boolean" ? data.saveSearch : true;

		if (this.state.saveSearch) {
			this.state.searchTerm =
				typeof data.searchTerm === "string" ? data.searchTerm : "";

			// Validate and restore filters
			if (typeof data.filters === "object" && data.filters !== null) {
				const filters = data.filters as Record<string, unknown>;

				// Handle migration from old boolean filters to new roleFilter
				let roleFilter: RoleFilter = "all";
				if (typeof filters.roleFilter === "string") {
					const validRoles: RoleFilter[] = [
						"all",
						"external",
						"staff",
						"ba_lead",
						"approver",
						"key_stakeholder",
						"admin",
					];
					roleFilter = validRoles.includes(filters.roleFilter as RoleFilter)
						? (filters.roleFilter as RoleFilter)
						: "all";
				} else if (filters.onlyExternal === true) {
					roleFilter = "external";
				} else if (filters.onlyStaff === true) {
					roleFilter = "staff";
				} else if (filters.onlySuperuser === true) {
					roleFilter = "admin";
				} else if (filters.onlyBALead === true) {
					roleFilter = "ba_lead";
				}

				this.state.filters = {
					roleFilter,
					businessArea:
						filters.businessArea !== undefined
							? (filters.businessArea as string | number)
							: undefined,
				};
			} else {
				this.state.filters = { ...DEFAULT_FILTERS };
			}

			this.state.currentPage =
				typeof data.currentPage === "number" ? data.currentPage : 1;
			logger.info("Loaded search state from storage", {
				saveSearch: this.state.saveSearch,
			});
		} else {
			logger.info("saveSearch disabled, not restoring search state");
		}
	});

	/**
	 * Saves current search state to localStorage.
	 */
	private saveToStorage() {
		if (typeof window === "undefined") return;

		try {
			const toSave = {
				searchTerm: this.state.searchTerm,
				filters: this.state.filters,
				currentPage: this.state.currentPage,
				saveSearch: this.state.saveSearch,
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
			logger.debug("Saved search state to storage", toSave);
		} catch (error) {
			logger.warn("Failed to save search state to storage", { error });
		}
	}

	/**
	 * Clears search state from localStorage.
	 */
	private clearStorage() {
		if (typeof window === "undefined") return;

		try {
			localStorage.removeItem(STORAGE_KEY);
			logger.debug("Cleared search state from storage");
		} catch (error) {
			logger.warn("Failed to clear search state from storage", { error });
		}
	}

	/**
	 * Resets store to initial state and clears localStorage.
	 */
	reset() {
		this.state.searchTerm = "";
		this.state.filters = { ...DEFAULT_FILTERS };
		this.state.currentPage = 1;
		this.state.saveSearch = false;
		this.state.totalResults = 0;
		this.state.loading = false;
		this.state.error = null;
		this.state.initialised = false;
		this.clearStorage();
		logger.info("UserSearch store reset");
	}

	/**
	 * Performs cleanup when store is disposed.
	 */
	async dispose() {
		if (!this.state.saveSearch) {
			this.clearStorage();
		}
		this.reset();
	}
}
