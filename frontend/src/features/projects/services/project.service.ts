import { apiClient } from "@/shared/services/api/client.service";
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

	const url = `projects${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
	return apiClient.get<ProjectListResponse>(url);
};

/**
 * Get full project details by ID
 */
export const getProjectById = async (
	id: number | string
): Promise<IFullProjectDetails> => {
	return apiClient.get<IFullProjectDetails>(`projects/${id}`);
};

/**
 * Create a new project
 */
export const createProject = async (
	data: Partial<IProjectData>
): Promise<IProjectData> => {
	return apiClient.post<IProjectData>("projects/", data);
};

/**
 * Update an existing project
 */
export const updateProject = async (
	id: number | string,
	data: Partial<IProjectData>
): Promise<IProjectData> => {
	return apiClient.put<IProjectData>(`projects/${id}`, data);
};

/**
 * Update project status
 */
export const updateProjectStatus = async (
	id: number | string,
	status: ProjectStatus
): Promise<IProjectData> => {
	return apiClient.put<IProjectData>(`projects/${id}`, { status });
};

/**
 * Delete a project
 */
export const deleteProject = async (
	id: number | string
): Promise<void> => {
	return apiClient.delete<void>(`projects/${id}`);
};

/**
 * Get list of all project years
 */
export const getAllProjectYears = async (): Promise<number[]> => {
	return apiClient.get<number[]>("projects/listofyears");
};
