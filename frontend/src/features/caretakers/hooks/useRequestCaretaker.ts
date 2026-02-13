import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { caretakerKeys } from "../services/caretaker.endpoints";
import { requestCaretaker } from "../services/caretaker.service";
import type { ICaretakerRequest } from "../types";

/**
 * Hook for requesting a caretaker
 * - Creates AdminTask with status "pending"
 * - Invalidates all caretaker queries and admin tasks
 * - Shows success/error toast notifications
 *
 * @returns TanStack Query mutation for caretaker request
 */
export const useRequestCaretaker = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ICaretakerRequest) => requestCaretaker(payload),
		onSuccess: () => {
			// Invalidate ALL caretaker queries
			queryClient.invalidateQueries({
				queryKey: caretakerKeys.all,
			});

			// Invalidate admin tasks to show new pending request
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });

			// Invalidate auth user to update caretaker data
			queryClient.invalidateQueries({ queryKey: ["auth", "user"] });

			toast.success("Caretaker request submitted successfully.");
		},
		onError: (error: Error) => {
			toast.error(`Failed to request caretaker: ${error.message}`);
		},
	});
};
