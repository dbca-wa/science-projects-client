import { useQuery } from "@tanstack/react-query";
import { getPendingCaretakerRequests } from "@/shared/services/caretaker.service";
import { caretakerKeys } from "@/shared/types/caretaker.types";

/**
 * Query key factory for pending caretaker requests
 */
export const pendingCaretakerRequestsKeys = {
	forUser: (userId: number) =>
		[...caretakerKeys.all, "pending", userId] as const,
};

/**
 * Hook to fetch pending caretaker requests for a specific user.
 * Shared version — used by cross-feature consumers.
 */
export const usePendingCaretakerRequests = (userId: number | null) => {
	return useQuery({
		queryKey: pendingCaretakerRequestsKeys.forUser(userId || 0),
		queryFn: () => getPendingCaretakerRequests(userId!),
		staleTime: 10 * 60_000,
		refetchOnWindowFocus: false,
		enabled: !!userId,
	});
};
