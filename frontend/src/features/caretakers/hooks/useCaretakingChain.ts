import { useMemo } from "react";
import type { IUserMe, ICaretakerSimpleUserData } from "@/shared/types/user.types";

/**
 * Recursively get all IDs in the caretaking chain
 * Includes the user, their caretakees, and sub-caretakees
 * 
 * @param user - User with caretaking_for data
 * @param visited - Set of already visited IDs to prevent infinite loops
 * @returns Array of IDs in the caretaking chain
 */
const getCaretakingChainIds = (
  user: { id?: number; caretaking_for?: ICaretakerSimpleUserData[] },
  visited: Set<number> = new Set(),
): number[] => {
  // Ensure we have a valid id
  if (!user?.id || visited.has(user.id)) return [];
  visited.add(user.id); // Mark the current user as visited

  const chainIds = [user.id]; // Add the user's id to the chain

  // Recursively process caretakees
  user.caretaking_for?.forEach((caretakee) => {
    if (caretakee?.id && !visited.has(caretakee.id)) {
      chainIds.push(
        ...getCaretakingChainIds(caretakee, visited), // Process the caretakee
      );
    }
  });

  return chainIds;
};

/**
 * Hook to compute the IDs of all users in the caretaking chain
 * Used to exclude users from caretaker selection to prevent circular chains
 * 
 * @param userData - Current user data with caretaking_for property
 * @returns Array of user IDs that should be excluded from caretaker selection
 */
export const useCaretakingChain = (userData: IUserMe | undefined): number[] => {
  return useMemo(() => {
    if (!userData?.id) return []; // Ensure valid user data
    const visited = new Set<number>();
    return getCaretakingChainIds(userData, visited);
  }, [userData?.id, JSON.stringify(userData?.caretaking_for)]);
};
