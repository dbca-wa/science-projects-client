import { apiClient } from "./api/client.service";

/**
 * Content update service functions for the inline editing system.
 * These are used by shared/config/content-types.config.ts and must
 * live in shared/ to maintain the shared/ independence rule.
 */

const CONTENT_ENDPOINTS = {
	PROJECT_DETAIL: (id: number | string) => `projects/${id}`,
	EXTERNAL_DETAIL: (id: number | string) =>
		`projects/external_project_details/${id}`,
	CONCEPT_PLAN: (id: number | string) => `documents/conceptplans/${id}`,
	PROJECT_PLAN: (id: number | string) => `documents/projectplans/${id}`,
	PROJECT_PLAN_ENDORSEMENT: (id: number | string) =>
		`documents/projectplan_endorsements/${id}`,
	PROGRESS_REPORT: (id: number | string) => `documents/progressreports/${id}`,
	STUDENT_REPORT: (id: number | string) => `documents/studentreports/${id}`,
	PROJECT_CLOSURE: (id: number | string) => `documents/projectclosures/${id}`,
	REPORT_DETAIL: (id: number) => `documents/reports/${id}`,
} as const;

/** Update project description */
export const updateProjectDescription = async (
	id: number | string,
	description: string
): Promise<void> => {
	await apiClient.patch(CONTENT_ENDPOINTS.PROJECT_DETAIL(id), { description });
};

/** Update external project details field */
export const updateExternalProjectField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(CONTENT_ENDPOINTS.EXTERNAL_DETAIL(id), {
		[field]: content,
	});
};

/** Update concept plan field */
export const updateConceptPlanField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(CONTENT_ENDPOINTS.CONCEPT_PLAN(id), {
		[field]: content,
	});
};

/** Update project plan field */
export const updateProjectPlanField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(CONTENT_ENDPOINTS.PROJECT_PLAN(id), {
		[field]: content,
	});
};

/** Update project plan endorsement field */
export const updateProjectPlanEndorsementField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(CONTENT_ENDPOINTS.PROJECT_PLAN_ENDORSEMENT(id), {
		[field]: content,
	});
};

/** Update progress report field */
export const updateProgressReportField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(CONTENT_ENDPOINTS.PROGRESS_REPORT(id), {
		[field]: content,
	});
};

/** Update student report field */
export const updateStudentReportField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(CONTENT_ENDPOINTS.STUDENT_REPORT(id), {
		[field]: content,
	});
};

/** Update project closure field */
export const updateProjectClosureField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(CONTENT_ENDPOINTS.PROJECT_CLOSURE(id), {
		[field]: content,
	});
};

/** Update a single field on an annual report via partial PUT */
export const updateAnnualReportField = async (
	id: number,
	fieldName: string,
	content: string
): Promise<void> => {
	await apiClient.put(CONTENT_ENDPOINTS.REPORT_DETAIL(id), {
		[fieldName]: content,
	});
};
