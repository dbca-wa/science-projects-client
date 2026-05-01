import { apiClient } from "@/shared/services/api/client.service";
import { PROJECT_ENDPOINTS } from "./project.endpoints";
import { TEAM_ENDPOINTS } from "./team.endpoints";
import type { IProjectData, ProjectKind } from "@/shared/types/project.types";
import type { IWizardTeamMember } from "@/app/stores/derived/project-wizard.store";
import { logger } from "@/shared/services/logger.service";

/**
 * Wizard form data shape — matches the ProjectWizardStore state
 */
export interface WizardSubmissionData {
	// Base information
	title: string;
	description: string;
	keywords: string[];
	image: File | null;

	// Project details
	business_area: number | null;
	departmental_service: number | null;
	start_date: Date | null;
	end_date: Date | null;
	project_leader: number | null;
	data_custodian: number | null;

	// Location
	areas: number[];

	// Project metadata
	projectKind: ProjectKind;
	creator: number;
	year: number;

	// Student details (conditional)
	organisation?: string;
	level?: string;

	// External details (conditional)
	collaboration_with?: string;
	budget?: string;
	external_description?: string;
	aims?: string;

	// Team members added during creation
	teamMembers?: IWizardTeamMember[];
}

/**
 * Build a FormData payload from wizard data.
 *
 * Field names use camelCase to match the backend's expected format
 * (the Django view reads `request.data.get("businessArea")`, etc.).
 */
function buildFormData(data: WizardSubmissionData): FormData {
	const formData = new FormData();

	// Base information
	formData.append("kind", data.projectKind);
	formData.append("year", data.year.toString());
	formData.append("creator", data.creator.toString());
	formData.append("title", data.title);
	formData.append("description", data.description);
	formData.append("keywords", data.keywords.join(", "));

	// Image (optional)
	if (data.image instanceof File) {
		formData.append("imageData", data.image);
	}

	// Project details
	if (data.business_area) {
		formData.append("businessArea", data.business_area.toString());
	}
	if (data.departmental_service) {
		formData.append(
			"departmentalService",
			data.departmental_service.toString()
		);
	}
	if (data.data_custodian) {
		formData.append("dataCustodian", data.data_custodian.toString());
	}
	if (data.project_leader) {
		formData.append("projectLead", data.project_leader.toString());
	}
	if (data.start_date) {
		formData.append("startDate", data.start_date.toISOString());
	}
	if (data.end_date) {
		formData.append("endDate", data.end_date.toISOString());
	}

	// Locations (repeated form field entries)
	data.areas.forEach((locationId) => {
		formData.append("locations", locationId.toString());
	});

	// Student-specific fields
	if (data.projectKind === "student") {
		if (data.organisation) {
			formData.append("organisation", data.organisation);
		}
		if (data.level) {
			formData.append("level", data.level);
		}
	}

	// External-specific fields
	if (data.projectKind === "external") {
		if (data.external_description) {
			formData.append("externalDescription", data.external_description);
		}
		if (data.aims) {
			formData.append("aims", data.aims);
		}
		if (data.budget) {
			formData.append("budget", data.budget);
		}
		if (data.collaboration_with) {
			formData.append("collaborationWith", data.collaboration_with);
		}
	}

	return formData;
}

/**
 * Submit the wizard data to create a new project.
 *
 * Uses multipart/form-data to support image upload.
 * After the project is created, adds team members (excluding the leader,
 * who is already set via the projectLead field).
 * Returns the created project data including the new project ID.
 */
export const submitWizard = async (
	data: WizardSubmissionData
): Promise<IProjectData> => {
	const formData = buildFormData(data);

	const project = await apiClient.post<IProjectData>(
		PROJECT_ENDPOINTS.LIST,
		formData,
		{
			headers: { "Content-Type": "multipart/form-data" },
		}
	);

	// Add non-leader team members to the newly created project
	if (data.teamMembers && data.teamMembers.length > 0) {
		const nonLeaderMembers = data.teamMembers.filter((tm) => !tm.isLeader);

		for (const member of nonLeaderMembers) {
			try {
				await apiClient.post(TEAM_ENDPOINTS.CREATE(), {
					project: project.id,
					user: member.userId,
					role: member.role,
					time_allocation: 0,
					position: member.position,
					is_leader: false,
					comments: "",
					short_code: "",
				});
			} catch (error) {
				// Log but don't fail the entire submission if a single member fails
				logger.warn("Failed to add team member during project creation", {
					userId: member.userId,
					projectId: project.id,
					error,
				});
			}
		}
	}

	return project;
};
