export const STAFF_PROFILE_ENDPOINTS = {
	// Staff profiles
	STAFF_PROFILES: {
		LIST: "users/staffprofiles",
		DETAIL: (pk: number) => `users/${pk}/staffprofiles`,
		UPDATE: (pk: number) => `users/staffprofiles/${pk}`,
		TOGGLE_VISIBILITY: (staffProfilePk: number) =>
			`users/staffprofiles/${staffProfilePk}/toggle_visibility`,
		CHECK_STAFF_PROFILE: (pk: number) => `users/${pk}/check_staff_profile`,
		HERO: (pk: number) => `users/staffprofiles/${pk}/hero`,
		OVERVIEW: (pk: number) => `users/staffprofiles/${pk}/overview`,
		CV: (pk: number) => `users/staffprofiles/${pk}/cv`,
		PUBLIC_EMAIL: (pk: number) => `users/${pk}/public_email_staff_member`,
	},

	// Employment and education
	EMPLOYMENT_ENTRIES: {
		LIST: "users/employment_entries/",
		DETAIL: (pk: number) => `users/employment_entries/${pk}`,
	},
	EDUCATION_ENTRIES: {
		LIST: "users/education_entries/",
		DETAIL: (pk: number) => `users/education_entries/${pk}`,
	},

	// Email lists
	STAFF_PROFILE_EMAILS: "users/get_staff_profile_emails",
};
