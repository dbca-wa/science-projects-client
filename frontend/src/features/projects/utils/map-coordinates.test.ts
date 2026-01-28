import { describe, it, expect, vi } from "vitest";
import {
  calculateCentroid,
  calculateProjectCoordinates,
  calculateAllProjectCoordinates,
} from "./map-coordinates";
import type { IProjectData } from "@/shared/types/project.types";
import type { GeoJSONData } from "@/features/projects/types/map.types";
import * as coordinateCalculation from "./coordinate-calculation";

// Mock the coordinate-calculation module
vi.mock("./coordinate-calculation", () => ({
  calculateCoordinates: vi.fn(),
}));

describe("map-coordinates", () => {
  describe("calculateCentroid", () => {
    it("should return null for empty array", () => {
      expect(calculateCentroid([])).toBeNull();
    });

    it("should return the same coordinate for single coordinate", () => {
      const coords: [number, number][] = [[10, 20]];
      expect(calculateCentroid(coords)).toEqual([10, 20]);
    });

    it("should calculate centroid for two coordinates", () => {
      const coords: [number, number][] = [
        [10, 20],
        [20, 30],
      ];
      expect(calculateCentroid(coords)).toEqual([15, 25]);
    });

    it("should calculate centroid for multiple coordinates", () => {
      const coords: [number, number][] = [
        [0, 0],
        [10, 10],
        [20, 20],
      ];
      expect(calculateCentroid(coords)).toEqual([10, 10]);
    });

    it("should handle negative coordinates", () => {
      const coords: [number, number][] = [
        [-10, -20],
        [10, 20],
      ];
      expect(calculateCentroid(coords)).toEqual([0, 0]);
    });

    it("should handle decimal coordinates", () => {
      const coords: [number, number][] = [
        [10.5, 20.5],
        [20.5, 30.5],
      ];
      expect(calculateCentroid(coords)).toEqual([15.5, 25.5]);
    });
  });

  describe("calculateProjectCoordinates", () => {
    const mockGeoJsonData = {} as GeoJSONData;

    it("should return null for project with no areas", () => {
      const project = {
        id: 1,
        areas: [],
      } as IProjectData;

      const result = calculateProjectCoordinates(project, mockGeoJsonData);
      expect(result).toBeNull();
    });

    it("should return null for project with null areas", () => {
      const project = {
        id: 1,
        areas: null,
      } as unknown as IProjectData;

      const result = calculateProjectCoordinates(project, mockGeoJsonData);
      expect(result).toBeNull();
    });

    it("should use existing logic for single location project", () => {
      const project = {
        id: 1,
        areas: [{ id: 1, name: "Area 1" }],
      } as IProjectData;

      const mockCoords: [number, number] = [10, 20];
      vi.mocked(coordinateCalculation.calculateCoordinates).mockReturnValue(
        mockCoords
      );

      const result = calculateProjectCoordinates(project, mockGeoJsonData);
      expect(result).toEqual(mockCoords);
      expect(coordinateCalculation.calculateCoordinates).toHaveBeenCalledWith(
        project,
        mockGeoJsonData
      );
    });

    it("should return null for single location with invalid data", () => {
      const project = {
        id: 1,
        areas: [{ id: 1, name: "Invalid Area" }],
      } as IProjectData;

      vi.mocked(coordinateCalculation.calculateCoordinates).mockReturnValue(
        null
      );

      const result = calculateProjectCoordinates(project, mockGeoJsonData);
      expect(result).toBeNull();
    });

    it("should calculate centroid for multi-location project", () => {
      const project = {
        id: 1,
        areas: [
          { id: 1, name: "Area 1" },
          { id: 2, name: "Area 2" },
        ],
      } as IProjectData;

      // Mock returns different coordinates for each area
      vi.mocked(coordinateCalculation.calculateCoordinates)
        .mockReturnValueOnce([10, 20])
        .mockReturnValueOnce([20, 30]);

      const result = calculateProjectCoordinates(project, mockGeoJsonData);
      expect(result).toEqual([15, 25]); // Centroid of [10,20] and [20,30]
    });

    it("should handle multi-location project with some invalid areas", () => {
      const project = {
        id: 1,
        areas: [
          { id: 1, name: "Valid Area" },
          { id: 2, name: "Invalid Area" },
          { id: 3, name: "Another Valid Area" },
        ],
      } as IProjectData;

      // Mock returns coordinates for valid areas, null for invalid
      vi.mocked(coordinateCalculation.calculateCoordinates)
        .mockReturnValueOnce([10, 20])
        .mockReturnValueOnce(null)
        .mockReturnValueOnce([30, 40]);

      const result = calculateProjectCoordinates(project, mockGeoJsonData);
      expect(result).toEqual([20, 30]); // Centroid of [10,20] and [30,40]
    });

    it("should return null for multi-location project with all invalid areas", () => {
      const project = {
        id: 1,
        areas: [
          { id: 1, name: "Invalid Area 1" },
          { id: 2, name: "Invalid Area 2" },
        ],
      } as IProjectData;

      vi.mocked(coordinateCalculation.calculateCoordinates).mockReturnValue(
        null
      );

      const result = calculateProjectCoordinates(project, mockGeoJsonData);
      expect(result).toBeNull();
    });
  });

  describe("calculateAllProjectCoordinates", () => {
    const mockGeoJsonData = {} as GeoJSONData;

    it("should return empty array for empty projects array", () => {
      const result = calculateAllProjectCoordinates([], mockGeoJsonData);
      expect(result).toEqual([]);
    });

    it("should calculate coordinates for all projects", () => {
      const projects = [
        { id: 1, areas: [{ id: 1, name: "Area 1" }] },
        { id: 2, areas: [{ id: 2, name: "Area 2" }] },
      ] as IProjectData[];

      vi.mocked(coordinateCalculation.calculateCoordinates)
        .mockReturnValueOnce([10, 20])
        .mockReturnValueOnce([30, 40]);

      const result = calculateAllProjectCoordinates(projects, mockGeoJsonData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        project: projects[0],
        coordinates: [10, 20],
      });
      expect(result[1]).toEqual({
        project: projects[1],
        coordinates: [30, 40],
      });
    });

    it("should skip projects without valid coordinates", () => {
      const projects = [
        { id: 1, areas: [{ id: 1, name: "Valid Area" }] },
        { id: 2, areas: [{ id: 2, name: "Invalid Area" }] },
        { id: 3, areas: [{ id: 3, name: "Another Valid Area" }] },
      ] as IProjectData[];

      vi.mocked(coordinateCalculation.calculateCoordinates)
        .mockReturnValueOnce([10, 20])
        .mockReturnValueOnce(null)
        .mockReturnValueOnce([30, 40]);

      const result = calculateAllProjectCoordinates(projects, mockGeoJsonData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        project: projects[0],
        coordinates: [10, 20],
      });
      expect(result[1]).toEqual({
        project: projects[2],
        coordinates: [30, 40],
      });
    });

    it("should handle projects with no areas", () => {
      const projects = [
        { id: 1, areas: [] },
        { id: 2, areas: [{ id: 2, name: "Valid Area" }] },
      ] as IProjectData[];

      vi.mocked(coordinateCalculation.calculateCoordinates).mockReturnValueOnce(
        [30, 40]
      );

      const result = calculateAllProjectCoordinates(projects, mockGeoJsonData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        project: projects[1],
        coordinates: [30, 40],
      });
    });
  });
});
