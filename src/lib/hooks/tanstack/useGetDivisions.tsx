// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { getAllDivisions } from "../../api";

export const useGetDivisions = () => {
  const { isPending, data } = useQuery({
    queryKey: ["divisions"],
    queryFn: getAllDivisions,
    retry: false,
  });

  return {
    divsLoading: isPending,
    divsData: data,
  };
};
