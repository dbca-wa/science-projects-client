// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { getSingleBusinessArea } from "../../api/api";
import { IBusinessArea } from "../../../types";

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
