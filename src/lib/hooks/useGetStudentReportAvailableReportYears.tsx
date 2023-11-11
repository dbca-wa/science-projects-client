// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query"
import { ISimplePkProp, getAvailableReportYearsForStudentReport } from "../api";

export const useGetStudentReportAvailableReportYears = (pk: number) => {
    const { isLoading, data, isError, refetch } = useQuery(["availableStudentReportYears", pk], getAvailableReportYearsForStudentReport, {
        retry: false,
    });

    const refetchStudentYears = (callback?: () => void) => {
        refetch().then(() => {
            if (callback) {
                callback();
            }
        });
    };

    return {
        availableStudentYearsLoading: isLoading,
        availableStudentYearsData: data,
        refetchStudentYears,
    };

}