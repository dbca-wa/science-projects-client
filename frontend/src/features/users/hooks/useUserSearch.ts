import { useQuery } from "@tanstack/react-query";
import { getUsersBasedOnSearchTerm } from "../services/user.service";
import type { UserSearchParams } from "../types/user.types";

/**
 * Query keys for user search
 */
export const userSearchKeys = {
  all: ["users", "search"] as const,
  search: (searchTerm: string, filters: UserSearchParams["filters"], page: number) =>
    [...userSearchKeys.all, searchTerm, filters, page] as const,
};

/**
 * Hook for searching users with filters and pagination
 * - Configured with 5 minute stale time for caching
 * - Uses placeholderData to keep previous data while fetching for smooth transitions
 * - Automatically refetches in background when data becomes stale
 * 
 * @param params - Search parameters including searchTerm, filters, and page
 * @returns TanStack Query result with user search data
 */
export const useUserSearch = ({
  searchTerm,
  filters,
  page,
}: UserSearchParams) => {
  return useQuery({
    queryKey: userSearchKeys.search(searchTerm, filters, page),
    queryFn: () => getUsersBasedOnSearchTerm(searchTerm, page, filters),
    staleTime: 5 * 60_000, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep old data while fetching new page
  });
};
