import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { toast } from "sonner";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

/**
 * Reopen a closed project by deleting the project closure document
 */
const reopenProject = async (projectId: number): Promise<void> => {
	const url = `documents/projectclosures/reopen/${projectId}`;
	return apiClient.post<void>(url, { project: projectId });
};

/**
 * Hook for reopening a closed project
 * - Deletes the project closure document
 * - Sets project status to 'updating'
 * - Invalidates project queries on success
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for reopening a project
 */
export const useReopenProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (projectId: number) => reopenProject(projectId),
		onSuccess: (_data, projectId) => {
			// Invalidate project queries to refetch updated project
			queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
			queryClient.invalidateQueries({ queryKey: ["projects"] });

			// Show success toast
			toast.success("Project has been reopened successfully");
		},
		onError: (error: Error) => {
			// Show user-friendly error toast
			const message = extractUserFriendlyMessage(
				error,
				"Failed to reopen project"
			);
			toast.error(message);
		},
	});
};
