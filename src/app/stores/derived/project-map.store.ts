import { makeObservable, action, computed } from "mobx";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import { logger } from "@/shared/services/logger.service";
import type { MapFilters } from "@/features/projects/types/map.types";
import type { ProjectMapSearchParams } from "@/features/projects/services/project.service";

/**
 * Project Map Filters
 * Similar to ProjectSearchFilters but for map-specific filtering
 */
export interface ProjectMapFilters {
	selectedBusinessAreas: number[];
	user: number | null;
	status: string;
	kind: string;
	year: number;
	onlyActive: boolean;
	onlyInactive: boolean;
}

/**
 * Project Map Store State
 */
interface ProjectMapState extends BaseStoreState {
	// Search and filters (matches ProjectSearchStore pattern)
	searchTerm: string;
	filters: ProjectMapFilters;
	saveSearch: boolean;

	// Map-specific: Location filtering
	selectedLocations: number[];

	// Map-specific: UI state
	sidebarOpen: boolean;
	visibleLayerTypes: string[]; // ["dbcaregion", "nrm", etc.]
	showLabels: boolean;
	showColors: boolean;
	mapLoading: boolean;
	mapFullscreen: boolean;
	filtersMinimized: boolean;
	selectedMarkerCoords: [number, number] | null;
	visualizationMode: "markers" | "heatmap";
}

const STORAGE_KEY = "projectMapState";

const DEFAULT_FILTERS: ProjectMapFilters = {
	selectedBusinessAreas: [],
	user: null,
	status: "",
	kind: "",
	year: 0,
	onlyActive: false,
	onlyInactive: false,
};

/**
 * ProjectMapStore
 *
 * Manages client-side state for the Project Map feature.
 * Follows the same pattern as ProjectSearchStore for consistency.
 *
 * State includes:
 * - Search term and filters (business areas, user, status, kind, year, active/inactive)
 * - Map-specific: Location filtering, layer visibility, UI state
 * - Persistence via localStorage when saveSearch is enabled
 *
 * All API data (projects, locations, business areas) is managed by TanStack Query.
 */
export class ProjectMapStore extends BaseStore<ProjectMapState> {
	constructor() {
		super({
			// Search and filters (matches ProjectSearchStore pattern)
			searchTerm: "",
			filters: { ...DEFAULT_FILTERS },
			saveSearch: true,

			// Map-specific: Location filtering
			selectedLocations: [],

			// Map-specific: UI state
			sidebarOpen: true,
			visibleLayerTypes: ["dbcaregion"],
			showLabels: true,
			showColors: true,
			mapLoading: false,
			mapFullscreen: false,
			filtersMinimized: false,
			selectedMarkerCoords: null,
			visualizationMode: "markers",

			// Base state
			loading: false,
			error: null,
			initialised: false,
		});

		// Use makeObservable for classes with inheritance
		makeObservable(this, {
			// Actions - search and filters (matches ProjectSearchStore)
			setSearchTerm: action,
			setCurrentPage: action,
			setFilters: action,
			resetFilters: action,
			toggleSaveSearch: action,
			setSaveSearch: action,
			clearState: action,

			// Actions - map-specific location filtering
			toggleLocation: action,
			selectLocations: action,
			deselectLocations: action,

			// Actions - map-specific UI
			toggleSidebar: action,
			showLayer: action,
			hideLayer: action,
			toggleLayerType: action,
			showAllLayers: action,
			hideAllLayers: action,
			toggleLabels: action,
			toggleColors: action,
			setMapLoading: action,
			toggleMapFullscreen: action,
			toggleFiltersMinimized: action,
			selectMarker: action,
			clearMarkerSelection: action,
			toggleVisualizationMode: action,
			setVisualizationMode: action,

			// Computed properties (matches ProjectSearchStore)
			hasActiveFilters: computed,
			filterCount: computed,
			searchParams: computed,

			// Computed - map-specific
			selectedBusinessAreas: computed,
			selectedBusinessAreasArray: computed,
			isMarkerSelected: computed,
			isHeatmapMode: computed,
			isMarkerMode: computed,
			apiParams: computed,
			mapFilters: computed,
		});

		this.loadFromLocalStorage();
	}

	/**
	 * Initialises the store.
	 */
	async initialise() {
		this.state.initialised = true;
		logger.info("ProjectMap store initialized");
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
					this.restoreFromStorage(parsed);
				}
			}
		} catch (error) {
			logger.error("Failed to load project map state from localStorage", {
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
	 * Saves current search state to localStorage.
	 */
	private saveToLocalStorage() {
		if (this.state.saveSearch) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
			} catch (error) {
				logger.error("Failed to save project map state to localStorage", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	/**
	 * Sets the search term (matches ProjectSearchStore pattern).
	 */
	setSearchTerm(term: string) {
		this.state.searchTerm = term;
		this.saveToLocalStorage();
	}

	/**
	 * Dummy method for compatibility with useSearchStoreInit.
	 * Map doesn't use pagination, so this is a no-op.
	 */
	setCurrentPage(_page: number) {
		// No-op: Map doesn't have pagination
	}

	/**
	 * Updates filters (matches ProjectSearchStore pattern).
	 */
	setFilters(filters: Partial<ProjectMapFilters>) {
		this.state.filters = { ...this.state.filters, ...filters };
		this.saveToLocalStorage();
	}

	/**
	 * Resets filters to defaults (matches ProjectSearchStore pattern).
	 */
	resetFilters() {
		this.state.filters = { ...DEFAULT_FILTERS };
		this.setSearchTerm("");
	}

	/**
	 * Toggles whether search state should be saved to localStorage.
	 */
	toggleSaveSearch() {
		this.state.saveSearch = !this.state.saveSearch;
		this.saveToLocalStorage();
	}

	/**
	 * Sets whether search state should be saved to localStorage.
	 */
	setSaveSearch(value: boolean) {
		this.state.saveSearch = value;
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
	 * Toggle sidebar visibility
	 */
	toggleSidebar = (): void => {
		this.state.sidebarOpen = !this.state.sidebarOpen;
	};

	/**
	 * Toggle location selection
	 */
	toggleLocation = (locationId: number): void => {
		const index = this.state.selectedLocations.indexOf(locationId);
		if (index > -1) {
			this.state.selectedLocations.splice(index, 1);
		} else {
			this.state.selectedLocations.push(locationId);
		}
	};

	/**
	 * Select multiple locations at once
	 */
	selectLocations = (locationIds: number[]): void => {
		const newLocations = locationIds.filter(
			(id) => !this.state.selectedLocations.includes(id)
		);
		this.state.selectedLocations.push(...newLocations);
	};

	/**
	 * Deselect multiple locations at once
	 */
	deselectLocations = (locationIds: number[]): void => {
		this.state.selectedLocations = this.state.selectedLocations.filter(
			(id) => !locationIds.includes(id)
		);
	};

	/**
	 * Show a specific layer type
	 */
	showLayer = (layerType: string): void => {
		if (!this.state.visibleLayerTypes.includes(layerType)) {
			this.state.visibleLayerTypes.push(layerType);
		}
	};

	/**
	 * Hide a specific layer type
	 */
	hideLayer = (layerType: string): void => {
		const index = this.state.visibleLayerTypes.indexOf(layerType);
		if (index > -1) {
			this.state.visibleLayerTypes.splice(index, 1);
		}
	};

	/**
	 * Toggle layer type visibility (for GeoJSON layers)
	 */
	toggleLayerType = (layerType: string): void => {
		const index = this.state.visibleLayerTypes.indexOf(layerType);
		if (index > -1) {
			this.state.visibleLayerTypes.splice(index, 1);
		} else {
			this.state.visibleLayerTypes.push(layerType);
		}
	};

	/**
	 * Show all layer types
	 */
	showAllLayers = (): void => {
		this.state.visibleLayerTypes = [
			"dbcaregion",
			"dbcadistrict",
			"nrm",
			"ibra",
			"imcra",
		];
	};

	/**
	 * Hide all layer types
	 */
	hideAllLayers = (): void => {
		this.state.visibleLayerTypes = [];
	};

	/**
	 * Toggle labels visibility
	 */
	toggleLabels = (): void => {
		this.state.showLabels = !this.state.showLabels;
	};

	/**
	 * Toggle colors visibility
	 */
	toggleColors = (): void => {
		this.state.showColors = !this.state.showColors;
	};

	/**
	 * Set map loading state
	 */
	setMapLoading = (loading: boolean): void => {
		this.state.mapLoading = loading;
	};

	/**
	 * Toggle map fullscreen mode
	 */
	toggleMapFullscreen = (): void => {
		this.state.mapFullscreen = !this.state.mapFullscreen;
		// Reset filters minimized when exiting fullscreen
		if (!this.state.mapFullscreen) {
			this.state.filtersMinimized = false;
		}
	};

	/**
	 * Toggle filters minimized state (only in fullscreen mode)
	 */
	toggleFiltersMinimized = (): void => {
		this.state.filtersMinimized = !this.state.filtersMinimized;
	};

	/**
	 * Select a marker (for highlighting)
	 */
	selectMarker = (coords: [number, number]): void => {
		// If clicking the same marker, deselect it
		if (
			this.state.selectedMarkerCoords &&
			this.state.selectedMarkerCoords[0] === coords[0] &&
			this.state.selectedMarkerCoords[1] === coords[1]
		) {
			this.state.selectedMarkerCoords = null;
		} else {
			this.state.selectedMarkerCoords = coords;
		}
	};

	/**
	 * Clear marker selection
	 */
	clearMarkerSelection = (): void => {
		this.state.selectedMarkerCoords = null;
	};

	/**
	 * Toggle visualization mode between markers and heatmap
	 */
	toggleVisualizationMode = (): void => {
		this.state.visualizationMode =
			this.state.visualizationMode === "markers" ? "heatmap" : "markers";
	};

	/**
	 * Set specific visualization mode
	 */
	setVisualizationMode = (mode: "markers" | "heatmap"): void => {
		this.state.visualizationMode = mode;
	};

	/**
	 * @returns True if any filters or search term are active (matches ProjectSearchStore)
	 */
	get hasActiveFilters(): boolean {
		return (
			this.state.searchTerm.length > 0 ||
			this.state.filters.selectedBusinessAreas.length > 0 ||
			this.state.filters.user !== null ||
			this.state.filters.status !== "" ||
			this.state.filters.kind !== "" ||
			(this.state.filters.year !== undefined &&
				this.state.filters.year !== 0) ||
			this.state.filters.onlyActive === true ||
			this.state.filters.onlyInactive === true
		);
	}

	/**
	 * @returns The number of active filters (matches ProjectSearchStore)
	 */
	get filterCount(): number {
		let count = 0;

		if (this.state.searchTerm.length > 0) count++;
		if (this.state.filters.selectedBusinessAreas.length > 0)
			count += this.state.filters.selectedBusinessAreas.length;
		if (this.state.filters.user !== null) count++;
		if (this.state.filters.status !== "") count++;
		if (this.state.filters.kind !== "") count++;
		if (this.state.filters.year !== undefined && this.state.filters.year !== 0)
			count++;
		if (this.state.filters.onlyActive) count++;
		if (this.state.filters.onlyInactive) count++;

		return count;
	}

	/**
	 * @returns URLSearchParams object constructed from current search state (matches ProjectSearchStore)
	 */
	get searchParams(): URLSearchParams {
		const params = new URLSearchParams();

		if (this.state.searchTerm) {
			params.set("search", this.state.searchTerm);
		}

		if (this.state.filters.selectedBusinessAreas.length > 0) {
			params.set(
				"businessAreas",
				this.state.filters.selectedBusinessAreas.join(",")
			);
		}

		if (this.state.filters.user) {
			params.set("user", this.state.filters.user.toString());
		}

		if (this.state.filters.status) {
			params.set("status", this.state.filters.status);
		}

		if (this.state.filters.kind) {
			params.set("kind", this.state.filters.kind);
		}

		if (this.state.filters.year && this.state.filters.year !== 0) {
			params.set("year", this.state.filters.year.toString());
		}

		if (this.state.filters.onlyActive) {
			params.set("onlyActive", "true");
		}

		if (this.state.filters.onlyInactive) {
			params.set("onlyInactive", "true");
		}

		return params;
	}

	/**
	 * Get selected business areas as a Set for efficient lookups
	 */
	get selectedBusinessAreas(): Set<number> {
		return new Set(this.state.filters.selectedBusinessAreas);
	}

	/**
	 * Get selected business areas as regular array (for React useEffect)
	 */
	get selectedBusinessAreasArray(): number[] {
		return [...this.state.filters.selectedBusinessAreas];
	}

	/**
	 * Check if a specific marker is selected
	 */
	get isMarkerSelected() {
		return (coords: [number, number]): boolean => {
			if (!this.state.selectedMarkerCoords) return false;
			return (
				this.state.selectedMarkerCoords[0] === coords[0] &&
				this.state.selectedMarkerCoords[1] === coords[1]
			);
		};
	}

	/**
	 * Check if currently in heatmap mode
	 */
	get isHeatmapMode(): boolean {
		return this.state.visualizationMode === "heatmap";
	}

	/**
	 * Check if currently in marker mode
	 */
	get isMarkerMode(): boolean {
		return this.state.visualizationMode === "markers";
	}

	/**
	 * Get filters object for TanStack Query (legacy compatibility)
	 */
	get mapFilters(): MapFilters {
		return {
			search: this.state.searchTerm,
			locations: this.state.selectedLocations,
			businessAreas: this.state.filters.selectedBusinessAreas,
			user: this.state.filters.user,
			status: this.state.filters.status,
			kind: this.state.filters.kind,
			year: this.state.filters.year,
			onlyActive: this.state.filters.onlyActive,
			onlyInactive: this.state.filters.onlyInactive,
		};
	}

	/**
	 * Get API parameters for project map queries
	 */
	get apiParams(): ProjectMapSearchParams {
		return {
			searchTerm: this.state.searchTerm || undefined,
			locations:
				this.state.selectedLocations.length > 0
					? this.state.selectedLocations
					: undefined,
			businessAreas:
				this.state.filters.selectedBusinessAreas.length > 0
					? this.state.filters.selectedBusinessAreas
					: undefined,
			user: this.state.filters.user || undefined,
			status: this.state.filters.status || undefined,
			kind: this.state.filters.kind || undefined,
			year: this.state.filters.year !== 0 ? this.state.filters.year : undefined,
			onlyActive: this.state.filters.onlyActive || undefined,
			onlyInactive: this.state.filters.onlyInactive || undefined,
		};
	}

	/**
	 * Reset store to initial state (matches ProjectSearchStore pattern)
	 */
	reset(): void {
		this.state = {
			// Search and filters
			searchTerm: "",
			filters: { ...DEFAULT_FILTERS },
			saveSearch: true,

			// Map-specific: Location filtering
			selectedLocations: [],

			// Map-specific: UI state
			sidebarOpen: true,
			visibleLayerTypes: ["dbcaregion"],
			showLabels: true,
			showColors: true,
			mapLoading: false,
			mapFullscreen: false,
			filtersMinimized: false,
			selectedMarkerCoords: null,
			visualizationMode: "markers",

			// Base state
			loading: false,
			error: null,
			initialised: false,
		};
	}

	/**
	 * Dispose store (required by BaseStore)
	 */
	async dispose(): Promise<void> {
		// No cleanup needed
	}
}
