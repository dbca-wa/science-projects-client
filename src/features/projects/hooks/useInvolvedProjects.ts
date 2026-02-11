import { useQuery } from "@tanstack/react-query";
import { getInvolvedProjects } from "../services/project.service";

/**
 * Hook to fetch projects for a specific user
 *
 * @param userId - The ID of the user to fetch projects for
 * @returns TanStack Query result with projects data
 */
export function useInvolvedProjects(userId: number) {
	return useQuery({
		queryKey: ["projects", "involved", userId],
		queryFn: () => getInvolvedProjects(userId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!userId,
		retry: (failureCount, error) => {
			// Don't retry on 404 or auth errors
			const status = (error as any)?.response?.status;
			if (status === 404 || status === 401 || status === 403) {
				return false;
			}
			// Retry up to 3 times for other errors
			return failureCount < 3;
		},
	});
}
