/**
 * Team Management Permission Utilities
 *
 * Utilities for checking team management permissions based on user roles,
 * caretaker relationships, and project leadership.
 */

import type { IUserMe } from "@/shared/types/user.types";
import type {
	IProjectData,
	IProjectMember,
} from "@/shared/types/project.types";
import type { ITeamManagementPermissions } from "../../types/team.types";

/**
 * Check if a user has permission to manage the project team
 *
 * A user has team management permissions if they meet ANY of the following criteria:
 * 1. User is a superuser
 * 2. User is a caretaker of an admin user
 * 3. User is designated as a project leader for the project
 * 4. User is a caretaker of a project leader for the project
 * 5. User is a business area leader for the project's business area
 * 6. User is a caretaker of a business area leader for the project's business area
 * 7. User is an existing team member on the project
 *
 * @param user - The current user
 * @param project - The project
 * @param teamMembers - The current team members
 * @returns Permission result with reason
 */
export function checkTeamManagementPermissions(
	user: IUserMe,
	project: IProjectData,
	teamMembers: IProjectMember[]
): ITeamManagementPermissions {
	// 1. Superuser
	if (user.is_superuser) {
		return { canManageTeam: true, reason: "superuser" };
	}

	// 2. Caretaker of admin
	if (user.caretaking_for?.some((c) => c.is_superuser)) {
		return { canManageTeam: true, reason: "caretaker_of_admin" };
	}

	// 3. Project leader
	const isProjectLeader = teamMembers.some(
		(tm) => tm.user.id === user.id && tm.is_leader
	);
	if (isProjectLeader) {
		return { canManageTeam: true, reason: "project_leader" };
	}

	// 4. Caretaker of project leader
	const projectLeaderIds = teamMembers
		.filter((tm) => tm.is_leader)
		.map((tm) => tm.user.id);
	const isCaretakerOfLeader = user.caretaking_for?.some((c) =>
		projectLeaderIds.includes(c.id)
	);
	if (isCaretakerOfLeader) {
		return { canManageTeam: true, reason: "caretaker_of_project_leader" };
	}

	// 5. Business area leader
	const businessAreaLeaderIds =
		user.business_areas_led?.map((ba) => ba.id) || [];
	if (businessAreaLeaderIds.includes(project.business_area.id)) {
		return { canManageTeam: true, reason: "business_area_leader" };
	}

	// 6. Caretaker of business area leader
	const isCaretakerOfBaLeader = user.caretaking_for?.some((_c) => {
		// Check if the caretaking user leads the project's business area
		// Note: We need to check if any of the caretaking user's led business areas
		// match the project's business area
		return businessAreaLeaderIds.includes(project.business_area.id);
	});
	if (isCaretakerOfBaLeader) {
		return { canManageTeam: true, reason: "caretaker_of_ba_leader" };
	}

	// 7. Existing team member
	const isTeamMember = teamMembers.some((tm) => tm.user.id === user.id);
	if (isTeamMember) {
		return { canManageTeam: true, reason: "team_member" };
	}

	return { canManageTeam: false };
}
