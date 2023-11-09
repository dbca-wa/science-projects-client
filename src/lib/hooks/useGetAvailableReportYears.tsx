// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query"
import { ISimplePkProp, getAvailableReportYears } from "../api";

export const useGetAvailableReportYears = (pk: number) => {
    const { isLoading, data, isError } = useQuery(["availableReportYears", pk], getAvailableReportYears, {
        retry: false,
    });
    return {
        availableReportYearsLoading: isLoading,
        availableReportYearsData: data,
    }
}