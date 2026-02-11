import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProject } from "../services/project.service";
import { toast } from "sonner";

/**
 * Hook for deleting a project
 * - Invalidates project list cache on success
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for project deletion
 */
export const useDeleteProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number | string) => deleteProject(id),
		onSuccess: () => {
			// Invalidate project list to refetch without deleted project
			queryClient.invalidateQueries({ queryKey: ["projects"] });

			// Show success toast
			toast.success("Project deleted successfully");
		},
		onError: (error: Error) => {
			// Show error toast
			toast.error(`Failed to delete project: ${error.message}`);
		},
	});
};
