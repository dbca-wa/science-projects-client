import { makeObservable, action, computed } from "mobx";
import { BaseStore, type BaseStoreState } from "@/app/stores/base.store";
import type { MapFilters } from "@/features/projects/types/map.types";

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

	// Map UI (for GeoJSON LAYER visibility)
	visibleLayerTypes: string[]; // ["dbcaregion", "nrm", etc.]
	showLabels: boolean;
	showColors: boolean;
	mapLoading: boolean;
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
			filterYear: new Date().getFullYear(),
			onlyActive: false,
			onlyInactive: false,

			// Map UI
			visibleLayerTypes: ["dbcaregion"], // Start with DBCA Regions visible
			showLabels: true,
			showColors: true,
			mapLoading: false,

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
			clearFilters: action,
			checkAllBusinessAreas: action,
			uncheckAllBusinessAreas: action,

			// Computed
			filters: computed,
			hasActiveFilters: computed,
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
	 * Clear all filters
	 */
	clearFilters = (): void => {
		this.state.searchTerm = "";
		this.state.selectedLocations = [];
		this.state.selectedBusinessAreas = [];
		this.state.filterUser = null;
		this.state.filterStatus = "";
		this.state.filterKind = "";
		this.state.filterYear = new Date().getFullYear();
		this.state.onlyActive = false;
		this.state.onlyInactive = false;
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
