import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";
import type { IAdminTask } from "@/shared/types/admin.types";

/**
 * Hook for checking if there is a pending merge request involving a specific user.
 *
 * Queries all pending admin tasks and finds one where:
 * - action is "mergeuser"
 * - status is "pending"
 * - the target user appears in secondary_users
 *
 * @param userId - The user ID to check for pending merge requests (null to disable)
 * @returns The pending merge task if one exists, or null
 */
export const usePendingMergeRequest = (userId: number | null) => {
	return useQuery({
		queryKey: ["adminTasks", "merge", userId],
		queryFn: async () => {
			const tasks = await apiClient.get<IAdminTask[]>("adminoptions/tasks");
			const pendingMerge = tasks.find(
				(task) =>
					task.action === "mergeuser" &&
					task.status === "pending" &&
					task.secondary_users?.some((u) => u.id === userId)
			);
			return pendingMerge ?? null;
		},
		enabled: !!userId,
		staleTime: 30_000, // 30 seconds
	});
};
