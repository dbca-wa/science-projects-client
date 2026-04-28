import { apiClient } from "./api/client.service";
import type { IAdminTask } from "@/shared/types/admin.types";

/**
 * Shared admin service functions used across multiple features.
 */

const ADMIN_TASK_ENDPOINTS = {
	ADMIN_TASKS: "adminoptions/tasks",
} as const;

/**
 * Fetch pending admin tasks (filtered to status === "pending").
 */
export const getAdminTasks = async (): Promise<IAdminTask[]> => {
	const response = await apiClient.get<IAdminTask[]>(
		ADMIN_TASK_ENDPOINTS.ADMIN_TASKS
	);
	return response.filter((task) => task.status === "pending");
};
