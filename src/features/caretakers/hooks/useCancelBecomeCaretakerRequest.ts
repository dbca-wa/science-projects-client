import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelCaretakerRequest } from "../services/caretaker.service";
import { caretakerKeys } from "../services/caretaker.endpoints";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/store-context";

/**
 * Hook for cancelling a "become caretaker" request
 * - Updates AdminTask status to "cancelled"
 * - Invalidates user detail query, caretaker check query, and admin tasks on success to refresh UI
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for cancelling become caretaker request
 */
export const useCancelBecomeCaretakerRequest = () => {
	const queryClient = useQueryClient();
	const authStore = useAuthStore();

	return useMutation({
		mutationFn: ({ taskId }: { taskId: number; userId: number }) =>
			cancelCaretakerRequest(taskId),
		onSuccess: (_data, variables) => {
			// Invalidate user detail query to refresh caretaker section
			queryClient.invalidateQueries({
				queryKey: ["users", "detail", variables.userId],
			});

			// Invalidate current user's caretaker check to update button state
			if (authStore.user?.id) {
				queryClient.invalidateQueries({
					queryKey: caretakerKeys.check(authStore.user.id),
				});

				// Invalidate outgoing requests for current user
				queryClient.invalidateQueries({
					queryKey: caretakerKeys.outgoing(authStore.user.id),
				});
			}

			// Invalidate pending requests for the target user
			queryClient.invalidateQueries({
				queryKey: ["caretakers", "pending", variables.userId],
			});

			// Invalidate admin tasks to update dashboard
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });

			// Show success toast
			toast.success("Caretaker request cancelled successfully.");
		},
		onError: (error: Error) => {
			// Show error toast
			toast.error(`Failed to cancel caretaker request: ${error.message}`);
		},
	});
};
