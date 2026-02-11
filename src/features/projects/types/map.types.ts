import type { IProjectData } from "@/shared/types/project.types";

/**
 * GeoJSON data structure for all location types
 */
export interface GeoJSONData {
	dbcaRegions: GeoJSON.FeatureCollection | null;
	dbcaDistricts: GeoJSON.FeatureCollection | null;
	nrm: GeoJSON.FeatureCollection | null;
	ibra: GeoJSON.FeatureCollection | null;
	imcra: GeoJSON.FeatureCollection | null;
}

/**
 * Project with calculated coordinates
 */
export interface ProjectWithCoords extends IProjectData {
	coords: [number, number];
}

/**
 * Cluster of projects at the same location
 */
export interface ProjectCluster {
	coords: [number, number];
	projects: IProjectData[];
}

/**
 * Location metadata for area name lookups
 */
export interface ISimpleLocationData {
	id: number;
	name: string;
	area_type: "dbcaregion" | "dbcadistrict" | "nrm" | "ibra" | "imcra";
}

/**
 * Map filter state
 */
export interface MapFilters {
	search: string;
	locations: number[];
	businessAreas: number[];
	user: number | null;
	status: string;
	kind: string;
	year: number;
	onlyActive: boolean;
	onlyInactive: boolean;
}

/**
 * GeoJSON layer type identifiers
 */
export type GeoJSONLayerType =
	| "dbcaRegions"
	| "dbcaDistricts"
	| "nrm"
	| "ibra"
	| "imcra";

/**
 * GeoJSON property names for each layer type
 */
export const GEOJSON_PROPERTY_NAMES: Record<GeoJSONLayerType, string> = {
	dbcaRegions: "DRG_REGION_NAME",
	dbcaDistricts: "DDT_DISTRICT_NAME",
	nrm: "NRG_REGION_NAME",
	ibra: "IWA_SUB_NAME_7", // Use sub-region name for more granular labels
	imcra: "MESO_NAME",
};

/**
 * GeoJSON file paths
 */
export const GEOJSON_PATHS: Record<GeoJSONLayerType, string> = {
	dbcaRegions: "/data/optimized/optimized_DBCA_REGION_DATA.geojson",
	dbcaDistricts: "/data/optimized/optimized_DBCA_DISTRICT_DATA.geojson",
	nrm: "/data/optimized/optimized_NRM_DATA.geojson",
	ibra: "/data/optimized/optimized_IBRA_DATA.geojson",
	imcra: "/data/optimized/optimized_IMCRA_DATA.geojson",
};

/**
 * Layer colors for GeoJSON boundaries
 */
export const LAYER_COLORS: Record<GeoJSONLayerType, string> = {
	dbcaRegions: "#3b82f6", // blue
	dbcaDistricts: "#10b981", // green
	nrm: "#f59e0b", // amber
	ibra: "#8b5cf6", // purple
	imcra: "#ef4444", // red
};
