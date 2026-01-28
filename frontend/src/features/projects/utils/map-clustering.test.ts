import { describe, it, expect } from "vitest";
import {
  clusterProjects,
  getClusterCount,
  isMultiProjectCluster,
} from "./map-clustering";
import type { IProjectData } from "@/shared/types/project.types";
import type { ProjectWithCoordinates } from "./map-coordinates";

describe("map-clustering", () => {
  const createProject = (id: number): IProjectData => ({
    id,
    title: `Project ${id}`,
    areas: [],
  } as IProjectData);

  const createProjectWithCoords = (
    id: number,
    coords: [number, number]
  ): ProjectWithCoordinates => ({
    project: createProject(id),
    coordinates: coords,
  });

  describe("clusterProjects", () => {
    const noFilter = () => false;

    it("should return empty array for empty input", () => {
      const result = clusterProjects([], noFilter);
      expect(result).toEqual([]);
    });

    it("should create single cluster for single project", () => {
      const projects = [createProjectWithCoords(1, [10, 20])];
      const result = clusterProjects(projects, noFilter);

      expect(result).toHaveLength(1);
      expect(result[0].projects).toHaveLength(1);
      expect(result[0].projects[0].id).toBe(1);
      expect(result[0].position).toEqual([10, 20]);
      expect(result[0].isFiltered).toBe(false);
    });

    it("should cluster projects at exact same coordinates", () => {
      const projects = [
        createProjectWithCoords(1, [10, 20]),
        createProjectWithCoords(2, [10, 20]),
        createProjectWithCoords(3, [10, 20]),
      ];
      const result = clusterProjects(projects, noFilter);

      expect(result).toHaveLength(1);
      expect(result[0].projects).toHaveLength(3);
      expect(result[0].position).toEqual([10, 20]);
    });

    it("should cluster projects within threshold (0.0001 degrees)", () => {
      const projects = [
        createProjectWithCoords(1, [10.0, 20.0]),
        createProjectWithCoords(2, [10.00005, 20.00005]), // Within threshold
        createProjectWithCoords(3, [10.00003, 20.00003]), // Within threshold
      ];
      const result = clusterProjects(projects, noFilter);

      expect(result).toHaveLength(1);
      expect(result[0].projects).toHaveLength(3);
    });

    it("should not cluster projects outside threshold", () => {
      const projects = [
        createProjectWithCoords(1, [10.0, 20.0]),
        createProjectWithCoords(2, [10.001, 20.001]), // Outside threshold
      ];
      const result = clusterProjects(projects, noFilter);

      expect(result).toHaveLength(2);
      expect(result[0].projects).toHaveLength(1);
      expect(result[1].projects).toHaveLength(1);
    });

    it("should create separate clusters for distant projects", () => {
      const projects = [
        createProjectWithCoords(1, [10, 20]),
        createProjectWithCoords(2, [30, 40]),
        createProjectWithCoords(3, [50, 60]),
      ];
      const result = clusterProjects(projects, noFilter);

      expect(result).toHaveLength(3);
      expect(result[0].projects[0].id).toBe(1);
      expect(result[1].projects[0].id).toBe(2);
      expect(result[2].projects[0].id).toBe(3);
    });

    it("should handle mix of clustered and separate projects", () => {
      const projects = [
        createProjectWithCoords(1, [10, 20]),
        createProjectWithCoords(2, [10, 20]), // Cluster with 1
        createProjectWithCoords(3, [30, 40]), // Separate
        createProjectWithCoords(4, [30, 40]), // Cluster with 3
        createProjectWithCoords(5, [50, 60]), // Separate
      ];
      const result = clusterProjects(projects, noFilter);

      expect(result).toHaveLength(3);
      expect(result[0].projects).toHaveLength(2); // Projects 1, 2
      expect(result[1].projects).toHaveLength(2); // Projects 3, 4
      expect(result[2].projects).toHaveLength(1); // Project 5
    });

    it("should set isFiltered to false when no projects are filtered", () => {
      const projects = [
        createProjectWithCoords(1, [10, 20]),
        createProjectWithCoords(2, [10, 20]),
      ];
      const result = clusterProjects(projects, () => false);

      expect(result[0].isFiltered).toBe(false);
    });

    it("should set isFiltered to true when any project is filtered", () => {
      const projects = [
        createProjectWithCoords(1, [10, 20]),
        createProjectWithCoords(2, [10, 20]),
      ];
      const isFiltered = (project: IProjectData) => project.id === 2;
      const result = clusterProjects(projects, isFiltered);

      expect(result[0].isFiltered).toBe(true);
    });

    it("should set isFiltered to true when all projects are filtered", () => {
      const projects = [
        createProjectWithCoords(1, [10, 20]),
        createProjectWithCoords(2, [10, 20]),
      ];
      const result = clusterProjects(projects, () => true);

      expect(result[0].isFiltered).toBe(true);
    });

    it("should handle negative coordinates", () => {
      const projects = [
        createProjectWithCoords(1, [-10, -20]),
        createProjectWithCoords(2, [-10, -20]),
      ];
      const result = clusterProjects(projects, noFilter);

      expect(result).toHaveLength(1);
      expect(result[0].position).toEqual([-10, -20]);
    });

    it("should handle coordinates near equator and prime meridian", () => {
      const projects = [
        createProjectWithCoords(1, [0, 0]),
        createProjectWithCoords(2, [0.00005, 0.00005]),
      ];
      const result = clusterProjects(projects, noFilter);

      expect(result).toHaveLength(1);
    });

    it("should preserve project order within clusters", () => {
      const projects = [
        createProjectWithCoords(1, [10, 20]),
        createProjectWithCoords(2, [10, 20]),
        createProjectWithCoords(3, [10, 20]),
      ];
      const result = clusterProjects(projects, noFilter);

      expect(result[0].projects[0].id).toBe(1);
      expect(result[0].projects[1].id).toBe(2);
      expect(result[0].projects[2].id).toBe(3);
    });
  });

  describe("getClusterCount", () => {
    it("should return 1 for single project cluster", () => {
      const cluster = {
        projects: [createProject(1)],
        position: [10, 20] as [number, number],
        isFiltered: false,
      };
      expect(getClusterCount(cluster)).toBe(1);
    });

    it("should return correct count for multi-project cluster", () => {
      const cluster = {
        projects: [createProject(1), createProject(2), createProject(3)],
        position: [10, 20] as [number, number],
        isFiltered: false,
      };
      expect(getClusterCount(cluster)).toBe(3);
    });
  });

  describe("isMultiProjectCluster", () => {
    it("should return false for single project cluster", () => {
      const cluster = {
        projects: [createProject(1)],
        position: [10, 20] as [number, number],
        isFiltered: false,
      };
      expect(isMultiProjectCluster(cluster)).toBe(false);
    });

    it("should return true for two project cluster", () => {
      const cluster = {
        projects: [createProject(1), createProject(2)],
        position: [10, 20] as [number, number],
        isFiltered: false,
      };
      expect(isMultiProjectCluster(cluster)).toBe(true);
    });

    it("should return true for multi-project cluster", () => {
      const cluster = {
        projects: [createProject(1), createProject(2), createProject(3)],
        position: [10, 20] as [number, number],
        isFiltered: false,
      };
      expect(isMultiProjectCluster(cluster)).toBe(true);
    });
  });
});
