// Simple hook for getting the Annual Reports which do not yet have pdfs

import { getArarsWithPDFs } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetARARsWithPDF = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["ararsWithPDFs"],
    queryFn: getArarsWithPDFs,
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
    reportsWithPDFLoading: isPending,
    reportsWithPDFData: data,
    refetchReportsWithPDFs,
  };
};
