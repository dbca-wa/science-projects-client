/**
 * Staff profile API service functions
 */

import { apiClient } from "@/shared/services/api/client.service";
import { STAFF_PROFILE_ENDPOINTS } from "./staff-profile.endpoints";
import type {
	IStaffProfileListResponse,
	IStaffProfileHeroData,
	IStaffOverviewData,
	IStaffCVData,
	IEmploymentEntry,
	IEducationEntry,
	IEmploymentEntryFormData,
	IEducationEntryFormData,
	IOverviewUpdateData,
	IStaffProfileProject,
	IPublicationResponse,
} from "../types/staff-profile.types";

// Directory listing
export const getStaffProfiles = async (params: {
	search?: string;
	page?: number;
	showHidden?: boolean;
	pageSize?: number;
}): Promise<IStaffProfileListResponse> => {
	const queryParams = new URLSearchParams();
	if (params.search) queryParams.set("searchTerm", params.search);
	if (params.page) queryParams.set("page", params.page.toString());
	if (params.showHidden) queryParams.set("showHidden", "true");
	queryParams.set("page_size", (params.pageSize ?? 24).toString());

	const url = `${STAFF_PROFILE_ENDPOINTS.LIST()}?${queryParams.toString()}`;
	return apiClient.get<IStaffProfileListResponse>(url);
};

// Profile sections
export const getStaffProfileHero = async (
	pk: number
): Promise<IStaffProfileHeroData> => {
	return apiClient.get<IStaffProfileHeroData>(STAFF_PROFILE_ENDPOINTS.HERO(pk));
};

export const getStaffProfileOverview = async (
	pk: number
): Promise<IStaffOverviewData> => {
	return apiClient.get<IStaffOverviewData>(
		STAFF_PROFILE_ENDPOINTS.OVERVIEW(pk)
	);
};

export const getStaffProfileCV = async (pk: number): Promise<IStaffCVData> => {
	return apiClient.get<IStaffCVData>(STAFF_PROFILE_ENDPOINTS.CV(pk));
};

// Projects for staff profile
export const getStaffProfileProjects = async (
	userPk: number
): Promise<IStaffProfileProject[]> => {
	return apiClient.get<IStaffProfileProject[]>(
		STAFF_PROFILE_ENDPOINTS.PROJECTS(userPk)
	);
};

// Update overview section
export const updateStaffProfileOverview = async (
	pk: number,
	data: IOverviewUpdateData
): Promise<IStaffOverviewData> => {
	return apiClient.put<IStaffOverviewData>(
		STAFF_PROFILE_ENDPOINTS.OVERVIEW(pk),
		data
	);
};

// Toggle visibility
export const toggleStaffProfileVisibility = async (
	pk: number
): Promise<{ is_hidden: boolean }> => {
	return apiClient.post<{ is_hidden: boolean }>(
		STAFF_PROFILE_ENDPOINTS.TOGGLE_VISIBILITY(pk),
		{}
	);
};

export const createEmploymentEntry = async (
	profileId: number,
	data: IEmploymentEntryFormData
): Promise<IEmploymentEntry> => {
	return apiClient.post<IEmploymentEntry>(
		STAFF_PROFILE_ENDPOINTS.EMPLOYMENT_ENTRIES(profileId),
		{ ...data, public_profile: profileId }
	);
};

export const updateEmploymentEntry = async (
	pk: number,
	data: IEmploymentEntryFormData
): Promise<IEmploymentEntry> => {
	return apiClient.put<IEmploymentEntry>(
		STAFF_PROFILE_ENDPOINTS.EMPLOYMENT_ENTRY(pk),
		data
	);
};

export const deleteEmploymentEntry = async (pk: number): Promise<void> => {
	return apiClient.delete<void>(STAFF_PROFILE_ENDPOINTS.EMPLOYMENT_ENTRY(pk));
};

export const createEducationEntry = async (
	profileId: number,
	data: IEducationEntryFormData
): Promise<IEducationEntry> => {
	return apiClient.post<IEducationEntry>(
		STAFF_PROFILE_ENDPOINTS.EDUCATION_ENTRIES(profileId),
		{ ...data, public_profile: profileId }
	);
};

export const updateEducationEntry = async (
	pk: number,
	data: IEducationEntryFormData
): Promise<IEducationEntry> => {
	return apiClient.put<IEducationEntry>(
		STAFF_PROFILE_ENDPOINTS.EDUCATION_ENTRY(pk),
		data
	);
};

export const deleteEducationEntry = async (pk: number): Promise<void> => {
	return apiClient.delete<void>(STAFF_PROFILE_ENDPOINTS.EDUCATION_ENTRY(pk));
};

// Email staff member
export const emailStaffMember = async (
	userPk: number,
	data: { senderEmail: string; message: string }
): Promise<void> => {
	return apiClient.post<void>(STAFF_PROFILE_ENDPOINTS.EMAIL_STAFF(userPk), {
		pk: userPk,
		...data,
	});
};

// Publications (external library)
export const getPublications = async (
	employeeId: string
): Promise<IPublicationResponse> => {
	return apiClient.get<IPublicationResponse>(
		STAFF_PROFILE_ENDPOINTS.PUBLICATIONS(employeeId)
	);
};
