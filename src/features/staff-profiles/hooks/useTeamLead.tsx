import { getTeamLead } from "@/features/staff-profiles/services/staff-profiles.service";
import type { IUserMe } from "@/shared/types";
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
