// Simple hook for getting the research functions.
// Exposes that data and loading staet.

import { useQuery } from "@tanstack/react-query";
import { getAllResearchFunctions } from "../api";

export const useResearchFunctions = () => {
  const { isLoading, data } = useQuery(
    ["researchFunctions"],
    getAllResearchFunctions,
    {
      retry: false,
    }
  );

  return {
    rfLoading: isLoading,
    rfData: data,
  };
};
