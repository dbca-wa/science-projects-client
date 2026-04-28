import { apiClient } from "./client.service";
import type {
	OrganisedLocationData,
	ISimpleLocationData,
} from "@/shared/types/org.types";

/**
 * Get all location areas with their IDs, names, and types
 * Returns raw location data for coordinate calculation and other uses
 */
export const getLocationMetadata = async (): Promise<ISimpleLocationData[]> => {
	return apiClient.get<ISimpleLocationData[]>("locations/list");
};

/**
 * Get all locations organised by area type
 */
export const getAllLocations = async (): Promise<OrganisedLocationData> => {
	const locationsData = await getLocationMetadata();

	// Organise locations based on their 'area_type'
	const organisedLocations: OrganisedLocationData = {
		dbcaregion: [],
		dbcadistrict: [],
		ibra: [],
		imcra: [],
		nrm: [],
	};

	// Loop through the locations and add them to the corresponding area_type array
	locationsData.forEach((location: ISimpleLocationData) => {
		const areaType = location.area_type;
		if (areaType in organisedLocations) {
			organisedLocations[areaType].push(location);
		}
	});

	// Sort each array alphabetically based on the 'name' property of each location
	for (const areaType in organisedLocations) {
		organisedLocations[areaType].sort((a, b) => {
			const nameA = a.name.toUpperCase();
			const nameB = b.name.toUpperCase();
			if (nameA.startsWith("ALL ") && !nameB.startsWith("ALL ")) {
				return -1;
			} else if (!nameA.startsWith("ALL ") && nameB.startsWith("ALL ")) {
				return 1;
			} else {
				return nameA.localeCompare(nameB);
			}
		});
	}

	return organisedLocations;
};
