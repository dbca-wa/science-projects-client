/**
 * useRemoveTeamMember Mutation Hook
 *
 * TanStack Query mutation hook for removing team members from a project.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeTeamMember } from "../services/team.service";

/**
 * Remove a team member from a project
 *
 * @param projectId - The project ID
 * @returns Mutation function and state
 */
export const useRemoveTeamMember = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: (memberId: number) => removeTeamMember(projectId, memberId),
		onSuccess: () => {
			// Invalidate team query to refetch updated list
			queryClient.invalidateQueries({
				queryKey: ["projects", projectId, "team"],
			});
		},
	});
};
