/**
 * Project API endpoints
 */
export const PROJECT_ENDPOINTS = {
	// Base project endpoints
	LIST: "projects/list",
	DETAIL: (id: number | string) => `projects/${id}`,
	MAP: "projects/map",
	MINE: "projects/mine",
	YEARS: "projects/listofyears",
	DOWNLOAD: "projects/download",
	DOWNLOAD_AR: "projects/download-ar",

	// External project details
	EXTERNAL_DETAIL: (id: number | string) =>
		`projects/external_project_details/${id}`,

	// Concept plans
	CONCEPT_PLAN: (id: number | string) => `documents/conceptplans/${id}`,

	// Project plans
	PROJECT_PLAN: (id: number | string) => `documents/projectplans/${id}`,
	PROJECT_PLAN_ENDORSEMENT: (id: number | string) =>
		`documents/projectplans/endorsements/${id}`,

	// Progress reports
	PROGRESS_REPORT: (id: number | string) => `documents/progressreports/${id}`,

	// Student reports
	STUDENT_REPORT: (id: number | string) => `documents/studentreports/${id}`,

	// Project closures
	PROJECT_CLOSURE: (id: number | string) => `documents/projectclosures/${id}`,

	// Drafts
	DRAFT_DETAIL: (kind: string) => `projects/drafts/${kind}`,

	// Methodology image
	METHODOLOGY_IMAGE_LIST: "medias/methodology_photos",
	METHODOLOGY_IMAGE_DETAIL: (projectPlanId: number | string) =>
		`medias/methodology_photos/${projectPlanId}`,
} as const;
