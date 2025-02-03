import { useQuery } from "@tanstack/react-query";
import { getAnnualReportPDF } from "../../api";
import { IAnnualReportPDFObject } from "@/types";

export const useGetAnnualReportPDF = (pk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["annualReportPDF", pk],
    queryFn: getAnnualReportPDF,
    retry: false,
  });

  return {
    pdfDocumentDataLoading: isPending,
    pdfDocumentData: data as IAnnualReportPDFObject,
    refetchPDF: refetch,
  };
};
