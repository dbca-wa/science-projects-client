// Simple hook to get branches data and save it in a query key.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { getAllAffiliations } from "../api";

export const useAffiliations = () => {
  const { isLoading, data } = useQuery(["affiliations"], getAllAffiliations, {
    retry: false,
  });

  // Sort the branches alphabetically
  const sortedAffiliations = data
    ? [...data].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return {
    affiliationsLoading: isLoading,
    affiliationsData: sortedAffiliations,
  };
};
