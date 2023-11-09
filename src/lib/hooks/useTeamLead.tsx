
import { useQuery } from "@tanstack/react-query"
import { getTeamLead } from "../api";
import { IUserMe } from "../../types";

export const useTeamLead = (projectPk: number) => {
    // console.log(projectPk)
    const { isLoading, data } = useQuery(["teamLead", projectPk], getTeamLead, {
        retry: false,   //immediate fail if not logged in
    });
    return {
        leaderLoading: isLoading,
        leaderData: data as IUserMe,
    }

}