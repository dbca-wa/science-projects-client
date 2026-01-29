import { describe, it, expect, beforeEach } from "vitest";
import { ProjectMapStore } from "./project-map.store";

describe("ProjectMapStore", () => {
  let store: ProjectMapStore;

  beforeEach(() => {
    store = new ProjectMapStore();
  });

  describe("initialization", () => {
    it("should initialize with empty search term", () => {
      expect(store.state.searchTerm).toBe("");
    });

    it("should initialize with empty business areas array", () => {
      expect(store.state.selectedBusinessAreas).toEqual([]);
    });

    it("should initialize with empty locations array", () => {
      expect(store.state.selectedLocations).toEqual([]);
    });

    it("should initialize with sidebar open", () => {
      expect(store.state.sidebarOpen).toBe(true);
    });

    it("should initialize with DBCA regions visible", () => {
      expect(store.state.visibleLayerTypes).toEqual(["dbcaregion"]);
    });

    it("should initialize with labels enabled", () => {
      expect(store.state.showLabels).toBe(true);
    });

    it("should initialize with colors enabled", () => {
      expect(store.state.showColors).toBe(true);
    });

    it("should initialize with year filter as 0 (All Years)", () => {
      expect(store.state.filterYear).toBe(0);
    });
  });

  describe("setSearchTerm", () => {
    it("should set search term", () => {
      store.setSearchTerm("test");
      expect(store.state.searchTerm).toBe("test");
    });

    it("should update search term", () => {
      store.setSearchTerm("first");
      store.setSearchTerm("second");
      expect(store.state.searchTerm).toBe("second");
    });

    it("should handle empty string", () => {
      store.setSearchTerm("test");
      store.setSearchTerm("");
      expect(store.state.searchTerm).toBe("");
    });
  });

  describe("toggleBusinessArea", () => {
    it("should add business area when not present", () => {
      store.toggleBusinessArea(1);
      expect(store.state.selectedBusinessAreas).toContain(1);
    });

    it("should remove business area when present", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(1);
      expect(store.state.selectedBusinessAreas).not.toContain(1);
    });

    it("should handle multiple business areas", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(2);
      store.toggleBusinessArea(3);
      expect(store.state.selectedBusinessAreas).toEqual([1, 2, 3]);
    });

    it("should toggle specific business area without affecting others", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(2);
      store.toggleBusinessArea(1);
      expect(store.state.selectedBusinessAreas).toEqual([2]);
    });
  });

  describe("checkAllBusinessAreas", () => {
    it("should select all provided business areas", () => {
      store.checkAllBusinessAreas([1, 2, 3]);
      expect(store.state.selectedBusinessAreas).toEqual([1, 2, 3]);
    });

    it("should replace existing selections", () => {
      store.toggleBusinessArea(1);
      store.checkAllBusinessAreas([2, 3]);
      expect(store.state.selectedBusinessAreas).toEqual([2, 3]);
    });

    it("should handle empty array", () => {
      store.toggleBusinessArea(1);
      store.checkAllBusinessAreas([]);
      expect(store.state.selectedBusinessAreas).toEqual([]);
    });
  });

  describe("uncheckAllBusinessAreas", () => {
    it("should clear all selected business areas", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(2);
      store.uncheckAllBusinessAreas();
      expect(store.state.selectedBusinessAreas).toEqual([]);
    });

    it("should work when no business areas are selected", () => {
      store.uncheckAllBusinessAreas();
      expect(store.state.selectedBusinessAreas).toEqual([]);
    });
  });

  describe("toggleLayerType", () => {
    it("should add layer when not present", () => {
      store.toggleLayerType("nrm");
      expect(store.state.visibleLayerTypes).toContain("nrm");
    });

    it("should remove layer when present", () => {
      store.toggleLayerType("dbcaregion");
      expect(store.state.visibleLayerTypes).not.toContain("dbcaregion");
    });

    it("should handle multiple layers", () => {
      store.toggleLayerType("nrm");
      store.toggleLayerType("ibra");
      expect(store.state.visibleLayerTypes).toEqual(["dbcaregion", "nrm", "ibra"]);
    });
  });

  describe("showAllLayers", () => {
    it("should show all layer types", () => {
      store.showAllLayers();
      expect(store.state.visibleLayerTypes).toEqual(["dbcaregion", "dbcadistrict", "nrm", "ibra", "imcra"]);
    });
  });

  describe("hideAllLayers", () => {
    it("should hide all layer types", () => {
      store.hideAllLayers();
      expect(store.state.visibleLayerTypes).toEqual([]);
    });
  });

  describe("toggleSidebar", () => {
    it("should toggle sidebar from open to closed", () => {
      expect(store.state.sidebarOpen).toBe(true);
      store.toggleSidebar();
      expect(store.state.sidebarOpen).toBe(false);
    });

    it("should toggle sidebar from closed to open", () => {
      store.toggleSidebar();
      store.toggleSidebar();
      expect(store.state.sidebarOpen).toBe(true);
    });
  });

  describe("toggleLabels", () => {
    it("should toggle labels from true to false", () => {
      expect(store.state.showLabels).toBe(true);
      store.toggleLabels();
      expect(store.state.showLabels).toBe(false);
    });

    it("should toggle labels from false to true", () => {
      store.toggleLabels();
      store.toggleLabels();
      expect(store.state.showLabels).toBe(true);
    });
  });

  describe("toggleColors", () => {
    it("should toggle colors from true to false", () => {
      expect(store.state.showColors).toBe(true);
      store.toggleColors();
      expect(store.state.showColors).toBe(false);
    });

    it("should toggle colors from false to true", () => {
      store.toggleColors();
      store.toggleColors();
      expect(store.state.showColors).toBe(true);
    });
  });

  describe("selectedBusinessAreas computed property", () => {
    it("should return empty Set when no business areas selected", () => {
      expect(store.selectedBusinessAreas.size).toBe(0);
    });

    it("should return Set with selected business areas", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(2);
      expect(store.selectedBusinessAreas.size).toBe(2);
      expect(store.selectedBusinessAreas.has(1)).toBe(true);
      expect(store.selectedBusinessAreas.has(2)).toBe(true);
    });

    it("should update reactively when business areas change", () => {
      expect(store.selectedBusinessAreas.size).toBe(0);
      store.toggleBusinessArea(1);
      expect(store.selectedBusinessAreas.size).toBe(1);
      store.toggleBusinessArea(1);
      expect(store.selectedBusinessAreas.size).toBe(0);
    });
  });

  describe("filters computed property", () => {
    it("should return correct filter object", () => {
      store.setSearchTerm("test");
      store.toggleBusinessArea(1);
      store.setFilterUser(123);
      
      const filters = store.filters;
      expect(filters.search).toBe("test");
      expect(filters.businessAreas).toEqual([1]);
      expect(filters.user).toBe(123);
      expect(filters.year).toBe(0);
    });
  });

  describe("hasActiveFilters computed property", () => {
    it("should return false when no filters are active", () => {
      expect(store.hasActiveFilters).toBe(false);
    });

    it("should return true when search term is set", () => {
      store.setSearchTerm("test");
      expect(store.hasActiveFilters).toBe(true);
    });

    it("should return true when business areas are selected", () => {
      store.toggleBusinessArea(1);
      expect(store.hasActiveFilters).toBe(true);
    });

    it("should return true when user filter is set", () => {
      store.setFilterUser(123);
      expect(store.hasActiveFilters).toBe(true);
    });

    it("should return true when status filter is set", () => {
      store.setFilterStatus("active");
      expect(store.hasActiveFilters).toBe(true);
    });

    it("should return true when onlyActive is set", () => {
      store.setOnlyActive(true);
      expect(store.hasActiveFilters).toBe(true);
    });
  });

  describe("clearFilters", () => {
    it("should clear all filters", () => {
      store.setSearchTerm("test");
      store.toggleBusinessArea(1);
      store.setFilterUser(123);
      store.setFilterStatus("active");
      store.setOnlyActive(true);
      
      store.clearFilters();
      
      expect(store.state.searchTerm).toBe("");
      expect(store.state.selectedBusinessAreas).toEqual([]);
      expect(store.state.filterUser).toBe(null);
      expect(store.state.filterStatus).toBe("");
      expect(store.state.onlyActive).toBe(false);
      expect(store.hasActiveFilters).toBe(false);
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      store.setSearchTerm("test");
      store.toggleBusinessArea(1);
      store.toggleSidebar();
      store.toggleLabels();
      store.hideAllLayers();
      
      store.reset();
      
      expect(store.state.searchTerm).toBe("");
      expect(store.state.selectedBusinessAreas).toEqual([]);
      expect(store.state.sidebarOpen).toBe(true);
      expect(store.state.showLabels).toBe(true);
      expect(store.state.visibleLayerTypes).toEqual(["dbcaregion"]);
    });
  });

  describe("complex interactions", () => {
    it("should handle multiple state changes independently", () => {
      store.setSearchTerm("test");
      store.toggleBusinessArea(1);
      store.toggleLayerType("nrm");
      store.toggleLabels();
      store.setFilterUser(123);
      
      expect(store.state.searchTerm).toBe("test");
      expect(store.state.selectedBusinessAreas).toEqual([1]);
      expect(store.state.visibleLayerTypes).toEqual(["dbcaregion", "nrm"]);
      expect(store.state.showLabels).toBe(false);
      expect(store.state.filterUser).toBe(123);
    });

    it("should maintain filter consistency", () => {
      store.setOnlyActive(true);
      store.setOnlyInactive(true);
      
      expect(store.state.onlyActive).toBe(false);
      expect(store.state.onlyInactive).toBe(true);
    });
  });
});