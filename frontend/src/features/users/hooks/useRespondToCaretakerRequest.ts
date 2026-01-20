import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

interface RespondToCaretakerRequestParams {
  taskId: number;
  action: "approve" | "reject";
}

/**
 * Respond to a caretaker request (approve or reject)
 * Allows the requested caretaker to directly approve or reject the request
 */
const respondToCaretakerRequest = async ({
  taskId,
  action,
}: RespondToCaretakerRequestParams): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `/adminoptions/tasks/${taskId}/respond`,
    { action }
  );
  return response;
};

export const useRespondToCaretakerRequest = () => {
  return useMutation({
    mutationFn: respondToCaretakerRequest,
  });
};
