// Simple hook to get completed reports.
// Exposes data, error, and loading states of query

import { useQuery } from "@tanstack/react-query"
import { getCompletedReports } from "../api";

export const useUser = () => {
    const { isLoading, data, isError } = useQuery(["completedReports"], getCompletedReports, {
        retry: false,
    });
    return {
        reportsLoading: isLoading,
        reportsData: data,
    }
}