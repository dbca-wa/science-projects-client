// Simple hook for getting the tasks of the user, for the dashboard

import { getAvailableReportYearsForStudentReport } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetStudentReportAvailableReportYears = (pk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["availableStudentReportYears", pk],
    queryFn: getAvailableReportYearsForStudentReport,
    retry: false,
  });

  const refetchStudentYears = (callback?: () => void) => {
    refetch().then(() => {
      if (callback) {
        callback();
      }
    });
  };

  return {
    availableStudentYearsLoading: isPending,
    availableStudentYearsData: data,
    refetchStudentYears,
  };
};
