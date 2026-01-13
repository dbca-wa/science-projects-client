export const USER_ENDPOINTS = {
	// Base user endpoints
	LIST: "users/",
	CREATE: "users/",
	ME: "users/me",
	DETAIL: (pk: number | string) => `users/${pk}`,
	DELETE: (pk: number | string) => `users/${pk}`,

	// User search
	SEARCH: "users/", // With query params (?page=1&searchTerm=...)
	SMALL_SEARCH: "users/smallsearch",

	// User validation
	CHECK_EMAIL_EXISTS: "users/check-email-exists",
	CHECK_NAME_EXISTS: "users/check-name-exists",

	// User status
	IS_STAFF: (pk: number) => `users/is_staff/${pk}`,
	LAST_ONLINE: (userId: string) => `users/lastOnline/${userId}`,

	// User profile
	PERSONAL_INFO: (userId: number | string) => `users/${userId}/pi`,
	PROFILE: (userId: number | string) => `users/${userId}/profile`,
	REMOVE_AVATAR: (userPk: number | string) => `users/${userPk}/remove_avatar`,
	MEMBERSHIP: (userPk: number | string) => `users/${userPk}/membership`,

	// User projects
	PROJECTS: (pk: number) => `users/${pk}/projects`,

	// Downloads/Exports
	DOWNLOAD_BCS_CSV: "users/download_bcs_csv",

	// Admin actions on users
	TOGGLE_ACTIVE: (pk: number | string) => `users/${pk}/toggleactive`,
	TOGGLE_ADMIN: (pk: number | string) => `users/${pk}/admin`,
	MERGE_USERS: "adminoptions/mergeusers",
} as const;
