import { useQuery } from "@tanstack/react-query";
import { getMyProjects } from "../services/project.service";

/**
 * Hook to fetch projects for the current authenticated user
 * 
 * @returns TanStack Query result with projects data sorted by created date (newest first)
 */
export function useMyProjects(enabled = true) {
	return useQuery({
		queryKey: ["projects", "my"],
		queryFn: getMyProjects,
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled,
		select: (data) => {
			// Sort by created_at descending (newest first)
			return [...data].sort((a, b) => {
				const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
				const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
				return dateB - dateA;
			});
		},
		retry: (failureCount, error) => {
			// Don't retry on auth errors
			const status = (error as any)?.response?.status;
			if (status === 401 || status === 403) {
				return false;
			}
			// Retry up to 3 times for other errors
			return failureCount < 3;
		},
	});
}
