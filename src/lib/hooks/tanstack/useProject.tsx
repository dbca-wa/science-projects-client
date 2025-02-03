// Simple hook for getting the full project data
// Exposes that data and the state of the query loading

import { useQuery } from "@tanstack/react-query";
import { getFullProject } from "../../api";

export const useProject = (projectPk: undefined | string | number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["project", projectPk],
    queryFn: getFullProject,
    retry: false,
  });
  return {
    isLoading: isPending,
    projectData: data,
    refetch: refetch,
  };
};
