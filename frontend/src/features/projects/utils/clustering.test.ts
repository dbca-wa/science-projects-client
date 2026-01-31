import { describe, it, expect } from "vitest";
import { clusterProjects, getClusterCountDisplay } from "./clustering";
import type { ProjectWithCoords } from "@/features/projects/types/map.types";
import type { IProjectData } from "@/shared/types/project.types";

const mockBaseProject: IProjectData = {
  id: 1,
  title: "Test Project",
  description: "Test description",
  tagline: "Test tagline",
  keywords: "test",
  year: 2024,
  number: 1,
  start_date: new Date("2024-01-01"),
  end_date: new Date("2024-12-31"),
  kind: "science",
  status: "active",
  business_area: {
    id: 1,
    name: "Test Business Area",
    slug: "test-ba",
    is_active: true,
    focus: "Test focus",
    introduction: "Test introduction",
    image: null,
  },
  areas: [],
  image: null,
  deletion_requested: false,
  deletion_request_id: null,
  created_at: new Date("2024-01-01"),
  updated_at: new Date("2024-01-01"),
};

describe("clustering", () => {
  const createProjectWithCoords = (
    id: number,
    coords: [number, number],
    title = `Project ${id}`
  ): ProjectWithCoords => ({
    ...mockBaseProject,
    id,
    title,
    coords,
  });

  describe("clusterProjects", () => {
    it("should return empty map for empty input", () => {
      const result = clusterProjects([]);
      expect(result.size).toBe(0);
    });

    it("should create single cluster for single project", () => {
      const projects = [createProjectWithCoords(1, [10.1234, 20.5678])];
      const result = clusterProjects(projects);

      expect(result.size).toBe(1);
      const cluster = Array.from(result.values())[0];
      expect(cluster.projects).toHaveLength(1);
      expect(cluster.projects[0].id).toBe(1);
      expect(cluster.coords).toEqual([10.1234, 20.5678]);
    });

    it("should cluster projects at exact same coordinates", () => {
      const projects = [
        createProjectWithCoords(1, [10.1234, 20.5678]),
        createProjectWithCoords(2, [10.1234, 20.5678]),
        createProjectWithCoords(3, [10.1234, 20.5678]),
      ];
      const result = clusterProjects(projects);

      expect(result.size).toBe(1);
      const cluster = Array.from(result.values())[0];
      expect(cluster.projects).toHaveLength(3);
      expect(cluster.projects.map(p => p.id)).toEqual([1, 2, 3]);
    });

    it("should cluster projects within rounding threshold (4 decimal places)", () => {
      const projects = [
        createProjectWithCoords(1, [10.12340, 20.56780]),
        createProjectWithCoords(2, [10.12341, 20.56781]), // Rounds to same key
        createProjectWithCoords(3, [10.12344, 20.56784]), // Rounds to same key
      ];
      const result = clusterProjects(projects);

      expect(result.size).toBe(1);
      const cluster = Array.from(result.values())[0];
      expect(cluster.projects).toHaveLength(3);
    });

    it("should not cluster projects outside rounding threshold", () => {
      const projects = [
        createProjectWithCoords(1, [10.1234, 20.5678]),
        createProjectWithCoords(2, [10.1235, 20.5679]), // Different when rounded to 4 decimals
      ];
      const result = clusterProjects(projects);

      expect(result.size).toBe(2);
      const clusters = Array.from(result.values());
      expect(clusters[0].projects).toHaveLength(1);
      expect(clusters[1].projects).toHaveLength(1);
    });

    it("should create separate clusters for distant projects", () => {
      const projects = [
        createProjectWithCoords(1, [10.0000, 20.0000]),
        createProjectWithCoords(2, [30.0000, 40.0000]),
        createProjectWithCoords(3, [50.0000, 60.0000]),
      ];
      const result = clusterProjects(projects);

      expect(result.size).toBe(3);
      const clusters = Array.from(result.values());
      expect(clusters[0].projects[0].id).toBe(1);
      expect(clusters[1].projects[0].id).toBe(2);
      expect(clusters[2].projects[0].id).toBe(3);
    });

    it("should handle mix of clustered and separate projects", () => {
      const projects = [
        createProjectWithCoords(1, [10.1234, 20.5678]),
        createProjectWithCoords(2, [10.1234, 20.5678]), // Cluster with 1
        createProjectWithCoords(3, [30.0000, 40.0000]), // Separate
        createProjectWithCoords(4, [30.0000, 40.0000]), // Cluster with 3
        createProjectWithCoords(5, [50.0000, 60.0000]), // Separate
      ];
      const result = clusterProjects(projects);

      expect(result.size).toBe(3);
      const clusters = Array.from(result.values());
      
      // Find clusters by checking project counts
      const clusterSizes = clusters.map(c => c.projects.length).sort();
      expect(clusterSizes).toEqual([1, 2, 2]);
    });

    it("should handle negative coordinates", () => {
      const projects = [
        createProjectWithCoords(1, [-10.1234, -20.5678]),
        createProjectWithCoords(2, [-10.1234, -20.5678]),
      ];
      const result = clusterProjects(projects);

      expect(result.size).toBe(1);
      const cluster = Array.from(result.values())[0];
      expect(cluster.coords).toEqual([-10.1234, -20.5678]);
      expect(cluster.projects).toHaveLength(2);
    });

    it("should handle coordinates near equator and prime meridian", () => {
      const projects = [
        createProjectWithCoords(1, [0.0000, 0.0000]),
        createProjectWithCoords(2, [0.0000, 0.0000]),
      ];
      const result = clusterProjects(projects);

      expect(result.size).toBe(1);
      const cluster = Array.from(result.values())[0];
      expect(cluster.coords).toEqual([0.0000, 0.0000]);
    });

    it("should preserve project order within clusters", () => {
      const projects = [
        createProjectWithCoords(1, [10.1234, 20.5678]),
        createProjectWithCoords(2, [10.1234, 20.5678]),
        createProjectWithCoords(3, [10.1234, 20.5678]),
      ];
      const result = clusterProjects(projects);

      const cluster = Array.from(result.values())[0];
      expect(cluster.projects[0].id).toBe(1);
      expect(cluster.projects[1].id).toBe(2);
      expect(cluster.projects[2].id).toBe(3);
    });

    it("should use first project coordinates as cluster coordinates", () => {
      const projects = [
        createProjectWithCoords(1, [10.12340, 20.56780]),
        createProjectWithCoords(2, [10.12341, 20.56781]), // Slightly different but rounds to same
      ];
      const result = clusterProjects(projects);

      const cluster = Array.from(result.values())[0];
      expect(cluster.coords).toEqual([10.12340, 20.56780]); // Uses first project's coords
    });

    it("should handle large numbers of projects efficiently", () => {
      const projects = Array.from({ length: 1000 }, (_, i) =>
        createProjectWithCoords(i + 1, [10.1234, 20.5678])
      );
      const result = clusterProjects(projects);

      expect(result.size).toBe(1);
      const cluster = Array.from(result.values())[0];
      expect(cluster.projects).toHaveLength(1000);
    });
  });

  describe("getClusterCountDisplay", () => {
    it("should return exact count for small numbers", () => {
      expect(getClusterCountDisplay(1)).toBe("1");
      expect(getClusterCountDisplay(5)).toBe("5");
      expect(getClusterCountDisplay(50)).toBe("50");
      expect(getClusterCountDisplay(99)).toBe("99");
      expect(getClusterCountDisplay(100)).toBe("100");
    });

    it("should return '100+' for counts over 100", () => {
      expect(getClusterCountDisplay(101)).toBe("100+");
      expect(getClusterCountDisplay(500)).toBe("100+");
      expect(getClusterCountDisplay(1000)).toBe("100+");
      expect(getClusterCountDisplay(9999)).toBe("100+");
    });

    it("should handle edge cases", () => {
      expect(getClusterCountDisplay(0)).toBe("0");
    });
  });
});