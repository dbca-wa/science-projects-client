import { getProjectTeam } from "@/features/projects/services/projects.service";
import { useQuery } from "@tanstack/react-query";

export const useProjectTeam = (projectPk: undefined | string) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["projectTeam", projectPk],
    queryFn: getProjectTeam,
    retry: false,
  });
  return {
    isTeamLoading: isPending,
    teamData: data,
    refetchTeamData: refetch,
  };
};
