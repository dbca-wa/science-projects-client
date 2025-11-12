import { useQuery } from "@tanstack/react-query";
import { IProjectData } from "@/types";
import { getUsersProjects } from "../../api";

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
