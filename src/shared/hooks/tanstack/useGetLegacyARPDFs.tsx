// Simple hook for getting the Annual Reports which do not yet have pdfs

import { useQuery } from "@tanstack/react-query";
import { getLegacyArarPDFs } from "@/shared/lib/api";
import type { ILegacyPDF } from "@/shared/types/index.d";

export const useGetLegacyARPDFs = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["legacyARPDFs"],
    queryFn: getLegacyArarPDFs,
    retry: false,
  });

  const refetchLegacyPDFs = (callback?: () => void) => {
    refetch().then(() => {
      if (callback) {
        callback();
      }
    });
  };

  return {
    legacyPDFDataLoading: isPending,
    legacyPDFData: data as ILegacyPDF[],
    refetchLegacyPDFs,
  };
};
