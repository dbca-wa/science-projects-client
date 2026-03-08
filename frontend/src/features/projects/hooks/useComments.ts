import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getComments,
	getComment,
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
			console.log(
				`[useComments] Fetching comments for document ${documentId}...`
			);
			const result = await getComments(documentId as number);
			console.log(`[useComments] Fetched ${result.length} comments`);
			return result;
		},
		staleTime: 30_000, // 30 seconds for dynamic data
		enabled: !!documentId, // Only fetch if documentId is provided
		refetchInterval: ENABLE_COMMENT_POLLING ? 30_000 : false, // Poll every 30 seconds if enabled
	});
};

/**
 * Hook for fetching a single comment by ID
 * - Configured with 30 second stale time (dynamic data)
 * - Only enabled when commentId is provided
 * - Includes full comment details with replies
 *
 * @param commentId - Comment ID to fetch
 * @returns TanStack Query result with comment detail
 */
export const useComment = (commentId: number | undefined) => {
	return useQuery({
		queryKey: commentKeys.detail(commentId as number),
		queryFn: async () => {
			console.log(`[useComment] Fetching comment ${commentId}...`);
			const result = await getComment(commentId as number);
			console.log(`[useComment] Fetched comment ${commentId}`);
			return result;
		},
		staleTime: 30_000, // 30 seconds for dynamic data
		enabled: !!commentId, // Only fetch if commentId is provided
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
			console.log(`[useCreateComment] ========== START ==========`);
			console.log(`[useCreateComment] Comment created:`, newComment.id);
			console.log(
				`[useCreateComment] Document (full object):`,
				newComment.document
			);

			// Extract document ID from the document object
			const documentId = newComment.document.id;

			console.log(`[useCreateComment] Document ID (extracted):`, documentId);
			console.log(
				`[useCreateComment] Query key to invalidate:`,
				commentKeys.list(documentId)
			);

			// Get all queries to see what's actually cached
			const allQueries = queryClient.getQueryCache().getAll();
			console.log(
				`[useCreateComment] All cached queries:`,
				allQueries.map((q) => ({
					key: q.queryKey,
					state: q.state.status,
				}))
			);

			// First, invalidate the query using the correct document ID
			await queryClient.invalidateQueries({
				queryKey: commentKeys.list(documentId),
				exact: true,
			});

			console.log(
				`[useCreateComment] Invalidation complete, now refetching...`
			);

			// Then explicitly refetch it
			await queryClient.refetchQueries({
				queryKey: commentKeys.list(documentId),
				exact: true,
			});

			console.log(`[useCreateComment] Refetch complete`);
			console.log(`[useCreateComment] ========== END ==========`);
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
			console.log(`[useUpdateComment] ========== START ==========`);
			console.log(`[useUpdateComment] Comment updated:`, updatedComment.id);
			console.log(
				`[useUpdateComment] Document (full object):`,
				updatedComment.document
			);

			// Extract document ID from the document object
			const _documentId = updatedComment.document.id;

			console.log(`[useUpdateComment] Document ID (extracted):`, _documentId);
			console.log(
				`[useUpdateComment] Query key to invalidate:`,
				commentKeys.list(_documentId)
			);

			// Get all queries to see what's actually cached
			const allQueries = queryClient.getQueryCache().getAll();
			console.log(
				`[useUpdateComment] All cached queries:`,
				allQueries.map((q) => ({
					key: q.queryKey,
					state: q.state.status,
				}))
			);

			// First, invalidate the query using the correct document ID
			await queryClient.invalidateQueries({
				queryKey: commentKeys.list(_documentId),
				exact: true,
			});

			console.log(
				`[useUpdateComment] Invalidation complete, now refetching...`
			);

			// Then explicitly refetch it
			await queryClient.refetchQueries({
				queryKey: commentKeys.list(_documentId),
				exact: true,
			});

			console.log(`[useUpdateComment] Refetch complete`);
			console.log(`[useUpdateComment] ========== END ==========`);
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
			console.log(`[useDeleteComment] ========== START ==========`);
			console.log(`[useDeleteComment] Comment deleted:`, variables.commentId);
			console.log(`[useDeleteComment] Document ID:`, variables.documentId);
			console.log(
				`[useDeleteComment] Query key to invalidate:`,
				commentKeys.list(variables.documentId)
			);

			// Get all queries to see what's actually cached
			const allQueries = queryClient.getQueryCache().getAll();
			console.log(
				`[useDeleteComment] All cached queries:`,
				allQueries.map((q) => ({
					key: q.queryKey,
					state: q.state.status,
				}))
			);

			// Invalidate comment list for this document
			await queryClient.invalidateQueries({
				queryKey: commentKeys.list(variables.documentId),
				exact: true,
			});

			console.log(
				`[useDeleteComment] Invalidation complete, now refetching...`
			);

			// Then explicitly refetch it
			await queryClient.refetchQueries({
				queryKey: commentKeys.list(variables.documentId),
				exact: true,
			});

			console.log(`[useDeleteComment] Refetch complete`);
			console.log(`[useDeleteComment] ========== END ==========`);
			toast.success("Comment deleted successfully");
		},
		onError: (error: Error) => {
			console.error("[useDeleteComment] Failed to delete comment:", error);
			toast.error(error.message || "Failed to delete comment");
		},
	});
};
