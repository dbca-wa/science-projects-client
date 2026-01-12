import { apiClient } from "@/shared/services/api/client.service";
import { PROJECT_ENDPOINTS } from "./project.endpoints";
import type { IRemedyProblematicProjects } from "../types/project.types";

export const getAllProblematicProjects = async (): Promise<unknown[]> => {
	return apiClient.get<unknown[]>(PROJECT_ENDPOINTS.LIST_PROBLEMATIC);
};

export const getAllUnapprovedProjectsThisFY = async (): Promise<unknown[]> => {
	return apiClient.get<unknown[]>(PROJECT_ENDPOINTS.LIST_UNAPPROVED_FY);
};

export const remedyMemberlessProjects = async ({
	projects,
}: IRemedyProblematicProjects): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		PROJECT_ENDPOINTS.REMEDY.MEMBERLESS,
		{
			projects,
		}
	);
};

export const remedyOpenClosedProjects = async ({
	projects,
	status = "active",
}: IRemedyProblematicProjects): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		PROJECT_ENDPOINTS.REMEDY.OPEN_CLOSED,
		{
			projects: projects,
			status: status,
		}
	);
};

export const remedyLeaderlessProjects = async ({
	projects,
}: IRemedyProblematicProjects): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		PROJECT_ENDPOINTS.REMEDY.LEADERLESS,
		{
			projects: projects,
		}
	);
};

export const remedyMultipleLeaderProjects = async ({
	projects,
}: IRemedyProblematicProjects): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		PROJECT_ENDPOINTS.REMEDY.MULTIPLE_LEADERS,
		{
			projects: projects,
		}
	);
};

export const remedyExternallyLedProjects = async ({
	projects,
}: IRemedyProblematicProjects): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		PROJECT_ENDPOINTS.REMEDY.EXTERNAL_LEADERS,
		{
			projects: projects,
		}
	);
};
