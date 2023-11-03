// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query"
import { getReportPDFs } from "../api";

export const useGetReportPDFs = () => {
    const { isLoading, data, isError } = useQuery(["reportPdfs"], getReportPDFs, {
        retry: false,
    });
    return {
        reportPdfsLoading: isLoading,
        reportPdfsData: data,
    }
}