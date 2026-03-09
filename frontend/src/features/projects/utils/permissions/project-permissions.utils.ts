import type { IUserData, IUserMe } from "@/shared/types/user.types";
import type {
	IProjectData,
	IProjectMember,
} from "@/shared/types/project.types";
import { findProjectLeader } from "@/features/projects/utils/team/team.utils";

/**
 * Project Permission Utilities
 *
 * Utilities for checking user permissions for project operations.
 * These functions implement the permission logic defined in the requirements.
 */

/**
 * Document data interface for permission checks
 */
export interface IDocumentData {
	id: number;
	type: string;
	project_lead_approval_granted: boolean;
	business_area_lead_approval_granted: boolean;
	directorate_approval_granted: boolean;
}

/**
 * Check if user can edit project
 *
 * Users can edit if they are:
 * - Superuser
 * - Caretaker of admin (superuser)
 * - Project leader
 * - Caretaker of project leader
 * - Business area leader
 * - Caretaker of business area leader
 *
 * @param user - Current user (can be IUserData or IUserMe)
 * @param project - Project to check permissions for
 * @returns true if user can edit the project
 */
export function canEditProject(
	user: IUserData | IUserMe | null,
	project: IProjectData | null
): boolean {
	if (!user || !project) return false;

	// Superuser can always edit
	if (user.is_superuser) return true;

	// Check if user is caretaker of admin (superuser)
	if ("caretaking_for" in user) {
		const isCaretakerOfAdmin = user.caretaking_for.some(
			(caretakee) => caretakee.is_superuser
		);
		if (isCaretakerOfAdmin) return true;
	}

	// Check if user is project leader (requires team_members in project)
	if ("team_members" in project && Array.isArray(project.team_members)) {
		if (isProjectLeader(user, project.team_members)) return true;

		// Check if user is caretaker of project leader
		if (isCaretakerOfProjectLeader(user, project.team_members)) return true;
	}

	// Check if user is business area leader
	if (project.business_area.leader) {
		const leader =
			typeof project.business_area.leader === "number"
				? { id: project.business_area.leader }
				: project.business_area.leader;
		if (leader.id === user.id) return true;

		// Check if user is caretaker of business area leader
		if ("caretaking_for" in user) {
			const isCaretakerOfBALeader = user.caretaking_for.some(
				(caretakee) => caretakee.id === leader.id
			);
			if (isCaretakerOfBALeader) return true;
		}
	}

	return false;
}

/**
 * Check if user can manage team
 *
 * Users can manage team if they:
 * - Have edit permissions (see canEditProject)
 * - Are an existing team member
 *
 * @param user - Current user
 * @param project - Project to check permissions for
 * @param members - Current team members
 * @returns true if user can manage the team
 */
export function canManageTeam(
	user: IUserData | IUserMe | null,
	project: IProjectData | null,
	members: IProjectMember[]
): boolean {
	if (!user || !project) return false;

	// Check if user has edit permissions
	if (canEditProject(user, project)) return true;

	// Check if user is a team member
	const isTeamMember = members.some((m) => m.user.id === user.id);

	return isTeamMember;
}

/**
 * Check if user can delete document
 *
 * Documents can be deleted if:
 * - Project lead approval has not been granted
 * - Document is a project plan with no progress reports (even if approved)
 *
 * @param user - Current user
 * @param document - Document to check
 * @param project - Associated project
 * @param hasProgressReports - Whether the project has progress reports
 * @returns true if user can delete the document
 */
export function canDeleteDocument(
	user: IUserData | IUserMe | null,
	document: IDocumentData,
	project: IProjectData,
	hasProgressReports: boolean = false
): boolean {
	if (!user) return false;

	// Can delete if no project lead approval
	if (!document.project_lead_approval_granted) {
		return canEditProject(user, project);
	}

	// Can delete project plan if no progress reports
	if (document.type === "project_plan" && !hasProgressReports) {
		return canEditProject(user, project);
	}

	return false;
}

/**
 * Check if user is at a specific approval stage
 *
 * @param user - Current user
 * @param project - Project to check
 * @param stage - Approval stage to check
 * @returns true if user is an approver at the specified stage
 */
export function isUserAtApprovalStage(
	user: IUserData | IUserMe | null,
	project: IProjectData,
	stage: "project_lead" | "business_area_lead" | "directorate"
): boolean {
	if (!user) return false;

	// Superuser can approve at any stage
	if (user.is_superuser) return true;

	switch (stage) {
		case "project_lead":
			// Check if user is project leader
			if ("team_members" in project && Array.isArray(project.team_members)) {
				return isProjectLeader(user, project.team_members);
			}
			return false;

		case "business_area_lead":
			// Check if user is business area leader
			if (project.business_area.leader) {
				const leader =
					typeof project.business_area.leader === "number"
						? { id: project.business_area.leader }
						: project.business_area.leader;
				if (leader.id === user.id) return true;
			}
			return false;

		case "directorate":
			// Check if user is directorate member (affiliation is "Directorate")
			if ("affiliation" in user && user.affiliation) {
				const affiliation = user.affiliation;
				return affiliation.slug === "directorate";
			}
			return false;

		default:
			return false;
	}
}

/**
 * Check if user is project leader
 *
 * @param user - Current user
 * @param members - Project members
 * @returns true if user is the project leader
 */
export function isProjectLeader(
	user: IUserData | IUserMe | null,
	members: IProjectMember[]
): boolean {
	if (!user) return false;

	const leaderMember = findProjectLeader(members);
	return leaderMember?.user.id === user.id;
}

/**
 * Check if user is caretaker of project leader
 *
 * @param user - Current user
 * @param members - Project members
 * @returns true if user is caretaker of the project leader
 */
export function isCaretakerOfProjectLeader(
	user: IUserData | IUserMe | null,
	members: IProjectMember[]
): boolean {
	if (!user) return false;

	// Only IUserMe has caretaking_for field
	if (!("caretaking_for" in user)) return false;

	const leaderMember = findProjectLeader(members);
	if (!leaderMember) return false;

	// Check if the project leader is in the user's caretaking_for list
	return user.caretaking_for.some(
		(caretakee) => caretakee.id === leaderMember.user.id
	);
}
