import { describe, it, expect, vi } from "vitest";
import L from "leaflet";
import { 
  createProjectMarker, 
  createSingleProjectMarker, 
  createClusterMarker,
  getMarkerSize,
  createSizedMarker,
  getMarkerColor,
  getMarkerDensityLabel,
  MARKER_COLORS 
} from "./marker-creation";
import type { IProjectData } from "@/shared/types/project.types";

// Type guard for DivIcon options (since we're mocking divIcon to return options)
interface DivIconOptions {
  html: string;
  className: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor: [number, number];
}

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

const mockProject: IProjectData = {
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
  created_at: new Date("2024-01-01T00:00:00Z"),
  updated_at: new Date("2024-01-01T00:00:00Z"),
};

describe("marker-creation", () => {
  describe("MARKER_COLORS", () => {
    it("should have density-based colors", () => {
      expect(MARKER_COLORS.density.single).toBe("#3b82f6"); // blue
      expect(MARKER_COLORS.density.small).toBe("#10b981");  // green
      expect(MARKER_COLORS.density.medium).toBe("#f59e0b"); // amber
      expect(MARKER_COLORS.density.large).toBe("#ef4444");  // red
    });

    it("should have muted colors", () => {
      expect(MARKER_COLORS.muted.single).toBe("#60a5fa"); // blue-400 - muted blue
      expect(MARKER_COLORS.muted.small).toBe("#34d399");  // emerald-400 - muted green
      expect(MARKER_COLORS.muted.medium).toBe("#fbbf24"); // amber-400 - muted amber
      expect(MARKER_COLORS.muted.large).toBe("#f87171");  // red-400 - muted red
    });

    it("should have legacy colors for backward compatibility", () => {
      expect(MARKER_COLORS.selected).toBe("#10b981");
      expect(MARKER_COLORS.unselected).toBe("#6b7280");
    });
  });

  describe("getMarkerColor", () => {
    it("should return correct colors for selected single project", () => {
      expect(getMarkerColor(1, true)).toBe("#3b82f6"); // blue
    });

    it("should return correct colors for selected small cluster", () => {
      expect(getMarkerColor(5, true)).toBe("#10b981"); // green
      expect(getMarkerColor(10, true)).toBe("#10b981"); // green
    });

    it("should return correct colors for selected medium cluster", () => {
      expect(getMarkerColor(25, true)).toBe("#f59e0b"); // amber
      expect(getMarkerColor(50, true)).toBe("#f59e0b"); // amber
    });

    it("should return correct colors for selected large cluster", () => {
      expect(getMarkerColor(75, true)).toBe("#ef4444"); // red
      expect(getMarkerColor(150, true)).toBe("#ef4444"); // red
    });

    it("should return muted colors for unselected markers", () => {
      expect(getMarkerColor(1, false)).toBe("#60a5fa");  // muted blue
      expect(getMarkerColor(5, false)).toBe("#34d399");  // muted green
      expect(getMarkerColor(25, false)).toBe("#fbbf24"); // muted amber
      expect(getMarkerColor(75, false)).toBe("#f87171"); // muted red
    });
  });

  describe("getMarkerDensityLabel", () => {
    it("should return correct labels for different cluster sizes", () => {
      expect(getMarkerDensityLabel(1)).toBe("single project");
      expect(getMarkerDensityLabel(5)).toBe("small cluster");
      expect(getMarkerDensityLabel(10)).toBe("small cluster");
      expect(getMarkerDensityLabel(25)).toBe("medium cluster");
      expect(getMarkerDensityLabel(50)).toBe("medium cluster");
      expect(getMarkerDensityLabel(75)).toBe("large cluster");
      expect(getMarkerDensityLabel(150)).toBe("large cluster");
    });
  });

  describe("createProjectMarker", () => {
    it("should create marker with correct coordinates", () => {
      const coords: [number, number] = [-25.2744, 122.2402];
      createProjectMarker([mockProject], coords, true);
      
      expect(L.marker).toHaveBeenCalledWith(coords, expect.any(Object));
    });

    it("should use density-based color for selected single project", () => {
      const marker = createProjectMarker([mockProject], [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain("#3b82f6"); // blue for single project
    });

    it("should use muted color for unselected single project", () => {
      const marker = createProjectMarker([mockProject], [-25, 122], false);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain("#60a5fa"); // muted blue
    });

    it("should use green for selected small cluster", () => {
      const projects = Array.from({ length: 5 }, (_, i) => ({ ...mockProject, id: i + 1 }));
      const marker = createProjectMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain("#10b981"); // green for small cluster
    });

    it("should use amber for selected medium cluster", () => {
      const projects = Array.from({ length: 25 }, (_, i) => ({ ...mockProject, id: i + 1 }));
      const marker = createProjectMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain("#f59e0b"); // amber for medium cluster
    });

    it("should use red for selected large cluster", () => {
      const projects = Array.from({ length: 75 }, (_, i) => ({ ...mockProject, id: i + 1 }));
      const marker = createProjectMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain("#ef4444"); // red for large cluster
    });

    it("should display correct count for single project", () => {
      const marker = createProjectMarker([mockProject], [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain(">1<");
    });

    it("should display correct count for multiple projects", () => {
      const projects = [mockProject, { ...mockProject, id: 2 }, { ...mockProject, id: 3 }];
      const marker = createProjectMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain(">3<");
    });

    it("should display '100+' for more than 100 projects", () => {
      const projects = Array.from({ length: 150 }, (_, i) => ({ ...mockProject, id: i + 1 }));
      const marker = createProjectMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain(">100+<");
    });

    it("should include proper ARIA label for single project", () => {
      const marker = createProjectMarker([mockProject], [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain(`aria-label="Project: ${mockProject.title}"`);
    });

    it("should include proper ARIA label for multiple projects with density info", () => {
      const projects = [mockProject, { ...mockProject, id: 2 }];
      const marker = createProjectMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain('aria-label="2 projects at this location (small cluster)"');
    });

    it("should include accessibility attributes", () => {
      const marker = createProjectMarker([mockProject], [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain('role="button"');
      expect(icon.html).toContain('tabindex="0"');
    });

    it("should include different hover styles for selected vs unselected", () => {
      const selectedMarker = createProjectMarker([mockProject], [-25, 122], true);
      const unselectedMarker = createProjectMarker([mockProject], [-25, 122], false);
      
      const selectedIcon = selectedMarker.getIcon() as unknown as DivIconOptions;
      const unselectedIcon = unselectedMarker.getIcon() as unknown as DivIconOptions;
      
      expect(selectedIcon.html).toContain('group-hover:scale-110');
      expect(unselectedIcon.html).toContain('group-hover:scale-105');
    });

    it("should include different focus ring styles for selected vs unselected", () => {
      const selectedMarker = createProjectMarker([mockProject], [-25, 122], true);
      const unselectedMarker = createProjectMarker([mockProject], [-25, 122], false);
      
      const selectedIcon = selectedMarker.getIcon() as unknown as DivIconOptions;
      const unselectedIcon = unselectedMarker.getIcon() as unknown as DivIconOptions;
      
      expect(selectedIcon.html).toContain('focus:ring-blue-500');
      expect(unselectedIcon.html).toContain('focus:ring-gray-400');
    });

    it("should include drop shadow", () => {
      const marker = createProjectMarker([mockProject], [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain('shadow-lg');
      expect(icon.html).toContain('bg-black opacity-20');
      expect(icon.html).toContain('blur-sm');
    });

    it("should include higher z-index for selected markers", () => {
      const selectedMarker = createProjectMarker([mockProject], [-25, 122], true);
      const unselectedMarker = createProjectMarker([mockProject], [-25, 122], false);
      
      const selectedIcon = selectedMarker.getIcon() as unknown as DivIconOptions;
      const unselectedIcon = unselectedMarker.getIcon() as unknown as DivIconOptions;
      
      expect(selectedIcon.html).toContain('z-50');
      expect(unselectedIcon.html).toContain('z-10');
    });

    it("should set correct icon properties", () => {
      const marker = createProjectMarker([mockProject], [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.className).toBe("project-marker");
      expect(icon.iconSize).toEqual([40, 40]);
      expect(icon.iconAnchor).toEqual([20, 20]);
      expect(icon.popupAnchor).toEqual([0, -20]);
    });
  });

  describe("createSingleProjectMarker", () => {
    it("should create marker for single project", () => {
      const coords: [number, number] = [-25, 122];
      const marker = createSingleProjectMarker(mockProject, coords, true);
      
      expect(L.marker).toHaveBeenCalledWith(coords, expect.any(Object));
      
      const icon = marker.getIcon() as unknown as DivIconOptions;
      expect(icon.html).toContain(">1<");
      expect(icon.html).toContain(`aria-label="Project: ${mockProject.title}"`);
      expect(icon.html).toContain("#3b82f6"); // blue for single project
    });
  });

  describe("createClusterMarker", () => {
    it("should create marker for project cluster", () => {
      const projects = [mockProject, { ...mockProject, id: 2 }];
      const coords: [number, number] = [-25, 122];
      const marker = createClusterMarker(projects, coords, true);
      
      expect(L.marker).toHaveBeenCalledWith(coords, expect.any(Object));
      
      const icon = marker.getIcon() as unknown as DivIconOptions;
      expect(icon.html).toContain(">2<");
      expect(icon.html).toContain('aria-label="2 projects at this location (small cluster)"');
      expect(icon.html).toContain("#10b981"); // green for small cluster
    });

    it("should throw error for empty projects array", () => {
      expect(() => {
        createClusterMarker([], [-25, 122], true);
      }).toThrow("Cannot create cluster marker with empty projects array");
    });
  });

  describe("getMarkerSize", () => {
    it("should return correct size for single project", () => {
      const size = getMarkerSize(1);
      expect(size).toEqual({ size: 40, iconAnchor: [20, 20] });
    });

    it("should return correct size for small clusters", () => {
      const size = getMarkerSize(5);
      expect(size).toEqual({ size: 40, iconAnchor: [20, 20] });
    });

    it("should return correct size for medium clusters", () => {
      const size = getMarkerSize(25);
      expect(size).toEqual({ size: 44, iconAnchor: [22, 22] });
    });

    it("should return correct size for large clusters", () => {
      const size = getMarkerSize(75);
      expect(size).toEqual({ size: 48, iconAnchor: [24, 24] });
    });
  });

  describe("createSizedMarker", () => {
    it("should create marker with appropriate size for cluster count", () => {
      const projects = Array.from({ length: 25 }, (_, i) => ({ ...mockProject, id: i + 1 }));
      const marker = createSizedMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.iconSize).toEqual([44, 44]);
      expect(icon.iconAnchor).toEqual([22, 22]);
      expect(icon.popupAnchor).toEqual([0, -12]); // -iconAnchor[1] + 10
    });

    it("should include size in HTML style", () => {
      const projects = Array.from({ length: 25 }, (_, i) => ({ ...mockProject, id: i + 1 }));
      const marker = createSizedMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain('width: 44px');
      expect(icon.html).toContain('height: 44px');
    });

    it("should use correct density-based color", () => {
      const projects = Array.from({ length: 25 }, (_, i) => ({ ...mockProject, id: i + 1 }));
      const marker = createSizedMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain("#f59e0b"); // amber for medium cluster
    });

    it("should include density label in ARIA description", () => {
      const projects = Array.from({ length: 25 }, (_, i) => ({ ...mockProject, id: i + 1 }));
      const marker = createSizedMarker(projects, [-25, 122], true);
      const icon = marker.getIcon() as unknown as DivIconOptions;
      
      expect(icon.html).toContain('aria-label="25 projects at this location (medium cluster)"');
    });

    it("should include higher z-index for selected markers in sized marker", () => {
      const projects = Array.from({ length: 25 }, (_, i) => ({ ...mockProject, id: i + 1 }));
      const selectedMarker = createSizedMarker(projects, [-25, 122], true);
      const unselectedMarker = createSizedMarker(projects, [-25, 122], false);
      
      const selectedIcon = selectedMarker.getIcon() as unknown as DivIconOptions;
      const unselectedIcon = unselectedMarker.getIcon() as unknown as DivIconOptions;
      
      expect(selectedIcon.html).toContain('z-50');
      expect(unselectedIcon.html).toContain('z-10');
    });
  });
});