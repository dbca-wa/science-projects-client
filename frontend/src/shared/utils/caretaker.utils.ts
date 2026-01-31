/**
 * Caretaker validation utilities
 */

interface ICaretakee {
  id: number;
  end_date?: string | Date | null;
  caretaking_for?: ICaretakee[];
}

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
