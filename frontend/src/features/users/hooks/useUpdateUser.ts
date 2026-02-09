import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUpdateUser } from "../services/user.service";
import { toast } from "sonner";
import type { UserEditFormData } from "../schemas/userEdit.schema";
import type { IUserData } from "@/shared/types/user.types";

/**
 * Hook for updating an existing user
 * - Invalidates user detail and list caches on success
 * - Shows success/error toast notifications
 * 
 * @returns TanStack Query mutation for user update
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserEditFormData }) =>
      adminUpdateUser(id, data),
    onSuccess: (_updatedUser: IUserData, variables) => {
      // Invalidate user detail to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["users", "detail", variables.id],
      });

      // Invalidate user list in case name/email changed
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Show success toast
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(`Failed to update user: ${error.message}`);
    },
  });
};
