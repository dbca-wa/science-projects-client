import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateUser } from "../services/user.service";
import { toast } from "sonner";

/**
 * Hook for deactivating a user account
 * Invalidates user detail and list caches on success
 */
export const useDeactivateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: number) => deactivateUser(userId),
		onMutate: () => {
			// Show loading toast
			toast.loading("Deactivating Account...");
		},
		onSuccess: (_data, userId) => {
			// Dismiss loading toast
			toast.dismiss();

			// Invalidate user detail cache
			queryClient.invalidateQueries({ queryKey: ["users", "detail", userId] });

			// Invalidate user list cache
			queryClient.invalidateQueries({ queryKey: ["users"] });

			// Show success toast
			toast.success("User Deactivated");
		},
		onError: (error: Error) => {
			// Dismiss loading toast
			toast.dismiss();

			// Show error toast
			toast.error(`Deactivation failed: ${error.message}`);
		},
	});
};
