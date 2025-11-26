// Simple hook for getting projects the user is involved in, for the dashboard.

import { getMyProjects } from "@/features/dashboard/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

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
