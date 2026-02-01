import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectCaretakerRequest } from "../services";
import { toast } from "sonner";
import { caretakerTasksKeys } from "./useCaretakerTasks";

/**
 * Hook for rejecting caretaker requests
 * Invalidates relevant queries on success to refresh the UI
 */
export const useRejectCaretakerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => rejectCaretakerRequest(taskId),
    onSuccess: () => {
      // Invalidate admin tasks
      queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
      
      // Invalidate all caretaker-related queries
      queryClient.invalidateQueries({ queryKey: ["caretakers"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // Invalidate caretaker tasks
      queryClient.invalidateQueries({ queryKey: caretakerTasksKeys.all });
      
      toast.success("Caretaker request rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject caretaker request");
    },
  });
};
