import { useQuery } from "@tanstack/react-query";
import { getFullUser } from "../services/user.service";

/**
 * Query keys for user detail
 */
export const userDetailKeys = {
  all: ["users", "detail"] as const,
  detail: (userId: number) => [...userDetailKeys.all, userId] as const,
};

/**
 * Hook for fetching single user detail by ID
 * - Configured with 5 minute stale time for caching
 * - Only enabled when userId is provided
 * - Automatically refetches in background when data becomes stale
 * 
 * @param userId - User primary key
 * @returns TanStack Query result with user detail data
 */
export const useUserDetail = (userId: number) => {
  return useQuery({
    queryKey: userDetailKeys.detail(userId),
    queryFn: () => getFullUser(userId),
    staleTime: 5 * 60_000, // 5 minutes
    enabled: !!userId, // Only fetch if userId is provided
  });
};
