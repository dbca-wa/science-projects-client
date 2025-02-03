import { useQuery } from "@tanstack/react-query";
import { getProjectTeam } from "../../api";

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
