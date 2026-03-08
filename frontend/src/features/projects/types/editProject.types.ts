/**
 * Form data for editing a project
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
