/**
 * Format caretaker reason from backend to display text.
 * Capitalises first letter if it's a custom reason.
 */
export const formatCaretakerReason = (reason: string | undefined): string => {
	if (!reason) return "";

	return reason.charAt(0).toUpperCase() + reason.slice(1);
};
