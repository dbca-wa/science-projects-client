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
 * Edit project form data
 */
export interface EditProjectFormData {
	title: string;
	description?: string;
	image?: File | string | null;
	business_area: number;
	start_date: string;
	end_date?: string | null;
	project_leader?: number | null;
	data_custodian?: number | null;
	keywords?: string;
	project_areas: number[];
	// External project fields
	collaboration_with?: string;
	budget?: string;
	external_description?: string;
	aims?: string;
	// Student project fields
	organisation?: string;
	level?: string;
}

/**
 * API payload for updating a project
 */
export interface UpdateProjectPayload {
	title?: string;
	description?: string;
	image?: File | string | null;
	business_area?: number;
	start_date?: string;
	end_date?: string | null;
	project_leader?: number | null;
	data_custodian?: number | null;
	project_areas?: number[];
	keywords?: string;
	// External project fields
	collaboration_with?: string;
	budget?: string;
	external_description?: string;
	aims?: string;
	// Student project fields
	organisation?: string;
	level?: string;
}
