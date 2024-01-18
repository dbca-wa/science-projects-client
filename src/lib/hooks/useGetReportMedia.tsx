// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getReportMedia } from "../api";

export const useGetReportMedia = (pk: number) => {
  const { isLoading, data, refetch } = useQuery(
    ["reportMedia", pk],
    getReportMedia,
    {
      retry: false,
    }
  );

  return {
    reportMediaLoading: isLoading,
    reportMediaData: data,
    refetchMedia: refetch,
  };
};
