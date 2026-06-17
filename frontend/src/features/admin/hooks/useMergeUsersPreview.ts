import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

interface UserProjectPreview {
	id: number;
	title: string;
	role: string;
}

/**
 * Fetches projects for a specific user (used in merge preview).
 * Uses the existing staff profile projects endpoint.
 */
export const useUserProjects = (userId: number | null) => {
	return useQuery({
		queryKey: ["user-projects-preview", userId],
		queryFn: async () => {
			if (!userId) return [];
			return apiClient.get<UserProjectPreview[]>(
				`users/staff-profiles/${userId}/projects`
			);
		},
		enabled: !!userId,
		staleTime: 2 * 60_000,
	});
};
