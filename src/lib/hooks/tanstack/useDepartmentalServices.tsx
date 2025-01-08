// Simple hook to get services.
// returns the loading and data variables.

import { useQuery } from "@tanstack/react-query";
import { getAllDepartmentalServices } from "../../api/api";

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
