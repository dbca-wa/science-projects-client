import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";
import { useNavigate } from "react-router";

/**
 * Delete a project (superuser only)
 */
const deleteProject = async (projectId: number): Promise<void> => {
	return apiClient.delete<void>(`projects/${projectId}`);
};

/**
 * Hook for deleting a project (superuser only)
 */
export const useDeleteProject = () => {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: deleteProject,
		onSuccess: async (_, projectId) => {
			console.log(
				"[useDeleteProject] Mutation succeeded, invalidating queries for project:",
				projectId
			);

			// Invalidate project detail query
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

			// Invalidate projects list
			await queryClient.invalidateQueries({
				predicate: (query) => {
					const [resource, type] = query.queryKey;
					return resource === "projects" && type === "list";
				},
			});

			console.log(
				"[useDeleteProject] Query invalidation complete, navigating to projects list"
			);

			toast.success("Project deleted");
			navigate("/projects");
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Could not delete project"
			);
			toast.error(message);
		},
	});
};
