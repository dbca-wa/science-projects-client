// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getLatestReportMedia } from "../../api";

export const useGetLatestReportMedia = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["latestReportMedia"],
    queryFn: getLatestReportMedia,
    retry: false,
  });

  return {
    reportMediaLoading: isPending,
    reportMediaData: data,
    refetchMedia: refetch,
  };
};
