/**
 * Comment Permission Utilities
 *
 * Utilities for checking user permissions for commenting, editing, and deleting comments.
 * Mirrors the backend permission logic in communications/utils/comment_permissions.py
 */

import type { IUserData, IUserMe } from "@/shared/types/user.types";
import type {
	IFullProjectDetails,
	IProjectMember,
} from "@/shared/types/project.types";
import type { IComment } from "@/shared/types/comment.types";

/**
 * Check if a user is a member of the project team
 *
 * @param userId - ID of the user to check
 * @param members - Array of project members
 * @returns True if user is a team member, false otherwise
 */
function isProjectTeamMember(
	userId: number,
	members: IProjectMember[] | null | undefined
): boolean {
	if (!members || members.length === 0) {
		return false;
	}

	return members.some((member) => member.user.id === userId);
}

/**
 * Check if a user can comment on a project
 *
 * Users can comment if they are:
 * - Superuser
 * - Directorate user (case-sensitive: business_area.name === "Directorate")
 * - Project team member
 * - Business area lead (user's business_area matches project's business_area)
 *
 * @param user - User to check permissions for
 * @param project - Project details
 * @returns True if user can comment, false otherwise
 */
export function canUserComment(
	user: IUserData | IUserMe | null | undefined,
	project: IFullProjectDetails | null | undefined
): boolean {
	// Null checks
	if (!user || !project) {
		return false;
	}

	// Superuser can comment on all projects
	if (user.is_superuser) {
		return true;
	}

	// Directorate user can comment on all projects (case-sensitive)
	if (user.business_area?.name === "Directorate") {
		return true;
	}

	// Project team member can comment
	if (isProjectTeamMember(user.id, project.members)) {
		return true;
	}

	// Business area lead can comment on projects in their BA
	if (
		user.business_area &&
		project.project.business_area &&
		user.business_area.id === project.project.business_area.id
	) {
		return true;
	}

	return false;
}

/**
 * Check if a user can edit a comment
 *
 * Users can edit a comment if they are:
 * - The comment author AND
 * - Have current permission to comment on the project
 *
 * @param user - User to check permissions for
 * @param comment - Comment to check edit permissions for
 * @param project - Project details
 * @returns True if user can edit the comment, false otherwise
 */
export function canUserEditComment(
	user: IUserData | IUserMe | null | undefined,
	comment: IComment | null | undefined,
	project: IFullProjectDetails | null | undefined
): boolean {
	// Null checks
	if (!user || !comment || !project) {
		return false;
	}

	// Must be the comment author
	if (comment.user.id !== user.id) {
		return false;
	}

	// Must have current permission to comment on the project
	return canUserComment(user, project);
}

/**
 * Check if a user can delete a comment
 *
 * Users can delete a comment if they are:
 * - The comment author (no permission check required)
 *
 * @param user - User to check permissions for
 * @param comment - Comment to check delete permissions for
 * @returns True if user can delete the comment, false otherwise
 */
export function canUserDeleteComment(
	user: IUserData | IUserMe | null | undefined,
	comment: IComment | null | undefined
): boolean {
	// Null checks
	if (!user || !comment) {
		return false;
	}

	// Must be the comment author
	return comment.user.id === user.id;
}
