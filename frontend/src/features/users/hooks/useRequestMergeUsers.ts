import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestMergeUsers } from "../services/user.service";
import { toast } from "sonner";

/**
 * Hook for requesting to merge users
 * Creates an admin task for manual review and invalidates user list cache on success
 */
export const useRequestMergeUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      primaryUserId,
      secondaryUserIds,
    }: {
      primaryUserId: number;
      secondaryUserIds: number[];
    }) => requestMergeUsers(primaryUserId, secondaryUserIds),
    onMutate: () => {
      // Show loading toast
      toast.loading("Requesting Merge");
    },
    onSuccess: () => {
      // Dismiss loading toast
      toast.dismiss();

      // Invalidate user list cache
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Show success toast
      toast.success("Request Made");
    },
    onError: (error: Error) => {
      // Dismiss loading toast
      toast.dismiss();

      // Show error toast
      toast.error(`Could not request merge: ${error.message}`);
    },
  });
};
