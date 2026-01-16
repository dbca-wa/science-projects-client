import { useQuery } from "@tanstack/react-query";
import { getAllAffiliations } from "@/shared/services/org.service";

/**
 * Hook for fetching all affiliations
 * - Cached with 10 minute stale time
 * - Used across multiple features (users, projects, etc.)
 * 
 * @returns TanStack Query result with affiliations data
 */
export const useAffiliations = () => {
  return useQuery({
    queryKey: ["affiliations"],
    queryFn: getAllAffiliations,
    staleTime: 10 * 60_000, // 10 minutes
  });
};
