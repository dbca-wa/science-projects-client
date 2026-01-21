import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveCaretakerTask } from "../services/caretaker.endpoints";
import { toast } from "sonner";

/**
 * Hook to approve a caretaker request
 * Approves the AdminTask and creates the Caretaker object
 */
export const useApproveCaretakerTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => approveCaretakerTask(taskId),
    onSuccess: () => {
      // Invalidate all caretaker-related queries
      queryClient.invalidateQueries({ queryKey: ["caretakers"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      toast.success("Caretaker request approved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve caretaker request");
    },
  });
};
