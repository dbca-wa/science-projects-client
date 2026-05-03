import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getComments,
	createComment,
	updateComment,
	deleteComment,
} from "../services/comment.service";
import type {
	IComment,
	ICommentCreate,
	ICommentUpdate,
} from "@/shared/types/comment.types";
import { ENABLE_COMMENT_POLLING } from "@/shared/constants/features";

/**
 * Query keys for comments
 */
export const commentKeys = {
	all: ["comments"] as const,
	lists: () => [...commentKeys.all, "list"] as const,
	list: (documentId: number) => [...commentKeys.lists(), documentId] as const,
	details: () => [...commentKeys.all, "detail"] as const,
	detail: (id: number) => [...commentKeys.details(), id] as const,
};

/**
 * Hook for fetching comments for a document
 * - Configured with 30 second stale time (dynamic data)
 * - Only enabled when documentId is provided
 * - Automatically refetches in background when data becomes stale
 * - Polling can be enabled/disabled via ENABLE_COMMENT_POLLING constant
 *
 * @param documentId - Document ID to fetch comments for
 * @returns TanStack Query result with comments array
 */
export const useComments = (documentId: number | undefined) => {
	return useQuery({
		queryKey: commentKeys.list(documentId as number),
		queryFn: async () => {
			const result = await getComments(documentId as number);
			return result;
		},
		staleTime: 30_000, // 30 seconds for dynamic data
		enabled: !!documentId, // Only fetch if documentId is provided
		refetchInterval: ENABLE_COMMENT_POLLING ? 30_000 : false, // Poll every 30 seconds if enabled
	});
};

/**
 * Hook for creating a new comment
 * - Invalidates comment list query on success
 * - Shows success/error toast notifications
 *
 * @returns Mutation hook for creating comments
 */
export const useCreateComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: ICommentCreate) => createComment(data),
		onSuccess: async (newComment: IComment) => {
			// Extract document ID from the document object
			const documentId = newComment.document.id;

			// Invalidate and refetch the comment list
			await queryClient.invalidateQueries({
				queryKey: commentKeys.list(documentId),
				exact: true,
			});

			await queryClient.refetchQueries({
				queryKey: commentKeys.list(documentId),
				exact: true,
			});

			toast.success("Comment posted successfully");
		},
		onError: (error: Error) => {
			console.error("[useCreateComment] Failed to create comment:", error);
			toast.error(error.message || "Failed to post comment");
		},
	});
};

/**
 * Hook for updating an existing comment
 * - Invalidates comment detail and list queries on success
 * - Shows success/error toast notifications
 *
 * @returns Mutation hook for updating comments
 */
export const useUpdateComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			commentId,
			data,
		}: {
			commentId: number;
			data: ICommentUpdate;
		}) => updateComment(commentId, data),
		onSuccess: async (updatedComment: IComment) => {
			// Extract document ID from the document object
			const _documentId = updatedComment.document.id;

			// Invalidate and refetch the comment list
			await queryClient.invalidateQueries({
				queryKey: commentKeys.list(_documentId),
				exact: true,
			});

			await queryClient.refetchQueries({
				queryKey: commentKeys.list(_documentId),
				exact: true,
			});

			toast.success("Comment updated successfully");
		},
		onError: (error: Error) => {
			console.error("[useUpdateComment] Failed to update comment:", error);
			toast.error(error.message || "Failed to update comment");
		},
	});
};

/**
 * Hook for deleting a comment (soft delete)
 * - Invalidates comment list query on success
 * - Shows success/error toast notifications
 *
 * @returns Mutation hook for deleting comments
 */
export const useDeleteComment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			commentId,
			documentId: _documentId,
		}: {
			commentId: number;
			documentId: number;
		}) => deleteComment(commentId),
		onSuccess: async (_data, variables) => {
			// Invalidate and refetch comment list for this document
			await queryClient.invalidateQueries({
				queryKey: commentKeys.list(variables.documentId),
				exact: true,
			});

			await queryClient.refetchQueries({
				queryKey: commentKeys.list(variables.documentId),
				exact: true,
			});

			toast.success("Comment deleted successfully");
		},
		onError: (error: Error) => {
			console.error("[useDeleteComment] Failed to delete comment:", error);
			toast.error(error.message || "Failed to delete comment");
		},
	});
};
