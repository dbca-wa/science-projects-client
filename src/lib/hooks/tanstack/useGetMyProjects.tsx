// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getMyProjects } from "../../api/api";

export const useGetMyProjects = () => {
  const { isPending, data } = useQuery({
    queryKey: ["myprojects"],
    queryFn: getMyProjects,
    retry: false,
  });

  const dataSortedByCreatedAt = data?.sort(
    (a, b) => b.created_at - a.created_at,
  );

  return {
    projectsLoading: isPending,
    projectData: dataSortedByCreatedAt,
  };
};
