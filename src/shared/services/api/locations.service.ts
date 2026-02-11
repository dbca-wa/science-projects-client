import { apiClient } from "./client.service";
import type {
	OrganisedLocationData,
	ISimpleLocationData,
} from "@/shared/types/org.types";

/**
 * Get all locations organized by area type
 */
export const getAllLocations = async (): Promise<OrganisedLocationData> => {
	const locationsData =
		await apiClient.get<ISimpleLocationData[]>("locations/list");

	// Organize locations based on their 'area_type'
	const organizedLocations: OrganisedLocationData = {
		dbcaregion: [],
		dbcadistrict: [],
		ibra: [],
		imcra: [],
		nrm: [],
	};

	// Loop through the locations and add them to the corresponding area_type array
	locationsData.forEach((location: ISimpleLocationData) => {
		const areaType = location.area_type;
		if (areaType in organizedLocations) {
			organizedLocations[areaType].push(location);
		}
	});

	// Sort each array alphabetically based on the 'name' property of each location
	for (const areaType in organizedLocations) {
		organizedLocations[areaType].sort((a, b) => {
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

	return organizedLocations;
};
