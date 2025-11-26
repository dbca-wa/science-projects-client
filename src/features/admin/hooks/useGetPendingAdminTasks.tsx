// Simple hook for getting admin tasks for the dashboard.

import { getPendingAdminTasks } from "@/features/dashboard/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

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
