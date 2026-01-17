import type { IUserData, IUserMe } from "@/shared/types/user.types";

/**
 * User utility functions
 * 
 * These utilities are shared across features (users, projects, reports, etc.)
 * for consistent user display and formatting.
 */

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
export const getUserDisplayName = (user: IUserData | IUserMe | null | undefined): string => {
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
export const getUserInitials = (user: IUserData | IUserMe | null | undefined): string => {
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
export const hasValidEmail = (user: IUserData | IUserMe | null | undefined): boolean => {
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
export const getUserEmail = (user: IUserData | IUserMe | null | undefined): string => {
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
export const getUserPhone = (user: IUserData | IUserMe | null | undefined): string => {
  return user?.phone || "No Phone number";
};
