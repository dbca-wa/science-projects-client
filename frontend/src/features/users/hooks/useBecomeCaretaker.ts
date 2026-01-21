import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestCaretaker, caretakerKeys } from "../services/caretaker.endpoints";
import { userDetailKeys } from "./useUserDetail";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/store-context";
import type { RequestCaretakerPayload } from "../types/caretaker.types";

/**
 * Hook for requesting to become a caretaker for another user
 * - Creates AdminTask with current user as caretaker and target user as primary_user
 * - Sets reason="other" and endDate=null (admin will configure these)
 * - Invalidates user detail query and caretaker check query on success to refresh UI
 * - Shows success/error toast notifications
 * 
 * @returns TanStack Query mutation for become caretaker request
 */
export const useBecomeCaretaker = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: (payload: { userId: number; caretakerId: number }) => {
      const requestPayload: RequestCaretakerPayload = {
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
          queryKey: caretakerKeys.check(authStore.user.id),
        });
      }

      // Invalidate pending requests for the target user
      queryClient.invalidateQueries({
        queryKey: ["caretakers", "pending", variables.userId],
      });

      // Show success toast
      toast.success("Caretaker request submitted successfully. Awaiting admin approval.");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(`Failed to request caretaker: ${error.message}`);
    },
  });
};
