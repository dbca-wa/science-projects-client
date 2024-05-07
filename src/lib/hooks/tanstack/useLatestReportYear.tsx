// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getLatestReportingYear } from "../../api";

export const useLatestReportYear = () => {
  const { isPending, data } = useQuery({
    queryKey: ["latestReport"],
    queryFn: getLatestReportingYear,
    retry: false,
  });

  return {
    latestYearLoading: isPending,
    latestYear: data?.year,
  };
};
