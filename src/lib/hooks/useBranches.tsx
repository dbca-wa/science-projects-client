// Simple hook to get branches data and save it in a query key.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { getAllBranches } from "../api";

export const useBranches = () => {
  const { isLoading, data } = useQuery(["branches"], getAllBranches, {
    retry: false,
  });

  // Sort the branches alphabetically
  const sortedBranches = data
    ? [...data].sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return {
    branchesLoading: isLoading,
    branchesData: sortedBranches,
  };
};
