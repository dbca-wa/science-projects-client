import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

interface RequestDeleteProjectParams {
	projectId: number;
	reason: "duplicate" | "mistake" | "other";
}

/**
 * Request project deletion (non-superuser)
 * Creates an admin task via the adminoptions endpoint.
 */
const requestDeleteProject = async ({
	projectId,
	reason,
}: RequestDeleteProjectParams): Promise<void> => {
	return apiClient.post<void>("adminoptions/tasks", {
		action: "deleteproject",
		project: projectId,
		reason,
	});
};

/**
 * Hook for requesting project deletion (non-superuser)
 */
export const useRequestDeleteProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: requestDeleteProject,
		onSuccess: async (_, variables) => {
			// Invalidate project detail query
			await queryClient.invalidateQueries({
				predicate: (query) => {
					const [resource, type, id] = query.queryKey;
					return (
						resource === "projects" &&
						type === "detail" &&
						(id === variables.projectId || id === String(variables.projectId))
					);
				},
			});

			// Invalidate pending admin tasks
			await queryClient.invalidateQueries({
				queryKey: ["pendingAdminTasks"],
			});

			toast.success("Request made");
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Could not request deletion"
			);
			toast.error(message);
		},
	});
};
