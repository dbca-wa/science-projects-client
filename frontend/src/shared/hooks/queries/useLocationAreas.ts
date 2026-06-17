import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

interface LocationArea {
	id: number;
	name: string;
	area_type: "dbcaregion" | "dbcadistrict";
}

/**
 * Fetches DBCA districts and regions, combining them into a single sorted
 * list with [District] or [Region] prefixes for display.
 *
 * Uses 10-minute stale time since areas are static reference data.
 */
export const useLocationAreas = () => {
	return useQuery({
		queryKey: ["location-areas"],
		queryFn: async () => {
			const [districts, regions] = await Promise.all([
				apiClient.get<LocationArea[]>("locations/dbcadistricts"),
				apiClient.get<LocationArea[]>("locations/dbcaregions"),
			]);

			const combined = [
				...districts.map((d) => ({ ...d, prefix: "[District]" as const })),
				...regions.map((r) => ({ ...r, prefix: "[Region]" as const })),
			];

			// Sort alphabetically by prefixed display name
			combined.sort((a, b) => {
				const aDisplay = `${a.prefix} ${a.name}`;
				const bDisplay = `${b.prefix} ${b.name}`;
				return aDisplay.localeCompare(bDisplay);
			});

			return combined;
		},
		staleTime: 10 * 60_000, // 10 minutes — static reference data
	});
};
