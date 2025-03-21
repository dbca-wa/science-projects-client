// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { getAllDivisions } from "../../api";
import { IDivision } from "@/types";

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
