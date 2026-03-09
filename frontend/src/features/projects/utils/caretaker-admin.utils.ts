import type { IUserData } from "@/shared/types/user.types";

/**
 * Check if user is caretaking for any superuser (admin) in the project
 *
 * This checks if the current user is caretaking for any member who is a superuser,
 * either directly or through nested caretaking relationships.
 *
 * @param currentUser - Current logged-in user (IUserData or IUserMe)
 * @param members - Project members
 * @param canActForUser - Function from useCaretakerPermissions to check if can act for a user
 * @returns True if user is caretaking for any superuser
 */
export function isCaretakerOfAdmin(
	currentUser: { id: number; is_superuser?: boolean } | null | undefined,
	members: Array<{ user: IUserData }> | null,
	canActForUser: (userId: number) => boolean
): boolean {
	if (!currentUser || !members || members.length === 0) {
		return false;
	}

	// Check if caretaking for any superuser in members
	return members.some((member) => {
		const user = member.user;
		return user.is_superuser && canActForUser(user.id);
	});
}
