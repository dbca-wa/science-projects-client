import { useQuery } from "@tanstack/react-query";
import { getAnnualReportPDF } from "../api";
import { IAnnualReportPDFObject } from "@/types";

export const useGetAnnualReportPDF = (pk: number) => {
    const { isLoading, data, refetch } = useQuery(
        ["annualReportPDF", pk],
        getAnnualReportPDF,
        {
            retry: false,
        }
    );

    return {
        pdfDocumentDataLoading: isLoading,
        pdfDocumentData: data as IAnnualReportPDFObject,
        refetchPDF: refetch,
    };
};
