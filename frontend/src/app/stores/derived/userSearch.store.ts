import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { makeObservable, computed, action } from "mobx";

export interface UserSearchFilters {
	onlyExternal?: boolean;
	onlyStaff?: boolean;
	onlySuperuser?: boolean;
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
	onlyExternal: false,
	onlyStaff: false,
	onlySuperuser: false,
	businessArea: undefined,
};

export class UserSearchStore extends BaseStore<UserSearchStoreState> {
	constructor() {
		super({
			searchTerm: "",
			filters: { ...DEFAULT_FILTERS },
			currentPage: 1,
			saveSearch: true, // Default to true - save search by default
			totalResults: 0,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			// Actions
			setSearchTerm: action,
			setFilters: action,
			setCurrentPage: action,
			toggleSaveSearch: action,
			resetFilters: action,
			clearState: action,
			setTotalResults: action,
			reset: action,

			// Computed
			hasActiveFilters: computed,
			searchParams: computed,
		});
	}

	async initialise() {
		this.loadFromStorage();
		this.state.initialised = true;
		logger.info("UserSearch store initialized", {
			saveSearch: this.state.saveSearch,
			hasFilters: this.hasActiveFilters,
		});
	}

	setSearchTerm(term: string) {
		this.state.searchTerm = term;
		this.state.currentPage = 1; // Reset to page 1 on search
		if (this.state.saveSearch) {
			this.saveToStorage();
		}
	}

	setFilters(filters: Partial<UserSearchFilters>) {
		this.state.filters = { ...this.state.filters, ...filters };
		this.state.currentPage = 1; // Reset to page 1 on filter change
		if (this.state.saveSearch) {
			this.saveToStorage();
		}
	}

	setCurrentPage(page: number) {
		this.state.currentPage = page;
		if (this.state.saveSearch) {
			this.saveToStorage();
		}
	}

	toggleSaveSearch() {
		this.state.saveSearch = !this.state.saveSearch;
		if (this.state.saveSearch) {
			// When enabling, save current state
			this.saveToStorage();
		} else {
			// When disabling, save the saveSearch: false flag so we know not to restore on next load
			// But keep current search active in memory
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ saveSearch: false }));
		}
		logger.info("Save search toggled", { saveSearch: this.state.saveSearch });
	}

	resetFilters() {
		this.state.filters = { ...DEFAULT_FILTERS };
		this.state.searchTerm = "";
		this.state.currentPage = 1;
		if (this.state.saveSearch) {
			this.saveToStorage();
		}
	}

	clearState() {
		this.state.searchTerm = "";
		this.state.filters = { ...DEFAULT_FILTERS };
		this.state.currentPage = 1;
		this.state.totalResults = 0;
		// Don't clear localStorage here - we need to preserve the saveSearch flag
	}

	setTotalResults(count: number) {
		this.state.totalResults = count;
	}

	get hasActiveFilters(): boolean {
		return (
			this.state.filters.onlyExternal ||
			this.state.filters.onlyStaff ||
			this.state.filters.onlySuperuser ||
			this.state.filters.businessArea !== undefined ||
			this.state.searchTerm.length > 0
		);
	}

	get searchParams(): URLSearchParams {
		const params = new URLSearchParams();

		if (this.state.searchTerm) {
			params.set("search", this.state.searchTerm);
		}
		if (this.state.currentPage > 1) {
			params.set("page", this.state.currentPage.toString());
		}
		if (this.state.filters.onlyStaff) {
			params.set("staff", "true");
		}
		if (this.state.filters.onlyExternal) {
			params.set("external", "true");
		}
		if (this.state.filters.onlySuperuser) {
			params.set("superuser", "true");
		}
		if (this.state.filters.businessArea) {
			params.set("businessArea", this.state.filters.businessArea.toString());
		}

		return params;
	}

	private loadFromStorage() {
		if (typeof window === "undefined") return;

		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Always load the saveSearch flag
				this.state.saveSearch = parsed.saveSearch ?? true;
				
				// Only restore search state if saveSearch is enabled
				if (parsed.saveSearch) {
					this.state.searchTerm = parsed.searchTerm || "";
					this.state.filters = parsed.filters || { ...DEFAULT_FILTERS };
					this.state.currentPage = parsed.currentPage || 1;
					logger.info("Loaded search state from storage", parsed);
				} else {
					logger.info("saveSearch disabled, not restoring search state");
				}
			}
		} catch (error) {
			logger.warn("Failed to load search state from storage", { error });
		}
	}

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

	private clearStorage() {
		if (typeof window === "undefined") return;

		try {
			localStorage.removeItem(STORAGE_KEY);
			logger.debug("Cleared search state from storage");
		} catch (error) {
			logger.warn("Failed to clear search state from storage", { error });
		}
	}

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

	async dispose() {
		if (!this.state.saveSearch) {
			this.clearStorage();
		}
		this.reset();
	}
}
