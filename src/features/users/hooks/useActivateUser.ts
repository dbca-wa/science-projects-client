import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateUser } from "../services/user.service";
import { toast } from "sonner";

/**
 * Hook for activating a user account
 * Invalidates user detail and list caches on success
 */
export const useActivateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: number) => activateUser(userId),
		onMutate: () => {
			// Show loading toast
			toast.loading("Reactivating Account...");
		},
		onSuccess: (_data, userId) => {
			// Dismiss loading toast
			toast.dismiss();

			// Invalidate user detail cache
			queryClient.invalidateQueries({ queryKey: ["users", "detail", userId] });

			// Invalidate user list cache
			queryClient.invalidateQueries({ queryKey: ["users"] });

			// Show success toast
			toast.success("User Reactivated");
		},
		onError: (error: Error) => {
			// Dismiss loading toast
			toast.dismiss();

			// Show error toast
			toast.error(`Reactivation failed: ${error.message}`);
		},
	});
};
