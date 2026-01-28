import type { IProjectData } from "@/shared/types/project.types";
import type { ProjectWithCoordinates } from "./map-coordinates";

export interface ClusteredMarker {
  projects: IProjectData[];
  position: [number, number];
  isFiltered: boolean;
}

/**
 * Clustering threshold in degrees.
 * Projects within this distance are grouped together.
 */
const CLUSTERING_THRESHOLD = 0.0001;

/**
 * Calculate the distance between two coordinates in degrees.
 * 
 * Uses simple Euclidean distance for small distances.
 * This is sufficient for the clustering threshold of 0.0001 degrees.
 * 
 * @param coord1 - First coordinate [lat, lng]
 * @param coord2 - Second coordinate [lat, lng]
 * @returns Distance in degrees
 */
function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lng1] = coord1;
  const [lat2, lng2] = coord2;
  
  const latDiff = lat1 - lat2;
  const lngDiff = lng1 - lng2;
  
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

/**
 * Check if two coordinates are within the clustering threshold.
 * 
 * @param coord1 - First coordinate [lat, lng]
 * @param coord2 - Second coordinate [lat, lng]
 * @returns True if coordinates are within threshold
 */
function areCoordinatesNearby(
  coord1: [number, number],
  coord2: [number, number]
): boolean {
  return calculateDistance(coord1, coord2) <= CLUSTERING_THRESHOLD;
}

/**
 * Cluster projects that are at the same or very close coordinates.
 * 
 * Algorithm:
 * 1. For each project, check if it's near any existing cluster
 * 2. If yes, add to that cluster
 * 3. If no, create a new cluster
 * 
 * Projects within 0.0001 degrees of each other are clustered together.
 * 
 * @param projectsWithCoords - Array of projects with coordinates
 * @param isFiltered - Function to determine if a project is filtered
 * @returns Array of clustered markers
 */
export function clusterProjects(
  projectsWithCoords: ProjectWithCoordinates[],
  isFiltered: (project: IProjectData) => boolean
): ClusteredMarker[] {
  // Handle empty array
  if (projectsWithCoords.length === 0) {
    return [];
  }

  const clusters: ClusteredMarker[] = [];

  for (const { project, coordinates } of projectsWithCoords) {
    // Find existing cluster within threshold
    const existingCluster = clusters.find((cluster) =>
      areCoordinatesNearby(cluster.position, coordinates)
    );

    if (existingCluster) {
      // Add to existing cluster
      existingCluster.projects.push(project);
      
      // Update isFiltered: true if ANY project in cluster is filtered
      if (isFiltered(project)) {
        existingCluster.isFiltered = true;
      }
    } else {
      // Create new cluster
      clusters.push({
        projects: [project],
        position: coordinates,
        isFiltered: isFiltered(project),
      });
    }
  }

  return clusters;
}

/**
 * Get the count of projects in a cluster.
 * 
 * @param cluster - Clustered marker
 * @returns Number of projects in the cluster
 */
export function getClusterCount(cluster: ClusteredMarker): number {
  return cluster.projects.length;
}

/**
 * Check if a cluster contains multiple projects.
 * 
 * @param cluster - Clustered marker
 * @returns True if cluster has more than one project
 */
export function isMultiProjectCluster(cluster: ClusteredMarker): boolean {
  return cluster.projects.length > 1;
}
