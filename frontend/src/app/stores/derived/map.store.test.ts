import { describe, it, expect, beforeEach } from "vitest";
import { MapStore, LayerType } from "./map.store";

describe("MapStore", () => {
  let store: MapStore;

  beforeEach(() => {
    store = new MapStore();
  });

  describe("initialization", () => {
    it("should initialize with empty search term", () => {
      expect(store.searchTerm).toBe("");
    });

    it("should initialize with empty business areas set", () => {
      expect(store.selectedBusinessAreas.size).toBe(0);
    });

    it("should initialize with empty visible layers set", () => {
      expect(store.visibleLayers.size).toBe(0);
    });

    it("should initialize with labels enabled", () => {
      expect(store.showLabels).toBe(true);
    });

    it("should initialize with colors enabled", () => {
      expect(store.showColors).toBe(true);
    });
  });

  describe("setSearchTerm", () => {
    it("should set search term", () => {
      store.setSearchTerm("test");
      expect(store.searchTerm).toBe("test");
    });

    it("should update search term", () => {
      store.setSearchTerm("first");
      store.setSearchTerm("second");
      expect(store.searchTerm).toBe("second");
    });

    it("should handle empty string", () => {
      store.setSearchTerm("test");
      store.setSearchTerm("");
      expect(store.searchTerm).toBe("");
    });
  });

  describe("toggleBusinessArea", () => {
    it("should add business area when not present", () => {
      store.toggleBusinessArea(1);
      expect(store.selectedBusinessAreas.has(1)).toBe(true);
    });

    it("should remove business area when present", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(1);
      expect(store.selectedBusinessAreas.has(1)).toBe(false);
    });

    it("should handle multiple business areas", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(2);
      store.toggleBusinessArea(3);
      expect(store.selectedBusinessAreas.size).toBe(3);
      expect(store.selectedBusinessAreas.has(1)).toBe(true);
      expect(store.selectedBusinessAreas.has(2)).toBe(true);
      expect(store.selectedBusinessAreas.has(3)).toBe(true);
    });

    it("should toggle specific business area without affecting others", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(2);
      store.toggleBusinessArea(1);
      expect(store.selectedBusinessAreas.has(1)).toBe(false);
      expect(store.selectedBusinessAreas.has(2)).toBe(true);
    });
  });

  describe("selectAllBusinessAreas", () => {
    it("should select all provided business areas", () => {
      store.selectAllBusinessAreas([1, 2, 3]);
      expect(store.selectedBusinessAreas.size).toBe(3);
      expect(store.selectedBusinessAreas.has(1)).toBe(true);
      expect(store.selectedBusinessAreas.has(2)).toBe(true);
      expect(store.selectedBusinessAreas.has(3)).toBe(true);
    });

    it("should clear existing selections before adding new ones", () => {
      store.toggleBusinessArea(1);
      store.selectAllBusinessAreas([2, 3]);
      expect(store.selectedBusinessAreas.size).toBe(2);
      expect(store.selectedBusinessAreas.has(1)).toBe(false);
      expect(store.selectedBusinessAreas.has(2)).toBe(true);
      expect(store.selectedBusinessAreas.has(3)).toBe(true);
    });

    it("should handle empty array", () => {
      store.toggleBusinessArea(1);
      store.selectAllBusinessAreas([]);
      expect(store.selectedBusinessAreas.size).toBe(0);
    });

    it("should handle duplicate IDs in array", () => {
      store.selectAllBusinessAreas([1, 1, 2, 2]);
      expect(store.selectedBusinessAreas.size).toBe(2);
      expect(store.selectedBusinessAreas.has(1)).toBe(true);
      expect(store.selectedBusinessAreas.has(2)).toBe(true);
    });
  });

  describe("clearBusinessAreas", () => {
    it("should clear all selected business areas", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(2);
      store.clearBusinessAreas();
      expect(store.selectedBusinessAreas.size).toBe(0);
    });

    it("should work when no business areas are selected", () => {
      store.clearBusinessAreas();
      expect(store.selectedBusinessAreas.size).toBe(0);
    });
  });

  describe("toggleLayer", () => {
    it("should add layer when not present", () => {
      store.toggleLayer("dbca_regions");
      expect(store.visibleLayers.has("dbca_regions")).toBe(true);
    });

    it("should remove layer when present", () => {
      store.toggleLayer("dbca_regions");
      store.toggleLayer("dbca_regions");
      expect(store.visibleLayers.has("dbca_regions")).toBe(false);
    });

    it("should handle multiple layers", () => {
      store.toggleLayer("dbca_regions");
      store.toggleLayer("dbca_districts");
      store.toggleLayer("nrm_regions");
      expect(store.visibleLayers.size).toBe(3);
      expect(store.visibleLayers.has("dbca_regions")).toBe(true);
      expect(store.visibleLayers.has("dbca_districts")).toBe(true);
      expect(store.visibleLayers.has("nrm_regions")).toBe(true);
    });

    it("should toggle specific layer without affecting others", () => {
      store.toggleLayer("dbca_regions");
      store.toggleLayer("dbca_districts");
      store.toggleLayer("dbca_regions");
      expect(store.visibleLayers.has("dbca_regions")).toBe(false);
      expect(store.visibleLayers.has("dbca_districts")).toBe(true);
    });

    it("should handle all layer types", () => {
      const layers: LayerType[] = [
        "dbca_regions",
        "dbca_districts",
        "nrm_regions",
        "ibra_regions",
        "imcra_regions",
      ];
      
      layers.forEach((layer) => store.toggleLayer(layer));
      
      expect(store.visibleLayers.size).toBe(5);
      layers.forEach((layer) => {
        expect(store.visibleLayers.has(layer)).toBe(true);
      });
    });
  });

  describe("toggleLabels", () => {
    it("should toggle labels from true to false", () => {
      expect(store.showLabels).toBe(true);
      store.toggleLabels();
      expect(store.showLabels).toBe(false);
    });

    it("should toggle labels from false to true", () => {
      store.toggleLabels();
      store.toggleLabels();
      expect(store.showLabels).toBe(true);
    });

    it("should toggle multiple times", () => {
      store.toggleLabels();
      store.toggleLabels();
      store.toggleLabels();
      expect(store.showLabels).toBe(false);
    });
  });

  describe("toggleColors", () => {
    it("should toggle colors from true to false", () => {
      expect(store.showColors).toBe(true);
      store.toggleColors();
      expect(store.showColors).toBe(false);
    });

    it("should toggle colors from false to true", () => {
      store.toggleColors();
      store.toggleColors();
      expect(store.showColors).toBe(true);
    });

    it("should toggle multiple times", () => {
      store.toggleColors();
      store.toggleColors();
      store.toggleColors();
      expect(store.showColors).toBe(false);
    });
  });

  describe("hasBusinessAreaFilter computed property", () => {
    it("should return false when no business areas selected", () => {
      expect(store.hasBusinessAreaFilter).toBe(false);
    });

    it("should return true when business areas are selected", () => {
      store.toggleBusinessArea(1);
      expect(store.hasBusinessAreaFilter).toBe(true);
    });

    it("should return false after clearing business areas", () => {
      store.toggleBusinessArea(1);
      store.clearBusinessAreas();
      expect(store.hasBusinessAreaFilter).toBe(false);
    });

    it("should update reactively when business areas change", () => {
      expect(store.hasBusinessAreaFilter).toBe(false);
      store.toggleBusinessArea(1);
      expect(store.hasBusinessAreaFilter).toBe(true);
      store.toggleBusinessArea(1);
      expect(store.hasBusinessAreaFilter).toBe(false);
    });
  });

  describe("visibleLayersList computed property", () => {
    it("should return empty array when no layers visible", () => {
      expect(store.visibleLayersList).toEqual([]);
    });

    it("should return array with single layer", () => {
      store.toggleLayer("dbca_regions");
      expect(store.visibleLayersList).toEqual(["dbca_regions"]);
    });

    it("should return array with multiple layers", () => {
      store.toggleLayer("dbca_regions");
      store.toggleLayer("nrm_regions");
      store.toggleLayer("ibra_regions");
      
      const layers = store.visibleLayersList;
      expect(layers.length).toBe(3);
      expect(layers).toContain("dbca_regions");
      expect(layers).toContain("nrm_regions");
      expect(layers).toContain("ibra_regions");
    });

    it("should update reactively when layers change", () => {
      store.toggleLayer("dbca_regions");
      expect(store.visibleLayersList.length).toBe(1);
      
      store.toggleLayer("nrm_regions");
      expect(store.visibleLayersList.length).toBe(2);
      
      store.toggleLayer("dbca_regions");
      expect(store.visibleLayersList.length).toBe(1);
      expect(store.visibleLayersList).toEqual(["nrm_regions"]);
    });

    it("should return new array instance on each access", () => {
      store.toggleLayer("dbca_regions");
      const list1 = store.visibleLayersList;
      const list2 = store.visibleLayersList;
      expect(list1).not.toBe(list2);
      expect(list1).toEqual(list2);
    });
  });

  describe("complex interactions", () => {
    it("should handle multiple state changes independently", () => {
      store.setSearchTerm("test");
      store.toggleBusinessArea(1);
      store.toggleLayer("dbca_regions");
      store.toggleLabels();
      
      expect(store.searchTerm).toBe("test");
      expect(store.selectedBusinessAreas.has(1)).toBe(true);
      expect(store.visibleLayers.has("dbca_regions")).toBe(true);
      expect(store.showLabels).toBe(false);
      expect(store.showColors).toBe(true);
    });

    it("should maintain state consistency across rapid changes", () => {
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(2);
      store.toggleBusinessArea(1);
      store.toggleBusinessArea(3);
      store.toggleBusinessArea(2);
      
      expect(store.selectedBusinessAreas.size).toBe(1);
      expect(store.selectedBusinessAreas.has(3)).toBe(true);
    });

    it("should handle selectAll followed by individual toggles", () => {
      store.selectAllBusinessAreas([1, 2, 3]);
      store.toggleBusinessArea(2);
      
      expect(store.selectedBusinessAreas.size).toBe(2);
      expect(store.selectedBusinessAreas.has(1)).toBe(true);
      expect(store.selectedBusinessAreas.has(2)).toBe(false);
      expect(store.selectedBusinessAreas.has(3)).toBe(true);
    });
  });
});
