// Simple hook for getting the full project data 
// Exposes that data and the state of the query loading


import { useQuery } from "@tanstack/react-query"
import { getFullProject } from "../api";

export const useProject = (projectPk: undefined | string) => {
    const { isLoading, data, refetch } = useQuery(["project", projectPk], getFullProject, {
        retry: false,
    });
    return {
        isLoading: isLoading,
        projectData: data,
        refetch: refetch
    }
}