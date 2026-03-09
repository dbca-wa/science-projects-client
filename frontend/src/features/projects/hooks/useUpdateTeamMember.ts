/**
 * useUpdateTeamMember Mutation Hook
 *
 * TanStack Query mutation hook for updating existing team member details.
 * Supports partial updates (role, time_allocation, position, is_leader).
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeamMember } from "../services/team.service";
import type {
	IUpdateTeamMemberRequest,
	ITeamMember,
} from "../types/team.types";

interface UpdateTeamMemberVariables {
	userId: number;
	data: IUpdateTeamMemberRequest;
}

/**
 * Update an existing team member's details
 *
 * @param projectId - The project ID
 * @returns Mutation function and state
 */
export const useUpdateTeamMember = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation<ITeamMember, Error, UpdateTeamMemberVariables>({
		mutationFn: ({ userId, data }: UpdateTeamMemberVariables) =>
			updateTeamMember(projectId, userId, data),
		onSuccess: () => {
			// Invalidate team query to refetch updated list
			queryClient.invalidateQueries({
				queryKey: ["projects", projectId, "team"],
			});
		},
	});
};
