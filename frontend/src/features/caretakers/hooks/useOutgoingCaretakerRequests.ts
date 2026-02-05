import { useQuery } from "@tanstack/react-query";
import { getOutgoingCaretakerRequests } from "../services/caretaker.service";
import { caretakerKeys } from "../services/caretaker.endpoints";
import type { IAdminTask } from "../types/caretaker.types";

/**
 * Hook to fetch outgoing caretaker requests for a user
 * Returns all pending requests where the user is the primary_user
 * (requests the user made for someone to be THEIR caretaker)
 * 
 * @param userId - User ID to fetch outgoing requests for
 * @returns Query result with array of AdminTask objects
 */
export const useOutgoingCaretakerRequests = (userId: number) => {
  return useQuery<IAdminTask[], Error>({
    queryKey: caretakerKeys.outgoing(userId),
    queryFn: () => getOutgoingCaretakerRequests(userId),
    staleTime: 30_000, // 30 seconds - requests don't change frequently
    enabled: !!userId,
  });
};
