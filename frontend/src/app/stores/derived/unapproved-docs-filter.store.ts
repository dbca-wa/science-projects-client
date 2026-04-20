import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { makeObservable, computed, action } from "mobx";

/**
 * Stage filter checkboxes for the unapproved documents tab.
 */
export interface StageFilters {
	stage1: boolean; // Waiting on Project Lead
	stage2: boolean; // Waiting on Me (Business Area Lead)
	stage3: boolean; // Waiting on Directorate
}

/**
 * Filter state for the unapproved documents tab.
 */
export interface UnapprovedDocsFilterState extends BaseStoreState {
	stageFilters: StageFilters;
	searchTerm: string;
}

const STORAGE_KEY = "unapprovedDocsFilterState";

const DEFAULT_STAGE_FILTERS: StageFilters = {
	stage1: true,
	stage2: true,
	stage3: true,
};

/**
 * Type guard for validating stored filter state from sessionStorage.
 */
function isStoredFilterState(
	value: unknown
): value is Pick<UnapprovedDocsFilterState, "stageFilters" | "searchTerm"> {
	if (typeof value !== "object" || value === null) return false;
	const obj = value as Record<string, unknown>;

	if (typeof obj.searchTerm !== "string") return false;
	if (typeof obj.stageFilters !== "object" || obj.stageFilters === null)
		return false;

	const filters = obj.stageFilters as Record<string, unknown>;
	return (
		typeof filters.stage1 === "boolean" &&
		typeof filters.stage2 === "boolean" &&
		typeof filters.stage3 === "boolean"
	);
}

/**
 * UnapprovedDocsFilterStore
 *
 * Manages client-side filter state for the Unapproved Documents tab
 * on the My Business Area page. Persists to sessionStorage so filters
 * are retained during tab navigation within the same session.
 */
export class UnapprovedDocsFilterStore extends BaseStore<UnapprovedDocsFilterState> {
	constructor() {
		super({
			stageFilters: { ...DEFAULT_STAGE_FILTERS },
			searchTerm: "",
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			toggleStageFilter: action,
			setSearchTerm: action,
			resetFilters: action,
			hasActiveFilters: computed,
			activeStages: computed,
		});

		this.loadFromSessionStorage();
	}

	/**
	 * Loads persisted filter state from sessionStorage.
	 */
	private loadFromSessionStorage() {
		try {
			const stored = sessionStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed: unknown = JSON.parse(stored);
				if (isStoredFilterState(parsed)) {
					this.restoreFromStorage(parsed);
				}
			}
		} catch (error) {
			logger.error(
				"Failed to load unapproved docs filter state from sessionStorage",
				{
					error: error instanceof Error ? error.message : String(error),
				}
			);
		}
	}

	/**
	 * Restores state from validated storage data.
	 */
	private restoreFromStorage = action(
		(
			parsed: Pick<UnapprovedDocsFilterState, "stageFilters" | "searchTerm">
		) => {
			this.state.stageFilters = { ...parsed.stageFilters };
			this.state.searchTerm = parsed.searchTerm;
		}
	);

	/**
	 * Saves current filter state to sessionStorage.
	 */
	private saveToSessionStorage() {
		try {
			const toStore = {
				stageFilters: this.state.stageFilters,
				searchTerm: this.state.searchTerm,
			};
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
		} catch (error) {
			logger.error(
				"Failed to save unapproved docs filter state to sessionStorage",
				{
					error: error instanceof Error ? error.message : String(error),
				}
			);
		}
	}

	/**
	 * Toggles a specific stage checkbox filter.
	 */
	toggleStageFilter(stage: 1 | 2 | 3) {
		const key = `stage${stage}` as keyof StageFilters;
		this.state.stageFilters[key] = !this.state.stageFilters[key];
		this.saveToSessionStorage();
	}

	/**
	 * Updates the search term.
	 */
	setSearchTerm(term: string) {
		this.state.searchTerm = term;
		this.saveToSessionStorage();
	}

	/**
	 * Resets all filters to defaults.
	 */
	resetFilters() {
		this.state.stageFilters = { ...DEFAULT_STAGE_FILTERS };
		this.state.searchTerm = "";
		this.saveToSessionStorage();
	}

	/**
	 * Resets store to initial state and clears sessionStorage.
	 */
	reset() {
		this.state = {
			stageFilters: { ...DEFAULT_STAGE_FILTERS },
			searchTerm: "",
			loading: false,
			error: null,
			initialised: false,
		};
		sessionStorage.removeItem(STORAGE_KEY);
	}

	/**
	 * True if any checkbox is unchecked or search term is non-empty.
	 */
	get hasActiveFilters(): boolean {
		const { stageFilters, searchTerm } = this.state;
		return (
			searchTerm.length > 0 ||
			!stageFilters.stage1 ||
			!stageFilters.stage2 ||
			!stageFilters.stage3
		);
	}

	/**
	 * Set of currently checked approval stages.
	 */
	get activeStages(): Set<1 | 2 | 3> {
		const stages = new Set<1 | 2 | 3>();
		if (this.state.stageFilters.stage1) stages.add(1);
		if (this.state.stageFilters.stage2) stages.add(2);
		if (this.state.stageFilters.stage3) stages.add(3);
		return stages;
	}
}
