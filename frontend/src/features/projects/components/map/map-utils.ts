import { GEOJSON_PROPERTY_NAMES } from "@/features/projects/types/map.types";

/**
 * Mapping from layer type strings to GeoJSON data keys
 */
export const LAYER_TO_GEOJSON_KEY: Record<
	string,
	keyof typeof GEOJSON_PROPERTY_NAMES
> = {
	dbcaregion: "dbcaRegions",
	dbcadistrict: "dbcaDistricts",
	nrm: "nrm",
	ibra: "ibra",
	imcra: "imcra",
};

/**
 * Map configuration
 */
export const MAP_CONFIG = {
	center: [-25.2744, 122.2402] as [number, number],
	zoom: 6,
	minZoom: 5,
	maxZoom: 18,
};
