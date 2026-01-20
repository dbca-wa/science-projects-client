import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelCaretakerRequest, caretakerKeys } from "../services/caretaker.endpoints";
import { userDetailKeys } from "./useUserDetail";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/useStore";

/**
 * Hook for cancelling a "become caretaker" request
 * - Updates AdminTask status to "cancelled"
 * - Invalidates user detail query and caretaker check query on success to refresh UI
 * - Shows success/error toast notifications
 * 
 * @returns TanStack Query mutation for cancelling become caretaker request
 */
export const useCancelBecomeCaretakerRequest = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: number; userPk: number }) => 
      cancelCaretakerRequest(taskId),
    onSuccess: (_data, variables) => {
      // Invalidate user detail query to refresh caretaker section
      queryClient.invalidateQueries({
        queryKey: userDetailKeys.detail(variables.userPk),
      });

      // Invalidate current user's caretaker check to update button state
      if (authStore.user?.pk) {
        queryClient.invalidateQueries({
          queryKey: caretakerKeys.check(authStore.user.pk),
        });
      }

      // Show success toast
      toast.success("Caretaker request cancelled successfully.");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(`Failed to cancel caretaker request: ${error.message}`);
    },
  });
};
