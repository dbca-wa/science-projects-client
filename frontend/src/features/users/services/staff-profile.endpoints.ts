export const STAFF_PROFILE_ENDPOINTS = {
	// Staff profiles
	LIST: "users/staffprofiles",
	DETAIL: (pk: number) => `users/${pk}/staffprofiles`,
	UPDATE: (pk: number) => `users/staffprofiles/${pk}`,
	TOGGLE_VISIBILITY: (staffProfilePk: number) =>
		`users/staffprofiles/${staffProfilePk}/toggle_visibility`,
	CHECK_STAFF_PROFILE: (pk: number) => `users/${pk}/check_staff_profile`,
	HERO: (pk: number) => `users/staffprofiles/${pk}/hero`,
	OVERVIEW: (pk: number) => `users/staffprofiles/${pk}/overview`,
	CV: (pk: number) => `users/staffprofiles/${pk}/cv`,

	// Email
	PUBLIC_EMAIL: (pk: number) => `users/${pk}/public_email_staff_member`,
	EMAIL_LIST: "users/get_staff_profile_emails",

	// Employment entries
	EMPLOYMENT: {
		LIST: "users/employment_entries/",
		DETAIL: (pk: number) => `users/employment_entries/${pk}`,
	},

	// Education entries
	EDUCATION: {
		LIST: "users/education_entries/",
		DETAIL: (pk: number) => `users/education_entries/${pk}`,
	},

	// Related data
	PROJECTS: (pk: number) => `users/${pk}/projects_staff_profile`,
	IT_ASSETS: (pk: number) => `users/${pk}/itassets`,
	TOGGLE_PROJECT_VISIBILITY: (projectPk: number) =>
		`projects/${projectPk}/toggle_user_profile_visibility`,
} as const;
