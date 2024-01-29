// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query";
import { getMyTasks } from "../api";

export const useGetMyTasks = () => {
  const { isLoading, data } = useQuery(["mytasks"], getMyTasks, {
    retry: false,
  });

  // Function to sort tasks based on status
  const sortTasksByStatus = (tasks) => {
    return tasks.sort((a, b) => {
      // Customize this logic based on your status order
      if (a.status === "done") return 1;
      if (a.status === "inprogress" && b.status !== "done") return -1;
      return 0;
    });
  };

  // Check if data is available and then sort tasks
  const sortedTaskData = data ? {
    done: sortTasksByStatus(data.filter(task => task.status === 'done')),
    todo: sortTasksByStatus(data.filter(task => task.status === 'todo')),
    inprogress: sortTasksByStatus(data.filter(task => task.status === 'inprogress')),
  } : null;

  return {
    tasksLoading: isLoading,
    taskData: sortedTaskData,
  };
};

// export const useGetMyTasks = () => {
//   const { isLoading, data } = useQuery(["mytasks"], getMyTasks, {
//     retry: false,
//   });
//   return {
//     tasksLoading: isLoading,
//     taskData: data,
//   };
// };
