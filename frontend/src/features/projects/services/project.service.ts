import { apiClient } from "@/shared/services/api/client.service";
import { PROJECT_ENDPOINTS } from "./project.endpoints";
import type {
	IProjectData,
	IFullProjectDetails,
	ProjectStatus,
} from "@/shared/types/project.types";

/**
 * Project API Service
 *
 * Handles all project-related API calls.
 */

// API Response Types
export interface ProjectListResponse {
	projects: IProjectData[];
	total_results: number;
	total_pages: number;
}

export interface ProjectSearchParams {
	page?: number;
	searchTerm?: string;
	businessarea?: string;
	projectkind?: string;
	projectstatus?: string;
	year?: number;
	selected_user?: number;
	only_active?: boolean;
	only_inactive?: boolean;
}

/**
 * Get paginated list of projects with optional filters
 */
export const getAllProjects = async (
	params: ProjectSearchParams = {}
): Promise<ProjectListResponse> => {
	const queryParams = new URLSearchParams();

	// Add pagination
	if (params.page) {
		queryParams.append("page", params.page.toString());
	}

	// Add search term
	if (params.searchTerm) {
		queryParams.append("searchTerm", params.searchTerm);
	}

	// Add filters
	if (params.businessarea && params.businessarea !== "All") {
		queryParams.append("businessarea", params.businessarea);
	}

	if (params.projectkind && params.projectkind !== "All") {
		queryParams.append("projectkind", params.projectkind);
	}

	if (params.projectstatus && params.projectstatus !== "All") {
		queryParams.append("projectstatus", params.projectstatus);
	}

	if (params.year && params.year !== 0) {
		queryParams.append("year", params.year.toString());
	}

	if (params.selected_user) {
		queryParams.append("selected_user", params.selected_user.toString());
	}

	if (params.only_active) {
		queryParams.append("only_active", "true");
	}

	if (params.only_inactive) {
		queryParams.append("only_inactive", "true");
	}

	const url = `${PROJECT_ENDPOINTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
	return apiClient.get<ProjectListResponse>(url);
};

/**
 * Get full project details by ID
 */
export const getProjectById = async (
	id: number | string
): Promise<IFullProjectDetails> => {
	return apiClient.get<IFullProjectDetails>(PROJECT_ENDPOINTS.DETAIL(id));
};

/**
 * Create a new project
 */
export const createProject = async (
	data: Partial<IProjectData>
): Promise<IProjectData> => {
	return apiClient.post<IProjectData>(PROJECT_ENDPOINTS.LIST, data);
};

/**
 * Update an existing project
 */
export const updateProject = async (
	id: number | string,
	data: Partial<IProjectData>
): Promise<IProjectData> => {
	return apiClient.patch<IProjectData>(PROJECT_ENDPOINTS.DETAIL(id), data);
};

/**
 * Update project status
 */
export const updateProjectStatus = async (
	id: number | string,
	status: ProjectStatus
): Promise<IProjectData> => {
	return apiClient.patch<IProjectData>(PROJECT_ENDPOINTS.DETAIL(id), {
		status,
	});
};

/**
 * Delete a project
 */
export const deleteProject = async (id: number | string): Promise<void> => {
	return apiClient.delete<void>(PROJECT_ENDPOINTS.DETAIL(id));
};

/**
 * Get list of all project years
 */
export const getAllProjectYears = async (): Promise<number[]> => {
	return apiClient.get<number[]>(PROJECT_ENDPOINTS.YEARS);
};

/**
 * Download projects CSV (Full)
 */
export const downloadProjectsCSV = async (): Promise<Blob> => {
	return apiClient.getBlob(PROJECT_ENDPOINTS.DOWNLOAD);
};

/**
 * Download projects CSV (Annual Report)
 */
export const downloadProjectsCSVAR = async (): Promise<Blob> => {
	return apiClient.getBlob(PROJECT_ENDPOINTS.DOWNLOAD_AR);
};

// Export as default service object
export const projectService = {
	getAllProjects,
	getProjectById,
	createProject,
	updateProject,
	updateProjectStatus,
	deleteProject,
	getAllProjectYears,
	downloadProjectsCSV,
	downloadProjectsCSVAR,
};

/**
 * Map-specific search parameters
 */
export interface ProjectMapSearchParams {
	searchTerm?: string;
	locations?: number[]; // Selected location IDs
	businessAreas?: number[]; // Selected business area IDs
	user?: number | null;
	status?: string;
	kind?: string;
	year?: number;
	onlyActive?: boolean;
	onlyInactive?: boolean;
}

/**
 * Map-specific API response
 */
export interface ProjectMapResponse {
	projects: IProjectData[];
	total_projects: number;
	projects_without_location: number;
}

/**
 * Get projects for map display with filters
 * Returns all projects (no pagination) with location data and statistics
 */
export const getProjectsForMap = async (
	params: ProjectMapSearchParams = {}
): Promise<ProjectMapResponse> => {
	const queryParams = new URLSearchParams();

	// Add search term
	if (params.searchTerm) {
		queryParams.append("searchTerm", params.searchTerm);
	}

	// Add location filters (comma-separated IDs)
	if (params.locations && params.locations.length > 0) {
		queryParams.append("locations", params.locations.join(","));
	}

	// Add business area filters (comma-separated IDs)
	if (params.businessAreas && params.businessAreas.length > 0) {
		queryParams.append("businessarea", params.businessAreas.join(","));
	}

	// Add user filter
	if (params.user) {
		queryParams.append("selected_user", params.user.toString());
	}

	// Add status filter
	if (params.status && params.status !== "All" && params.status !== "") {
		queryParams.append("projectstatus", params.status);
	}

	// Add kind filter
	if (params.kind && params.kind !== "All" && params.kind !== "") {
		queryParams.append("projectkind", params.kind);
	}

	// Add year filter
	if (params.year && params.year !== 0) {
		queryParams.append("year", params.year.toString());
	}

	// Add active/inactive filters
	if (params.onlyActive) {
		queryParams.append("only_active", "true");
	}

	if (params.onlyInactive) {
		queryParams.append("only_inactive", "true");
	}

	const url = `${PROJECT_ENDPOINTS.MAP}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
	return apiClient.get<ProjectMapResponse>(url);
};

/**
 * Get projects for a specific user (involved projects)
 */
export const getInvolvedProjects = async (
	userId: number
): Promise<IProjectData[]> => {
	return apiClient.get<IProjectData[]>(`users/${userId}/projects`);
};

/**
 * Get projects for the current authenticated user
 */
export const getMyProjects = async (): Promise<IProjectData[]> => {
	return apiClient.get<IProjectData[]>(PROJECT_ENDPOINTS.MINE);
};

// ============================================================================
// PROJECT DOCUMENT UPDATES
// ============================================================================

/**
 * Update project description
 */
export const updateProjectDescription = async (
	id: number | string,
	description: string
): Promise<void> => {
	await apiClient.patch(PROJECT_ENDPOINTS.DETAIL(id), { description });
};

/**
 * Update external project details field
 */
export const updateExternalProjectField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(PROJECT_ENDPOINTS.EXTERNAL_DETAIL(id), {
		[field]: content,
	});
};

/**
 * Update concept plan field
 */
export const updateConceptPlanField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(PROJECT_ENDPOINTS.CONCEPT_PLAN(id), {
		[field]: content,
	});
};

/**
 * Update project plan field
 */
export const updateProjectPlanField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(PROJECT_ENDPOINTS.PROJECT_PLAN(id), {
		[field]: content,
	});
};

/**
 * Update project plan endorsement field
 */
export const updateProjectPlanEndorsementField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(PROJECT_ENDPOINTS.PROJECT_PLAN_ENDORSEMENT(id), {
		[field]: content,
	});
};

/**
 * Update progress report field
 */
export const updateProgressReportField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(PROJECT_ENDPOINTS.PROGRESS_REPORT(id), {
		[field]: content,
	});
};

/**
 * Update student report field
 */
export const updateStudentReportField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(PROJECT_ENDPOINTS.STUDENT_REPORT(id), {
		[field]: content,
	});
};

/**
 * Update project closure field
 */
export const updateProjectClosureField = async (
	id: number | string,
	field: string,
	content: string
): Promise<void> => {
	await apiClient.patch(PROJECT_ENDPOINTS.PROJECT_CLOSURE(id), {
		[field]: content,
	});
};
