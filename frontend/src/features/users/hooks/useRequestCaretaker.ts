import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestCaretaker, approveCaretakerTask, caretakerKeys } from "../services/caretaker.endpoints";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/useStore";
import type { RequestCaretakerPayload } from "../types/caretaker.types";

/**
 * Hook for requesting a caretaker
 * - Creates AdminTask with status "pending" for all users
 * - Returns the task ID for optional immediate approval by admins
 * - Does NOT invalidate queries automatically (caller handles this)
 * - Shows success/error toast notifications
 * 
 * @returns TanStack Query mutation for caretaker request
 */
export const useRequestCaretaker = () => {
  return useMutation({
    mutationFn: (payload: RequestCaretakerPayload) => requestCaretaker(payload),
    onSuccess: () => {
      // Show success toast
      toast.success("Caretaker request submitted successfully.");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(`Failed to request caretaker: ${error.message}`);
    },
  });
};

/**
 * Hook for approving a caretaker request (admin only)
 * - Approves the AdminTask and creates the Caretaker object
 * - Invalidates caretaker check query on success to refresh UI
 * - Shows success/error toast notifications
 * 
 * @returns TanStack Query mutation for approving caretaker request
 */
export const useApproveCaretakerTask = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: (taskId: number) => approveCaretakerTask(taskId),
    onSuccess: () => {
      // Invalidate caretaker check query to refetch updated data
      if (authStore.user?.pk) {
        queryClient.invalidateQueries({
          queryKey: caretakerKeys.check(authStore.user.pk),
        });
      }

      // Show success toast
      toast.success("Caretaker request approved successfully.");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(`Failed to approve caretaker request: ${error.message}`);
    },
  });
};