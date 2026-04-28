import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "../services/project.service";
import { projectKeys } from "./useProjects";

/**
 * Hook for fetching single project detail by ID
 * - Configured with 5 minute stale time for caching
 * - Only enabled when projectId is provided
 * - Automatically refetches in background when data becomes stale
 *
 * @param projectId - Project primary key (string or number)
 * @returns TanStack Query result with project detail data
 */
export const useProject = (projectId: number | string | undefined) => {
	// Normalize projectId to number for consistent query keys
	const normalizedId = projectId ? Number(projectId) : undefined;

	return useQuery({
		queryKey: projectKeys.detail(normalizedId as number),
		queryFn: async () => {
			const result = await getProjectById(normalizedId as number | string);
			return result;
		},
		staleTime: 5 * 60_000, // 5 minutes
		enabled: !!normalizedId, // Only fetch if projectId is provided
	});
};
