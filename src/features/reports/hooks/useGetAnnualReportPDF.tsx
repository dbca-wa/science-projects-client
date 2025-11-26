import { getAnnualReportPDF } from "@/features/admin/services/admin.service";
import type { IAnnualReportPDFObject } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

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
