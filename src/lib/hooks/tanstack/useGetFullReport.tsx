// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getFullReport } from "../../api/api";

export const useGetFullReport = (pk: number) => {
  const { isPending, data } = useQuery({
    queryKey: ["report", pk],
    queryFn: getFullReport,
    retry: false,
  });

  return {
    reportLoading: isPending,
    reportData: data,
  };
};
