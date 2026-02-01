import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/store-context";

/**
 * Cancel a pending caretaker request
 */
const cancelCaretakerRequest = async (taskId: number): Promise<void> => {
  await apiClient.patch(`/adminoptions/tasks/${taskId}/`, {
    status: "cancelled",
  });
};

/**
 * Query keys for caretaker check
 */
export const caretakerCheckKeys = {
  check: (userId: number) => ["caretakers", "check", userId] as const,
};

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
          queryKey: caretakerCheckKeys.check(authStore.user.id),
        });
      }

      // Invalidate admin tasks to update dashboard
      queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });

      toast.success("Caretaker request cancelled successfully.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel caretaker request: ${error.message}`);
    },
  });
};
