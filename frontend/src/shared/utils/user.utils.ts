import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { getImageUrl } from "@/shared/utils/image.utils";

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
	first_name?: string | null;
	last_name?: string | null;
	username?: string | null;
}

/**
 * Check if a name field value is valid for display purposes.
 * Returns false for null, undefined, empty, whitespace-only, or strings starting with "None".
 */
export const isValidName = (value: string | null | undefined): boolean => {
	if (!value) return false;
	if (value.trim().length === 0) return false;
	if (value.startsWith("None")) return false;
	return true;
};

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
	user: UserLike | null | undefined
): string => {
	if (!user) return "";

	// Try display names first (both valid = full name)
	if (
		isValidName(user.display_first_name) &&
		isValidName(user.display_last_name)
	) {
		return `${user.display_first_name} ${user.display_last_name}`;
	}

	// Try first_name + last_name (both valid = full name)
	if (isValidName(user.first_name) && isValidName(user.last_name)) {
		return `${user.first_name} ${user.last_name}`;
	}

	// Single valid display name (for organisations with only one name set)
	if (isValidName(user.display_first_name)) return user.display_first_name!;
	if (isValidName(user.display_last_name)) return user.display_last_name!;
	if (isValidName(user.first_name)) return user.first_name!;
	if (isValidName(user.last_name)) return user.last_name!;

	// Final fallback to username
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
export const getUserInitials = (user: UserLike | null | undefined): string => {
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
	user: IUserData | IUserMe | null | undefined
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
	user: IUserData | IUserMe | null | undefined
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
	user: IUserData | IUserMe | null | undefined
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
	id: number;
	display_first_name: string | null;
	display_last_name: string | null;
	email: string;
	image?: { file: string } | string | null;
}): {
	id: number;
	display_first_name: string | null;
	display_last_name: string | null;
	email: string;
	image?: string;
} => ({
	id: user.id,
	display_first_name: user.display_first_name,
	display_last_name: user.display_last_name,
	email: user.email,
	image: getImageUrl(user.image),
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
