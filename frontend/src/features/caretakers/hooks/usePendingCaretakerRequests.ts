import { useQuery } from "@tanstack/react-query";
import { getPendingCaretakerRequests } from "../services/caretaker.service";
import { caretakerKeys } from "../services/caretaker.endpoints";

/**
 * Query key factory for pending caretaker requests
 */
export const pendingCaretakerRequestsKeys = {
	forUser: (userId: number) =>
		[...caretakerKeys.all, "pending", userId] as const,
};

/**
 * Hook to fetch pending caretaker requests for a specific user
 * Returns requests where someone has requested to become THIS user's caretaker
 */
export const usePendingCaretakerRequests = (userId: number | null) => {
	return useQuery({
		queryKey: pendingCaretakerRequestsKeys.forUser(userId || 0),
		queryFn: () => getPendingCaretakerRequests(userId!),
		staleTime: 10 * 60_000, // 10 minutes - requests don't change frequently
		refetchOnWindowFocus: false, // Don't refetch on every window focus
		enabled: !!userId, // Only fetch if userId is provided
	});
};
