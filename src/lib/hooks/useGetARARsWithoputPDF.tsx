// Simple hook for getting the Annual Reports which do not yet have pdfs

import { useQuery } from "@tanstack/react-query"
import { ISimplePkProp, getArarsWithoutPDFs } from "../api";

export const useGetARARsWithoputPDF = () => {
    const { isLoading, data, isError, refetch } = useQuery(["ararsWithoutPDFs"], getArarsWithoutPDFs, {
        retry: false,
    });

    const refetchReportsWithoutPDFs = (callback?: () => void) => {
        refetch().then(() => {
            if (callback) {
                callback();
            }
        });
    };

    return {
        reportsWithoutPDFLoading: isLoading,
        reportsWithoutPDFData: data,
        refetchReportsWithoutPDFs,
    };

}