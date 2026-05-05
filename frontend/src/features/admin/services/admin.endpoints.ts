/**
 * Admin API endpoints
 *
 * Paths are relative to the base URL which already includes /api/v1/.
 */
export const ADMIN_ENDPOINTS = {
	// Agencies app
	BRANCHES: "agencies/branches",
	BRANCH_DETAIL: (id: number) => `agencies/branches/${id}`,
	BUSINESS_AREAS: "agencies/business_areas",
	BUSINESS_AREA_DETAIL: (id: number) => `agencies/business_areas/${id}`,
	AFFILIATIONS: "agencies/affiliations",
	AFFILIATION_DETAIL: (id: number) => `agencies/affiliations/${id}`,
	AFFILIATION_MERGE: "agencies/affiliations/merge",
	AFFILIATION_CLEAN: "agencies/affiliations/clean_orphaned",
	DIVISIONS: "agencies/divisions",
	DIVISION_DETAIL: (id: number) => `agencies/divisions/${id}`,
	DIVISION_EMAIL_LIST: (id: number) => `agencies/divisions/${id}/email_list`,

	// Contacts app
	ADDRESSES: "contacts/addresses",
	ADDRESS_DETAIL: (id: number) => `contacts/addresses/${id}`,

	// Locations app
	LOCATIONS: "locations/list",
	LOCATION_DETAIL: (id: number) => `locations/${id}`,

	// Documents app (report info)
	REPORTS: "documents/reports",
	REPORT_DETAIL: (id: number) => `documents/reports/${id}`,

	// Admin actions
	BATCH_APPROVE: "documents/batchapprovecurrent",
	BATCH_APPROVE_OLD: "documents/batchapproveold",
	OPEN_NEW_CYCLE: "documents/opennewcycle",

	// Data lists
	UNAPPROVED_DOCS: "projects/unapprovedFY",
	PROBLEMATIC_PROJECTS: "projects/problematic",

	// Remedy endpoints
	REMEDY_OPEN_CLOSED: "projects/remedy/open_closed",
	REMEDY_MEMBERLESS: "projects/remedy/memberless",
	REMEDY_LEADERLESS: "projects/remedy/leaderless",
	REMEDY_MULTIPLE_LEADERS: "projects/remedy/multiple_leaders",
	REMEDY_EXTERNAL_LEADERS: "projects/remedy/external_leaders",

	// User/staff data lists
	USERS_LIST: "users/list",

	// Admin options (email testing settings)
	ADMIN_OPTIONS_DETAIL: (pk: number) => `adminoptions/${pk}`,
	SEND_ALL_TEST_EMAILS: "adminoptions/send-all-test-emails",
	NEW_CYCLE_DRAFT: "adminoptions/new-cycle-draft",
} as const;
