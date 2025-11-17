// Simple hook for getting the arars where a progress report can be created for a given project

import { getAvailableReportYearsForProgressReport } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetProgressReportAvailableReportYears = (pk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["availableProgressReportYears", pk],
    queryFn: getAvailableReportYearsForProgressReport,
    retry: false,
  });

  const refetchProgressYears = (callback?: () => void) => {
    refetch().then(() => {
      if (callback) {
        callback();
      }
    });
  };

  return {
    availableProgressReportYearsLoading: isPending,
    availableProgressReportYearsData: data,
    refetchProgressYears,
  };
};
