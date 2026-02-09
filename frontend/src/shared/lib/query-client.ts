import { QueryClient } from "@tanstack/react-query";

/**
 * Query client configuration for TanStack Query
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
			gcTime: 1000 * 60 * 10, // Cache data for 10 minutes
			retry: 1, // Retry failed requests once
			refetchOnWindowFocus: false, // Don't refetch when window regains focus
		},
		mutations: {
			retry: 0, // Don't retry mutations
		},
	},
});
