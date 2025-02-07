import { useQuery } from "@tanstack/react-query";
import { IProjectData } from "../../../types";
import { getUsersProjectsForStaffProfile } from "../../api";

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
