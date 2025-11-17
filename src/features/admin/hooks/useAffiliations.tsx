// Simple hook to get branches data and save it in a query key.
// Exposes data and loading states of query

import { getAllAffiliations } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useAffiliations = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["affiliations"],
    queryFn: getAllAffiliations,
    retry: false,
  });

  // Sort the branches alphabetically
  const sortedAffiliations = data
    ? [...data].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return {
    affiliationsLoading: isPending,
    affiliationsData: sortedAffiliations,
    refetchAffiliations: refetch,
  };
};
