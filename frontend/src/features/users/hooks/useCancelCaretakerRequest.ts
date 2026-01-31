import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelCaretakerRequest, caretakerKeys } from "../services/caretaker.endpoints";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/store-context";

/**
 * Hook for cancelling a pending caretaker request
 * - Updates AdminTask status to "cancelled"
 * - Invalidates caretaker check query and admin tasks on success to refresh UI
 * - Shows success/error toast notifications
 * 
 * @returns TanStack Query mutation for caretaker request cancellation
 */
export const useCancelCaretakerRequest = () => {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: (taskId: number) => cancelCaretakerRequest(taskId),
    onSuccess: () => {
      // Invalidate caretaker check query to refetch updated data
      if (authStore.user?.id) {
        queryClient.invalidateQueries({
          queryKey: caretakerKeys.check(authStore.user.id),
        });
      }

      // Invalidate admin tasks to update dashboard
      queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });

      // Show success toast
      toast.success("Caretaker request cancelled successfully.");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(`Failed to cancel caretaker request: ${error.message}`);
    },
  });
};