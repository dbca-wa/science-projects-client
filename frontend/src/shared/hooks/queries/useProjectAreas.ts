import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

interface IProjectArea {
	id: number;
	area_name: string;
}

/**
 * Fetch all location areas for project selection
 */
export const useProjectAreas = () => {
	return useQuery<IProjectArea[], Error>({
		queryKey: ["projectAreas"],
		queryFn: async () => {
			const response = await apiClient.get<IProjectArea[]>("/locations/list");
			return response || []; // Return empty array if response is undefined
		},
		staleTime: 10 * 60_000, // 10 minutes (areas rarely change)
	});
};
