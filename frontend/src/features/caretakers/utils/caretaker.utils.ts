/**
 * Caretaker validation utilities
 */

import type { ICaretakee } from "../types";

/**
 * Check if a caretaking relationship is valid (not expired)
 * 
 * @param caretakee - Caretakee object with end_date
 * @returns True if caretaking is valid (not expired)
 */
export const isValidCaretaking = (caretakee: ICaretakee): boolean => {
  if (!caretakee?.end_date) return true; // No end date means permanent
  
  const endDate = new Date(caretakee.end_date);
  const now = new Date();
  
  return endDate >= now;
};

/**
 * Check if a caretakee has a nested caretakee with the target user ID
 * Recursively searches through the caretaking chain
 * 
 * @param caretakee - Caretakee object to search
 * @param targetUserId - User ID to find
 * @param visited - Set of visited user IDs (prevents infinite loops)
 * @returns True if target user is found in the caretaking chain
 */
export const hasNestedCaretakee = (
  caretakee: ICaretakee,
  targetUserId: number,
  visited: Set<number> = new Set()
): boolean => {
  if (visited.has(caretakee.id)) return false; // Prevent infinite loops
  visited.add(caretakee.id);
  
  if (caretakee.id === targetUserId) return true;
  
  if (!caretakee.caretaking_for) return false;
  
  return caretakee.caretaking_for.some((subCaretakee) =>
    hasNestedCaretakee(subCaretakee, targetUserId, visited)
  );
};

/**
 * Get all user IDs in the caretaking chain
 * Recursively collects IDs from the caretaking_for array
 * 
 * @param user - User object with caretaking_for array
 * @param visited - Set of visited user IDs (prevents infinite loops)
 * @returns Array of user IDs in the caretaking chain
 */
export const getCaretakingChainIds = (
  user: { id?: number; caretaking_for?: ICaretakee[] },
  visited: Set<number> = new Set()
): number[] => {
  const chainIds: number[] = [];
  
  // Add current user ID
  if (user.id && !visited.has(user.id)) {
    chainIds.push(user.id);
    visited.add(user.id);
  }
  
  // Process caretakees
  if (user.caretaking_for) {
    for (const caretakee of user.caretaking_for) {
      if (caretakee?.id && !visited.has(caretakee.id)) {
        chainIds.push(
          ...getCaretakingChainIds(caretakee, visited)
        );
      }
    }
  }
  
  return chainIds;
};
