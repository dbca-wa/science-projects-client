import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectCaretakerRequest } from "../services/caretaker.service";
import { caretakerKeys } from "../services/caretaker.endpoints";
import { toast } from "sonner";
import { caretakerTasksKeys } from "./useCaretakerTasks";

/**
 * Hook for rejecting caretaker requests
 * Invalidates all caretaker queries on success to refresh the UI
 */
export const useRejectCaretakerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => rejectCaretakerRequest(taskId),
    onSuccess: () => {
      // Invalidate ALL caretaker queries
      queryClient.invalidateQueries({ queryKey: caretakerKeys.all });
      
      // Invalidate admin tasks
      queryClient.invalidateQueries({ queryKey: ["dashboard", "adminTasks"] });
      
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // Invalidate auth user
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      
      // Invalidate caretaker tasks
      queryClient.invalidateQueries({ queryKey: caretakerTasksKeys.all });
      
      toast.success("Caretaker request rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject caretaker request");
    },
  });
};
