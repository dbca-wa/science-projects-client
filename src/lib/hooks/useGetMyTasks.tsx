// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query"
import { getMyTasks } from "../api";

export const useGetMyTasks = () => {
    const { isLoading, data, isError } = useQuery(["mytasks"], getMyTasks, {
        retry: false,
    });
    return {
        tasksLoading: isLoading,
        taskData: data,
    }
}