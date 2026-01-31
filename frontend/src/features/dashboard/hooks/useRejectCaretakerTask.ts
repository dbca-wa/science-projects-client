import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectCaretakerTask } from "@/features/users/services/caretaker.endpoints";
import { toast } from "sonner";
import { dashboardKeys } from "./useDashboardTasks";

/**
 * Hook for rejecting caretaker requests
 * Invalidates admin tasks query on success to refresh the dashboard
 */
export const useRejectCaretakerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => rejectCaretakerTask(taskId),
    onSuccess: () => {
      // Invalidate admin tasks
      queryClient.invalidateQueries({ queryKey: dashboardKeys.adminTasks });
      
      // Invalidate all caretaker-related queries
      queryClient.invalidateQueries({ queryKey: ["caretakers"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // Invalidate caretaker tasks (Documents tab) for all users
      queryClient.invalidateQueries({ queryKey: ["dashboard", "caretakerTasks"] });
      
      // Invalidate pending caretaker requests (Requests tab)
      queryClient.invalidateQueries({ queryKey: ["caretakers", "pending"] });
      
      toast.success("Caretaker request rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject caretaker request");
    },
  });
};
