import type { IUserData, IUserMe } from "@/shared/types/user.types";

/**
 * User utility functions
 *
 * These utilities are shared across features (users, projects, reports, etc.)
 * for consistent user display and formatting.
 */

/**
 * Minimal user interface for display name functions
 * Allows flexibility for different user data structures
 */
interface UserLike {
	display_first_name?: string | null;
	display_last_name?: string | null;
	first_name?: string;
	last_name?: string;
	username?: string;
}

/**
 * Get user's display name with fallback logic
 * Priority: display_first_name + display_last_name → first_name + last_name → username
 *
 * @param user - User data object
 * @returns Formatted display name
 *
 * @example
 * ```ts
 * getUserDisplayName(user) // "John Doe"
 * getUserDisplayName(userWithNoName) // "johndoe2024"
 * ```
 */
export const getUserDisplayName = (
	user: UserLike | null | undefined,
): string => {
	if (!user) return "";

	const firstName = user.display_first_name || user.first_name;
	const lastName = user.display_last_name || user.last_name;

	// Check if display name is valid (not "None")
	if (firstName && !firstName.startsWith("None") && lastName) {
		return `${firstName} ${lastName}`;
	}

	// Fallback to username
	return user.username || "";
};

/**
 * Get user's initials for avatar fallback
 * Uses first letter of first name and last name
 *
 * @param user - User data object
 * @returns Uppercase initials (e.g., "JD")
 *
 * @example
 * ```ts
 * getUserInitials(user) // "JD"
 * getUserInitials(userWithNoName) // ""
 * ```
 */
export const getUserInitials = (
	user: IUserData | IUserMe | null | undefined,
): string => {
	if (!user) return "";

	const firstName = user.display_first_name || user.first_name;
	const lastName = user.display_last_name || user.last_name;

	const firstInitial = firstName?.[0] || "";
	const lastInitial = lastName?.[0] || "";

	return `${firstInitial}${lastInitial}`.toUpperCase();
};

/**
 * Check if user has a valid email address
 *
 * @param user - User data object
 * @returns True if user has a valid email
 *
 * @example
 * ```ts
 * hasValidEmail(user) // true
 * hasValidEmail(userWithUnsetEmail) // false
 * ```
 */
export const hasValidEmail = (
	user: IUserData | IUserMe | null | undefined,
): boolean => {
	if (!user?.email) return false;
	return !user.email.startsWith("unset");
};

/**
 * Get user's email or fallback message
 *
 * @param user - User data object
 * @returns Email address or "No Email"
 *
 * @example
 * ```ts
 * getUserEmail(user) // "john@example.com"
 * getUserEmail(userWithNoEmail) // "No Email"
 * ```
 */
export const getUserEmail = (
	user: IUserData | IUserMe | null | undefined,
): string => {
	if (!user?.email || user.email.startsWith("unset")) {
		return "No Email";
	}
	return user.email;
};

/**
 * Get user's phone or fallback message
 *
 * @param user - User data object
 * @returns Phone number or "No Phone number"
 *
 * @example
 * ```ts
 * getUserPhone(user) // "+1234567890"
 * getUserPhone(userWithNoPhone) // "No Phone number"
 * ```
 */
export const getUserPhone = (
	user: IUserData | IUserMe | null | undefined,
): string => {
	return user?.phone || "No Phone number";
};

/**
 * Transform user data to UserDisplay component format
 * Handles different user data structures (SecondaryUserData, IUserData, etc.)
 * and normalizes them to the format expected by UserDisplay component
 *
 * @param user - User data with minimal required fields
 * @returns Normalized user object for UserDisplay component
 *
 * @example
 * ```ts
 * // From SecondaryUserData (AdminTask secondary_users)
 * const displayUser = toUserDisplayFormat(secondaryUser);
 * <UserDisplay user={displayUser} />
 * ```
 */
export const toUserDisplayFormat = (user: {
	pk: number;
	display_first_name: string | null;
	display_last_name: string | null;
	email: string;
	image?: { file: string } | string | null;
}): {
	pk: number;
	display_first_name: string | null;
	display_last_name: string | null;
	email: string;
	image?: string;
} => ({
	pk: user.pk,
	display_first_name: user.display_first_name,
	display_last_name: user.display_last_name,
	email: user.email,
	image: typeof user.image === "string" ? user.image : user.image?.file,
});

/**
 * Get a human-readable label for caretaker reasons
 * 
 * @param reason - The reason code
 * @returns Human-readable label
 * 
 * @example
 * ```ts
 * getCaretakerReasonLabel("leave") // "On Leave"
 * getCaretakerReasonLabel("resignation") // "Leaving the Department"
 * ```
 */
export const getCaretakerReasonLabel = (reason: string): string => {
	switch (reason) {
		case "leave":
			return "On Leave";
		case "resignation":
			return "Leaving the Department";
		case "other":
			return "Other";
		default:
			return reason;
	}
};
