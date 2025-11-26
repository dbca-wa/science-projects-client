import { getUsersProjects } from "@/features/users/services/users.service";
import type { IProjectData } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useInvolvedProjects = (pk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["userProjects", pk],
    queryFn: getUsersProjects,
    retry: false,
  });
  return {
    userProjectsLoading: isPending,
    userProjectsData: data as IProjectData[],
    refetchUserProjects: refetch,
  };
};
