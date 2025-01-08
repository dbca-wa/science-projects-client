import { useQuery } from "@tanstack/react-query";
import { IProjectData } from "../../../types";
import { getUsersProjects } from "../../api/api";

export const useInvolvedProjects = (pk: number) => {
  const { isPending, data } = useQuery({
    queryKey: ["userProjects", pk],
    queryFn: getUsersProjects,
    retry: false,
  });
  return {
    userProjectsLoading: isPending,
    userProjectsData: data as IProjectData[],
  };
};
