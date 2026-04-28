import { useQuery } from "@tanstack/react-query";
import { getAdminTasks } from "@/shared/services/admin.service";
import { STALE_TIME } from "@/shared/constants";

/**
 * Fetch pending admin tasks.
 * Shared hook — used by dashboard and caretakers features.
 */
export const useAdminTasks = (enabled = true) => {
	return useQuery({
		queryKey: ["dashboard", "adminTasks"],
		queryFn: getAdminTasks,
		staleTime: STALE_TIME.SHORT,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		enabled,
	});
};
