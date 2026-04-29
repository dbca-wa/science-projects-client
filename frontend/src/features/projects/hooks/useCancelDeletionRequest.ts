import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { toast } from "sonner";

/**
 * Cancel a project deletion request (admin task).
 * Invalidates project detail and pending admin tasks queries on success.
 */
export function useCancelDeletionRequest(projectId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (taskId: number) => {
			return apiClient.post(`adminoptions/tasks/${taskId}/cancel`);
		},
		onSuccess: () => {
			toast.success("Deletion request cancelled");
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
				queryClient.invalidateQueries({ queryKey: ["pendingAdminTasks"] });
			}, 350);
		},
		onError: (error: Error) => {
			console.error("Failed to cancel deletion request:", error);
			toast.error(error.message || "Could not cancel deletion request");
		},
	});
}
