/**
 * Dashboard API Service
 *
 * API service functions for dashboard data fetching including
 * document tasks, endorsement tasks, projects, and admin tasks.
 */

import { apiClient } from "@/shared/services/api/client.service";
import { DASHBOARD_ENDPOINTS } from "./dashboard.endpoints";
import type {
	DocumentTasksResponse,
	EndorsementTasksResponse,
} from "../types/dashboard.types";
import type { IProjectData } from "@/shared/types/project.types";
import type { IAdminTask } from "@/shared/types/admin.types";

export const getDocumentTasks = async (): Promise<DocumentTasksResponse> => {
	return apiClient.get<DocumentTasksResponse>(
		DASHBOARD_ENDPOINTS.DOCUMENT_TASKS
	);
};

export const getEndorsementTasks =
	async (): Promise<EndorsementTasksResponse> => {
		return apiClient.get<EndorsementTasksResponse>(
			DASHBOARD_ENDPOINTS.ENDORSEMENT_TASKS
		);
	};

export const getMyProjects = async (): Promise<IProjectData[]> => {
	return apiClient.get<IProjectData[]>(DASHBOARD_ENDPOINTS.MY_PROJECTS);
};

export const getAdminTasks = async (): Promise<IAdminTask[]> => {
	const response = await apiClient.get<IAdminTask[]>(
		DASHBOARD_ENDPOINTS.ADMIN_TASKS
	);
	return response.filter((task) => task.status === "pending");
};
