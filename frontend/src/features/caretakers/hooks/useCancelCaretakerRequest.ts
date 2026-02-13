import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/store-context";
import { caretakerKeys } from "../services/caretaker.endpoints";
import { cancelCaretakerRequest } from "../services/caretaker.service";

/**
 * Hook for cancelling a pending caretaker request
 * - Updates AdminTask status to "cancelled"
 * - Invalidates all caretaker queries and admin tasks on success
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for caretaker request cancellation
 */
export const useCancelCaretakerRequest = () => {
	const queryClient = useQueryClient();
	const authStore = useAuthStore();

	return useMutation({
		mutationFn: (taskId: number) => cancelCaretakerRequest(taskId),
		onSuccess: () => {
			// Invalidate ALL caretaker queries
			queryClient.invalidateQueries({
				queryKey: caretakerKeys.all,
			});

			// Invalidate admin tasks to update dashboard
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });

			// Invalidate auth user
			queryClient.invalidateQueries({ queryKey: ["auth", "user"] });

			// Invalidate current user detail
			if (authStore.user?.id) {
				queryClient.invalidateQueries({
					queryKey: ["users", "detail", authStore.user.id],
				});
			}

			toast.success("Caretaker request cancelled successfully.");
		},
		onError: (error: Error) => {
			toast.error(`Failed to cancel caretaker request: ${error.message}`);
		},
	});
};
