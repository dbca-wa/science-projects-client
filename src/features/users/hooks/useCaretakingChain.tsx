// Takes an instance of IUserMe (userData) and returns a list of pks of people that are in the caretaking chain.
// List includes the user pk, any caretakees, and any subcaretakees.

import type { IUserMe } from "@/shared/types/index.d";
import { useMemo } from "react";

const getCaretakingChainPks = (
  user: { pk?: number; caretaking_for?: { pk?: number }[] },
  visited: Set<number> = new Set(),
): number[] => {
  // Ensure we have a valid pk
  if (!user?.pk || visited.has(user.pk)) return [];
  visited.add(user.pk); // Mark the current user as visited

  const chainPks = [user.pk]; // Add the user's pk to the chain

  // Recursively process caretakees
  user.caretaking_for?.forEach((caretakee) => {
    if (caretakee?.pk && !visited.has(caretakee.pk)) {
      chainPks.push(
        ...getCaretakingChainPks(caretakee, visited), // Process the caretakee
      );
    }
  });

  return chainPks;
};

// Hook to compute the PKs of all users in the caretaking chain
const useCaretakingChain = (userData: IUserMe | undefined): number[] => {
  return useMemo(() => {
    if (!userData?.pk) return []; // Ensure valid user data
    const visited = new Set<number>();
    return getCaretakingChainPks(userData, visited);
  }, [userData?.pk, JSON.stringify(userData?.caretaking_for)]);
};

export default useCaretakingChain;
