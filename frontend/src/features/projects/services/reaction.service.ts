/**
 * Reaction Service
 *
 * API service functions for comment reactions.
 */

import { apiClient } from "@/shared/services/api/client.service";
import type { IReaction, ReactionType } from "@/shared/types/comment.types";

/**
 * Get all reactions for a comment
 *
 * @param commentId - Comment ID to fetch reactions for
 * @returns Array of reactions
 */
export const getReactions = async (commentId: number): Promise<IReaction[]> => {
	try {
		return await apiClient.get<IReaction[]>(
			`/communications/reactions?comment_id=${commentId}`
		);
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch reactions",
			{ cause: error }
		);
	}
};

/**
 * Toggle reaction on a comment
 * Returns reaction if created, null if deleted
 *
 * @param commentId - Comment ID to toggle reaction on
 * @param reactionType - Type of reaction to toggle
 * @returns Reaction if created, null if deleted
 */
export const toggleReaction = async (
	commentId: number,
	reactionType: ReactionType
): Promise<IReaction | null> => {
	try {
		return await apiClient.post<IReaction | null>(`/communications/reactions`, {
			comment: commentId,
			reaction: reactionType,
		});
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to toggle reaction",
			{ cause: error }
		);
	}
};
