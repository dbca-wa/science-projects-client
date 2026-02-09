import { useQuery } from "@tanstack/react-query";
import { getAllBusinessAreas } from "@/shared/services/org.service";
import { STALE_TIME } from "@/shared/constants";

/**
 * Query keys for business areas
 */
export const businessAreasKeys = {
  all: ["businessAreas"] as const,
};

/**
 * Hook for fetching all business areas
 * - Configured with 30 minute stale time (business areas rarely change)
 * - Shared hook used across multiple features (users, projects, etc.)
 * - Automatically refetches in background when data becomes stale
 * 
 * @returns TanStack Query result with business areas data
 */
export const useBusinessAreas = () => {
  return useQuery({
    queryKey: businessAreasKeys.all,
    queryFn: getAllBusinessAreas,
    staleTime: STALE_TIME.VERY_LONG,
  });
};
