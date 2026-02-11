import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/store-context";
import { caretakerKeys } from "../services/caretaker.endpoints";
import { requestCaretaker } from "../services/caretaker.service";
import type { ICaretakerRequest } from "../types";

/**
 * Hook for requesting to become a caretaker for another user
 * - Creates AdminTask with current user as caretaker and target user as primary_user
 * - Sets reason="other" and endDate=null (admin will configure these)
 * - Invalidates all caretaker queries, user queries, and admin tasks on success
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for become caretaker request
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
			// Invalidate ALL caretaker queries to ensure fresh data everywhere
			queryClient.invalidateQueries({
				queryKey: caretakerKeys.all,
			});

			// Invalidate user detail query to refresh caretaker section
			queryClient.invalidateQueries({
				queryKey: ["users", "detail", variables.userId],
			});

			// Invalidate current user query
			if (authStore.user?.id) {
				queryClient.invalidateQueries({
					queryKey: ["users", "detail", authStore.user.id],
				});
				queryClient.invalidateQueries({
					queryKey: ["auth", "user"],
				});
			}

			// Invalidate admin tasks to update dashboard
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
