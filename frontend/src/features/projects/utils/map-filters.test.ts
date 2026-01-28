import { describe, it, expect } from "vitest";
import {
  filterBySearch,
  filterByBusinessArea,
  applyCombinedFilters,
} from "./map-filters";
import type { IProjectData } from "@/shared/types/project.types";
import type { IBusinessArea } from "@/shared/types/org.types";

describe("map-filters", () => {
  const createBusinessArea = (id: number, name: string): IBusinessArea => ({
    id,
    name,
    leader: 1,
  });

  const createProject = (
    id: number,
    title: string,
    description: string,
    businessAreaId: number
  ): IProjectData => ({
    id,
    title,
    description,
    business_area: createBusinessArea(businessAreaId, `BA ${businessAreaId}`),
    areas: [],
  } as IProjectData);

  describe("filterBySearch", () => {
    const projects = [
      createProject(1, "Kangaroo Research", "Study of kangaroo behavior", 1),
      createProject(2, "Koala Conservation", "Protecting koala habitats", 1),
      createProject(3, "Marine Biology", "Ocean ecosystem research", 2),
      createProject(4, "Forest Ecology", "Study of forest ecosystems", 2),
    ];

    it("should return all projects when search term is empty", () => {
      const result = filterBySearch(projects, "");
      expect(result).toHaveLength(4);
    });

    it("should return all projects when search term is whitespace", () => {
      const result = filterBySearch(projects, "   ");
      expect(result).toHaveLength(4);
    });

    it("should filter by title (case-insensitive)", () => {
      const result = filterBySearch(projects, "kangaroo");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it("should filter by title with different case", () => {
      const result = filterBySearch(projects, "KOALA");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it("should filter by description", () => {
      const result = filterBySearch(projects, "ecosystem");
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual([3, 4]);
    });

    it("should filter by partial match in title", () => {
      const result = filterBySearch(projects, "rese");
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual([1, 3]);
    });

    it("should filter by partial match in description", () => {
      const result = filterBySearch(projects, "study");
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual([1, 4]);
    });

    it("should return empty array when no matches", () => {
      const result = filterBySearch(projects, "nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should handle special regex characters", () => {
      const specialProjects = [
        createProject(1, "Test (with) parentheses", "Description", 1),
        createProject(2, "Test [with] brackets", "Description", 1),
        createProject(3, "Test with dots...", "Description", 1),
      ];

      const result1 = filterBySearch(specialProjects, "(with)");
      expect(result1).toHaveLength(1);
      expect(result1[0].id).toBe(1);

      const result2 = filterBySearch(specialProjects, "[with]");
      expect(result2).toHaveLength(1);
      expect(result2[0].id).toBe(2);

      const result3 = filterBySearch(specialProjects, "dots...");
      expect(result3).toHaveLength(1);
      expect(result3[0].id).toBe(3);
    });

    it("should handle null title gracefully", () => {
      const projectsWithNull = [
        { ...createProject(1, "", "Description", 1), title: null as unknown as string },
      ];
      const result = filterBySearch(projectsWithNull, "test");
      expect(result).toHaveLength(0);
    });

    it("should handle null description gracefully", () => {
      const projectsWithNull = [
        { ...createProject(1, "Title", "", 1), description: null as unknown as string },
      ];
      const result = filterBySearch(projectsWithNull, "test");
      expect(result).toHaveLength(0);
    });
  });

  describe("filterByBusinessArea", () => {
    const projects = [
      createProject(1, "Project 1", "Description 1", 1),
      createProject(2, "Project 2", "Description 2", 1),
      createProject(3, "Project 3", "Description 3", 2),
      createProject(4, "Project 4", "Description 4", 3),
    ];

    it("should return all projects when no business areas selected", () => {
      const result = filterByBusinessArea(projects, new Set());
      expect(result).toHaveLength(4);
    });

    it("should filter by single business area", () => {
      const result = filterByBusinessArea(projects, new Set([1]));
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual([1, 2]);
    });

    it("should filter by multiple business areas (OR logic)", () => {
      const result = filterByBusinessArea(projects, new Set([1, 3]));
      expect(result).toHaveLength(3);
      expect(result.map((p) => p.id)).toEqual([1, 2, 4]);
    });

    it("should return empty array when no matches", () => {
      const result = filterByBusinessArea(projects, new Set([999]));
      expect(result).toHaveLength(0);
    });

    it("should handle projects with null business_area", () => {
      const projectsWithNull = [
        { ...createProject(1, "Project 1", "Description 1", 1), business_area: null as unknown as IBusinessArea },
      ];
      const result = filterByBusinessArea(projectsWithNull, new Set([1]));
      expect(result).toHaveLength(0);
    });
  });

  describe("applyCombinedFilters", () => {
    const projects = [
      createProject(1, "Kangaroo Research", "Study of kangaroo behavior", 1),
      createProject(2, "Koala Conservation", "Protecting koala habitats", 1),
      createProject(3, "Marine Biology", "Ocean ecosystem research", 2),
      createProject(4, "Forest Ecology", "Study of forest ecosystems", 2),
    ];

    it("should return all projects when no filters applied", () => {
      const result = applyCombinedFilters(projects, "", new Set());
      expect(result.filteredProjects).toHaveLength(4);
      expect(result.projectsWithFilterFlag).toHaveLength(4);
      expect(result.projectsWithFilterFlag.every((p) => !p.isFiltered)).toBe(true);
    });

    it("should apply search filter only", () => {
      const result = applyCombinedFilters(projects, "kangaroo", new Set());
      expect(result.filteredProjects).toHaveLength(1);
      expect(result.filteredProjects[0].id).toBe(1);
      
      expect(result.projectsWithFilterFlag[0].isFiltered).toBe(false); // Project 1 matches
      expect(result.projectsWithFilterFlag[1].isFiltered).toBe(true);  // Project 2 doesn't match
      expect(result.projectsWithFilterFlag[2].isFiltered).toBe(true);  // Project 3 doesn't match
      expect(result.projectsWithFilterFlag[3].isFiltered).toBe(true);  // Project 4 doesn't match
    });

    it("should apply business area filter only", () => {
      const result = applyCombinedFilters(projects, "", new Set([1]));
      expect(result.filteredProjects).toHaveLength(2);
      expect(result.filteredProjects.map((p) => p.id)).toEqual([1, 2]);
      
      expect(result.projectsWithFilterFlag[0].isFiltered).toBe(false); // Project 1 matches
      expect(result.projectsWithFilterFlag[1].isFiltered).toBe(false); // Project 2 matches
      expect(result.projectsWithFilterFlag[2].isFiltered).toBe(true);  // Project 3 doesn't match
      expect(result.projectsWithFilterFlag[3].isFiltered).toBe(true);  // Project 4 doesn't match
    });

    it("should apply both filters with AND logic", () => {
      const result = applyCombinedFilters(projects, "research", new Set([1]));
      expect(result.filteredProjects).toHaveLength(1);
      expect(result.filteredProjects[0].id).toBe(1);
      
      expect(result.projectsWithFilterFlag[0].isFiltered).toBe(false); // Project 1 matches both
      expect(result.projectsWithFilterFlag[1].isFiltered).toBe(true);  // Project 2 doesn't match search
      expect(result.projectsWithFilterFlag[2].isFiltered).toBe(true);  // Project 3 doesn't match BA
      expect(result.projectsWithFilterFlag[3].isFiltered).toBe(true);  // Project 4 doesn't match BA
    });

    it("should return empty filtered list when no matches", () => {
      const result = applyCombinedFilters(projects, "nonexistent", new Set([999]));
      expect(result.filteredProjects).toHaveLength(0);
      expect(result.projectsWithFilterFlag.every((p) => p.isFiltered)).toBe(true);
    });

    it("should mark all projects as filtered when search has no matches", () => {
      const result = applyCombinedFilters(projects, "xyz123", new Set());
      expect(result.filteredProjects).toHaveLength(0);
      expect(result.projectsWithFilterFlag.every((p) => p.isFiltered)).toBe(true);
    });

    it("should mark all projects as filtered when business area has no matches", () => {
      const result = applyCombinedFilters(projects, "", new Set([999]));
      expect(result.filteredProjects).toHaveLength(0);
      expect(result.projectsWithFilterFlag.every((p) => p.isFiltered)).toBe(true);
    });

    it("should handle multiple business areas with search", () => {
      const result = applyCombinedFilters(projects, "study", new Set([1, 2]));
      expect(result.filteredProjects).toHaveLength(2);
      expect(result.filteredProjects.map((p) => p.id)).toEqual([1, 4]);
    });
  });
});
