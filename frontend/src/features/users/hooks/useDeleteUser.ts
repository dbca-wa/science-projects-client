import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "../services/user.service";
import { toast } from "sonner";
import { useNavigate } from "react-router";

/**
 * Hook for deleting a user permanently
 * Removes user from cache, invalidates user list, and navigates to user list page
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onMutate: (userId) => {
      // Show loading toast
      toast.loading("Deleting...");
      
      // Remove the specific user query from cache to prevent refetch
      queryClient.removeQueries({ queryKey: ["user", userId] });
    },
    onSuccess: () => {
      // Dismiss loading toast
      toast.dismiss();

      // Invalidate user list cache
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Show success toast
      toast.success("User Deleted");

      // Navigate to user list page
      navigate("/users");
    },
    onError: (error: Error) => {
      // Dismiss loading toast
      toast.dismiss();

      // Show error toast
      toast.error(`Update failed: ${error.message}`);
    },
  });
};
