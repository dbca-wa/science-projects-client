import type { IProjectMember } from "@/shared/types/project.types";

/**
 * Team Member Utilities
 *
 * Utilities for managing and displaying project team members.
 */

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
