import type { IProjectMember } from "@/shared/types/project.types";

/**
 * Team Member Utilities
 *
 * Utilities for managing and displaying project team members.
 */

/**
 * Sort team members by position in ascending order
 *
 * @param members - Array of team members to sort
 * @returns Sorted array of team members
 */
export function sortTeamMembers(members: IProjectMember[]): IProjectMember[] {
	return [...members].sort((a, b) => a.position - b.position);
}

/**
 * Reorder team members after drag and drop
 *
 * Moves a team member from one position to another and updates
 * all position values accordingly.
 *
 * @param members - Current array of team members
 * @param activeId - ID of the member being dragged
 * @param overId - ID of the member being dragged over
 * @returns New array with updated positions
 */
export function reorderTeamMembers(
	members: IProjectMember[],
	activeId: number,
	overId: number
): IProjectMember[] {
	const oldIndex = members.findIndex((m) => m.id === activeId);
	const newIndex = members.findIndex((m) => m.id === overId);

	if (oldIndex === -1 || newIndex === -1) {
		return members;
	}

	// Create a copy and move the item
	const reordered = [...members];
	const [movedItem] = reordered.splice(oldIndex, 1);
	reordered.splice(newIndex, 0, movedItem);

	// Update positions to match new order
	return reordered.map((member, index) => ({
		...member,
		position: index + 1,
	}));
}

/**
 * Get team member display label with role
 *
 * @param member - Team member to get label for
 * @returns Formatted label string
 */
export function getTeamMemberLabel(member: IProjectMember): string {
	const name = getTeamMemberName(member);
	return name ? `${name} (${member.role})` : `(${member.role})`;
}

/**
 * Get team member display name
 *
 * @param member - Team member to get name for
 * @returns Formatted name string
 */
export function getTeamMemberName(member: IProjectMember): string {
	const firstName = member.user.display_first_name || member.user.first_name;
	const lastName = member.user.display_last_name || member.user.last_name;

	return `${firstName} ${lastName}`.trim();
}

/**
 * Find the project leader in a list of members
 *
 * @param members - Array of team members
 * @returns The project leader member, or undefined if not found
 */
export function findProjectLeader(
	members: IProjectMember[]
): IProjectMember | undefined {
	return members.find((m) => m.is_leader);
}

/**
 * Check if a member is the project leader
 *
 * @param member - Team member to check
 * @returns true if the member is the project leader
 */
export function isLeader(member: IProjectMember): boolean {
	return member.is_leader;
}

/**
 * Get position updates for reordered members
 *
 * Returns an array of objects with id and new position for API updates.
 *
 * @param reorderedMembers - Array of members with new positions
 * @returns Array of position update objects
 */
export function getPositionUpdates(
	reorderedMembers: IProjectMember[]
): Array<{ id: number; position: number }> {
	return reorderedMembers.map((member) => ({
		id: member.id,
		position: member.position,
	}));
}
