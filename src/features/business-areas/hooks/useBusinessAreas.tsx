// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { getAllBusinessAreas } from "@/features/business-areas/services/business-areas.service";
import type { IBusinessArea } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useBusinessAreas = () => {
  const { isPending, data } = useQuery({
    queryKey: ["businessAreas"],
    queryFn: getAllBusinessAreas,
    retry: false,
  });
  // Sort the branches alphabetically
  const sortedBA = data
    ? [...data].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return {
    baLoading: isPending,
    baData: sortedBA as IBusinessArea[],
  };
};
