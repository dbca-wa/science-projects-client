import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import { makeObservable, computed, action } from "mobx";

interface ReportDetailsStoreState extends BaseStoreState {
	selectedDivisionSlug: string;
	selectedYear: number | null;
	saveSearch: boolean;
}

const STORAGE_KEY = "reportDetailsState";

export class ReportDetailsStore extends BaseStore<ReportDetailsStoreState> {
	constructor() {
		super({
			selectedDivisionSlug: "BCS",
			selectedYear: null,
			saveSearch: true,
			loading: false,
			error: null,
			initialised: false,
		});

		makeObservable(this, {
			setDivisionSlug: action,
			setYear: action,
			toggleSaveSearch: action,
			setSaveSearch: action,
			clearState: action,
			reset: action,
			hasActiveFilters: computed,
		});

		this.loadFromLocalStorage();
	}

	async initialise() {
		this.state.initialised = true;
		logger.info("ReportDetails store initialised");
	}

	setDivisionSlug(slug: string) {
		this.state.selectedDivisionSlug = slug;
		this.state.selectedYear = null;
		this.saveToLocalStorage();
	}

	setYear(year: number | null) {
		this.state.selectedYear = year;
		this.saveToLocalStorage();
	}

	toggleSaveSearch() {
		this.state.saveSearch = !this.state.saveSearch;
		this.saveToLocalStorage();
	}

	setSaveSearch(value: boolean) {
		this.state.saveSearch = value;
		this.saveToLocalStorage();
	}

	clearState() {
		this.state.selectedDivisionSlug = "BCS";
		this.state.selectedYear = null;
		localStorage.removeItem(STORAGE_KEY);
	}

	reset() {
		this.state = {
			selectedDivisionSlug: "BCS",
			selectedYear: null,
			saveSearch: true,
			loading: false,
			error: null,
			initialised: false,
		};
		localStorage.removeItem(STORAGE_KEY);
	}

	get hasActiveFilters(): boolean {
		return (
			this.state.selectedDivisionSlug !== "BCS" ||
			this.state.selectedYear !== null
		);
	}

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
			logger.error("Failed to load report details state from localStorage", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	private restoreFromStorage = action((parsed: unknown) => {
		if (typeof parsed !== "object" || parsed === null) return;
		const data = parsed as Record<string, unknown>;

		if (typeof data.selectedDivisionSlug === "string") {
			this.state.selectedDivisionSlug = data.selectedDivisionSlug;
		}
		if (typeof data.selectedYear === "number" || data.selectedYear === null) {
			this.state.selectedYear = data.selectedYear as number | null;
		}
		if (typeof data.saveSearch === "boolean") {
			this.state.saveSearch = data.saveSearch;
		}
	});

	private saveToLocalStorage() {
		if (this.state.saveSearch) {
			try {
				localStorage.setItem(
					STORAGE_KEY,
					JSON.stringify({
						selectedDivisionSlug: this.state.selectedDivisionSlug,
						selectedYear: this.state.selectedYear,
						saveSearch: this.state.saveSearch,
					})
				);
			} catch (error) {
				logger.error("Failed to save report details state to localStorage", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}
}
