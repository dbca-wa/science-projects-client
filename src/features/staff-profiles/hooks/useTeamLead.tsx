import { getTeamLead } from "@/shared/lib/api";
import type { IUserMe } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export const useTeamLead = (projectPk: number) => {
  const { isPending, data } = useQuery({
    queryKey: ["teamLead", projectPk],
    queryFn: getTeamLead,
    retry: false, //immediate fail if not logged in
  });
  return {
    leaderLoading: isPending,
    leaderData: data as IUserMe,
  };
};
