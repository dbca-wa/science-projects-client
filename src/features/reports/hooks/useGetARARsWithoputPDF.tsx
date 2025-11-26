// Simple hook for getting the Annual Reports which do not yet have pdfs

import { getArarsWithoutPDFs } from "@/features/reports/services/reports.service";
import { useQuery } from "@tanstack/react-query";

export const useGetARARsWithoputPDF = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["ararsWithoutPDFs"],
    queryFn: getArarsWithoutPDFs,
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
    reportsWithoutPDFLoading: isPending,
    reportsWithoutPDFData: data,
    refetchReportsWithoutPDFs,
  };
};
