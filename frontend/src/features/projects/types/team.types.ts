/**
 * Team Management Type Definitions
 *
 * Type definitions for project team management functionality including
 * team members, invitations, updates, and permissions.
 */

/**
 * Team Member
 *
 * Represents a user assigned to a project with a specific role and involvement level.
 */
export interface ITeamMember {
	id: number;
	user: {
		id: number;
		display_first_name: string;
		display_last_name: string;
		avatar: string | null;
		position_title: string;
		email: string;
	};
	role: string;
	time_allocation: number;
	position: number;
	is_leader: boolean;
	short_code?: string;
	comments?: string;
	created_at: string;
	updated_at: string;
}

/**
 * Invite Team Member Request
 *
 * Payload for inviting a new team member to a project.
 */
export interface IInviteTeamMemberRequest {
	user_id: number;
	role: string;
	time_allocation: number;
	position?: number;
}

/**
 * Update Team Member Request
 *
 * Payload for updating an existing team member's details.
 * All fields are optional to support partial updates.
 */
export interface IUpdateTeamMemberRequest {
	role?: string;
	time_allocation?: number;
	position?: number;
	is_leader?: boolean;
}

/**
 * Update Team Positions Request
 *
 * Payload for batch updating team member positions (used for drag-and-drop reordering).
 */
export interface IUpdateTeamPositionsRequest {
	members: Array<{
		id: number;
		position: number;
	}>;
}

/**
 * Team Management Permissions
 *
 * Result of permission check indicating whether a user can manage the project team.
 */
export interface ITeamManagementPermissions {
	canManageTeam: boolean;
	reason?:
		| "superuser"
		| "caretaker_of_admin"
		| "project_leader"
		| "caretaker_of_project_leader"
		| "business_area_leader"
		| "caretaker_of_ba_leader"
		| "team_member";
}
