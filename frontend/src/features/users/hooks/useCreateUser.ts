import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../services/user.service";
import { toast } from "sonner";
import type { UserCreationFormData } from "../types";
import type { IUserData } from "@/shared/types/user.types";

/**
 * Hook for creating a new user
 * - Invalidates user list cache on success
 * - Sets new user in detail cache for immediate navigation
 * - Shows success/error toast notifications
 * 
 * @returns TanStack Query mutation for user creation
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreationFormData) => createUser(data),
    onSuccess: (newUser: IUserData) => {
      // Invalidate user list to show new user
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Set the new user in cache for detail page
      queryClient.setQueryData(["users", "detail", newUser.id], newUser);

      // Show success toast
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error(`Failed to create user: ${error.message}`);
    },
  });
};
