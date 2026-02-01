import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/store-context";
import { caretakerCheckKeys } from "./useCancelCaretakerRequest";
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
 * Query keys for user detail
 */
const userDetailKeys = {
  detail: (userId: number) => ["users", "detail", userId] as const,
};

/**
 * Hook for requesting to become a caretaker for another user
 * - Creates AdminTask with current user as caretaker and target user as primary_user
 * - Sets reason="other" and endDate=null (admin will configure these)
 * - Invalidates user detail query, caretaker check query, and admin tasks on success to refresh UI
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
      // Invalidate user detail query to refresh caretaker section
      queryClient.invalidateQueries({
        queryKey: userDetailKeys.detail(variables.userId),
      });

      // Invalidate current user's caretaker check to update button state
      if (authStore.user?.id) {
        queryClient.invalidateQueries({
          queryKey: caretakerCheckKeys.check(authStore.user.id),
        });
      }

      // Invalidate pending requests for the target user
      queryClient.invalidateQueries({
        queryKey: ["caretakers", "pending", variables.userId],
      });

      // Invalidate admin tasks to update dashboard
      queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });

      toast.success("Caretaker request submitted successfully. Awaiting admin approval.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to request caretaker: ${error.message}`);
    },
  });
};
