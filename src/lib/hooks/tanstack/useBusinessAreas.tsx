// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { getAllBusinessAreas } from "../../api";
import { IBusinessArea } from "@/types";

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
