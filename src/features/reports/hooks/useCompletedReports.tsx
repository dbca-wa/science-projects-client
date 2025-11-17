// Simple hook to get completed reports.
// Exposes data, error, and loading states of query

import { getCompletedReports } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useCompletedReports = () => {
  const { isPending, data } = useQuery({
    queryKey: ["completedReports"],
    queryFn: getCompletedReports,
    retry: false,
  });
  return {
    reportsLoading: isPending,
    reportsData: data,
  };
};
