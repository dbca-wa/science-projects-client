import { useQuery } from "@tanstack/react-query";
import { checkEmailExists } from "../services/user.service";

/**
 * Hook for checking email uniqueness
 * - Used for form validation
 * - Configured for on-demand validation
 * - 30 second stale time to reduce API calls
 * 
 * @param email - Email address to check
 * @param currentUserId - Current user ID (for edit mode, to exclude self)
 * @returns TanStack Query result with email existence status
 */
export const useCheckEmailUnique = (
  email: string,
  currentUserId?: number
) => {
  return useQuery({
    queryKey: ["users", "email-check", email, currentUserId],
    queryFn: () => checkEmailExists(email),
    enabled: !!email && email.includes("@"), // Only check valid email format
    staleTime: 30 * 1000, // 30 seconds
  });
};
