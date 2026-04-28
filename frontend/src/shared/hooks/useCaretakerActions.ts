import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/store-context";
import { caretakerKeys } from "@/shared/types/caretaker.types";
import {
	requestCaretaker,
	cancelCaretakerRequest,
} from "@/shared/services/caretaker.service";
import type { ICaretakerRequest } from "@/shared/types/caretaker.types";

/**
 * Hook for requesting to become a caretaker for another user.
 * Creates an AdminTask with the current user as caretaker and target user as primary_user.
 * Sets reason="other" and endDate=null (admin will configure these).
 * Invalidates all caretaker queries, user queries, and admin tasks on success.
 */
export const useBecomeCaretaker = () => {
	const queryClient = useQueryClient();
	const authStore = useAuthStore();

	return useMutation({
		mutationFn: (payload: { userId: number; caretakerId: number }) => {
			const requestPayload: ICaretakerRequest = {
				user_id: payload.userId,
				caretaker_id: payload.caretakerId,
				reason: "other",
				end_date: undefined,
				notes: undefined,
			};
			return requestCaretaker(requestPayload);
		},
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: caretakerKeys.all,
			});
			queryClient.invalidateQueries({
				queryKey: ["users", "detail", variables.userId],
			});
			if (authStore.user?.id) {
				queryClient.invalidateQueries({
					queryKey: ["users", "detail", authStore.user.id],
				});
				queryClient.invalidateQueries({
					queryKey: ["auth", "user"],
				});
			}
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
			toast.success(
				"Caretaker request submitted successfully. Awaiting approval."
			);
		},
		onError: (error: Error) => {
			toast.error(`Failed to request caretaker: ${error.message}`);
		},
	});
};

/**
 * Hook for cancelling a "become caretaker" request.
 * Updates AdminTask status to "cancelled".
 * Invalidates user detail, caretaker check, and admin tasks on success.
 */
export const useCancelBecomeCaretakerRequest = () => {
	const queryClient = useQueryClient();
	const authStore = useAuthStore();

	return useMutation({
		mutationFn: ({ taskId }: { taskId: number; userId: number }) =>
			cancelCaretakerRequest(taskId),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["users", "detail", variables.userId],
			});
			if (authStore.user?.id) {
				queryClient.invalidateQueries({
					queryKey: caretakerKeys.check(authStore.user.id),
				});
				queryClient.invalidateQueries({
					queryKey: caretakerKeys.outgoing(authStore.user.id),
				});
			}
			queryClient.invalidateQueries({
				queryKey: ["caretakers", "pending", variables.userId],
			});
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
			toast.success("Caretaker request cancelled successfully.");
		},
		onError: (error: Error) => {
			toast.error(`Failed to cancel caretaker request: ${error.message}`);
		},
	});
};

// Re-export caretaker query hooks used by cross-feature consumers
export { useCaretakerCheck } from "@/shared/hooks/useCaretakerCheck";
export { usePendingCaretakerRequests } from "@/shared/hooks/usePendingCaretakerRequests";
