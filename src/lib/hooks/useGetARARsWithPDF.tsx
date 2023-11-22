// Simple hook for getting the Annual Reports which do not yet have pdfs

import { useQuery } from "@tanstack/react-query"
import { getArarsWithPDFs } from "../api";

export const useGetARARsWithPDF = () => {
    const { isLoading, data, isError, refetch } = useQuery(["ararsWithPDFs"], getArarsWithPDFs, {
        retry: false,
    });

    const refetchReportsWithPDFs = (callback?: () => void) => {
        refetch().then(() => {
            if (callback) {
                callback();
            }
        });
    };

    return {
        reportsWithPDFLoading: isLoading,
        reportsWithPDFData: data,
        refetchReportsWithPDFs,
    };

}