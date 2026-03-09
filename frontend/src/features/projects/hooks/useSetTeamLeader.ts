/**
 * useSetTeamLeader Hook
 *
 * TanStack Query mutation for promoting a team member to project leader.
 * Automatically demotes the current leader and swaps positions.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { promoteToLeader } from "../services/team.service";

export function useSetTeamLeader(projectId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: number) => promoteToLeader(projectId, userId),
		onSuccess: () => {
			// Invalidate team data to refetch
			queryClient.invalidateQueries({
				queryKey: ["projects", projectId, "team"],
			});
			queryClient.invalidateQueries({
				queryKey: ["projects", projectId],
			});
		},
	});
}
