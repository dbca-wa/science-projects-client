// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { getMyBusinessAreas } from "@/shared/lib/api";
import type { IBusinessArea } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export const useMyBusinessAreas = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["myBusinessAreas"],
    queryFn: getMyBusinessAreas,
    retry: false,
  });
  // Sort the branches alphabetically
  const sortedBA = data
    ? [...data].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return {
    basLoading: isPending,
    baData: sortedBA as IBusinessArea[],
    refetch: refetch,
  };
};
