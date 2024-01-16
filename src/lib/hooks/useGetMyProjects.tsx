// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getMyProjects } from "../api";

export const useGetMyProjects = () => {
  const { isLoading, data } = useQuery(["myprojects"], getMyProjects, {
    retry: false,
  });
  return {
    projectsLoading: isLoading,
    projectData: data,
  };
};
