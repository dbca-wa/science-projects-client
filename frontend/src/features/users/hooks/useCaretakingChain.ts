import { useMemo } from "react";
import type { IUserMe, ICaretakerSimpleUserData } from "@/shared/types/user.types";

/**
 * Recursively get all PKs in the caretaking chain
 * Includes the user, their caretakees, and sub-caretakees
 * 
 * @param user - User with caretaking_for data
 * @param visited - Set of already visited PKs to prevent infinite loops
 * @returns Array of PKs in the caretaking chain
 */
const getCaretakingChainPks = (
  user: { pk?: number; caretaking_for?: ICaretakerSimpleUserData[] },
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

/**
 * Hook to compute the PKs of all users in the caretaking chain
 * Used to exclude users from caretaker selection to prevent circular chains
 * 
 * @param userData - Current user data with caretaking_for property
 * @returns Array of user PKs that should be excluded from caretaker selection
 */
export const useCaretakingChain = (userData: IUserMe | undefined): number[] => {
  return useMemo(() => {
    if (!userData?.pk) return []; // Ensure valid user data
    const visited = new Set<number>();
    return getCaretakingChainPks(userData, visited);
  }, [userData?.pk, JSON.stringify(userData?.caretaking_for)]);
};
