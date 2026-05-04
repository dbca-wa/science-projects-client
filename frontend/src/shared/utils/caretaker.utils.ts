import type { ICaretakee } from "@/features/caretakers/types";

/**
 * Format caretaker reason from backend to display text.
 * Capitalises first letter if it's a custom reason.
 */
export const formatCaretakerReason = (reason: string | undefined): string => {
	if (!reason) return "";
	return reason.charAt(0).toUpperCase() + reason.slice(1);
};

/**
 * Check if a caretaking relationship is valid (not expired)
 */
export const isValidCaretaking = (caretakee: ICaretakee): boolean => {
	if (!caretakee?.end_date) return true;
	const endDate = new Date(caretakee.end_date);
	return endDate >= new Date();
};

/**
 * Check if a caretakee has a nested caretakee with the target user ID.
 * Recursively searches through the caretaking chain.
 */
export const hasNestedCaretakee = (
	caretakee: ICaretakee,
	targetUserId: number,
	visited: Set<number> = new Set()
): boolean => {
	if (visited.has(caretakee.id)) return false;
	visited.add(caretakee.id);
	if (caretakee.id === targetUserId) return true;
	if (!caretakee.caretaking_for) return false;
	return caretakee.caretaking_for.some((sub) =>
		hasNestedCaretakee(sub, targetUserId, visited)
	);
};
