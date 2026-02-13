import { apiClient } from "@/shared/services/api/client.service";
import type { ISimpleLocationData } from "@/features/projects/types/map.types";

/**
 * Location API Service
 *
 * Handles location-related API calls for the map feature.
 */

/**
 * Get all location areas for coordinate calculation
 * Returns all location areas with their IDs, names, and types
 */
export const getLocationMetadata = async (): Promise<ISimpleLocationData[]> => {
	return apiClient.get<ISimpleLocationData[]>("locations/list");
};
