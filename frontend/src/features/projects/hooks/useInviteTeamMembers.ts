/**
 * useInviteTeamMembers Batch Mutation Hook
 *
 * Submits multiple team member invites via Promise.allSettled.
 * Never throws — returns a result object with succeeded and failed arrays.
 * Invalidates the team query once after all invites are attempted.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteTeamMember } from "../services/team.service";
import type { IPendingInvite, IBatchInviteResult } from "../types/team.types";

/**
 * Batch invite team members to a project
 *
 * @param projectId - The project ID
 * @returns Mutation that accepts IPendingInvite[] and returns IBatchInviteResult
 */
export const useInviteTeamMembers = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation<IBatchInviteResult, Error, IPendingInvite[]>({
		mutationFn: async (invites: IPendingInvite[]) => {
			const results = await Promise.allSettled(
				invites.map((invite) =>
					inviteTeamMember(projectId, {
						user_id: invite.user.id,
						role: invite.role,
						time_allocation: invite.timeAllocation,
					})
				)
			);

			const succeeded: IPendingInvite[] = [];
			const failed: Array<{ invite: IPendingInvite; error: Error }> = [];

			results.forEach((result, index) => {
				if (result.status === "fulfilled") {
					succeeded.push(invites[index]);
				} else {
					failed.push({
						invite: invites[index],
						error:
							result.reason instanceof Error
								? result.reason
								: new Error("Unknown error"),
					});
				}
			});

			return { succeeded, failed };
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["projects", projectId, "team"],
			});
		},
	});
};
