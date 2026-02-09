import L from "leaflet";
import type { IProjectData } from "@/shared/types/project.types";
import type {
	GeoJSONData,
	ISimpleLocationData,
	ProjectWithCoords,
} from "@/features/projects/types/map.types";
import { GEOJSON_PROPERTY_NAMES } from "@/features/projects/types/map.types";
import { logger } from "@/shared/services/logger.service";

// Track areas with invalid bounds to avoid spamming logs
const invalidBoundsCache = new Set<string>();

/**
 * Normalize a string for comparison
 * - Convert to lowercase
 * - Trim whitespace
 * - Remove special characters
 * - Normalize whitespace to single spaces
 */
function normalizeString(str: string | undefined | null): string {
	if (!str) return "";
	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s]/g, "") // Remove special chars
		.replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Fuzzy match two strings with 70% similarity threshold
 * 
 * Matching strategy:
 * 1. Exact match after normalization
 * 2. Contains match (one string contains the other)
 * 3. Word similarity (70% of words match)
 * 
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns True if strings match with >= 70% similarity
 */
export function fuzzyMatch(str1: string, str2: string): boolean {
	const norm1 = normalizeString(str1);
	const norm2 = normalizeString(str2);

	// Exact match after normalization
	if (norm1 === norm2) return true;

	// Contains match
	if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

	// Word similarity (70% threshold)
	const words1 = norm1.split(" ");
	const words2 = norm2.split(" ");
	let matches = 0;

	for (const word1 of words1) {
		if (word1.length < 3) continue; // Skip short words
		if (
			words2.some(
				(word2) => word2.includes(word1) || word1.includes(word2)
			)
		) {
			matches++;
		}
	}

	const threshold = Math.min(words1.length, words2.length) * 0.7;
	return matches >= threshold;
}

/**
 * Match an area name to a GeoJSON feature and return center coordinates
 * 
 * @param areaName - Name of the area to match
 * @param geoJson - GeoJSON FeatureCollection to search
 * @param propertyName - Property name in GeoJSON features containing the area name
 * @returns [lat, lng] tuple or null if no match found
 */
export function matchToGeoJSON(
	areaName: string | undefined | null,
	geoJson: GeoJSON.FeatureCollection | null,
	propertyName: string
): [number, number] | null {
	if (!geoJson || !geoJson.features || !areaName) return null;

	// Try exact match first
	let feature = geoJson.features.find(
		(f) => f.properties && f.properties[propertyName] === areaName
	);

	// Try fuzzy match if exact fails
	if (!feature) {
		feature = geoJson.features.find(
			(f) =>
				f.properties &&
				f.properties[propertyName] &&
				fuzzyMatch(f.properties[propertyName], areaName)
		);
	}

	if (feature) {
		try {
			const layer = L.geoJSON(feature as GeoJSON.Feature);
			const bounds = layer.getBounds();
			
			// Check if bounds are valid
			if (!bounds || !bounds.isValid()) {
				// Only log once per unique area to avoid spam
				const cacheKey = `${areaName}-${propertyName}`;
				if (!invalidBoundsCache.has(cacheKey)) {
					invalidBoundsCache.add(cacheKey);
					logger.debug("Invalid bounds for GeoJSON feature (will not log again)", {
						areaName,
						propertyName,
					});
				}
				return null;
			}
			
			const center = bounds.getCenter();
			return [center.lat, center.lng];
		} catch (error) {
			logger.error("Error calculating center point for GeoJSON feature", {
				areaName,
				propertyName,
				errorMessage: error instanceof Error ? error.message : String(error),
			});
			return null;
		}
	}

	return null;
}

/**
 * Calculate coordinates for a project from its location area data
 * 
 * Priority order:
 * 1. DBCA Regions
 * 2. DBCA Districts
 * 3. NRM
 * 4. IBRA
 * 5. IMCRA
 * 
 * Uses fuzzy matching (70% threshold) when exact match fails.
 * 
 * @param project - Project data with areas
 * @param geoJsonData - GeoJSON data for all location types
 * @returns [lat, lng] tuple or null if no match found
 */
export function calculateCoordinates(
	project: IProjectData,
	geoJsonData: GeoJSONData
): [number, number] | null {
	// Get project's areas
	const areas = project.areas;
	if (!areas || areas.length === 0) return null;

	// For each area, try to match to GeoJSON features
	for (const area of areas) {
		// Try to match area name to GeoJSON features (in priority order)
		const coords =
			matchToGeoJSON(
				area.name,
				geoJsonData.dbcaRegions,
				GEOJSON_PROPERTY_NAMES.dbcaRegions
			) ||
			matchToGeoJSON(
				area.name,
				geoJsonData.dbcaDistricts,
				GEOJSON_PROPERTY_NAMES.dbcaDistricts
			) ||
			matchToGeoJSON(
				area.name,
				geoJsonData.nrm,
				GEOJSON_PROPERTY_NAMES.nrm
			) ||
			matchToGeoJSON(
				area.name,
				geoJsonData.ibra,
				GEOJSON_PROPERTY_NAMES.ibra
			) ||
			matchToGeoJSON(
				area.name,
				geoJsonData.imcra,
				GEOJSON_PROPERTY_NAMES.imcra
			);

		if (coords) return coords;
	}

	// No match found
	logger.debug("No coordinates found for project", {
		projectId: project.id,
		projectTitle: project.title,
		areas: areas.map((a) => a.name),
	});

	return null;
}

/**
 * Calculate coordinates for all projects
 * 
 * @param projects - Array of projects
 * @param locationMetadata - Location metadata (not used, kept for API compatibility)
 * @param geoJsonData - GeoJSON data for all location types
 * @returns Array of projects with coordinates
 */
export function calculateProjectCoordinates(
	projects: IProjectData[],
	_locationMetadata: ISimpleLocationData[],
	geoJsonData: GeoJSONData
): ProjectWithCoords[] {
	const projectsWithCoords: ProjectWithCoords[] = [];

	for (const project of projects) {
		const coords = calculateCoordinates(project, geoJsonData);

		if (coords) {
			projectsWithCoords.push({
				...project,
				coords,
			});
		}
	}

	logger.info("Calculated coordinates for projects", {
		total: projects.length,
		withCoords: projectsWithCoords.length,
		withoutCoords: projects.length - projectsWithCoords.length,
	});

	return projectsWithCoords;
}
