import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCaretaker } from "../services/caretaker.service";
import { caretakerKeys } from "../services/caretaker.endpoints";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/store-context";

/**
 * Hook for removing an active caretaker
 * - Deletes the Caretaker record
 * - Invalidates caretaker check query on success to refresh UI
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for caretaker removal
 */
export const useRemoveCaretaker = () => {
	const queryClient = useQueryClient();
	const authStore = useAuthStore();

	return useMutation({
		mutationFn: (caretakerId: number) => deleteCaretaker(caretakerId),
		onSuccess: () => {
			// Invalidate caretaker check query to refetch updated data
			if (authStore.user?.id) {
				queryClient.invalidateQueries({
					queryKey: caretakerKeys.check(authStore.user.id),
				});
			}

			// Invalidate user query to update caretaking_for list
			queryClient.invalidateQueries({
				queryKey: ["auth", "user"],
			});

			toast.success("No longer caretaking");
		},
		onError: (error: Error) => {
			toast.error(`Failed to remove caretaker: ${error.message}`);
		},
	});
};
