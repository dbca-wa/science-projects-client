import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { makeObservable, computed, action } from "mobx";

export interface ProjectSearchFilters {
	businessArea?: string;
	projectKind?: string;
	projectStatus?: string;
	year?: number;
	user?: number | null;
	onlyActive?: boolean;
	onlyInactive?: boolean;
}

interface ProjectSearchStoreState extends BaseStoreState {
	searchTerm: string;
	filters: ProjectSearchFilters;
	currentPage: number;
	totalPages: number;
	totalResults: number;
	saveSearch: boolean;
}

const STORAGE_KEY = "projectSearchState";

const DEFAULT_FILTERS: ProjectSearchFilters = {
	businessArea: "All",
	projectKind: "All",
	projectStatus: "All",
	year: 0,
	user: null,
	onlyActive: false,
	onlyInactive: false,
};

export class ProjectSearchStore extends BaseStore<ProjectSearchStoreState> {
	constructor() {
		super({
			searchTerm: "",
			filters: { ...DEFAULT_FILTERS },
			currentPage: 1,
			totalPages: 1,
			totalResults: 0,
			saveSearch: true,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			setSearchTerm: action,
			setFilters: action,
			setCurrentPage: action,
			setPagination: action,
			resetFilters: action,
			toggleSaveSearch: action,
			clearSearchAndFilters: action,
			setTotalResults: action,
			reset: action,
			hasActiveFilters: computed,
			filterCount: computed,
			searchParams: computed,
		});

		this.loadFromLocalStorage();
	}

	/**
	 * Initialises the store.
	 */
	async initialise() {
		this.state.initialised = true;
		logger.info("ProjectSearch store initialized");
	}

	/**
	 * Loads search state from localStorage if saveSearch is enabled.
	 */
	private loadFromLocalStorage() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (parsed.saveSearch) {
					this.state = { ...this.state, ...parsed };
				}
			}
		} catch (error) {
			logger.error("Failed to load project search state from localStorage", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Saves current search state to localStorage.
	 */
	private saveToLocalStorage() {
		if (this.state.saveSearch) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
			} catch (error) {
				logger.error("Failed to save project search state to localStorage", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	/**
	 * Sets the search term and resets to page 1.
	 */
	setSearchTerm(term: string) {
		this.state.searchTerm = term;
		this.setCurrentPage(1);
	}

	/**
	 * Updates filters and resets to page 1.
	 */
	setFilters(filters: Partial<ProjectSearchFilters>) {
		this.state.filters = { ...this.state.filters, ...filters };
		this.setCurrentPage(1);
	}

	/**
	 * Sets the current page number.
	 */
	setCurrentPage(page: number) {
		this.state.currentPage = page;
		this.saveToLocalStorage();
	}

	/**
	 * Sets pagination data.
	 */
	setPagination(data: { totalPages: number; totalResults: number }) {
		this.state.totalPages = data.totalPages;
		this.state.totalResults = data.totalResults;
	}

	/**
	 * Sets the total number of search results.
	 */
	setTotalResults(total: number) {
		this.state.totalResults = total;
	}

	/**
	 * Resets filters and search term to defaults.
	 */
	resetFilters() {
		this.state.filters = { ...DEFAULT_FILTERS };
		this.setSearchTerm("");
	}

	/**
	 * Clears all search state including filters.
	 */
	clearSearchAndFilters() {
		this.resetFilters();
	}

	/**
	 * Toggles whether search state should be saved to localStorage.
	 */
	toggleSaveSearch() {
		this.state.saveSearch = !this.state.saveSearch;
		this.saveToLocalStorage();
	}

	/**
	 * Clears search state and removes from localStorage.
	 */
	clearState() {
		this.resetFilters();
		localStorage.removeItem(STORAGE_KEY);
	}

	/**
	 * Resets store to initial state.
	 */
	reset() {
		this.state = {
			searchTerm: "",
			filters: { ...DEFAULT_FILTERS },
			currentPage: 1,
			totalPages: 1,
			totalResults: 0,
			saveSearch: true,
			loading: false,
			error: null,
			initialised: false,
		};
	}

	/**
	 * @returns True if any filters or search term are active
	 */
	get hasActiveFilters(): boolean {
		return (
			this.state.searchTerm.length > 0 ||
			this.state.filters.businessArea !== "All" ||
			this.state.filters.projectKind !== "All" ||
			this.state.filters.projectStatus !== "All" ||
			(this.state.filters.year !== undefined && this.state.filters.year !== 0) ||
			this.state.filters.user !== null ||
			this.state.filters.onlyActive === true ||
			this.state.filters.onlyInactive === true
		);
	}

	/**
	 * @returns The number of active filters
	 */
	get filterCount(): number {
		let count = 0;

		if (this.state.searchTerm.length > 0) count++;
		if (this.state.filters.businessArea !== "All") count++;
		if (this.state.filters.projectKind !== "All") count++;
		if (this.state.filters.projectStatus !== "All") count++;
		if (this.state.filters.year !== undefined && this.state.filters.year !== 0) count++;
		if (this.state.filters.user !== null) count++;
		if (this.state.filters.onlyActive) count++;
		if (this.state.filters.onlyInactive) count++;

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

		if (this.state.filters.businessArea && this.state.filters.businessArea !== "All") {
			params.set("businessArea", this.state.filters.businessArea);
		}

		if (this.state.filters.projectKind && this.state.filters.projectKind !== "All") {
			params.set("projectKind", this.state.filters.projectKind);
		}

		if (this.state.filters.projectStatus && this.state.filters.projectStatus !== "All") {
			params.set("projectStatus", this.state.filters.projectStatus);
		}

		if (this.state.filters.year && this.state.filters.year !== 0) {
			params.set("year", this.state.filters.year.toString());
		}

		if (this.state.filters.user) {
			params.set("user", this.state.filters.user.toString());
		}

		if (this.state.filters.onlyActive) {
			params.set("onlyActive", "true");
		}

		if (this.state.filters.onlyInactive) {
			params.set("onlyInactive", "true");
		}

		return params;
	}
}