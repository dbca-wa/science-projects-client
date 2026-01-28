import { useQuery } from "@tanstack/react-query";
import type { GeoJSONLayerType } from "@/features/projects/types/map.types";
import { GEOJSON_PATHS } from "@/features/projects/types/map.types";
import { logger } from "@/shared/services/logger.service";

/**
 * Load a single GeoJSON file
 * 
 * @param layerType - Type of GeoJSON layer to load
 * @returns GeoJSON FeatureCollection
 */
async function loadGeoJSONLayer(
	layerType: GeoJSONLayerType
): Promise<GeoJSON.FeatureCollection> {
	try {
		const path = GEOJSON_PATHS[layerType];
		const response = await fetch(path);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status} for ${layerType}`);
		}

		const data = await response.json();

		logger.info(`Loaded GeoJSON data for ${layerType}`, {
			featureCount: data.features?.length || 0,
		});

		return data;
	} catch (error) {
		logger.error(`Failed to load GeoJSON data for ${layerType}`, {
			errorMessage: error instanceof Error ? error.message : String(error),
			path: GEOJSON_PATHS[layerType],
		});
		throw error;
	}
}

/**
 * Hook to load DBCA Regions GeoJSON data
 * 
 * @returns TanStack Query result with DBCA Regions data
 */
export function useDBCARegions() {
	return useQuery({
		queryKey: ["geojson", "dbcaRegions"],
		queryFn: () => loadGeoJSONLayer("dbcaRegions"),
		staleTime: 30 * 60 * 1000, // 30 minutes
		gcTime: 60 * 60 * 1000, // 1 hour
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}

/**
 * Hook to load DBCA Districts GeoJSON data
 * 
 * @returns TanStack Query result with DBCA Districts data
 */
export function useDBCADistricts() {
	return useQuery({
		queryKey: ["geojson", "dbcaDistricts"],
		queryFn: () => loadGeoJSONLayer("dbcaDistricts"),
		staleTime: 30 * 60 * 1000, // 30 minutes
		gcTime: 60 * 60 * 1000, // 1 hour
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}

/**
 * Hook to load NRM GeoJSON data
 * 
 * @returns TanStack Query result with NRM data
 */
export function useNRM() {
	return useQuery({
		queryKey: ["geojson", "nrm"],
		queryFn: () => loadGeoJSONLayer("nrm"),
		staleTime: 30 * 60 * 1000, // 30 minutes
		gcTime: 60 * 60 * 1000, // 1 hour
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}

/**
 * Hook to load IBRA GeoJSON data
 * 
 * @returns TanStack Query result with IBRA data
 */
export function useIBRA() {
	return useQuery({
		queryKey: ["geojson", "ibra"],
		queryFn: () => loadGeoJSONLayer("ibra"),
		staleTime: 30 * 60 * 1000, // 30 minutes
		gcTime: 60 * 60 * 1000, // 1 hour
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}

/**
 * Hook to load IMCRA GeoJSON data
 * 
 * @returns TanStack Query result with IMCRA data
 */
export function useIMCRA() {
	return useQuery({
		queryKey: ["geojson", "imcra"],
		queryFn: () => loadGeoJSONLayer("imcra"),
		staleTime: 30 * 60 * 1000, // 30 minutes
		gcTime: 60 * 60 * 1000, // 1 hour
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}

/**
 * Hook to load a specific GeoJSON layer by type
 * 
 * @param layerType - Type of GeoJSON layer to load
 * @returns TanStack Query result with layer data
 */
export function useGeoJSONLayer(layerType: GeoJSONLayerType) {
	return useQuery({
		queryKey: ["geojson", layerType],
		queryFn: () => loadGeoJSONLayer(layerType),
		staleTime: 30 * 60 * 1000, // 30 minutes
		gcTime: 60 * 60 * 1000, // 1 hour
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}

/**
 * Hook to load all GeoJSON layers using TanStack Query
 * 
 * Provides individual query states for each layer type,
 * allowing for granular loading states and error handling.
 * 
 * @returns Object containing query results for all layer types
 */
export function useAllGeoJSONLayers() {
	const dbcaRegions = useDBCARegions();
	const dbcaDistricts = useDBCADistricts();
	const nrm = useNRM();
	const ibra = useIBRA();
	const imcra = useIMCRA();

	return {
		dbcaRegions,
		dbcaDistricts,
		nrm,
		ibra,
		imcra,
		// Computed states
		isLoading: dbcaRegions.isLoading || dbcaDistricts.isLoading || nrm.isLoading || ibra.isLoading || imcra.isLoading,
		isError: dbcaRegions.isError || dbcaDistricts.isError || nrm.isError || ibra.isError || imcra.isError,
		error: dbcaRegions.error || dbcaDistricts.error || nrm.error || ibra.error || imcra.error,
		// Combined data (compatible with existing useGeoJSON interface)
		data: {
			dbcaRegions: dbcaRegions.data || null,
			dbcaDistricts: dbcaDistricts.data || null,
			nrm: nrm.data || null,
			ibra: ibra.data || null,
			imcra: imcra.data || null,
		},
	};
}