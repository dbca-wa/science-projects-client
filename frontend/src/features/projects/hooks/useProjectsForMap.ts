import { useQuery } from "@tanstack/react-query";
import {
	getProjectsForMap,
	type ProjectMapSearchParams,
} from "../services/project.service";

/**
 * Query keys for map projects
 */
export const projectMapKeys = {
	all: ["projects", "map"] as const,
	list: (params: ProjectMapSearchParams) =>
		[...projectMapKeys.all, params] as const,
};

/**
 * Hook for fetching projects for map display with filters
 * - Configured with 5 minute stale time for caching
 * - Returns all projects (no pagination) with location data and statistics
 * - Automatically refetches when filter parameters change
 * - Limited retries to prevent backend spamming on errors
 *
 * @param params - Map search parameters including filters
 * @returns TanStack Query result with project map response
 */
export const useProjectsForMap = (params: ProjectMapSearchParams = {}) => {
	return useQuery({
		queryKey: projectMapKeys.list(params),
		queryFn: () => getProjectsForMap(params),
		staleTime: 5 * 60_000, // 5 minutes
		placeholderData: (previousData) => previousData, // Keep old data while fetching
		retry: 2, // Only retry twice on failure
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
	});
};
