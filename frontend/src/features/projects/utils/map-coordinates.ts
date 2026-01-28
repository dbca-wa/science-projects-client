import type { IProjectData } from "@/shared/types/project.types";
import { calculateCoordinates } from "./coordinate-calculation";
import type { GeoJSONData } from "@/features/projects/types/map.types";

export interface ProjectWithCoordinates {
  project: IProjectData;
  coordinates: [number, number];
}

/**
 * Calculate the centroid (average center point) of multiple coordinates.
 * 
 * @param coords - Array of [lat, lng] coordinate pairs
 * @returns [lat, lng] centroid or null if array is empty
 */
export function calculateCentroid(
  coords: [number, number][]
): [number, number] | null {
  if (coords.length === 0) return null;
  if (coords.length === 1) return coords[0];

  const sum = coords.reduce(
    (acc, [lat, lng]) => {
      acc.lat += lat;
      acc.lng += lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  return [sum.lat / coords.length, sum.lng / coords.length];
}

/**
 * Calculate coordinates for a project, handling multi-location projects.
 * 
 * For projects with multiple location areas:
 * - Calculates coordinates for each valid area
 * - Returns the centroid of all valid coordinates
 * 
 * For projects with a single location area:
 * - Returns the coordinates for that area
 * 
 * For projects with no valid locations:
 * - Returns null
 * 
 * @param project - Project data with areas
 * @param geoJsonData - GeoJSON data for all location types
 * @returns [lat, lng] tuple or null if no valid coordinates
 */
export function calculateProjectCoordinates(
  project: IProjectData,
  geoJsonData: GeoJSONData
): [number, number] | null {
  // Handle projects with no areas
  if (!project.areas || project.areas.length === 0) {
    return null;
  }

  // Single location - use existing logic
  if (project.areas.length === 1) {
    return calculateCoordinates(project, geoJsonData);
  }

  // Multiple locations - calculate centroid
  const validCoords: [number, number][] = [];

  for (const area of project.areas) {
    // Create a temporary project with just this area
    const tempProject = { ...project, areas: [area] };
    const coords = calculateCoordinates(tempProject, geoJsonData);
    
    if (coords) {
      validCoords.push(coords);
    }
  }

  // Return centroid of all valid coordinates
  return calculateCentroid(validCoords);
}

/**
 * Calculate coordinates for multiple projects.
 * 
 * @param projects - Array of projects
 * @param geoJsonData - GeoJSON data for all location types
 * @returns Array of projects with their calculated coordinates
 */
export function calculateAllProjectCoordinates(
  projects: IProjectData[],
  geoJsonData: GeoJSONData
): ProjectWithCoordinates[] {
  const projectsWithCoords: ProjectWithCoordinates[] = [];

  for (const project of projects) {
    const coordinates = calculateProjectCoordinates(project, geoJsonData);

    if (coordinates) {
      projectsWithCoords.push({
        project,
        coordinates,
      });
    }
  }

  return projectsWithCoords;
}
