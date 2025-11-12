// Simple hook for getting the full project data
// Exposes that data and the state of the query loading

import { getFullProject } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

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
