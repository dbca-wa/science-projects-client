/**
 * Dashboard API Endpoints
 *
 * Endpoint definitions for dashboard-related API calls.
 */

export const DASHBOARD_ENDPOINTS = {
	DOCUMENT_TASKS: "documents/projectdocuments/pendingmyaction",
	ENDORSEMENT_TASKS: "documents/endorsements/pendingmyaction",
	MY_PROJECTS: "projects/mine",
	ADMIN_TASKS: "adminoptions/tasks",
} as const;
