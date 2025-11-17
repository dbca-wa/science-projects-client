// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { getReportMedia } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetReportMedia = (pk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["reportMedia", pk],
    queryFn: getReportMedia,
    retry: false,
  });

  return {
    reportMediaLoading: isPending,
    reportMediaData: data,
    refetchMedia: refetch,
  };
};
