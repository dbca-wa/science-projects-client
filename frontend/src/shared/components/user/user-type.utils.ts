/**
 * Utility functions for determining user type variants.
 *
 * Separated from UserTypeBadge.tsx to satisfy react-refresh/only-export-components
 * (files with JSX components should only export components).
 */

export type UserTypeVariant =
	| "admin"
	| "key_stakeholder"
	| "approver"
	| "ba_lead"
	| "staff"
	| "external";

/**
 * Determine the user type variant from user data.
 * Uses the same hierarchy as UserCard: Admin > Key Stakeholder > Approver > BA Lead > Staff > External
 */
export const getUserTypeVariant = (user: {
	is_superuser?: boolean;
	is_staff?: boolean;
	is_key_stakeholder?: boolean;
	is_approver?: boolean;
	business_areas_led?: unknown[];
}): UserTypeVariant => {
	if (user.is_superuser) return "admin";
	if (user.is_key_stakeholder) return "key_stakeholder";
	if (user.is_approver) return "approver";
	if (user.business_areas_led && user.business_areas_led.length > 0)
		return "ba_lead";
	if (user.is_staff) return "staff";
	return "external";
};

/**
 * Simplified variant for contexts where only is_staff is known (e.g. wizard team members).
 */
export const getSimpleUserTypeVariant = (
	isStaff: boolean,
	isSuperuser?: boolean
): UserTypeVariant => {
	if (isSuperuser) return "admin";
	if (isStaff) return "staff";
	return "external";
};
