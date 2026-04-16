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
	DIVISIONS: "agencies/divisions",
	DIVISION_DETAIL: (id: number) => `agencies/divisions/${id}`,
	SERVICES: "agencies/services",
	SERVICE_DETAIL: (id: number) => `agencies/services/${id}`,

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
	BATCH_APPROVE: "documents/batchapprove",
	BATCH_APPROVE_OLD: "documents/batchapproveold",
	OPEN_NEW_CYCLE: "documents/opennewcycle",

	// Data lists
	UNAPPROVED_DOCS: "agencies/business_areas/unapproved_docs",
	PROBLEMATIC_PROJECTS: "agencies/business_areas/problematic_projects",
} as const;
