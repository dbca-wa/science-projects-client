import { useQuery } from "@tanstack/react-query";
import { getCaretakees, caretakerKeys } from "../services/caretaker.endpoints";

/**
 * Hook for fetching users the current user is caretaking for
 * - Fetches all caretakees for the specified user
 * - Configured with 5 minute stale time for caching
 * - Only enabled when userId is provided
 * - Automatically refetches in background when data becomes stale
 * 
 * @param userId - User primary key to fetch caretakees for
 * @returns TanStack Query result with caretakees data
 */
export const useCaretakees = (userId: number) => {
  return useQuery({
    queryKey: caretakerKeys.caretakees(userId),
    queryFn: () => getCaretakees(userId),
    staleTime: 5 * 60_000, // 5 minutes
    enabled: !!userId, // Only fetch if userId is provided
  });
};