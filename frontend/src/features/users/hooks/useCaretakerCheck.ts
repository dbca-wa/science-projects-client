import { useQuery } from "@tanstack/react-query";
import { getCaretakerCheck, caretakerKeys } from "../services/caretaker.endpoints";
import { useAuthStore } from "@/app/stores/useStore";

/**
 * Hook for fetching current user's caretaker status
 * - Fetches caretaker_object, caretaker_request_object, and become_caretaker_request_object
 * - Configured with 5 minute stale time for caching
 * - Only enabled when user is authenticated
 * - Automatically refetches in background when data becomes stale
 * 
 * @returns TanStack Query result with caretaker check data
 */
export const useCaretakerCheck = () => {
  const authStore = useAuthStore();

  return useQuery({
    queryKey: caretakerKeys.check(authStore.user?.pk || 0),
    queryFn: getCaretakerCheck,
    staleTime: 5 * 60_000, // 5 minutes
    enabled: authStore.isAuthenticated && !!authStore.user?.pk,
  });
};