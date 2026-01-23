import { useQuery } from "@tanstack/react-query";
import { getAllProjects, type ProjectSearchParams } from "../services/project.service";

/**
 * Query keys for projects
 */
export const projectKeys = {
	all: ["projects"] as const,
	lists: () => [...projectKeys.all, "list"] as const,
	list: (params: ProjectSearchParams) => [...projectKeys.lists(), params] as const,
	details: () => [...projectKeys.all, "detail"] as const,
	detail: (id: number | string) => [...projectKeys.details(), id] as const,
};

/**
 * Hook for fetching projects with filters and pagination
 * - Configured with 5 minute stale time for caching
 * - Uses placeholderData to keep previous data while fetching for smooth transitions
 * - Automatically refetches in background when data becomes stale
 * 
 * @param params - Search parameters including searchTerm, filters, and page
 * @returns TanStack Query result with project list data
 */
export const useProjects = (params: ProjectSearchParams = {}) => {
	return useQuery({
		queryKey: projectKeys.list(params),
		queryFn: () => getAllProjects(params),
		staleTime: 5 * 60_000, // 5 minutes
		placeholderData: (previousData) => previousData, // Keep old data while fetching new page
	});
};
