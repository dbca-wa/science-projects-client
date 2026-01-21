import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectCaretakerTask } from "../services/caretaker.endpoints";
import { toast } from "sonner";

/**
 * Hook to reject a caretaker request
 * Rejects the AdminTask
 */
export const useRejectCaretakerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => rejectCaretakerTask(taskId),
    onSuccess: () => {
      // Invalidate all caretaker-related queries
      queryClient.invalidateQueries({ queryKey: ["caretakers"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      toast.success("Caretaker request rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject caretaker request");
    },
  });
};
