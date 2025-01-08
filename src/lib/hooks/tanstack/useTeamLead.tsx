import { useQuery } from "@tanstack/react-query";
import { getTeamLead } from "../../api/api";
import { IUserMe } from "../../../types";

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
