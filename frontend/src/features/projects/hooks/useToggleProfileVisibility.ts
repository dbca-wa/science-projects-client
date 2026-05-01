import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

/**
 * Toggle project visibility on the current user's staff profile
 */
const toggleProfileVisibility = async (projectId: number): Promise<void> => {
	return apiClient.post<void>(
		`projects/${projectId}/toggle_user_profile_visibility`
	);
};

/**
 * Hook for toggling a project's visibility on the user's staff profile.
 * Invalidates project detail queries on success so the UI reflects the change.
 */
export const useToggleProfileVisibility = (projectId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => toggleProfileVisibility(projectId),
		onSuccess: async () => {
			// Invalidate project detail queries using predicate to match both string and number IDs
			await queryClient.invalidateQueries({
				predicate: (query) => {
					const [resource, type, id] = query.queryKey;
					return (
						resource === "projects" &&
						type === "detail" &&
						(id === projectId || id === String(projectId))
					);
				},
			});

			// Also invalidate the "me" query in case the user's profile data is cached
			await queryClient.invalidateQueries({ queryKey: ["me"] });
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Failed to change project visibility"
			);
			toast.error(message);
		},
	});
};
