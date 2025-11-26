// A simple hook which talks to the api to get the latest report's active and approved progress reports.
// Exposes that data as well as the state of the query (loading or not)

import { getLatestActiveProgressReports } from "@/features/reports/services/reports.service";
import { useQuery } from "@tanstack/react-query";

export const useLatestYearsActiveProgressReports = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["latestProgressReports"],
    queryFn: getLatestActiveProgressReports,
    retry: false,
  });

  return {
    latestProgressReportsLoading: isPending,
    latestProgressReportsData: data,
    refetchLatestProgressReports: refetch,
  };
};
