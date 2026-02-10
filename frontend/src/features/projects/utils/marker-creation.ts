import L from "leaflet";
import type { IProjectData } from "@/shared/types/project.types";
import { extractTextFromHTML } from "@/shared/utils/html-display.utils";

/**
 * Marker creation utilities for the project map
 * 
 * Creates modern circular markers (no traditional pins) with:
 * - Density-based colors (blue, green, amber, red)
 * - Selection state (vibrant vs muted colors)
 * - Hover animations (scale effect)
 * - Drop shadow for depth
 * - Proper ARIA labels for accessibility
 */

/**
 * Escape special characters for safe use in HTML attributes
 * Prevents HTML injection and ensures proper rendering
 * 
 * @param text - Plain text to escape
 * @returns Escaped text safe for HTML attributes
 */
const escapeHtmlAttribute = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Color constants for markers
 * Supports both density-based colors and selection states
 */
export const MARKER_COLORS = {
  // Density-based colors (selected state)
  density: {
    single: "#3b82f6",     // blue - single project
    small: "#10b981",      // green - 2-10 projects  
    medium: "#f59e0b",     // amber - 11-50 projects
    large: "#ef4444",      // red - 50+ projects
  },
  // Unselected/muted versions (maintain density colors but more muted)
  muted: {
    single: "#60a5fa",     // blue-400 - muted blue (still clearly blue)
    small: "#34d399",      // emerald-400 - muted green (still clearly green)
    medium: "#fbbf24",     // amber-400 - muted amber (still clearly amber/orange)
    large: "#f87171",      // red-400 - muted red (still clearly red)
  },
  // Legacy colors for backward compatibility
  selected: "#10b981",     // green
  unselected: "#6b7280",   // gray
} as const;

/**
 * Determines the appropriate marker color based on project count and selection state
 * 
 * @param count - Number of projects in the marker
 * @param isSelected - Whether the marker is in selected state
 * @returns Hex color string
 */
export const getMarkerColor = (count: number, isSelected: boolean): string => {
  const colorSet = isSelected ? MARKER_COLORS.density : MARKER_COLORS.muted;
  
  if (count === 1) {
    return colorSet.single;
  } else if (count <= 10) {
    return colorSet.small;
  } else if (count <= 50) {
    return colorSet.medium;
  } else {
    return colorSet.large;
  }
};

/**
 * Gets a descriptive label for the marker color category
 * 
 * @param count - Number of projects in the marker
 * @returns String description of the density category
 */
export const getMarkerDensityLabel = (count: number): string => {
  if (count === 1) {
    return "single project";
  } else if (count <= 10) {
    return "small cluster";
  } else if (count <= 50) {
    return "medium cluster";
  } else {
    return "large cluster";
  }
};

/**
 * Creates a modern circular marker for a single project or cluster
 * 
 * @param projects - Array of projects at this location
 * @param coords - [latitude, longitude] coordinates
 * @param isSelected - Whether the marker represents selected/filtered projects
 * @returns Leaflet marker with circular design
 */
export const createProjectMarker = (
  projects: IProjectData[],
  coords: [number, number],
  isSelected: boolean = true
): L.Marker => {
  const count = projects.length;
  const displayCount = count > 100 ? "100+" : count.toString();
  const color = getMarkerColor(count, isSelected);
  const densityLabel = getMarkerDensityLabel(count);
  
  // Create accessible label with sanitized plain text
  const plainTextTitle = count === 1 ? extractTextFromHTML(projects[0].title) : "";
  const ariaLabel = count === 1 
    ? `Project: ${plainTextTitle}`
    : `${count} projects at this location (${densityLabel})`;
  
  // Escape for safe use in HTML attribute
  const safeAriaLabel = escapeHtmlAttribute(ariaLabel);

  // Add visual emphasis for selected state
  const ringClass = isSelected 
    ? "focus:ring-blue-500 focus:ring-offset-2" 
    : "focus:ring-gray-400 focus:ring-offset-1";
  
  const scaleClass = isSelected 
    ? "group-hover:scale-110 focus:scale-110" 
    : "group-hover:scale-105 focus:scale-105";

  // Higher z-index for selected markers so they appear on top
  const zIndexClass = isSelected ? "z-50" : "z-10";

  const icon = L.divIcon({
    className: "project-marker",
    html: `
      <div class="relative group cursor-pointer ${zIndexClass}" role="button" aria-label="${safeAriaLabel}" tabindex="0">
        <div class="w-10 h-10 rounded-full shadow-lg transition-transform ${scaleClass} focus:outline-none focus:ring-2 ${ringClass}"
             style="background-color: ${color}">
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-white text-sm font-bold select-none">${displayCount}</span>
          </div>
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black opacity-20 rounded-full blur-sm"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });

  return L.marker(coords, { icon });
};

/**
 * Creates a marker specifically for a single project
 * 
 * @param project - Single project data
 * @param coords - [latitude, longitude] coordinates
 * @param isSelected - Whether the project matches current filters
 * @returns Leaflet marker for single project
 */
export const createSingleProjectMarker = (
  project: IProjectData,
  coords: [number, number],
  isSelected: boolean = true
): L.Marker => {
  return createProjectMarker([project], coords, isSelected);
};

/**
 * Creates a marker for a cluster of projects
 * 
 * @param projects - Array of projects in the cluster
 * @param coords - [latitude, longitude] coordinates (cluster centroid)
 * @param isSelected - Whether the cluster represents selected/filtered projects
 * @returns Leaflet marker for project cluster
 */
export const createClusterMarker = (
  projects: IProjectData[],
  coords: [number, number],
  isSelected: boolean = true
): L.Marker => {
  if (projects.length === 0) {
    throw new Error("Cannot create cluster marker with empty projects array");
  }
  
  return createProjectMarker(projects, coords, isSelected);
};

/**
 * Determines marker size based on cluster count
 * Used for potential future enhancements with variable marker sizes
 * 
 * @param count - Number of projects in cluster
 * @returns Size configuration object
 */
export const getMarkerSize = (count: number) => {
  if (count === 1) {
    return { size: 40, iconAnchor: [20, 20] };
  } else if (count <= 10) {
    return { size: 40, iconAnchor: [20, 20] };
  } else if (count <= 50) {
    return { size: 44, iconAnchor: [22, 22] };
  } else {
    return { size: 48, iconAnchor: [24, 24] };
  }
};

/**
 * Creates a marker with custom size based on cluster count
 * Currently uses fixed size, but prepared for future enhancements
 * 
 * @param projects - Array of projects at this location
 * @param coords - [latitude, longitude] coordinates
 * @param isSelected - Whether the marker represents selected/filtered projects
 * @returns Leaflet marker with appropriate size
 */
export const createSizedMarker = (
  projects: IProjectData[],
  coords: [number, number],
  isSelected: boolean = true
): L.Marker => {
  const count = projects.length;
  const displayCount = count > 100 ? "100+" : count.toString();
  const color = getMarkerColor(count, isSelected);
  const densityLabel = getMarkerDensityLabel(count);
  const sizeConfig = getMarkerSize(count);
  
  // Create accessible label with sanitized plain text
  const plainTextTitle = count === 1 ? extractTextFromHTML(projects[0].title) : "";
  const ariaLabel = count === 1 
    ? `Project: ${plainTextTitle}`
    : `${count} projects at this location (${densityLabel})`;
  
  // Escape for safe use in HTML attribute
  const safeAriaLabel = escapeHtmlAttribute(ariaLabel);

  // Add visual emphasis for selected state
  const ringClass = isSelected 
    ? "focus:ring-blue-500 focus:ring-offset-2" 
    : "focus:ring-gray-400 focus:ring-offset-1";
  
  const scaleClass = isSelected 
    ? "group-hover:scale-110 focus:scale-110" 
    : "group-hover:scale-105 focus:scale-105";

  // Higher z-index for selected markers so they appear on top
  const zIndexClass = isSelected ? "z-50" : "z-10";

  const icon = L.divIcon({
    className: "project-marker",
    html: `
      <div class="relative group cursor-pointer ${zIndexClass}" role="button" aria-label="${safeAriaLabel}" tabindex="0">
        <div class="rounded-full shadow-lg transition-transform ${scaleClass} focus:outline-none focus:ring-2 ${ringClass}"
             style="background-color: ${color}; width: ${sizeConfig.size}px; height: ${sizeConfig.size}px;">
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-white text-sm font-bold select-none">${displayCount}</span>
          </div>
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black opacity-20 rounded-full blur-sm"></div>
      </div>
    `,
    iconSize: [sizeConfig.size, sizeConfig.size],
    iconAnchor: [sizeConfig.iconAnchor[0], sizeConfig.iconAnchor[1]],
    popupAnchor: [0, -sizeConfig.iconAnchor[1] + 10],
  });

  return L.marker(coords, { icon });
};