import { useQuery } from "@tanstack/react-query";
import { getAllBranches } from "@/shared/services/org.service";
import { STALE_TIME } from "@/shared/constants";

/**
 * Hook for fetching all branches
 * - Cached with 10 minute stale time
 * - Used across multiple features (users, projects, etc.)
 *
 * @returns TanStack Query result with branches data
 */
export const useBranches = () => {
	return useQuery({
		queryKey: ["branches"],
		queryFn: getAllBranches,
		staleTime: STALE_TIME.LONG,
	});
};
