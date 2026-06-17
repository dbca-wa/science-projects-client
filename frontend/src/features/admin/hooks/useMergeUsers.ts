import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mergeUsers } from "../services/merge.service";

/**
 * Mutation hook for merging user accounts.
 * Invalidates user-related queries on success.
 */
export const useMergeUsers = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: mergeUsers,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
};
