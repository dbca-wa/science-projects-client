// Simple hook for getting the arars where a progress report can be created for a given project

import { useQuery } from "@tanstack/react-query"
import { ISimplePkProp, getAvailableReportYearsForProgressReport } from "../api";

export const useGetProgressReportAvailableReportYears = (pk: number) => {
    const { isLoading, data, isError, refetch } = useQuery(["availableProgressReportYears", pk], getAvailableReportYearsForProgressReport, {
        retry: false,
    });

    const refetchProgressYears = (callback?: () => void) => {
        refetch().then(() => {
            if (callback) {
                callback();
            }
        });
    };

    return {
        availableProgressReportYearsLoading: isLoading,
        availableProgressReportYearsData: data,
        refetchProgressYears,
    };

}