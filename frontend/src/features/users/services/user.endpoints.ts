export const USER_ENDPOINTS = {
	// Base user endpoints
	LIST: "users/",
	ME: "users/me",
	DETAIL: (pk: number | string) => `users/${pk}`,
	DELETE: (pk: number | string) => `users/${pk}`,

	// User search
	SEARCH: "users/",

	SMALL_SEARCH: "users/smallsearch",

	// User status and actions
	IS_STAFF: (pk: number) => `users/is_staff/${pk}`,
	TOGGLE_ACTIVE: (pk: number | string) => `users/${pk}/toggleactive`,
	TOGGLE_ADMIN: (pk: number | string) => `users/${pk}/admin`,
	LAST_ONLINE: (userId: string) => `users/lastOnline/${userId}`,

	// User validation
	CHECK_EMAIL_EXISTS: "users/check-email-exists",
	CHECK_NAME_EXISTS: "users/check-name-exists",

	// User profile
	PERSONAL_INFO: (userId: number | string) => `users/${userId}/pi`,
	PROFILE: (userId: number | string) => `users/${userId}/profile`,
	REMOVE_AVATAR: (userPk: number | string) => `users/${userPk}/remove_avatar`,
	MEMBERSHIP: (userPk: number | string) => `users/${userPk}/membership`,

	// User projects
	PROJECTS: (pk: number) => `users/${pk}/projects`,
	PROJECTS_STAFF_PROFILE: (pk: number) =>
		`users/${pk}/projects_staff_profile`,

	// IT Assets
	IT_ASSETS: (pk: number) => `users/${pk}/itassets`,

	// CSV Downloads
	DOWNLOAD_BCS_CSV: "users/download_bcs_csv",
} as const;

export const DOCUMENT_ENDPOINTS = {
	GET_PREVIOUS_REPORTS_DATA: "documents/get_previous_reports_data",
	BATCH_APPROVE_OLD: "documents/batchapproveold",
	BATCH_APPROVE: "documents/batchapprove",
	OPEN_NEW_CYCLE: "documents/opennewcycle",
	FINAL_APPROVAL: "documents/actions/finalApproval",
	PROJECT_LEAD_EMAILS: "documents/get_project_lead_emails",
} as const;

export const PROJECT_ENDPOINTS = {} as const;
