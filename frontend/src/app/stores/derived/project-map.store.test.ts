import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ProjectMapStore } from "./project-map.store";

describe("ProjectMapStore", () => {
	let store: ProjectMapStore;

	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
		store = new ProjectMapStore();
	});

	afterEach(() => {
		localStorage.clear();
	});

	describe("Initialization", () => {
		it("should initialize with default state", () => {
			expect(store.state.searchTerm).toBe("");
			expect(store.state.filters.selectedBusinessAreas).toEqual([]);
			expect(store.state.filters.user).toBe(null);
			expect(store.state.filters.status).toBe("");
			expect(store.state.filters.kind).toBe("");
			expect(store.state.filters.year).toBe(0);
			expect(store.state.filters.onlyActive).toBe(false);
			expect(store.state.filters.onlyInactive).toBe(false);
			expect(store.state.selectedLocations).toEqual([]);
			expect(store.state.sidebarOpen).toBe(true);
			expect(store.state.visibleLayerTypes).toEqual(["dbcaregion"]);
			expect(store.state.showLabels).toBe(true);
			expect(store.state.showColors).toBe(true);
			expect(store.state.mapLoading).toBe(false);
			expect(store.state.mapFullscreen).toBe(false);
			expect(store.state.filtersMinimized).toBe(false);
			expect(store.state.selectedMarkerCoords).toBe(null);
			expect(store.state.visualizationMode).toBe("markers");
			expect(store.state.saveSearch).toBe(true);
		});

		it("should mark as initialized after calling initialise", async () => {
			expect(store.state.initialised).toBe(false);
			await store.initialise();
			expect(store.state.initialised).toBe(true);
		});
	});

	describe("Search Term", () => {
		it("should set search term", () => {
			store.setSearchTerm("test project");
			expect(store.state.searchTerm).toBe("test project");
		});

		it("should save to localStorage when setting search term", () => {
			store.setSearchTerm("test");
			const stored = localStorage.getItem("projectMapState");
			expect(stored).toBeTruthy();
			const parsed = JSON.parse(stored!);
			expect(parsed.searchTerm).toBe("test");
		});
	});

	describe("Business Area Filters", () => {
		it("should set business area filters", () => {
			store.setFilters({ selectedBusinessAreas: [1, 2, 3] });
			expect(store.state.filters.selectedBusinessAreas).toEqual([1, 2, 3]);
		});

		it("should get selected business areas as Set", () => {
			store.setFilters({ selectedBusinessAreas: [1, 2, 3] });
			const set = store.selectedBusinessAreas;
			expect(set.has(1)).toBe(true);
			expect(set.has(2)).toBe(true);
			expect(set.has(3)).toBe(true);
			expect(set.has(4)).toBe(false);
		});

		it("should get selected business areas as array", () => {
			store.setFilters({ selectedBusinessAreas: [1, 2, 3] });
			expect(store.selectedBusinessAreasArray).toEqual([1, 2, 3]);
		});
	});

	describe("Other Filters", () => {
		it("should set user filter", () => {
			store.setFilters({ user: 123 });
			expect(store.state.filters.user).toBe(123);
		});

		it("should set status filter", () => {
			store.setFilters({ status: "active" });
			expect(store.state.filters.status).toBe("active");
		});

		it("should set kind filter", () => {
			store.setFilters({ kind: "science" });
			expect(store.state.filters.kind).toBe("science");
		});

		it("should set year filter", () => {
			store.setFilters({ year: 2024 });
			expect(store.state.filters.year).toBe(2024);
		});

		it("should set onlyActive filter", () => {
			store.setFilters({ onlyActive: true });
			expect(store.state.filters.onlyActive).toBe(true);
		});

		it("should set onlyInactive filter", () => {
			store.setFilters({ onlyInactive: true });
			expect(store.state.filters.onlyInactive).toBe(true);
		});

		it("should set multiple filters at once", () => {
			store.setFilters({
				selectedBusinessAreas: [1, 2],
				user: 123,
				status: "active",
				year: 2024,
			});
			expect(store.state.filters.selectedBusinessAreas).toEqual([1, 2]);
			expect(store.state.filters.user).toBe(123);
			expect(store.state.filters.status).toBe("active");
			expect(store.state.filters.year).toBe(2024);
		});
	});

	describe("Reset Filters", () => {
		it("should reset all filters to defaults", () => {
			store.setSearchTerm("test");
			store.setFilters({
				selectedBusinessAreas: [1, 2],
				user: 123,
				status: "active",
				year: 2024,
				onlyActive: true,
			});

			store.resetFilters();

			expect(store.state.searchTerm).toBe("");
			expect(store.state.filters.selectedBusinessAreas).toEqual([]);
			expect(store.state.filters.user).toBe(null);
			expect(store.state.filters.status).toBe("");
			expect(store.state.filters.kind).toBe("");
			expect(store.state.filters.year).toBe(0);
			expect(store.state.filters.onlyActive).toBe(false);
			expect(store.state.filters.onlyInactive).toBe(false);
		});

		it("should reset display settings to defaults", () => {
			// Change display settings
			store.setVisualizationMode("heatmap");
			store.showAllLayers();
			store.toggleLabels(); // Set to false
			store.toggleColors(); // Set to false

			// Reset filters
			store.resetFilters();

			// Verify display settings are reset
			expect(store.state.visualizationMode).toBe("markers");
			expect(store.state.visibleLayerTypes).toEqual(["dbcaregion"]);
			expect(store.state.showLabels).toBe(true);
			expect(store.state.showColors).toBe(true);
		});
	});

	describe("hasActiveFilters", () => {
		it("should return false when no filters are active", () => {
			expect(store.hasActiveFilters).toBe(false);
		});

		it("should return true when search term is set", () => {
			store.setSearchTerm("test");
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true when business areas are selected", () => {
			store.setFilters({ selectedBusinessAreas: [1] });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true when user filter is set", () => {
			store.setFilters({ user: 123 });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true when status filter is set", () => {
			store.setFilters({ status: "active" });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true when kind filter is set", () => {
			store.setFilters({ kind: "science" });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true when year filter is set", () => {
			store.setFilters({ year: 2024 });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true when onlyActive is set", () => {
			store.setFilters({ onlyActive: true });
			expect(store.hasActiveFilters).toBe(true);
		});

		it("should return true when onlyInactive is set", () => {
			store.setFilters({ onlyInactive: true });
			expect(store.hasActiveFilters).toBe(true);
		});
	});

	describe("filterCount", () => {
		it("should return 0 when no filters are active", () => {
			expect(store.filterCount).toBe(0);
		});

		it("should count search term as 1", () => {
			store.setSearchTerm("test");
			expect(store.filterCount).toBe(1);
		});

		it("should count each business area", () => {
			store.setFilters({ selectedBusinessAreas: [1, 2, 3] });
			expect(store.filterCount).toBe(3);
		});

		it("should count all active filters", () => {
			store.setSearchTerm("test");
			store.setFilters({
				selectedBusinessAreas: [1, 2],
				user: 123,
				status: "active",
				year: 2024,
				onlyActive: true,
			});
			// 1 (search) + 2 (business areas) + 1 (user) + 1 (status) + 1 (year) + 1 (onlyActive) = 7
			expect(store.filterCount).toBe(7);
		});
	});

	describe("searchParams", () => {
		it("should return empty params when no filters are active", () => {
			const params = store.searchParams;
			expect(params.toString()).toBe("");
		});

		it("should include search term", () => {
			store.setSearchTerm("test");
			const params = store.searchParams;
			expect(params.get("search")).toBe("test");
		});

		it("should include business areas as comma-separated", () => {
			store.setFilters({ selectedBusinessAreas: [1, 2, 3] });
			const params = store.searchParams;
			expect(params.get("businessAreas")).toBe("1,2,3");
		});

		it("should include all filters", () => {
			store.setSearchTerm("test");
			store.setFilters({
				selectedBusinessAreas: [1, 2],
				user: 123,
				status: "active",
				kind: "science",
				year: 2024,
				onlyActive: true,
			});
			const params = store.searchParams;
			expect(params.get("search")).toBe("test");
			expect(params.get("businessAreas")).toBe("1,2");
			expect(params.get("user")).toBe("123");
			expect(params.get("status")).toBe("active");
			expect(params.get("kind")).toBe("science");
			expect(params.get("year")).toBe("2024");
			expect(params.get("onlyActive")).toBe("true");
		});
	});

	describe("Location Filtering", () => {
		it("should toggle location selection", () => {
			store.toggleLocation(1);
			expect(store.state.selectedLocations).toContain(1);

			store.toggleLocation(1);
			expect(store.state.selectedLocations).not.toContain(1);
		});

		it("should select multiple locations", () => {
			store.selectLocations([1, 2, 3]);
			expect(store.state.selectedLocations).toEqual([1, 2, 3]);
		});

		it("should not duplicate locations when selecting", () => {
			store.selectLocations([1, 2]);
			store.selectLocations([2, 3]);
			expect(store.state.selectedLocations).toEqual([1, 2, 3]);
		});

		it("should deselect multiple locations", () => {
			store.selectLocations([1, 2, 3, 4]);
			store.deselectLocations([2, 3]);
			expect(store.state.selectedLocations).toEqual([1, 4]);
		});
	});

	describe("Layer Visibility", () => {
		it("should toggle layer type", () => {
			expect(store.state.visibleLayerTypes).toContain("dbcaregion");
			store.toggleLayerType("dbcaregion");
			expect(store.state.visibleLayerTypes).not.toContain("dbcaregion");
			store.toggleLayerType("dbcaregion");
			expect(store.state.visibleLayerTypes).toContain("dbcaregion");
		});

		it("should show layer", () => {
			store.showLayer("nrm");
			expect(store.state.visibleLayerTypes).toContain("nrm");
		});

		it("should not duplicate layer when showing", () => {
			store.showLayer("nrm");
			store.showLayer("nrm");
			const count = store.state.visibleLayerTypes.filter(
				(l) => l === "nrm"
			).length;
			expect(count).toBe(1);
		});

		it("should hide layer", () => {
			store.showLayer("nrm");
			store.hideLayer("nrm");
			expect(store.state.visibleLayerTypes).not.toContain("nrm");
		});

		it("should show all layers", () => {
			store.showAllLayers();
			expect(store.state.visibleLayerTypes).toEqual([
				"dbcaregion",
				"dbcadistrict",
				"nrm",
				"ibra",
				"imcra",
			]);
		});

		it("should hide all layers", () => {
			store.hideAllLayers();
			expect(store.state.visibleLayerTypes).toEqual([]);
		});
	});

	describe("UI State", () => {
		it("should toggle sidebar", () => {
			expect(store.state.sidebarOpen).toBe(true);
			store.toggleSidebar();
			expect(store.state.sidebarOpen).toBe(false);
			store.toggleSidebar();
			expect(store.state.sidebarOpen).toBe(true);
		});

		it("should toggle labels", () => {
			expect(store.state.showLabels).toBe(true);
			store.toggleLabels();
			expect(store.state.showLabels).toBe(false);
			store.toggleLabels();
			expect(store.state.showLabels).toBe(true);
		});

		it("should toggle colors", () => {
			expect(store.state.showColors).toBe(true);
			store.toggleColors();
			expect(store.state.showColors).toBe(false);
			store.toggleColors();
			expect(store.state.showColors).toBe(true);
		});

		it("should set map loading", () => {
			store.setMapLoading(true);
			expect(store.state.mapLoading).toBe(true);
			store.setMapLoading(false);
			expect(store.state.mapLoading).toBe(false);
		});

		it("should toggle map fullscreen", () => {
			store.toggleMapFullscreen();
			expect(store.state.mapFullscreen).toBe(true);
			store.toggleMapFullscreen();
			expect(store.state.mapFullscreen).toBe(false);
		});

		it("should reset filters minimized when exiting fullscreen", () => {
			store.toggleMapFullscreen(); // Enter fullscreen
			store.toggleFiltersMinimized(); // Minimize filters
			expect(store.state.filtersMinimized).toBe(true);
			store.toggleMapFullscreen(); // Exit fullscreen
			expect(store.state.filtersMinimized).toBe(false);
		});

		it("should toggle filters minimized", () => {
			store.toggleFiltersMinimized();
			expect(store.state.filtersMinimized).toBe(true);
			store.toggleFiltersMinimized();
			expect(store.state.filtersMinimized).toBe(false);
		});
	});

	describe("Marker Selection", () => {
		it("should select marker", () => {
			const coords: [number, number] = [115.8, -32.0];
			store.selectMarker(coords);
			expect(store.state.selectedMarkerCoords).toEqual(coords);
		});

		it("should deselect marker when clicking same marker", () => {
			const coords: [number, number] = [115.8, -32.0];
			store.selectMarker(coords);
			store.selectMarker(coords);
			expect(store.state.selectedMarkerCoords).toBe(null);
		});

		it("should clear marker selection", () => {
			const coords: [number, number] = [115.8, -32.0];
			store.selectMarker(coords);
			store.clearMarkerSelection();
			expect(store.state.selectedMarkerCoords).toBe(null);
		});

		it("should check if marker is selected", () => {
			const coords: [number, number] = [115.8, -32.0];
			store.selectMarker(coords);
			expect(store.isMarkerSelected(coords)).toBe(true);
			expect(store.isMarkerSelected([115.9, -32.1])).toBe(false);
		});
	});

	describe("Visualization Mode", () => {
		it("should toggle visualization mode", () => {
			expect(store.state.visualizationMode).toBe("markers");
			store.toggleVisualizationMode();
			expect(store.state.visualizationMode).toBe("heatmap");
			store.toggleVisualizationMode();
			expect(store.state.visualizationMode).toBe("markers");
		});

		it("should set visualization mode", () => {
			store.setVisualizationMode("heatmap");
			expect(store.state.visualizationMode).toBe("heatmap");
			store.setVisualizationMode("markers");
			expect(store.state.visualizationMode).toBe("markers");
		});

		it("should check if in heatmap mode", () => {
			store.setVisualizationMode("heatmap");
			expect(store.isHeatmapMode).toBe(true);
			expect(store.isMarkerMode).toBe(false);
		});

		it("should check if in marker mode", () => {
			store.setVisualizationMode("markers");
			expect(store.isMarkerMode).toBe(true);
			expect(store.isHeatmapMode).toBe(false);
		});
	});

	describe("API Parameters", () => {
		it("should return empty object when no filters", () => {
			const params = store.apiParams;
			expect(params.searchTerm).toBeUndefined();
			expect(params.locations).toBeUndefined();
			expect(params.businessAreas).toBeUndefined();
			expect(params.user).toBeUndefined();
			expect(params.status).toBeUndefined();
			expect(params.kind).toBeUndefined();
			expect(params.year).toBeUndefined();
			expect(params.onlyActive).toBeUndefined();
			expect(params.onlyInactive).toBeUndefined();
		});

		it("should include all active filters", () => {
			store.setSearchTerm("test");
			store.selectLocations([1, 2]);
			store.setFilters({
				selectedBusinessAreas: [3, 4],
				user: 123,
				status: "active",
				kind: "science",
				year: 2024,
				onlyActive: true,
			});

			const params = store.apiParams;
			expect(params.searchTerm).toBe("test");
			expect(params.locations).toEqual([1, 2]);
			expect(params.businessAreas).toEqual([3, 4]);
			expect(params.user).toBe(123);
			expect(params.status).toBe("active");
			expect(params.kind).toBe("science");
			expect(params.year).toBe(2024);
			expect(params.onlyActive).toBe(true);
		});
	});

	describe("LocalStorage Persistence", () => {
		it("should save state to localStorage when saveSearch is true", () => {
			store.setSearchTerm("test");
			const stored = localStorage.getItem("projectMapState");
			expect(stored).toBeTruthy();
		});

		it("should not save to localStorage when saveSearch is false", () => {
			store.setSaveSearch(false);
			store.setSearchTerm("test");
			const stored = localStorage.getItem("projectMapState");
			expect(stored).toBeFalsy();
		});

		it("should restore state from localStorage on initialization", () => {
			// Set some state and save
			store.setSearchTerm("test");
			store.setFilters({ selectedBusinessAreas: [1, 2] });

			// Create new store instance
			const newStore = new ProjectMapStore();
			expect(newStore.state.searchTerm).toBe("test");
			expect(newStore.state.filters.selectedBusinessAreas).toEqual([1, 2]);
		});

		it("should clear state and remove from localStorage", () => {
			store.setSearchTerm("test");
			store.setFilters({ selectedBusinessAreas: [1, 2] });
			store.clearState();

			expect(store.state.searchTerm).toBe("");
			expect(store.state.filters.selectedBusinessAreas).toEqual([]);
			expect(localStorage.getItem("projectMapState")).toBeFalsy();
		});

		it("should toggle saveSearch", () => {
			expect(store.state.saveSearch).toBe(true);
			store.toggleSaveSearch();
			expect(store.state.saveSearch).toBe(false);
			store.toggleSaveSearch();
			expect(store.state.saveSearch).toBe(true);
		});
	});

	describe("Display Settings Persistence", () => {
		describe("Visualization Mode", () => {
			it("should persist visualization mode to localStorage", () => {
				store.setVisualizationMode("heatmap");
				const stored = localStorage.getItem("projectMapState");
				expect(stored).toBeTruthy();
				const parsed = JSON.parse(stored!);
				expect(parsed.visualizationMode).toBe("heatmap");
			});

			it("should restore visualization mode from localStorage", () => {
				store.setVisualizationMode("heatmap");
				const newStore = new ProjectMapStore();
				expect(newStore.state.visualizationMode).toBe("heatmap");
			});

			it("should persist when toggling visualization mode", () => {
				store.toggleVisualizationMode(); // markers -> heatmap
				const stored = localStorage.getItem("projectMapState");
				const parsed = JSON.parse(stored!);
				expect(parsed.visualizationMode).toBe("heatmap");
			});
		});

		describe("Layer Visibility", () => {
			it("should persist layer visibility when toggling", () => {
				store.toggleLayerType("nrm");
				const stored = localStorage.getItem("projectMapState");
				const parsed = JSON.parse(stored!);
				expect(parsed.visibleLayerTypes).toContain("nrm");
			});

			it("should persist when showing a layer", () => {
				store.showLayer("ibra");
				const stored = localStorage.getItem("projectMapState");
				const parsed = JSON.parse(stored!);
				expect(parsed.visibleLayerTypes).toContain("ibra");
			});

			it("should persist when hiding a layer", () => {
				store.hideLayer("dbcaregion");
				const stored = localStorage.getItem("projectMapState");
				const parsed = JSON.parse(stored!);
				expect(parsed.visibleLayerTypes).not.toContain("dbcaregion");
			});

			it("should persist when showing all layers", () => {
				store.showAllLayers();
				const stored = localStorage.getItem("projectMapState");
				const parsed = JSON.parse(stored!);
				expect(parsed.visibleLayerTypes).toEqual([
					"dbcaregion",
					"dbcadistrict",
					"nrm",
					"ibra",
					"imcra",
				]);
			});

			it("should persist when hiding all layers", () => {
				store.hideAllLayers();
				const stored = localStorage.getItem("projectMapState");
				const parsed = JSON.parse(stored!);
				expect(parsed.visibleLayerTypes).toEqual([]);
			});

			it("should restore layer visibility from localStorage", () => {
				store.showAllLayers();
				const newStore = new ProjectMapStore();
				expect(newStore.state.visibleLayerTypes).toEqual([
					"dbcaregion",
					"dbcadistrict",
					"nrm",
					"ibra",
					"imcra",
				]);
			});
		});

		describe("Display Options", () => {
			it("should persist showLabels when toggling", () => {
				store.toggleLabels();
				const stored = localStorage.getItem("projectMapState");
				const parsed = JSON.parse(stored!);
				expect(parsed.showLabels).toBe(false);
			});

			it("should persist showColors when toggling", () => {
				store.toggleColors();
				const stored = localStorage.getItem("projectMapState");
				const parsed = JSON.parse(stored!);
				expect(parsed.showColors).toBe(false);
			});

			it("should restore showLabels from localStorage", () => {
				store.toggleLabels(); // Set to false
				const newStore = new ProjectMapStore();
				expect(newStore.state.showLabels).toBe(false);
			});

			it("should restore showColors from localStorage", () => {
				store.toggleColors(); // Set to false
				const newStore = new ProjectMapStore();
				expect(newStore.state.showColors).toBe(false);
			});
		});

		describe("SaveSearch Toggle", () => {
			it("should not persist display settings when saveSearch is false", () => {
				store.setSaveSearch(false);
				store.setVisualizationMode("heatmap");
				const stored = localStorage.getItem("projectMapState");
				expect(stored).toBeFalsy();
			});

			it("should persist display settings when saveSearch is true", () => {
				store.setSaveSearch(true);
				store.setVisualizationMode("heatmap");
				const stored = localStorage.getItem("projectMapState");
				expect(stored).toBeTruthy();
				const parsed = JSON.parse(stored!);
				expect(parsed.visualizationMode).toBe("heatmap");
			});

			it("should clear localStorage when saveSearch is disabled", () => {
				store.setVisualizationMode("heatmap");
				expect(localStorage.getItem("projectMapState")).toBeTruthy();
				store.setSaveSearch(false);
				expect(localStorage.getItem("projectMapState")).toBeFalsy();
			});
		});

		describe("Backward Compatibility", () => {
			it("should apply defaults for missing visualization mode", () => {
				// Simulate old localStorage without visualizationMode
				const oldState = {
					searchTerm: "test",
					filters: {
						selectedBusinessAreas: [],
						user: null,
						status: "",
						kind: "",
						year: 0,
						onlyActive: false,
						onlyInactive: false,
					},
					saveSearch: true,
				};
				localStorage.setItem("projectMapState", JSON.stringify(oldState));

				const newStore = new ProjectMapStore();
				expect(newStore.state.visualizationMode).toBe("markers");
				expect(newStore.state.searchTerm).toBe("test");
			});

			it("should apply defaults for missing layer visibility", () => {
				const oldState = {
					searchTerm: "test",
					filters: {
						selectedBusinessAreas: [],
						user: null,
						status: "",
						kind: "",
						year: 0,
						onlyActive: false,
						onlyInactive: false,
					},
					saveSearch: true,
				};
				localStorage.setItem("projectMapState", JSON.stringify(oldState));

				const newStore = new ProjectMapStore();
				expect(newStore.state.visibleLayerTypes).toEqual(["dbcaregion"]);
			});

			it("should apply defaults for missing display options", () => {
				const oldState = {
					searchTerm: "test",
					filters: {
						selectedBusinessAreas: [],
						user: null,
						status: "",
						kind: "",
						year: 0,
						onlyActive: false,
						onlyInactive: false,
					},
					saveSearch: true,
				};
				localStorage.setItem("projectMapState", JSON.stringify(oldState));

				const newStore = new ProjectMapStore();
				expect(newStore.state.showLabels).toBe(true);
				expect(newStore.state.showColors).toBe(true);
			});

			it("should handle partial new fields", () => {
				const partialState = {
					searchTerm: "test",
					filters: {
						selectedBusinessAreas: [],
						user: null,
						status: "",
						kind: "",
						year: 0,
						onlyActive: false,
						onlyInactive: false,
					},
					saveSearch: true,
					visualizationMode: "heatmap",
					// Missing: visibleLayerTypes, showLabels, showColors
				};
				localStorage.setItem("projectMapState", JSON.stringify(partialState));

				const newStore = new ProjectMapStore();
				expect(newStore.state.visualizationMode).toBe("heatmap");
				expect(newStore.state.visibleLayerTypes).toEqual(["dbcaregion"]);
				expect(newStore.state.showLabels).toBe(true);
				expect(newStore.state.showColors).toBe(true);
			});

			it("should handle invalid JSON gracefully", () => {
				localStorage.setItem("projectMapState", "invalid json{");
				const newStore = new ProjectMapStore();
				// Should use defaults
				expect(newStore.state.visualizationMode).toBe("markers");
				expect(newStore.state.visibleLayerTypes).toEqual(["dbcaregion"]);
				expect(newStore.state.showLabels).toBe(true);
				expect(newStore.state.showColors).toBe(true);
				// Should clear corrupted data
				expect(localStorage.getItem("projectMapState")).toBeFalsy();
			});
		});
	});

	describe("Reset", () => {
		it("should reset store to initial state", () => {
			// Set various state
			store.setSearchTerm("test");
			store.setFilters({ selectedBusinessAreas: [1, 2], user: 123 });
			store.selectLocations([1, 2]);
			store.toggleSidebar();
			store.setVisualizationMode("heatmap");

			// Reset
			store.reset();

			// Verify all state is reset
			expect(store.state.searchTerm).toBe("");
			expect(store.state.filters.selectedBusinessAreas).toEqual([]);
			expect(store.state.filters.user).toBe(null);
			expect(store.state.selectedLocations).toEqual([]);
			expect(store.state.sidebarOpen).toBe(true);
			expect(store.state.visualizationMode).toBe("markers");
		});
	});
});
