import { describe, it, expect, vi } from "vitest";
import { createProjectMarker, createClusterMarker } from "./marker-creation";
import type { IProjectData } from "@/shared/types/project.types";

// Mock Leaflet
vi.mock("leaflet", () => ({
  default: {
    marker: vi.fn((coords, options) => ({
      getIcon: () => options.icon,
      coords,
      options,
    })),
    divIcon: vi.fn((options) => options),
  },
}));

const createMockProject = (id: number): IProjectData => ({
  id,
  title: `Test Project ${id}`,
  year: 2024,
  kind: "science",
  status: "active",
  business_area: {
    id: 1,
    name: "Test Business Area",
    slug: "test-ba",
    is_active: true,
  },
  location_areas: [],
  image: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
});

describe("marker-creation performance", () => {
  it("should create single markers efficiently", () => {
    const startTime = performance.now();
    
    // Create 100 single project markers
    for (let i = 0; i < 100; i++) {
      const project = createMockProject(i);
      createProjectMarker([project], [-25 + i * 0.01, 122 + i * 0.01], true);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete in under 100ms for 100 markers
    expect(duration).toBeLessThan(100);
  });

  it("should create cluster markers efficiently", () => {
    const startTime = performance.now();
    
    // Create 50 cluster markers with varying sizes
    for (let i = 0; i < 50; i++) {
      const projectCount = Math.floor(Math.random() * 20) + 2; // 2-21 projects per cluster
      const projects = Array.from({ length: projectCount }, (_, j) => createMockProject(i * 100 + j));
      createClusterMarker(projects, [-25 + i * 0.02, 122 + i * 0.02], true);
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete in under 200ms for 50 clusters
    expect(duration).toBeLessThan(200);
  });

  it("should handle large clusters efficiently", () => {
    const startTime = performance.now();
    
    // Create a very large cluster (1000 projects)
    const projects = Array.from({ length: 1000 }, (_, i) => createMockProject(i));
    createClusterMarker(projects, [-25, 122], true);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete in under 50ms even for very large clusters
    expect(duration).toBeLessThan(50);
  });

  it("should generate consistent HTML for same inputs", () => {
    const project = createMockProject(1);
    const coords: [number, number] = [-25, 122];
    
    const marker1 = createProjectMarker([project], coords, true);
    const marker2 = createProjectMarker([project], coords, true);
    
    const icon1 = marker1.getIcon();
    const icon2 = marker2.getIcon();
    
    // HTML should be identical for same inputs
    expect(icon1.html).toBe(icon2.html);
    expect(icon1.iconSize).toEqual(icon2.iconSize);
    expect(icon1.iconAnchor).toEqual(icon2.iconAnchor);
  });

  it("should handle edge cases without errors", () => {
    // Test with empty title
    const projectWithEmptyTitle = { ...createMockProject(1), title: "" };
    expect(() => {
      createProjectMarker([projectWithEmptyTitle], [-25, 122], true);
    }).not.toThrow();

    // Test with very long title
    const projectWithLongTitle = { ...createMockProject(1), title: "A".repeat(1000) };
    expect(() => {
      createProjectMarker([projectWithLongTitle], [-25, 122], true);
    }).not.toThrow();

    // Test with extreme coordinates
    expect(() => {
      createProjectMarker([createMockProject(1)], [-90, -180], true);
    }).not.toThrow();

    expect(() => {
      createProjectMarker([createMockProject(1)], [90, 180], true);
    }).not.toThrow();
  });
});