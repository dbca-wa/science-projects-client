// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { getAllDivisions } from "@/shared/lib/api";
import type { IDivision } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export const useGetDivisions = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["divisions"],
    queryFn: getAllDivisions,
    retry: false,
  });

  return {
    divsLoading: isPending,
    divsData: data as IDivision[],
    refetch,
  };
};
