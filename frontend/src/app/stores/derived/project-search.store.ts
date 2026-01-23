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
			// Actions
			setSearchTerm: action,
			setFilters: action,
			setCurrentPage: action,
			setPagination: action,
			resetFilters: action,
			toggleSaveSearch: action,
			clearSearchAndFilters: action,
			setTotalResults: action,

			// Computed
			hasActiveFilters: computed,
			filterCount: computed,
			searchParams: computed,
		});

		// Load from localStorage if saveSearch is enabled
		this.loadFromLocalStorage();
	}

	async initialise() {
		this.state.initialised = true;
		logger.info("ProjectSearch store initialized");
	}

	private loadFromLocalStorage() {
		try {
			const stored = localStorage.getItem("projectSearchState");
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

	private saveToLocalStorage() {
		if (this.state.saveSearch) {
			try {
				localStorage.setItem("projectSearchState", JSON.stringify(this.state));
			} catch (error) {
				logger.error("Failed to save project search state to localStorage", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		} else {
			localStorage.removeItem("projectSearchState");
		}
	}

	setSearchTerm(term: string) {
		this.state.searchTerm = term;
		this.state.currentPage = 1; // Reset to page 1 on search
		this.saveToLocalStorage();
	}

	setFilters(filters: Partial<ProjectSearchFilters>) {
		this.state.filters = { ...this.state.filters, ...filters };
		this.state.currentPage = 1; // Reset to page 1 on filter change
		this.saveToLocalStorage();
	}

	setCurrentPage(page: number) {
		this.state.currentPage = page;
		this.saveToLocalStorage();
	}

	setPagination(data: { totalPages: number; totalResults: number }) {
		this.state.totalPages = data.totalPages;
		this.state.totalResults = data.totalResults;
	}

	setTotalResults(total: number) {
		this.state.totalResults = total;
	}

	resetFilters() {
		this.state.filters = { ...DEFAULT_FILTERS };
		this.state.searchTerm = "";
		this.state.currentPage = 1;
		this.saveToLocalStorage();
	}

	clearSearchAndFilters() {
		this.resetFilters();
	}

	toggleSaveSearch() {
		this.state.saveSearch = !this.state.saveSearch;
		this.saveToLocalStorage();
	}

	clearState() {
		this.state.searchTerm = "";
		this.state.filters = { ...DEFAULT_FILTERS };
		this.state.currentPage = 1;
		localStorage.removeItem("projectSearchState");
	}

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
