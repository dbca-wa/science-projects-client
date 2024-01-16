// Simple hook to get services.
// returns the loading and data variables.

import { useQuery } from "@tanstack/react-query";
import { getAllDepartmentalServices } from "../api";

export const useDepartmentalServices = () => {
  const { isLoading, data } = useQuery(
    ["services"],
    getAllDepartmentalServices,
    {
      retry: false,
    }
  );

  return {
    dsLoading: isLoading,
    dsData: data,
  };
};
