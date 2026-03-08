/**
 * Team Management API Service
 *
 * API service functions for project team management operations including
 * fetching team members, inviting members, updating member details, removing
 * members, and batch updating positions.
 */

import { apiClient } from "@/shared/services/api/client.service";
import type {
	ITeamMember,
	IInviteTeamMemberRequest,
	IUpdateTeamMemberRequest,
	IUpdateTeamPositionsRequest,
} from "../types/team.types";

/**
 * Get all team members for a project
 *
 * @param projectId - The project ID
 * @returns Array of team members (never undefined)
 */
export const getProjectTeam = async (
	projectId: number
): Promise<ITeamMember[]> => {
	try {
		const result = await apiClient.get<ITeamMember[]>(
			`/projects/${projectId}/team`
		);
		// Ensure we always return an array, never undefined
		return result ?? [];
	} catch (error) {
		// Log the error but return empty array instead of throwing
		console.error(`Failed to fetch team for project ${projectId}:`, error);
		// Return empty array to prevent undefined query data
		return [];
	}
};

/**
 * Invite a new team member to a project
 *
 * @param projectId - The project ID
 * @param data - Team member invitation data
 * @returns The created team member
 */
export const inviteTeamMember = async (
	projectId: number,
	data: IInviteTeamMemberRequest
): Promise<ITeamMember> => {
	try {
		// Backend expects project and user fields (not project_id and user_id)
		const payload = {
			project: projectId,
			user: data.user_id,
			role: data.role,
			time_allocation: data.time_allocation,
			position: data.position ?? 100,
			is_leader: false,
			comments: "",
			short_code: "",
		};

		return await apiClient.post<ITeamMember>(
			`/projects/project_members`,
			payload
		);
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to invite team member",
			{ cause: error }
		);
	}
};

/**
 * Update an existing team member's details
 *
 * @param projectId - The project ID
 * @param userId - The user ID (not member ID)
 * @param data - Updated team member data (partial)
 * @returns The updated team member
 */
export const updateTeamMember = async (
	projectId: number,
	userId: number,
	data: IUpdateTeamMemberRequest
): Promise<ITeamMember> => {
	try {
		return await apiClient.put<ITeamMember>(
			`/projects/project_members/${projectId}/${userId}`,
			data
		);
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to update team member",
			{ cause: error }
		);
	}
};

/**
 * Remove a team member from a project
 *
 * @param projectId - The project ID
 * @param memberId - The team member ID (actually the user ID in the backend)
 * @returns void
 */
export const removeTeamMember = async (
	projectId: number,
	userId: number
): Promise<void> => {
	try {
		await apiClient.delete<void>(
			`/projects/project_members/${projectId}/${userId}`
		);
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to remove team member",
			{ cause: error }
		);
	}
};

/**
 * Update team member positions (batch update for drag-and-drop reordering)
 *
 * @param projectId - The project ID
 * @param data - Array of member IDs with new positions
 * @returns Array of updated team members
 */
export const updateTeamPositions = async (
	projectId: number,
	data: IUpdateTeamPositionsRequest
): Promise<ITeamMember[]> => {
	try {
		return await apiClient.put<ITeamMember[]>(
			`/projects/${projectId}/team`,
			data
		);
	} catch (error) {
		throw new Error(
			error instanceof Error
				? error.message
				: "Failed to update team positions",
			{ cause: error }
		);
	}
};

/**
 * Promote a team member to project leader
 * Automatically demotes current leader and swaps positions
 *
 * @param projectId - The project ID
 * @param userId - The user ID to promote (not member ID)
 * @returns void
 */
export const promoteToLeader = async (
	projectId: number,
	userId: number
): Promise<void> => {
	try {
		await apiClient.post<void>(`/projects/promote`, {
			project_id: projectId,
			user_id: userId,
		});
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to promote to leader",
			{ cause: error }
		);
	}
};
