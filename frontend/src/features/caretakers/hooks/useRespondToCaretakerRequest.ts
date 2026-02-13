import { useMutation, useQueryClient } from "@tanstack/react-query";
import { respondToCaretakerRequest } from "../services/caretaker.service";

interface IRespondToCaretakerRequestParams {
	taskId: number;
	action: "approve" | "reject";
}

export const useRespondToCaretakerRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: IRespondToCaretakerRequestParams) =>
			respondToCaretakerRequest(params),
		onSuccess: () => {
			// Invalidate admin tasks to update dashboard
			queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
			// Invalidate caretaker-related queries
			queryClient.invalidateQueries({ queryKey: ["caretakers"] });
			queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
};
