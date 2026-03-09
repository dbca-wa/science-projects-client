/**
 * Project Types
 *
 * Re-exports core project types from shared and adds project-specific types.
 */

// Re-export from shared types
export type {
	IProjectData,
	IProjectMember,
	IExtendedProjectDetails,
	IExternalProjectDetails,
	IStudentProjectDetails,
	IProjectDocuments,
	ProjectKind,
	ProjectStatus,
	ProjectRoles,
} from "@/shared/types/project.types";

/**
 * Project filter options
 */
export interface IProjectFilters {
	status?: string[];
	kind?: string[];
	year?: number;
	businessArea?: number;
	search?: string;
}

/**
 * Edit project form data
 */
export interface EditProjectFormData {
	title: string;
	image?: File | string | null;
	business_area: number;
	service?: number | null;
	start_date: string;
	end_date?: string | null;
	data_custodian?: number | null;
	project_areas: number[];
	// External project fields
	collaboration_with?: string;
	budget?: string;
	// Student project fields
	organisation?: string;
	level?: string;
}

/**
 * API payload for updating a project
 */
export interface UpdateProjectPayload {
	title?: string;
	image?: File | string | null;
	business_area?: number;
	service?: number | null;
	start_date?: string;
	end_date?: string | null;
	data_custodian?: number | null;
	project_areas?: number[];
	keywords?: string;
	// External project fields
	collaboration_with?: string;
	budget?: string;
	// Student project fields
	organisation?: string;
	level?: string;
}
