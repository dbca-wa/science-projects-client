import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleAdminStatus } from "../services/user.service";
import { toast } from "sonner";

/**
 * Hook for toggling user's admin status
 * Invalidates user detail and list caches on success
 */
export const useToggleAdminStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: number) => toggleAdminStatus(userId),
		onMutate: () => {
			// Show loading toast
			toast.loading("Updating membership...");
		},
		onSuccess: (_data, userId) => {
			// Dismiss loading toast
			toast.dismiss();

			// Invalidate user detail cache
			queryClient.invalidateQueries({ queryKey: ["users", "detail", userId] });

			// Invalidate user list cache
			queryClient.invalidateQueries({ queryKey: ["users"] });

			// Show success toast
			toast.success("Information Updated");
		},
		onError: (error: Error) => {
			// Dismiss loading toast
			toast.dismiss();

			// Show error toast
			toast.error(`Update failed: ${error.message}`);
		},
	});
};
