/**
 * Team API Endpoints
 *
 * Endpoint definitions for team management API calls.
 */

export const TEAM_ENDPOINTS = {
	LIST: (projectId: number) => `/projects/${projectId}/team`,
	CREATE: () => `/projects/project_members`,
	UPDATE: (projectId: number, userId: number) =>
		`/projects/project_members/${projectId}/${userId}`,
	DELETE: (projectId: number, userId: number) =>
		`/projects/project_members/${projectId}/${userId}`,
	UPDATE_POSITIONS: (projectId: number) => `/projects/${projectId}/team`,
	PROMOTE_LEADER: () => `/projects/promote`,
} as const;
