// A simple hook which talks to the api to get the latest report's active and approved progress reports.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getLatestActiveProgressReports } from "../api";

export const useLatestYearsActiveProgressReports = () => {
  const { isLoading, data, refetch } = useQuery(
    ["latestProgressReports"],
    getLatestActiveProgressReports,
    {
      retry: false,
    }
  );

  return {
    latestProgressReportsLoading: isLoading,
    latestProgressReportsData: data,
    refetchLatestProgressReports: refetch,
  };
};
