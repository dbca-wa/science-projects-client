import { useMemo } from "react";
import type { IUserMe } from "@/shared/types/user.types";

/**
 * Recursively get all user IDs in the caretaking chain
 * Includes the user and all their caretakees (and sub-caretakees)
 * 
 * @param user - User object with caretaking_for array
 * @param visited - Set of already visited user IDs (prevents infinite loops)
 * @returns Array of user IDs in the caretaking chain
 */
const getCaretakingChainIds = (
  user: { id?: number; caretaking_for?: { id?: number; caretaking_for?: unknown }[] },
  visited: Set<number> = new Set()
): number[] => {
  if (!user?.id || visited.has(user.id)) return [];
  
  const chainIds: number[] = [user.id];
  visited.add(user.id);
  
  // Recursively process caretakees
  user.caretaking_for?.forEach((caretakee) => {
    if (caretakee?.id && !visited.has(caretakee.id)) {
      chainIds.push(caretakee.id);
      visited.add(caretakee.id);
      
      // Process nested caretakees
      const nestedIds = getCaretakingChainIds(
        caretakee as { id?: number; caretaking_for?: { id?: number; caretaking_for?: unknown }[] },
        visited
      );
      chainIds.push(...nestedIds);
    }
  });
  
  return chainIds;
};

/**
 * Hook to get all user IDs in the caretaking chain
 * Used to prevent circular caretaking relationships
 * 
 * @param user - Current user object
 * @returns Array of user IDs that should be excluded from caretaker selection
 * 
 * @example
 * ```tsx
 * const chainIds = useCaretakingChain(user);
 * <UserSearch excludeUserIds={chainIds} />
 * ```
 */
export const useCaretakingChain = (user: IUserMe | undefined): number[] => {
  return useMemo(() => {
    if (!user?.id) return [];
    
    const visited = new Set<number>();
    return getCaretakingChainIds(user, visited);
  }, [user]);
};
