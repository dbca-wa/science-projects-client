/**
 * Project protection utilities
 *
 * Centralised checks for whether a project is in a protected state.
 * Protected projects cannot have new documents created. Document actions
 * (approve/recall/send-back) are blocked only for fully closed projects
 * (completed/terminated), NOT for closure_requested.
 */

const PROTECTED_STATUSES = [
	"completed",
	"terminated",
	"closure_requested",
] as const;

/** Statuses where document actions are blocked and the "closed" banner shows. */
const FULLY_CLOSED_STATUSES = ["completed", "terminated"] as const;

export type ProtectedStatus = (typeof PROTECTED_STATUSES)[number];

/**
 * Determines whether a project is in a protected state for document creation.
 * No new documents can be spawned for projects in any protected status.
 * Also used for task filtering (dashboard exclusion).
 */
export const isProjectProtected = (status: string): boolean => {
	return PROTECTED_STATUSES.includes(status as ProtectedStatus);
};

/**
 * Determines whether document actions (approve/recall/send-back/bump) should
 * be disabled and the "project is closed" banner should show.
 *
 * Only fully closed projects (completed/terminated) block document actions.
 * closure_requested does NOT block actions — the backend guards handle
 * skipping status transitions without blocking the user from approving.
 */
export const areDocumentActionsBlocked = (
	projectStatus: string,
	_documentType?: string
): boolean => {
	return (FULLY_CLOSED_STATUSES as readonly string[]).includes(projectStatus);
};

export const PROTECTED_TOOLTIP =
	"This project is closed \u2014 reopen it to perform this action";
