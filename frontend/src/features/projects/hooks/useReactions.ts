import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getReactions, toggleReaction } from "../services/reaction.service";
import type { IReaction, ReactionType } from "@/shared/types/comment.types";
import { useCurrentUser } from "@/features/auth";

/**
 * Query keys for reactions
 */
export const reactionKeys = {
	all: ["reactions"] as const,
	lists: () => [...reactionKeys.all, "list"] as const,
	list: (commentId: number) =>
		[...reactionKeys.lists(), "comment", commentId] as const,
};

/**
 * Hook for fetching reactions for a comment
 * - Configured with 30 second stale time (dynamic data)
 * - Only enabled when commentId is provided
 * - Automatically refetches in background when data becomes stale
 *
 * @param commentId - Comment ID to fetch reactions for
 * @returns TanStack Query result with reactions array
 */
export const useReactions = (commentId: number | undefined) => {
	return useQuery({
		queryKey: reactionKeys.list(commentId as number),
		queryFn: async () => {
			const result = await getReactions(commentId as number);
			return result;
		},
		staleTime: 30_000, // 30 seconds for dynamic data
		enabled: !!commentId, // Only fetch if commentId is provided
	});
};

/**
 * Hook for toggling reaction on/off with optimistic updates
 * - Performs optimistic update for instant UI feedback
 * - Rolls back on error
 * - Invalidates queries on success
 *
 * @param commentId - Comment ID to toggle reaction on
 * @returns Mutation hook for toggling reactions
 */
export const useToggleReaction = (commentId: number) => {
	const queryClient = useQueryClient();
	const { data: currentUser } = useCurrentUser();

	return useMutation({
		mutationFn: (reactionType: ReactionType) =>
			toggleReaction(commentId, reactionType),

		// Optimistic update
		onMutate: async (reactionType) => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({
				queryKey: reactionKeys.list(commentId),
			});

			// Snapshot previous value
			const previousReactions = queryClient.getQueryData<IReaction[]>(
				reactionKeys.list(commentId)
			);

			// Optimistically update
			queryClient.setQueryData<IReaction[]>(
				reactionKeys.list(commentId),
				(old = []) => {
					if (!currentUser) return old;

					// Find if user already has THIS reaction type
					const existingReactionIndex = old.findIndex(
						(r) => r.user.id === currentUser.id && r.reaction === reactionType
					);

					// Find if user has ANY reaction (for one-reaction-per-user constraint)
					const userHasAnyReaction = old.some(
						(r) => r.user.id === currentUser.id
					);

					if (existingReactionIndex >= 0) {
						// Remove THIS reaction (user clicked their own reaction)
						return old.filter((_, i) => i !== existingReactionIndex);
					} else if (userHasAnyReaction) {
						// Replace existing reaction with new one (one-reaction-per-user)
						return old.map((r) =>
							r.user.id === currentUser.id
								? {
										...r,
										reaction: reactionType,
										created_at: new Date().toISOString(),
									}
								: r
						);
					} else {
						// Add new reaction (user has no reactions yet)
						return [
							...old,
							{
								id: Date.now(), // Temporary ID
								user: {
									id: currentUser.id,
									display_first_name: currentUser.display_first_name,
									display_last_name: currentUser.display_last_name,
									image: currentUser.image.file,
									email: currentUser.email || "",
								},
								reaction: reactionType,
								created_at: new Date().toISOString(),
							},
						];
					}
				}
			);

			return { previousReactions };
		},

		// Rollback on error
		onError: (error: Error, _reactionType, context) => {
			console.error(`[useToggleReaction] Error toggling reaction:`, error);
			queryClient.setQueryData(
				reactionKeys.list(commentId),
				context?.previousReactions
			);
			toast.error("Failed to update reaction");
		},

		// Refetch on success
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: reactionKeys.list(commentId),
			});
		},
	});
};
