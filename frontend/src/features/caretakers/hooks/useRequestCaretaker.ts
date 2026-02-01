import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { toast } from "sonner";
import type { ICaretakerRequest } from "../types";

/**
 * Request a caretaker (creates AdminTask)
 */
const requestCaretaker = async (payload: ICaretakerRequest): Promise<{ task_id: number }> => {
  const response = await apiClient.post<{ task_id: number }>(
    "/adminoptions/tasks/",
    {
      action: "setcaretaker",
      primary_user: payload.user_id,
      secondary_users: [payload.caretaker_id],
      reason: payload.reason,
      end_date: payload.end_date,
      notes: payload.notes,
    }
  );
  return response;
};

/**
 * Hook for requesting a caretaker
 * - Creates AdminTask with status "pending" for all users
 * - Returns the task ID for optional immediate approval by admins
 * - Invalidates admin tasks cache to show new pending request
 * - Shows success/error toast notifications
 * 
 * @returns TanStack Query mutation for caretaker request
 */
export const useRequestCaretaker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ICaretakerRequest) => requestCaretaker(payload),
    onSuccess: () => {
      // Invalidate admin tasks to show new pending request
      queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
      
      toast.success("Caretaker request submitted successfully.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to request caretaker: ${error.message}`);
    },
  });
};
