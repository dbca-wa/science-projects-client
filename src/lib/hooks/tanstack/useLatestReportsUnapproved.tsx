// A simple hook which talks to the api to get the latest report's inactive progress reports.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getLatestUnapprovedReports } from "../../api/api";

export const useLatestYearsUnapprovedReports = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["latestUnapprovedProgressReports"],
    queryFn: getLatestUnapprovedReports,
    retry: false,
  });

  return {
    unapprovedLoading: isPending,
    unapprovedData: data,
    refetchUnapproved: refetch,
  };
};
