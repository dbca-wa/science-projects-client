// Simple hook for getting the tasks of the user, for the dashboard

import { useQuery } from "@tanstack/react-query";
import { getAvailableReportYearsForStudentReport } from "../api";

export const useGetStudentReportAvailableReportYears = (pk: number) => {
  const { isLoading, data, refetch } = useQuery(
    ["availableStudentReportYears", pk],
    getAvailableReportYearsForStudentReport,
    {
      retry: false,
    }
  );

  const refetchStudentYears = (callback?: () => void) => {
    refetch().then(() => {
      if (callback) {
        callback();
      }
    });
  };

  return {
    availableStudentYearsLoading: isLoading,
    availableStudentYearsData: data,
    refetchStudentYears,
  };
};
