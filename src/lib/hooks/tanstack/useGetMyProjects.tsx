// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getMyProjects } from "../../api";

export const useGetMyProjects = () => {
  const { isPending, data } = useQuery({
    queryKey: ["myprojects"],
    queryFn: getMyProjects,
    retry: false,
  });
  return {
    projectsLoading: isPending,
    projectData: data,
  };
};
