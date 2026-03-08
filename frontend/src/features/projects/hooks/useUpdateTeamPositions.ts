/**
 * useUpdateTeamPositions Mutation Hook
 *
 * TanStack Query mutation hook for batch updating team member positions.
 * Implements optimistic updates for immediate UI feedback during drag-and-drop.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeamPositions } from "../services/team.service";
import type {
	IUpdateTeamPositionsRequest,
	ITeamMember,
} from "../types/team.types";

interface UpdatePositionsContext {
	previousTeam?: ITeamMember[];
}

/**
 * Update team member positions (batch update for drag-and-drop reordering)
 *
 * @param projectId - The project ID
 * @returns Mutation function and state with optimistic updates
 */
export const useUpdateTeamPositions = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation<
		ITeamMember[],
		Error,
		IUpdateTeamPositionsRequest,
		UpdatePositionsContext
	>({
		mutationFn: (data: IUpdateTeamPositionsRequest) =>
			updateTeamPositions(projectId, data),

		// Optimistic update for immediate UI feedback
		onMutate: async (newPositions: IUpdateTeamPositionsRequest) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: ["projects", projectId, "team"],
			});

			// Snapshot the previous value
			const previousTeam = queryClient.getQueryData<ITeamMember[]>([
				"projects",
				projectId,
				"team",
			]);

			// Optimistically update to the new value
			if (previousTeam) {
				const updatedTeam = previousTeam.map((member) => {
					const newPosition = newPositions.members.find(
						(m) => m.id === member.id
					);
					return newPosition
						? { ...member, position: newPosition.position }
						: member;
				});

				// Sort by position
				updatedTeam.sort((a, b) => a.position - b.position);

				queryClient.setQueryData<ITeamMember[]>(
					["projects", projectId, "team"],
					updatedTeam
				);
			}

			// Return context with previous value for rollback
			return { previousTeam };
		},

		// Revert optimistic update on error
		onError: (_error, _variables, context) => {
			if (context?.previousTeam) {
				queryClient.setQueryData<ITeamMember[]>(
					["projects", projectId, "team"],
					context.previousTeam
				);
			}
		},

		// Refetch after success to ensure consistency
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["projects", projectId, "team"],
			});
		},
	});
};
