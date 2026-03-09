import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

interface IService {
	id: number;
	name: string;
}

/**
 * Fetch all departmental services
 */
export const useServices = () => {
	return useQuery<IService[], Error>({
		queryKey: ["services"],
		queryFn: async () => {
			// apiClient.get already returns response.data, so we get the array directly
			const data = await apiClient.get<IService[]>("/agencies/services");
			return data || []; // Return empty array if data is undefined
		},
		staleTime: 10 * 60_000, // 10 minutes (services rarely change)
	});
};
