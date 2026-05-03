import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { toast } from "sonner";

/**
 * Hook for approving an admin task (merge user, delete project, etc.)
 * Invalidates admin task queries on success
 */
export const useApproveAdminTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (taskId: number) =>
			apiClient.post(`adminoptions/tasks/${taskId}/approve`),
		onSuccess: () => {
			toast.success("Task approved");
			// Invalidate all admin task queries (dashboard list + pending merge checks)
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
			queryClient.invalidateQueries({ queryKey: ["adminTasks"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to approve task: ${error.message}`);
		},
	});
};

/**
 * Hook for rejecting an admin task
 * Invalidates admin task queries on success
 */
export const useRejectAdminTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (taskId: number) =>
			apiClient.post(`adminoptions/tasks/${taskId}/reject`),
		onSuccess: () => {
			toast.success("Task rejected");
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
			queryClient.invalidateQueries({ queryKey: ["adminTasks"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to reject task: ${error.message}`);
		},
	});
};

/**
 * Hook for cancelling an admin task
 * Invalidates admin task queries on success
 */
export const useCancelAdminTask = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (taskId: number) =>
			apiClient.post(`adminoptions/tasks/${taskId}/cancel`),
		onSuccess: () => {
			toast.success("Task cancelled");
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
			queryClient.invalidateQueries({ queryKey: ["adminTasks"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
		onError: (error: Error) => {
			toast.error(`Failed to cancel task: ${error.message}`);
		},
	});
};
