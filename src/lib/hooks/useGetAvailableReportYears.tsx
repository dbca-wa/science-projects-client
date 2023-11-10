// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query"
import { ISimplePkProp, getAvailableReportYears } from "../api";

export const useGetAvailableReportYears = (pk: number) => {
    const { isLoading, data, isError, refetch } = useQuery(["availableReportYears", pk], getAvailableReportYears, {
        retry: false,
    });

    const refetchYears = (callback?: () => void) => {
        refetch().then(() => {
            if (callback) {
                callback();
            }
        });
    };

    return {
        availableReportYearsLoading: isLoading,
        availableReportYearsData: data,
        refetchYears,
    };

}