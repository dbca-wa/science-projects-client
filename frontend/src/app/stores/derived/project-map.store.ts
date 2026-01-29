import { makeObservable, action, computed } from "mobx";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import type { MapFilters } from "@/features/projects/types/map.types";
import type { ProjectMapSearchParams } from "@/features/projects/services/project.service";

/**
 * Project Map Store State
 */
interface ProjectMapState extends BaseStoreState {
	// Sidebar
	sidebarOpen: boolean;

	// Filters (for filtering PROJECTS)
	searchTerm: string;
	selectedLocations: number[]; // For filtering projects by location
	selectedBusinessAreas: number[];
	filterUser: number | null;
	filterStatus: string;
	filterKind: string;
	filterYear: number;
	onlyActive: boolean;
	onlyInactive: boolean;
	saveSearch: boolean; // Add saveSearch functionality

	// Map UI (for GeoJSON LAYER visibility)
	visibleLayerTypes: string[]; // ["dbcaregion", "nrm", etc.]
	showLabels: boolean;
	showColors: boolean;
	mapLoading: boolean;
	mapFullscreen: boolean; // For map-only fullscreen mode
	filtersMinimized: boolean; // For minimizing filters in fullscreen mode

	// Marker Selection (for highlighting selected markers)
	selectedMarkerCoords: [number, number] | null; // Coordinates of selected marker

	// Heatmap Visualization
	visualizationMode: 'markers' | 'heatmap'; // Current visualization mode
}

/**
 * ProjectMapStore
 * 
 * Manages client-side state for the Project Map feature.
 * Uses MobX for reactive state management.
 * 
 * State includes:
 * - Sidebar visibility
 * - Filter selections (search, locations, business areas, user, status, kind, year)
 * - Map UI settings (labels, colors, loading)
 * 
 * All API data (projects, locations, business areas) is managed by TanStack Query.
 */
export class ProjectMapStore extends BaseStore<ProjectMapState> {
	constructor() {
		super({
			// Sidebar
			sidebarOpen: true,

			// Filters
			searchTerm: "",
			selectedLocations: [],
			selectedBusinessAreas: [],
			filterUser: null,
			filterStatus: "",
			filterKind: "",
			filterYear: 0,
			onlyActive: false,
			onlyInactive: false,
			saveSearch: true, // Default to true like other search stores

			// Map UI
			visibleLayerTypes: ["dbcaregion"], // Start with DBCA Regions visible
			showLabels: true,
			showColors: true,
			mapLoading: false,
			mapFullscreen: false,
			filtersMinimized: false, // Default to expanded filters

			// Marker Selection
			selectedMarkerCoords: null,

			// Heatmap Visualization
			visualizationMode: 'markers', // Default to marker mode

			// Base state
			loading: false,
			error: null,
			initialised: false,
		});

		// Use makeObservable for classes with inheritance
		makeObservable(this, {
			// Actions
			toggleSidebar: action,
			setSearchTerm: action,
			toggleLocation: action,
			selectLocations: action,
			deselectLocations: action,
			toggleBusinessArea: action,
			showLayer: action,
			hideLayer: action,
			toggleLayerType: action,
			showAllLayers: action,
			hideAllLayers: action,
			setFilterUser: action,
			setFilterStatus: action,
			setFilterKind: action,
			setFilterYear: action,
			setOnlyActive: action,
			setOnlyInactive: action,
			toggleLabels: action,
			toggleColors: action,
			setMapLoading: action,
			toggleMapFullscreen: action,
			toggleFiltersMinimized: action,
			clearFilters: action,
			resetAllFilters: action,
			checkAllBusinessAreas: action,
			uncheckAllBusinessAreas: action,
			selectMarker: action,
			clearMarkerSelection: action,
			toggleSaveSearch: action,
			setSaveSearch: action,
			clearState: action,
			setCurrentPage: action,
			setFilters: action,

			// Heatmap actions
			toggleVisualizationMode: action,
			setVisualizationMode: action,

			// Computed
			filters: computed,
			apiParams: computed,
			hasActiveFilters: computed,
			selectedBusinessAreas: computed,
			selectedBusinessAreasArray: computed,
			isMarkerSelected: computed,

			// Heatmap computed
			isHeatmapMode: computed,
			isMarkerMode: computed,
		});
	}

	/**
	 * Toggle sidebar visibility
	 */
	toggleSidebar = (): void => {
		this.state.sidebarOpen = !this.state.sidebarOpen;
	};

	/**
	 * Set search term
	 */
	setSearchTerm = (term: string): void => {
		this.state.searchTerm = term;
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
	 * Toggle business area selection
	 */
	toggleBusinessArea = (baId: number): void => {
		const index = this.state.selectedBusinessAreas.indexOf(baId);
		if (index > -1) {
			this.state.selectedBusinessAreas.splice(index, 1);
		} else {
			this.state.selectedBusinessAreas.push(baId);
		}
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
		this.state.visibleLayerTypes = ["dbcaregion", "dbcadistrict", "nrm", "ibra", "imcra"];
	};

	/**
	 * Hide all layer types
	 */
	hideAllLayers = (): void => {
		this.state.visibleLayerTypes = [];
	};

	/**
	 * Set filter user
	 */
	setFilterUser = (userId: number | null): void => {
		this.state.filterUser = userId;
	};

	/**
	 * Set filter status
	 */
	setFilterStatus = (status: string): void => {
		this.state.filterStatus = status;
	};

	/**
	 * Set filter kind
	 */
	setFilterKind = (kind: string): void => {
		this.state.filterKind = kind;
	};

	/**
	 * Set filter year
	 */
	setFilterYear = (year: number): void => {
		this.state.filterYear = year;
	};

	/**
	 * Set only active filter
	 */
	setOnlyActive = (value: boolean): void => {
		this.state.onlyActive = value;
		if (value) {
			this.state.onlyInactive = false;
		}
	};

	/**
	 * Set only inactive filter
	 */
	setOnlyInactive = (value: boolean): void => {
		this.state.onlyInactive = value;
		if (value) {
			this.state.onlyActive = false;
		}
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
	 * Clear all filters
	 */
	clearFilters = (): void => {
		this.state.searchTerm = "";
		this.state.selectedLocations = [];
		this.state.selectedBusinessAreas = [];
		this.state.filterUser = null;
		this.state.filterStatus = "";
		this.state.filterKind = "";
		this.state.filterYear = 0;
		this.state.onlyActive = false;
		this.state.onlyInactive = false;
	};

	/**
	 * Reset all filters (alias for clearFilters for better naming)
	 */
	resetAllFilters = (): void => {
		this.clearFilters();
	};

	/**
	 * Check all business areas
	 */
	checkAllBusinessAreas = (businessAreaIds: number[]): void => {
		this.state.selectedBusinessAreas = [...businessAreaIds];
	};

	/**
	 * Uncheck all business areas
	 */
	uncheckAllBusinessAreas = (): void => {
		this.state.selectedBusinessAreas = [];
	};

	/**
	 * Select a marker (for highlighting)
	 */
	selectMarker = (coords: [number, number]): void => {
		// If clicking the same marker, deselect it
		if (this.state.selectedMarkerCoords && 
			this.state.selectedMarkerCoords[0] === coords[0] && 
			this.state.selectedMarkerCoords[1] === coords[1]) {
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
	 * Toggle save search
	 */
	toggleSaveSearch = (): void => {
		this.state.saveSearch = !this.state.saveSearch;
		
		// Immediately save the saveSearch state to localStorage
		// This is needed so useSearchStoreInit knows the user's preference on next page load
		if (typeof window !== "undefined") {
			if (this.state.saveSearch) {
				// If turning ON, save current state with ALL filters
				const stateToSave = {
					searchTerm: this.state.searchTerm,
					selectedBusinessAreas: [...this.state.selectedBusinessAreas],
					filterUser: this.state.filterUser,
					filterStatus: this.state.filterStatus,
					filterKind: this.state.filterKind,
					filterYear: this.state.filterYear,
					onlyActive: this.state.onlyActive,
					onlyInactive: this.state.onlyInactive,
					saveSearch: this.state.saveSearch,
				};
				localStorage.setItem("projectMapState", JSON.stringify(stateToSave));
			} else {
				// If turning OFF, save only the saveSearch: false flag
				localStorage.setItem("projectMapState", JSON.stringify({ saveSearch: false }));
			}
		}
	};

	/**
	 * Set save search state (action for MobX strict mode)
	 */
	setSaveSearch = (value: boolean): void => {
		this.state.saveSearch = value;
		
		// Immediately save the saveSearch state to localStorage
		if (typeof window !== "undefined") {
			if (value) {
				// If turning ON, save current state with ALL filters
				const stateToSave = {
					searchTerm: this.state.searchTerm,
					selectedBusinessAreas: [...this.state.selectedBusinessAreas],
					filterUser: this.state.filterUser,
					filterStatus: this.state.filterStatus,
					filterKind: this.state.filterKind,
					filterYear: this.state.filterYear,
					onlyActive: this.state.onlyActive,
					onlyInactive: this.state.onlyInactive,
					saveSearch: value,
				};
				localStorage.setItem("projectMapState", JSON.stringify(stateToSave));
			} else {
				// If turning OFF, save only the saveSearch: false flag
				localStorage.setItem("projectMapState", JSON.stringify({ saveSearch: false }));
			}
		}
	};

	/**
	 * Clear state (required for useSearchStoreInit)
	 */
	clearState = (): void => {
		this.clearFilters();
	};

	/**
	 * Set current page (required for useSearchStoreInit compatibility)
	 */
	setCurrentPage = (_page: number): void => {
		// Map doesn't have pagination, but we need this for compatibility
		// Could be used for future pagination if needed
	};

	/**
	 * Set filters (required for useSearchStoreInit compatibility)
	 */
	setFilters = (filters: Partial<{
		businessAreas: number[];
		user: number | null;
		searchTerm: string;
		search: string; // Add search as alias for searchTerm
		status: string;
		kind: string;
		year: number;
		onlyActive: boolean;
		onlyInactive: boolean;
	}>): void => {
		if (filters.businessAreas !== undefined) {
			this.state.selectedBusinessAreas = filters.businessAreas;
		}
		if (filters.user !== undefined) {
			this.state.filterUser = filters.user;
		}
		if (filters.searchTerm !== undefined) {
			this.state.searchTerm = filters.searchTerm;
		}
		if (filters.search !== undefined) {
			this.state.searchTerm = filters.search; // Handle search as alias for searchTerm
		}
		if (filters.status !== undefined) {
			this.state.filterStatus = filters.status;
		}
		if (filters.kind !== undefined) {
			this.state.filterKind = filters.kind;
		}
		if (filters.year !== undefined) {
			this.state.filterYear = filters.year;
		}
		if (filters.onlyActive !== undefined) {
			this.state.onlyActive = filters.onlyActive;
		}
		if (filters.onlyInactive !== undefined) {
			this.state.onlyInactive = filters.onlyInactive;
		}
	};

	/**
	 * Toggle visualization mode between markers and heatmap
	 */
	toggleVisualizationMode = (): void => {
		this.state.visualizationMode = 
			this.state.visualizationMode === 'markers' ? 'heatmap' : 'markers';
	};

	/**
	 * Set specific visualization mode
	 */
	setVisualizationMode = (mode: 'markers' | 'heatmap'): void => {
		this.state.visualizationMode = mode;
	};

	/**
	 * Get filters object for TanStack Query
	 */
	get filters(): MapFilters {
		return {
			search: this.state.searchTerm,
			locations: this.state.selectedLocations,
			businessAreas: this.state.selectedBusinessAreas,
			user: this.state.filterUser,
			status: this.state.filterStatus,
			kind: this.state.filterKind,
			year: this.state.filterYear,
			onlyActive: this.state.onlyActive,
			onlyInactive: this.state.onlyInactive,
		};
	}

	/**
	 * Get API parameters for project map queries
	 */
	get apiParams(): ProjectMapSearchParams {
		return {
			searchTerm: this.state.searchTerm || undefined,
			locations: this.state.selectedLocations.length > 0 ? this.state.selectedLocations : undefined,
			businessAreas: this.state.selectedBusinessAreas.length > 0 ? this.state.selectedBusinessAreas : undefined,
			user: this.state.filterUser || undefined,
			status: this.state.filterStatus || undefined,
			kind: this.state.filterKind || undefined,
			year: this.state.filterYear !== 0 ? this.state.filterYear : undefined,
			onlyActive: this.state.onlyActive || undefined,
			onlyInactive: this.state.onlyInactive || undefined,
		};
	}

	/**
	 * Get selected business areas as a Set for efficient lookups
	 */
	get selectedBusinessAreas(): Set<number> {
		return new Set(this.state.selectedBusinessAreas);
	}

	/**
	 * Get selected business areas as regular array (for React useEffect)
	 */
	get selectedBusinessAreasArray(): number[] {
		return [...this.state.selectedBusinessAreas];
	}

	/**
	 * Check if any filters are active
	 */
	get hasActiveFilters(): boolean {
		return (
			this.state.searchTerm !== "" ||
			this.state.selectedLocations.length > 0 ||
			this.state.selectedBusinessAreas.length > 0 ||
			this.state.filterUser !== null ||
			this.state.filterStatus !== "" ||
			this.state.filterKind !== "" ||
			this.state.onlyActive ||
			this.state.onlyInactive
		);
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
		return this.state.visualizationMode === 'heatmap';
	}

	/**
	 * Check if currently in marker mode
	 */
	get isMarkerMode(): boolean {
		return this.state.visualizationMode === 'markers';
	}

	/**
	 * Initialize store (required by BaseStore)
	 */
	async initialise(): Promise<void> {
		this.state.initialised = true;
	}

	/**
	 * Reset store to initial state (required by BaseStore)
	 */
	reset(): void {
		this.state.sidebarOpen = true;
		this.state.searchTerm = "";
		this.state.selectedLocations = [];
		this.state.selectedBusinessAreas = [];
		this.state.filterUser = null;
		this.state.filterStatus = "";
		this.state.filterKind = "";
		this.state.filterYear = new Date().getFullYear();
		this.state.onlyActive = false;
		this.state.onlyInactive = false;
		this.state.visibleLayerTypes = ["dbcaregion"];
		this.state.showLabels = true;
		this.state.showColors = true;
		this.state.mapLoading = false;
		this.state.mapFullscreen = false;
		this.state.filtersMinimized = false;
		this.state.selectedMarkerCoords = null;
		this.state.visualizationMode = 'markers'; // Reset to marker mode
		this.state.saveSearch = true;
		this.state.loading = false;
		this.state.error = null;
	}

	/**
	 * Dispose store (required by BaseStore)
	 */
	async dispose(): Promise<void> {
		// No cleanup needed
	}
}
