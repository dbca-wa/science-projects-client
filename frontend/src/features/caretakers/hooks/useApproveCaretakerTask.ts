import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveCaretakerRequest } from "../services";
import { toast } from "sonner";
import { caretakerTasksKeys } from "./useCaretakerTasks";

/**
 * Hook for approving caretaker requests
 * Invalidates relevant queries on success to refresh the UI
 */
export const useApproveCaretakerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => approveCaretakerRequest(taskId),
    onSuccess: () => {
      // Invalidate admin tasks
      queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
      
      // Invalidate all caretaker-related queries
      queryClient.invalidateQueries({ queryKey: ["caretakers"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // Invalidate caretaker tasks
      queryClient.invalidateQueries({ queryKey: caretakerTasksKeys.all });
      
      toast.success("Caretaker request approved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve caretaker request");
    },
  });
};
