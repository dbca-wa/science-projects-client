import { useQuery } from "@tanstack/react-query";
import { getCaretakerTasks } from "../services";
import { STALE_TIME } from "@/shared/constants";

/**
 * Query keys for caretaker tasks
 */
export const caretakerTasksKeys = {
	all: ["caretakers", "tasks"] as const,
	forUser: (userId: number) => ["caretakers", "tasks", userId] as const,
};

/**
 * Hook to fetch caretaker tasks for a user
 * Returns pending document tasks for all users the specified user is caretaking for
 *
 * @param userId - The caretaker's user ID
 * @returns TanStack Query result with caretaker tasks
 */
export const useCaretakerTasks = (userId: number | undefined) => {
	return useQuery({
		queryKey: userId
			? caretakerTasksKeys.forUser(userId)
			: caretakerTasksKeys.all,
		queryFn: () => getCaretakerTasks(userId!),
		enabled: !!userId,
		staleTime: STALE_TIME.MEDIUM, // 5 minutes - caretaker tasks don't change frequently
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
	});
};
