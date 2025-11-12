// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { getSingleBusinessArea } from "@/shared/lib/api";
import type { IBusinessArea } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export const useBusinessArea = (baPk: number) => {
  const { isPending, data } = useQuery({
    queryKey: ["businessArea", baPk],
    queryFn: getSingleBusinessArea,
    retry: false,
  });

  return {
    baLoading: isPending,
    baData: data as IBusinessArea,
  };
};
