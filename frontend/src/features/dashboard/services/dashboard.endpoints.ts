import { apiClient } from "@/shared/services/api/client.service";
import type {
	DocumentTasksResponse,
	EndorsementTasksResponse,
} from "../types/dashboard.types";
import type { IProjectData } from "@/shared/types/project.types";
import type { IAdminTask } from "../types/admin-tasks.types";

export const getDocumentTasks = async (): Promise<DocumentTasksResponse> => {
	return apiClient.get<DocumentTasksResponse>(
		"documents/projectdocuments/pendingmyaction"
	);
};

export const getEndorsementTasks =
	async (): Promise<EndorsementTasksResponse> => {
		return apiClient.get<EndorsementTasksResponse>(
			"documents/endorsements/pendingmyaction"
		);
	};

export const getMyProjects = async (): Promise<IProjectData[]> => {
	return apiClient.get<IProjectData[]>("projects/mine");
};

export const getAdminTasks = async (): Promise<IAdminTask[]> => {
	const response = await apiClient.get<IAdminTask[]>("adminoptions/tasks");
	console.log("🔍 [DEBUG] Raw API response from adminoptions/tasks:", response);
	console.log("🔍 [DEBUG] Response length:", response.length);
	console.log(
		"🔍 [DEBUG] Response types:",
		response.map((t) => ({ id: t.id, action: t.action, status: t.status }))
	);

	const filtered = response.filter((task) => task.status === "pending");
	console.log("🔍 [DEBUG] Filtered pending tasks:", filtered);
	console.log("🔍 [DEBUG] Filtered length:", filtered.length);

	return filtered;
};
