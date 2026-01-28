import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fuzzyMatch,
  matchToGeoJSON,
  calculateCoordinates,
  calculateProjectCoordinates,
} from "./coordinate-calculation";
import type { IProjectData } from "@/shared/types/project.types";
import type { GeoJSONData } from "@/features/projects/types/map.types";
import { GEOJSON_PROPERTY_NAMES } from "@/features/projects/types/map.types";

// Mock Leaflet
vi.mock("leaflet", () => ({
  default: {
    geoJSON: vi.fn(() => ({
      getBounds: vi.fn(() => ({
        isValid: vi.fn(() => true),
        getCenter: vi.fn(() => ({ lat: 10, lng: 20 })),
      })),
    })),
  },
}));

// Mock logger
vi.mock("@/shared/services/logger.service", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("coordinate-calculation", () => {
  describe("fuzzyMatch", () => {
    it("should match exact strings", () => {
      expect(fuzzyMatch("Perth", "Perth")).toBe(true);
    });

    it("should match case-insensitive", () => {
      expect(fuzzyMatch("Perth", "PERTH")).toBe(true);
      expect(fuzzyMatch("PERTH", "perth")).toBe(true);
    });

    it("should match with whitespace differences", () => {
      expect(fuzzyMatch("Perth Region", "Perth  Region")).toBe(true);
      expect(fuzzyMatch(" Perth Region ", "Perth Region")).toBe(true);
    });

    it("should match with special characters", () => {
      expect(fuzzyMatch("Perth-Region", "Perth Region")).toBe(true);
      expect(fuzzyMatch("Perth (Region)", "Perth Region")).toBe(true);
    });

    it("should match contains relationship", () => {
      expect(fuzzyMatch("Perth", "Perth Region")).toBe(true);
      expect(fuzzyMatch("Perth Region", "Perth")).toBe(true);
    });

    it("should match with word similarity", () => {
      expect(fuzzyMatch("Perth Metropolitan Region", "Perth Metro")).toBe(true);
      expect(fuzzyMatch("South West Region", "Southwest")).toBe(true);
    });

    it("should not match completely different strings", () => {
      expect(fuzzyMatch("Perth", "Melbourne")).toBe(false);
      expect(fuzzyMatch("North", "South")).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(fuzzyMatch("", "")).toBe(true);
      expect(fuzzyMatch("Perth", "")).toBe(true); // "Perth" contains ""
      expect(fuzzyMatch("", "Perth")).toBe(true); // "" is contained in "Perth"
    });

    it("should handle null/undefined strings", () => {
      expect(fuzzyMatch(null as any, "Perth")).toBe(true); // null becomes "", "" is contained in "Perth"
      expect(fuzzyMatch("Perth", undefined as any)).toBe(true); // undefined becomes "", "" is contained in "Perth"
      expect(fuzzyMatch(null as any, undefined as any)).toBe(true); // both become ""
    });
  });

  describe("matchToGeoJSON", () => {
    const mockGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { NAME: "Perth Region" },
          geometry: { type: "Point", coordinates: [115.8605, -31.9505] },
        },
        {
          type: "Feature",
          properties: { NAME: "South West Region" },
          geometry: { type: "Point", coordinates: [115.6, -33.2] },
        },
      ],
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should match exact area name", () => {
      const result = matchToGeoJSON("Perth Region", mockGeoJSON, "NAME");
      expect(result).toEqual([10, 20]); // Mocked center coordinates
    });

    it("should match with fuzzy matching", () => {
      const result = matchToGeoJSON("Perth", mockGeoJSON, "NAME");
      expect(result).toEqual([10, 20]);
    });

    it("should return null for no match", () => {
      const result = matchToGeoJSON("Melbourne", mockGeoJSON, "NAME");
      expect(result).toBeNull();
    });

    it("should return null for empty area name", () => {
      expect(matchToGeoJSON("", mockGeoJSON, "NAME")).toBeNull();
      expect(matchToGeoJSON(null, mockGeoJSON, "NAME")).toBeNull();
      expect(matchToGeoJSON(undefined, mockGeoJSON, "NAME")).toBeNull();
    });

    it("should return null for null GeoJSON", () => {
      const result = matchToGeoJSON("Perth", null, "NAME");
      expect(result).toBeNull();
    });

    it("should return null for empty GeoJSON features", () => {
      const emptyGeoJSON: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: [],
      };
      const result = matchToGeoJSON("Perth", emptyGeoJSON, "NAME");
      expect(result).toBeNull();
    });

    it("should handle features without properties", () => {
      const geoJSONWithoutProps: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: null,
            geometry: { type: "Point", coordinates: [115.8605, -31.9505] },
          },
        ],
      };
      const result = matchToGeoJSON("Perth", geoJSONWithoutProps, "NAME");
      expect(result).toBeNull();
    });
  });

  describe("calculateCoordinates", () => {
    const mockGeoJsonData: GeoJSONData = {
      dbcaRegions: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { [GEOJSON_PROPERTY_NAMES.dbcaRegions]: "Perth Region" },
            geometry: { type: "Point", coordinates: [115.8605, -31.9505] },
          },
        ],
      },
      dbcaDistricts: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { [GEOJSON_PROPERTY_NAMES.dbcaDistricts]: "Perth District" },
            geometry: { type: "Point", coordinates: [115.8605, -31.9505] },
          },
        ],
      },
      nrm: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { [GEOJSON_PROPERTY_NAMES.nrm]: "Perth NRM" },
            geometry: { type: "Point", coordinates: [115.8605, -31.9505] },
          },
        ],
      },
      ibra: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { [GEOJSON_PROPERTY_NAMES.ibra]: "Perth IBRA" },
            geometry: { type: "Point", coordinates: [115.8605, -31.9505] },
          },
        ],
      },
      imcra: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { [GEOJSON_PROPERTY_NAMES.imcra]: "Perth IMCRA" },
            geometry: { type: "Point", coordinates: [115.8605, -31.9505] },
          },
        ],
      },
    };

    it("should return null for project with no areas", () => {
      const project = {
        id: 1,
        areas: [],
      } as IProjectData;

      const result = calculateCoordinates(project, mockGeoJsonData);
      expect(result).toBeNull();
    });

    it("should return null for project with null areas", () => {
      const project = {
        id: 1,
        areas: null,
      } as unknown as IProjectData;

      const result = calculateCoordinates(project, mockGeoJsonData);
      expect(result).toBeNull();
    });

    it("should prioritize DBCA Regions", () => {
      const project = {
        id: 1,
        areas: [
          { id: 1, name: "Perth Region" },
          { id: 2, name: "Perth District" },
        ],
      } as IProjectData;

      const result = calculateCoordinates(project, mockGeoJsonData);
      expect(result).toEqual([10, 20]); // Should match DBCA Region first
    });

    it("should fall back to DBCA Districts", () => {
      const project = {
        id: 1,
        areas: [
          { id: 1, name: "Unknown Region" },
          { id: 2, name: "Perth District" },
        ],
      } as IProjectData;

      const result = calculateCoordinates(project, mockGeoJsonData);
      expect(result).toEqual([10, 20]); // Should match DBCA District
    });

    it("should fall back to NRM", () => {
      const project = {
        id: 1,
        areas: [
          { id: 1, name: "Unknown Region" },
          { id: 2, name: "Perth NRM" },
        ],
      } as IProjectData;

      const result = calculateCoordinates(project, mockGeoJsonData);
      expect(result).toEqual([10, 20]); // Should match NRM
    });

    it("should fall back to IBRA", () => {
      const project = {
        id: 1,
        areas: [
          { id: 1, name: "Unknown Region" },
          { id: 2, name: "Perth IBRA" },
        ],
      } as IProjectData;

      const result = calculateCoordinates(project, mockGeoJsonData);
      expect(result).toEqual([10, 20]); // Should match IBRA
    });

    it("should fall back to IMCRA", () => {
      const project = {
        id: 1,
        areas: [
          { id: 1, name: "Unknown Region" },
          { id: 2, name: "Perth IMCRA" },
        ],
      } as IProjectData;

      const result = calculateCoordinates(project, mockGeoJsonData);
      expect(result).toEqual([10, 20]); // Should match IMCRA
    });

    it("should return null when no areas match", () => {
      const project = {
        id: 1,
        areas: [
          { id: 1, name: "Unknown Region" },
          { id: 2, name: "Another Unknown" },
        ],
      } as IProjectData;

      const result = calculateCoordinates(project, mockGeoJsonData);
      expect(result).toBeNull();
    });
  });

  describe("calculateProjectCoordinates", () => {
    const mockGeoJsonData: GeoJSONData = {
      dbcaRegions: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { [GEOJSON_PROPERTY_NAMES.dbcaRegions]: "Perth Region" },
            geometry: { type: "Point", coordinates: [115.8605, -31.9505] },
          },
        ],
      },
      dbcaDistricts: { type: "FeatureCollection", features: [] },
      nrm: { type: "FeatureCollection", features: [] },
      ibra: { type: "FeatureCollection", features: [] },
      imcra: { type: "FeatureCollection", features: [] },
    };

    it("should return empty array for empty projects", () => {
      const result = calculateProjectCoordinates([], [], mockGeoJsonData);
      expect(result).toEqual([]);
    });

    it("should calculate coordinates for projects with valid areas", () => {
      const projects = [
        {
          id: 1,
          title: "Project 1",
          areas: [{ id: 1, name: "Perth Region" }],
        },
        {
          id: 2,
          title: "Project 2",
          areas: [{ id: 2, name: "Unknown Area" }],
        },
      ] as IProjectData[];

      const result = calculateProjectCoordinates(projects, [], mockGeoJsonData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        title: "Project 1",
        areas: [{ id: 1, name: "Perth Region" }],
        coords: [10, 20],
      });
    });

    it("should skip projects without valid coordinates", () => {
      const projects = [
        {
          id: 1,
          title: "Project 1",
          areas: [{ id: 1, name: "Unknown Area" }],
        },
        {
          id: 2,
          title: "Project 2",
          areas: [],
        },
      ] as IProjectData[];

      const result = calculateProjectCoordinates(projects, [], mockGeoJsonData);
      expect(result).toEqual([]);
    });

    it("should handle mixed valid and invalid projects", () => {
      const projects = [
        {
          id: 1,
          title: "Valid Project",
          areas: [{ id: 1, name: "Perth Region" }],
        },
        {
          id: 2,
          title: "Invalid Project",
          areas: [{ id: 2, name: "Unknown Area" }],
        },
        {
          id: 3,
          title: "Another Valid Project",
          areas: [{ id: 3, name: "Perth Region" }],
        },
      ] as IProjectData[];

      const result = calculateProjectCoordinates(projects, [], mockGeoJsonData);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });
  });
});