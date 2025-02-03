// Simple hook for getting admin tasks for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getPendingAdminTasks, getPendingCaretakerTasks } from "../../api";

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
