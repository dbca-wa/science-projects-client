import type { ProjectWithCoords, ProjectCluster } from "@/features/projects/types/map.types";

/**
 * Cluster projects by location
 * 
 * Groups projects within 0.0001 degrees (≈11 meters) into clusters.
 * This reduces marker count and improves map performance.
 * 
 * @param projects - Array of projects with coordinates
 * @returns Map of coordinate keys to project clusters
 */
export function clusterProjects(
	projects: ProjectWithCoords[]
): Map<string, ProjectCluster> {
	const clusters = new Map<string, ProjectCluster>();

	for (const project of projects) {
		// Round coordinates to 4 decimal places (≈11 meters precision)
		const key = `${project.coords[0].toFixed(4)},${project.coords[1].toFixed(4)}`;

		if (!clusters.has(key)) {
			clusters.set(key, {
				coords: project.coords,
				projects: [],
			});
		}

		clusters.get(key)!.projects.push(project);
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
