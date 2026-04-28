import { useQuery } from "@tanstack/react-query";
import { getCaretakerCheck } from "@/shared/services/caretaker.service";
import { caretakerKeys } from "@/shared/types/caretaker.types";
import { useAuthStore } from "@/app/stores/store-context";
import { STALE_TIME } from "@/shared/constants";

/**
 * Hook for fetching current user's caretaker status.
 * Shared version — used by cross-feature consumers.
 */
export const useCaretakerCheck = () => {
	const authStore = useAuthStore();

	return useQuery({
		queryKey: caretakerKeys.check(authStore.user?.id || 0),
		queryFn: getCaretakerCheck,
		staleTime: STALE_TIME.MEDIUM,
		enabled: authStore.isAuthenticated && !!authStore.user?.id,
	});
};
