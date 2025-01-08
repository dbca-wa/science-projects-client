// Simple hook for getting admin tasks for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getPendingAdminTasks } from "../../api/api";

export const useGetPendingAdminTasks = () => {
  const { isPending, data } = useQuery({
    queryKey: ["pendingAdminTasks"],
    queryFn: getPendingAdminTasks,
    retry: false,
  });
  return {
    pendingAdminTasksLoading: isPending,
    pendingAdminTaskData: data,
  };
};
