import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { stopCaretaking } from "../services/caretaker.endpoints";

/**
 * Hook to stop caretaking for a user
 * Invalidates current user and caretaker tasks queries
 */
export const useStopCaretaking = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (caretakeeId: number) => stopCaretaking(caretakeeId),
		onSuccess: () => {
			// Invalidate current user to refresh caretaking_for list
			queryClient.invalidateQueries({ queryKey: ["users", "me"] });
			
			// Invalidate caretaker tasks
			queryClient.invalidateQueries({ queryKey: ["dashboard", "caretakerTasks"] });
			
			// Invalidate admin tasks (in case there are pending requests)
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
			
			toast.success("Stopped caretaking successfully");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to stop caretaking");
		},
	});
};
