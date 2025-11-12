// Simple hook to get branches data and save it in a query key.
// Exposes data and loading states of query

import { getAllProblematicProjects } from "@/shared/lib/api";
import type { IProjectData } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export interface IProblematicData {
  no_progress: IProjectData[];
  open_closed: IProjectData[];
  no_members: IProjectData[];
  no_leader: IProjectData[];
  multiple_leads: IProjectData[];
  external_leader: IProjectData[];
  inactive_lead_active_project: IProjectData[];
}

export const useAllProblematicProjects = () => {
  const { isPending, data } = useQuery({
    queryKey: ["problematicProjects"],
    queryFn: getAllProblematicProjects,
    retry: false,
  });

  return {
    problematicProjectsLoading: isPending,
    problematicProjectsData: data as IProblematicData,
  };
};
