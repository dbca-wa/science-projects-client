// Simple hook for getting admin tasks for the dashboard.

import {
  getPendingCaretakerTasks
} from "@/features/dashboard/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export const useGetPendingCaretakerTasks = (userId: number) => {
  const { isPending, data } = useQuery({
    queryKey: ["pendingCaretakerTasks", userId],
    queryFn: () => getPendingCaretakerTasks({ usersPk: userId }),
    retry: false,
  });
  return {
    pendingCaretakerTasksLoading: isPending,
    pendingCaretakerTaskData: data,
  };
};
