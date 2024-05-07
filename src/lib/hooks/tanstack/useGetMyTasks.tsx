// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query";
import { getMyTasks } from "../../api";

export const useGetMyTasks = () => {
  const { isPending, data } = useQuery({
    queryKey: ["mytasks"],
    queryFn: getMyTasks,
    retry: false,
  });
  return {
    tasksLoading: isPending,
    taskData: data,
  };
};
