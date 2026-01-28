import { useMemo } from "react";
import type { IProjectData } from "@/shared/types/project.types";
import type { GeoJSONData, ISimpleLocationData } from "@/features/projects/types/map.types";
import { calculateProjectCoordinates } from "@/features/projects/utils/coordinate-calculation";
import { clusterProjects } from "@/features/projects/utils/clustering";
import { ProjectMarker } from "./ProjectMarker";

interface ProjectMapMarkersProps {
	projects: IProjectData[];
	locationMetadata: ISimpleLocationData[];
	geoJsonData: GeoJSONData;
	selectedBusinessAreas: number[];
}

/**
 * ProjectMapMarkers component
 * 
 * Renders all project markers on the map with clustering.
 * 
 * Process:
 * 1. Calculate coordinates for all projects from location area data
 * 2. Cluster projects by location (within 0.0001 degrees)
 * 3. Render a marker for each cluster
 * 
 * Features:
 * - Automatic coordinate calculation from area names
 * - Clustering to reduce marker count
 * - Memoized to prevent unnecessary recalculations
 * - Handles projects without coordinates gracefully
 */
export function ProjectMapMarkers({
	projects,
	locationMetadata,
	geoJsonData,
	selectedBusinessAreas,
}: ProjectMapMarkersProps) {
	// Calculate coordinates and cluster projects
	const clusters = useMemo(() => {
		// Calculate coordinates for all projects
		const projectsWithCoords = calculateProjectCoordinates(
			projects,
			locationMetadata,
			geoJsonData
		);

		// Cluster projects by location
		return clusterProjects(projectsWithCoords);
	}, [projects, locationMetadata, geoJsonData]);

	// Render markers for each cluster
	return (
		<>
			{Array.from(clusters.values()).map((cluster, index) => (
				<ProjectMarker
					key={`${cluster.coords[0]}-${cluster.coords[1]}-${index}`}
					projects={cluster.projects}
					coords={cluster.coords}
					selectedBusinessAreas={selectedBusinessAreas}
				/>
			))}
		</>
	);
}
