import { getUsersProjectsForStaffProfile } from "@/shared/lib/api";
import type { IProjectData } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export const useInvolvedStaffProfileProjects = (pk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["userSPProjects", pk],
    queryFn: getUsersProjectsForStaffProfile,
    retry: false,
  });
  return {
    userProjectsLoading: isPending,
    userProjectsData: data as IProjectData[],
    refetchUserProjects: refetch,
  };
};
