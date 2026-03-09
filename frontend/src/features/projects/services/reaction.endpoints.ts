/**
 * Reaction API Endpoints
 *
 * Endpoint definitions for reaction-related API calls.
 */

export const REACTION_ENDPOINTS = {
	LIST: (commentId: number) =>
		`/communications/reactions?comment_id=${commentId}`,
	TOGGLE: () => `/communications/reactions`,
} as const;
