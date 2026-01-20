import { useQuery } from "@tanstack/react-query";
import { getCaretakers, caretakerKeys } from "../services/caretaker.endpoints";

/**
 * Hook for fetching caretakers for a specific user (recursive up to 12 levels)
 * - Fetches the caretaking chain for the specified user
 * - Configured with 5 minute stale time for caching
 * - Only enabled when userId is provided
 * - Automatically refetches in background when data becomes stale
 * 
 * @param userId - User primary key to fetch caretakers for
 * @returns TanStack Query result with caretakers data
 */
export const useCaretakers = (userId: number) => {
  return useQuery({
    queryKey: caretakerKeys.list(userId),
    queryFn: () => getCaretakers(userId),
    staleTime: 5 * 60_000, // 5 minutes
    enabled: !!userId, // Only fetch if userId is provided
  });
};