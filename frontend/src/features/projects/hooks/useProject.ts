import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "../services/project.service";
import { projectKeys } from "./useProjects";

/**
 * Hook for fetching single project detail by ID
 * - Configured with 5 minute stale time for caching
 * - Only enabled when projectId is provided
 * - Automatically refetches in background when data becomes stale
 * 
 * @param projectId - Project primary key
 * @returns TanStack Query result with project detail data
 */
export const useProject = (projectId: number | string | undefined) => {
	return useQuery({
		queryKey: projectKeys.detail(projectId as number | string),
		queryFn: () => getProjectById(projectId as number | string),
		staleTime: 5 * 60_000, // 5 minutes
		enabled: !!projectId, // Only fetch if projectId is provided
	});
};
