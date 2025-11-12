// Simple hook to get services.
// returns the loading and data variables.

import { getAllDepartmentalServices } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useDepartmentalServices = () => {
  const { isPending, data } = useQuery({
    queryKey: ["services"],
    queryFn: getAllDepartmentalServices,
    retry: false,
  });

  return {
    dsLoading: isPending,
    dsData: data,
  };
};
