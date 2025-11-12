// Simple hook to get branches data and save it in a query key.
// Exposes data and loading states of query

import { getAllBranches } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useBranches = () => {
  const { isPending, data } = useQuery({
    queryKey: ["branches"],
    queryFn: getAllBranches,
    retry: false,
  });

  // Sort the branches alphabetically
  const sortedBranches = data
    ? [...data].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return {
    branchesLoading: isPending,
    branchesData: sortedBranches,
  };
};
