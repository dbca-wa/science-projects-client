// A simple hook which talks to the api to get the latest report's inactive progress reports.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getLatestUnapprovedReports } from "../api";

export const useLatestYearsUnapprovedReports = () => {
  const { isLoading, data, refetch } = useQuery(
    ["latestUnapprovedProgressReports"],
    getLatestUnapprovedReports,
    {
      retry: false,
    }
  );

  return {
    unapprovedLoading: isLoading,
    unapprovedData: data,
    refetchUnapproved: refetch,
  };
};
