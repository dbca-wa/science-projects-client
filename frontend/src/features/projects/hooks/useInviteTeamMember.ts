/**
 * useInviteTeamMember Mutation Hook
 *
 * TanStack Query mutation hook for inviting new team members to a project.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteTeamMember } from "../services/team.service";
import type {
	IInviteTeamMemberRequest,
	ITeamMember,
} from "../types/team.types";

/**
 * Invite a new team member to a project
 *
 * @param projectId - The project ID
 * @returns Mutation function and state
 */
export const useInviteTeamMember = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation<ITeamMember, Error, IInviteTeamMemberRequest>({
		mutationFn: (data: IInviteTeamMemberRequest) =>
			inviteTeamMember(projectId, data),
		onSuccess: () => {
			// Invalidate team query to refetch updated list
			queryClient.invalidateQueries({
				queryKey: ["projects", projectId, "team"],
			});
		},
	});
};
