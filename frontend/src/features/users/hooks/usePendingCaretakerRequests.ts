import { useQuery } from "@tanstack/react-query";
import { getPendingCaretakerRequests, caretakerKeys } from "../services/caretaker.endpoints";

/**
 * Query key factory for pending caretaker requests
 */
export const pendingCaretakerRequestsKeys = {
  forUser: (userId: number) => [...caretakerKeys.all, "pending", userId] as const,
};

/**
 * Hook to fetch pending caretaker requests for a specific user
 * Returns requests where someone has requested to become THIS user's caretaker
 */
export const usePendingCaretakerRequests = (userId: number | null) => {
  return useQuery({
    queryKey: pendingCaretakerRequestsKeys.forUser(userId || 0),
    queryFn: () => getPendingCaretakerRequests(userId!),
    staleTime: 5 * 60_000, // 5 minutes
    enabled: !!userId, // Only fetch if userId is provided
  });
};
