/**
 * Staff profile API endpoint constants
 * Paths are relative to the base URL (no /api/v1/ prefix)
 */
export const STAFF_PROFILE_ENDPOINTS = {
	// Directory
	LIST: () => "/users/staffprofiles",
	DETAIL: (pk: number) => `/users/staffprofiles/${pk}`,

	// Profile sections
	HERO: (pk: number) => `/users/staffprofiles/${pk}/hero`,
	OVERVIEW: (pk: number) => `/users/staffprofiles/${pk}/overview`,
	CV: (pk: number) => `/users/staffprofiles/${pk}/cv`,

	// Profile actions
	TOGGLE_VISIBILITY: (pk: number) =>
		`/users/staffprofiles/${pk}/toggle_visibility`,
	CHECK: (userPk: number) => `/users/${userPk}/check_staff_profile`,
	MY_PROFILE: () => "/users/mypublicprofile",

	// Projects
	PROJECTS: (userPk: number) => `/users/${userPk}/projects_staff_profile`,

	// Employment entries
	EMPLOYMENT_ENTRIES: (profileId: number) =>
		`/users/profiles/${profileId}/employment_entries`,
	EMPLOYMENT_ENTRY: (pk: number) => `/users/employment_entries/${pk}`,

	// Education entries
	EDUCATION_ENTRIES: (profileId: number) =>
		`/users/profiles/${profileId}/education_entries`,
	EDUCATION_ENTRY: (pk: number) => `/users/education_entries/${pk}`,

	// Contact
	EMAIL_STAFF: (userPk: number) => `/users/${userPk}/public_email_staff_member`,

	// Admin
	STAFF_EMAILS: () => "/users/get_staff_profile_emails",

	// Publications (external library)
	PUBLICATIONS: (employeeId: string) => `/documents/publications/${employeeId}`,
} as const;
