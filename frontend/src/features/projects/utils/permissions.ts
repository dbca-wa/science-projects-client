import type { IProjectData } from "@/shared/types/project.types";
import type { IUserMe } from "@/shared/types/user.types";

/**
 * @deprecated This file contains legacy permission checks that reference fields
 * not present in the current IProjectData type. These functions are not currently
 * used in the codebase and should be refactored or removed.
 *
 * TODO: Update to use actual project structure or remove if unused
 */

/**
 * Check if user can manage a project (superuser, project leader, business area leader, directorate, or caretaker)
 * @deprecated - Uses fields not in current IProjectData type
 */
export function canManageProject(
	_user: IUserMe | null,
	_project: IProjectData
): boolean {
	// Placeholder - needs refactoring with correct types
	return false;
}

/**
 * Check if user can edit a project (management permissions + team members)
 * @deprecated - Uses fields not in current IProjectData type
 */
export function canEditProject(
	_user: IUserMe | null,
	_project: IProjectData
): boolean {
	// Placeholder - needs refactoring with correct types
	return false;
}
