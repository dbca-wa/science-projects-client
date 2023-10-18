
import { useQuery } from "@tanstack/react-query"
import { getProjectTeam } from "../api";

export const useProjectTeam = (projectPk: undefined | string) => {
    const { isLoading, data, refetch } = useQuery(["projectTeam", projectPk], getProjectTeam, {
        retry: false,
    });
    return {
        isTeamLoading: isLoading,
        teamData: data,
        refetchTeamData: refetch, // Add this line

    }
}