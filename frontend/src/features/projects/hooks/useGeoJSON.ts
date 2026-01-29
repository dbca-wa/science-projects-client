import { useState, useEffect } from "react";
import type { GeoJSONData, GeoJSONLayerType } from "@/features/projects/types/map.types";
import { GEOJSON_PATHS } from "@/features/projects/types/map.types";
import { logger } from "@/shared/services/logger.service";

/**
 * Cache for loaded GeoJSON data
 * Prevents redundant network requests and improves performance
 */
const geoJsonCache: Partial<Record<GeoJSONLayerType, GeoJSON.FeatureCollection>> = {};

/**
 * Cache timestamps to track when data was loaded
 * Allows for cache invalidation if needed
 */
const cacheTimestamps: Partial<Record<GeoJSONLayerType, number>> = {};

/**
 * Maximum cache age in milliseconds (30 minutes)
 * After this time, data will be reloaded from server
 */
const CACHE_MAX_AGE = 30 * 60 * 1000;

/**
 * Load a single GeoJSON file with caching and cache invalidation
 * 
 * @param layerType - Type of GeoJSON layer to load
 * @returns GeoJSON FeatureCollection or null if load fails
 */
async function loadGeoJSON(
	layerType: GeoJSONLayerType
): Promise<GeoJSON.FeatureCollection | null> {
	// Check cache first and validate age
	const cachedData = geoJsonCache[layerType];
	const cacheTime = cacheTimestamps[layerType];
	const now = Date.now();
	
	if (cachedData && cacheTime && (now - cacheTime) < CACHE_MAX_AGE) {
		logger.debug(`Using cached GeoJSON data for ${layerType}`, {
			cacheAge: Math.round((now - cacheTime) / 1000) + 's'
		});
		return cachedData;
	}

	try {
		const path = GEOJSON_PATHS[layerType];
		const response = await fetch(path);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Validate GeoJSON structure
		if (!data.features || !Array.isArray(data.features)) {
			throw new Error(`Invalid GeoJSON structure for ${layerType}`);
		}

		// Cache the data with timestamp
		geoJsonCache[layerType] = data;
		cacheTimestamps[layerType] = now;

		logger.info(`Loaded GeoJSON data for ${layerType}`, {
			featureCount: data.features.length,
			cacheUpdated: true,
		});

		return data;
	} catch (error) {
		logger.error(`Failed to load GeoJSON data for ${layerType}`, {
			errorMessage: error instanceof Error ? error.message : String(error),
			path: GEOJSON_PATHS[layerType],
		});
		
		// Return cached data if available, even if expired
		if (geoJsonCache[layerType]) {
			logger.warn(`Using expired cache for ${layerType} due to load failure`);
			return geoJsonCache[layerType]!;
		}
		
		return null;
	}
}

/**
 * Hook to load all GeoJSON data for the map
 * 
 * Loads all 5 GeoJSON files (DBCA Regions, Districts, NRM, IBRA, IMCRA)
 * from static files in /public/data/optimized/
 * 
 * Features:
 * - Caches loaded data to avoid redundant requests
 * - Handles load failures gracefully (returns null for failed layers)
 * - Logs errors but continues functioning
 * 
 * @returns Object containing GeoJSON data and loading state
 */
export function useGeoJSON() {
	const [data, setData] = useState<GeoJSONData>({
		dbcaRegions: null,
		dbcaDistricts: null,
		nrm: null,
		ibra: null,
		imcra: null,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadAllGeoJSON() {
			setLoading(true);
			setError(null);

			try {
				// Load all GeoJSON files in parallel
				const [dbcaRegions, dbcaDistricts, nrm, ibra, imcra] =
					await Promise.all([
						loadGeoJSON("dbcaRegions"),
						loadGeoJSON("dbcaDistricts"),
						loadGeoJSON("nrm"),
						loadGeoJSON("ibra"),
						loadGeoJSON("imcra"),
					]);

				if (isMounted) {
					setData({
						dbcaRegions,
						dbcaDistricts,
						nrm,
						ibra,
						imcra,
					});

					// Check if any layers failed to load
					const failedLayers = [];
					if (!dbcaRegions) failedLayers.push("DBCA Regions");
					if (!dbcaDistricts) failedLayers.push("DBCA Districts");
					if (!nrm) failedLayers.push("NRM");
					if (!ibra) failedLayers.push("IBRA");
					if (!imcra) failedLayers.push("IMCRA");

					if (failedLayers.length > 0) {
						const errorMsg = `Failed to load: ${failedLayers.join(", ")}`;
						setError(errorMsg);
						logger.warn("Some GeoJSON layers failed to load", {
							failedLayers,
						});
					}

					setLoading(false);
				}
			} catch (err) {
				if (isMounted) {
					const errorMsg = "Failed to load GeoJSON data";
					setError(errorMsg);
					setLoading(false);
					logger.error(errorMsg, { 
						errorMessage: err instanceof Error ? err.message : String(err) 
					});
				}
			}
		}

		loadAllGeoJSON();

		return () => {
			isMounted = false;
		};
	}, []);

	return { data, loading, error };
}
