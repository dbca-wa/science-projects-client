import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { makeObservable, computed, action } from "mobx";
import type { IProjectData } from "@/shared/types/project.types";
import { INACTIVE_PROJECT_STATUSES } from "@/shared/constants/project.constants";

/**
 * My Projects Filters
 */
export interface MyProjectsFilters {
	hideInactive: boolean;
}

/**
 * My Projects Store State
 */
interface MyProjectsStoreState extends BaseStoreState {
	searchTerm: string;
	filters: MyProjectsFilters;
	saveSearch: boolean;
}

const STORAGE_KEY = "myProjectsState";

const DEFAULT_FILTERS: MyProjectsFilters = {
	hideInactive: false,
};

/**
 * MyProjectsStore
 * 
 * Manages client-side filter state for the My Projects dashboard tab.
 * Follows the same pattern as UserSearchStore and ProjectSearchStore.
 * 
 * State includes:
 * - searchTerm: Text search filter for project titles
 * - filters.hideInactive: Filter to hide completed/terminated/suspended projects
 * - saveSearch: Whether to persist state to localStorage
 * 
 * All API data (projects) is managed by TanStack Query via useMyProjects hook.
 */
export class MyProjectsStore extends BaseStore<MyProjectsStoreState> {
	constructor() {
		super({
			searchTerm: "",
			filters: { ...DEFAULT_FILTERS },
			saveSearch: true,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			setSearchTerm: action,
			setFilters: action,
			setHideInactive: action,
			resetFilters: action,
			toggleSaveSearch: action,
			setSaveSearch: action,
			clearState: action,
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
		logger.info("MyProjects store initialized");
	}

	/**
	 * Loads state from localStorage if saveSearch is enabled.
	 */
	private loadFromLocalStorage() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (parsed.saveSearch) {
					this.restoreFromStorage(parsed);
				}
			}
		} catch (error) {
			logger.error("Failed to load my projects state from localStorage", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	/**
	 * Restores state from parsed storage data (action).
	 */
	private restoreFromStorage = action((parsed: Record<string, unknown>) => {
		this.state = { ...this.state, ...parsed };
	});

	/**
	 * Saves current state to localStorage.
	 */
	private saveToLocalStorage() {
		if (this.state.saveSearch) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
			} catch (error) {
				logger.error("Failed to save my projects state to localStorage", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	/**
	 * Sets the search term.
	 */
	setSearchTerm(term: string) {
		this.state.searchTerm = term;
		this.saveToLocalStorage();
	}

	/**
	 * Updates filters.
	 */
	setFilters(filters: Partial<MyProjectsFilters>) {
		this.state.filters = { ...this.state.filters, ...filters };
		this.saveToLocalStorage();
	}

	/**
	 * Sets whether to hide inactive projects (convenience method).
	 */
	setHideInactive(value: boolean) {
		this.state.filters.hideInactive = value;
		this.saveToLocalStorage();
	}

	/**
	 * Resets filters and search term to defaults.
	 */
	resetFilters() {
		this.state.filters = { ...DEFAULT_FILTERS };
		this.state.searchTerm = "";
		this.saveToLocalStorage();
	}

	/**
	 * Toggles whether state should be saved to localStorage.
	 */
	toggleSaveSearch() {
		this.state.saveSearch = !this.state.saveSearch;
		this.saveToLocalStorage();
	}

	/**
	 * Sets whether state should be saved to localStorage.
	 */
	setSaveSearch(value: boolean) {
		this.state.saveSearch = value;
		this.saveToLocalStorage();
	}

	/**
	 * Clears state and removes from localStorage.
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
			saveSearch: true,
			loading: false,
			error: null,
			initialised: false,
		};
		localStorage.removeItem(STORAGE_KEY);
	}

	/**
	 * @returns True if any filters or search term are active
	 */
	get hasActiveFilters(): boolean {
		return (
			this.state.searchTerm.length > 0 ||
			this.state.filters.hideInactive !== DEFAULT_FILTERS.hideInactive
		);
	}

	/**
	 * @returns The number of active filters
	 */
	get filterCount(): number {
		let count = 0;

		if (this.state.searchTerm.length > 0) count++;
		if (this.state.filters.hideInactive !== DEFAULT_FILTERS.hideInactive) count++;

		return count;
	}

	/**
	 * @returns URLSearchParams object constructed from current state
	 */
	get searchParams(): URLSearchParams {
		const params = new URLSearchParams();

		if (this.state.searchTerm) {
			params.set("search", this.state.searchTerm);
		}

		if (this.state.filters.hideInactive) {
			params.set("hideInactive", "true");
		}

		return params;
	}

	/**
	 * Get filtered projects based on current filter state
	 * 
	 * @param projects - Array of projects to filter
	 * @returns Filtered array of projects
	 */
	getFilteredProjects(projects: IProjectData[]): IProjectData[] {
		let filtered = projects;

		// Apply inactive filter
		if (this.state.filters.hideInactive) {
			filtered = filtered.filter(
				(p) => !INACTIVE_PROJECT_STATUSES.includes(p.status)
			);
		}

		// Apply search filter
		if (this.state.searchTerm) {
			const term = this.state.searchTerm.toLowerCase();
			filtered = filtered.filter((p) =>
				p.title.toLowerCase().includes(term)
			);
		}

		return filtered;
	}
}
