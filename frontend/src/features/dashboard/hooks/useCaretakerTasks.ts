import { useQuery } from "@tanstack/react-query";
import { getCaretakerTasks } from "../services/caretaker-tasks.endpoints";
import { dashboardKeys } from "./useDashboardTasks";
import { STALE_TIME } from "@/shared/constants";

/**
 * Hook to fetch caretaker tasks for a user
 * Returns pending document tasks for all users the specified user is caretaking for
 * 
 * @param userId - The caretaker's user ID
 * @returns TanStack Query result with caretaker tasks
 */
export const useCaretakerTasks = (userId: number | undefined) => {
  return useQuery({
    queryKey: userId ? dashboardKeys.caretakerTasks(userId) : ["dashboard", "caretakerTasks"],
    queryFn: () => getCaretakerTasks(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME.MEDIUM, // 5 minutes - caretaker tasks don't change frequently
    refetchOnWindowFocus: false, // Don't refetch on every window focus
    refetchOnReconnect: true,
  });
};
