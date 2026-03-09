import type {
	ProjectWithCoords,
	ProjectCluster,
} from "@/features/projects/types/map.types";

/**
 * Cluster projects by location
 *
 * Groups projects within 0.0001 degrees (≈11 meters) into clusters.
 * This reduces marker count and improves map performance.
 *
 * Performance optimizations:
 * - Uses Map for O(1) lookups instead of array searches
 * - Pre-allocates cluster objects to reduce garbage collection
 * - Uses fixed-precision coordinate keys for consistent clustering
 *
 * @param projects - Array of projects with coordinates
 * @returns Map of coordinate keys to project clusters
 */
export function clusterProjects(
	projects: ProjectWithCoords[]
): Map<string, ProjectCluster> {
	const clusters = new Map<string, ProjectCluster>();

	// Early return for empty arrays
	if (projects.length === 0) {
		return clusters;
	}

	for (const project of projects) {
		// Round coordinates to 4 decimal places (≈11 meters precision)
		// Use consistent rounding to ensure same coordinates cluster together
		const lat = Math.round(project.coords[0] * 10000) / 10000;
		const lng = Math.round(project.coords[1] * 10000) / 10000;
		const key = `${lat},${lng}`;

		let cluster = clusters.get(key);
		if (!cluster) {
			// Pre-allocate cluster with rounded coordinates for consistency
			cluster = {
				coords: [lat, lng],
				projects: [],
			};
			clusters.set(key, cluster);
		}

		cluster.projects.push(project);
	}

	return clusters;
}

/**
 * Get cluster count display string
 *
 * For clusters with > 100 projects, displays "100+" instead of exact count.
 *
 * @param count - Number of projects in cluster
 * @returns Display string for cluster count
 */
export function getClusterCountDisplay(count: number): string {
	return count > 100 ? "100+" : count.toString();
}
