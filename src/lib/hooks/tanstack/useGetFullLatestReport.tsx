// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getFullLatestReport } from "../../api";

export const useGetFullLatestReport = () => {
  const { isPending, data } = useQuery({
    queryKey: ["latestReport"],
    queryFn: getFullLatestReport,
    retry: false,
  });

  return {
    reportLoading: isPending,
    reportData: data,
  };
};
