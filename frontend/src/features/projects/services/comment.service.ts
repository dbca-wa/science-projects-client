/**
 * Comment API Service
 *
 * API service functions for comment operations including fetching comments,
 * creating comments, updating comments, and deleting comments.
 */

import { apiClient } from "@/shared/services/api/client.service";
import { COMMENT_ENDPOINTS } from "./comment.endpoints";
import type {
	IComment,
	ICommentCreate,
	ICommentUpdate,
} from "@/shared/types/comment.types";

/**
 * Get all comments for a document
 *
 * @param documentId - The document ID
 * @returns Array of comments
 */
export const getComments = async (documentId: number): Promise<IComment[]> => {
	try {
		return await apiClient.get<IComment[]>(COMMENT_ENDPOINTS.LIST(documentId));
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch comments",
			{ cause: error }
		);
	}
};

/**
 * Get a single comment by ID
 *
 * @param commentId - The comment ID
 * @returns The comment with full details including replies
 */
export const getComment = async (commentId: number): Promise<IComment> => {
	try {
		return await apiClient.get<IComment>(COMMENT_ENDPOINTS.DETAIL(commentId));
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch comment",
			{ cause: error }
		);
	}
};

/**
 * Create a new comment
 *
 * @param data - Comment creation data
 * @returns The created comment
 */
export const createComment = async (
	data: ICommentCreate
): Promise<IComment> => {
	try {
		return await apiClient.post<IComment>(COMMENT_ENDPOINTS.CREATE(), data);
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to create comment",
			{ cause: error }
		);
	}
};

/**
 * Update an existing comment
 *
 * @param commentId - The comment ID
 * @param data - Updated comment data (partial)
 * @returns The updated comment
 */
export const updateComment = async (
	commentId: number,
	data: ICommentUpdate
): Promise<IComment> => {
	try {
		return await apiClient.put<IComment>(
			COMMENT_ENDPOINTS.UPDATE(commentId),
			data
		);
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to update comment",
			{ cause: error }
		);
	}
};

/**
 * Delete a comment (soft delete)
 *
 * @param commentId - The comment ID
 * @returns void
 */
export const deleteComment = async (commentId: number): Promise<void> => {
	try {
		await apiClient.delete<void>(COMMENT_ENDPOINTS.DELETE(commentId));
	} catch (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to delete comment",
			{ cause: error }
		);
	}
};
