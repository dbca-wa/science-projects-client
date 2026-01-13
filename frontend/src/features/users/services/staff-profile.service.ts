import { apiClient } from "@/shared/services/api/client.service";
import { STAFF_PROFILE_ENDPOINTS } from "./staff-profile.endpoints";
import type { ISimplePkProp } from "@/shared/types/generic.types";
import type {
	IStaffEducationEntry,
	IStaffEmploymentEntry,
} from "@/shared/types/staff-profile.types";
import type {
	IStaffPublicEmail,
	IUpdateCustomTitle,
	IUpdatePublicEmail,
	IUpdateStaffHeroSection,
	IUpdateStaffOverviewSection,
} from "../types/staff-profile.types";

// STAFF PROFILE ==============================================================

export const getStaffProfiles = async ({
	searchTerm,
	page,
	showHidden,
}: {
	searchTerm: string;
	page: number;
	showHidden: boolean;
}): Promise<unknown> => {
	const params = new URLSearchParams();
	if (searchTerm) params.append("searchTerm", searchTerm);
	params.append("page", page.toString());
	if (showHidden) params.append("showHidden", "true");

	return apiClient.get<unknown>(`${STAFF_PROFILE_ENDPOINTS.LIST}?${params}`);
};

export const getFullStaffProfile = async (pk: number): Promise<unknown> => {
	return apiClient.get<unknown>(STAFF_PROFILE_ENDPOINTS.DETAIL(pk));
};

export const checkUserActiveAndGetStaffProfileData = async (
	pk: number
): Promise<unknown> => {
	return apiClient.get<unknown>(
		STAFF_PROFILE_ENDPOINTS.CHECK_STAFF_PROFILE(pk)
	);
};

export const toggleStaffProfileVisibility = async ({
	staffProfilePk,
}: {
	staffProfilePk: number;
}): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		STAFF_PROFILE_ENDPOINTS.TOGGLE_VISIBILITY(staffProfilePk)
	);
};

// STAFF PROFILE SECTIONS ==============================================================

export const getPublicProfileHeroData = async (
	pk: number
): Promise<unknown> => {
	return apiClient.get<unknown>(STAFF_PROFILE_ENDPOINTS.HERO(pk));
};

export const getPublicProfileOverviewData = async (
	pk: number
): Promise<unknown> => {
	return apiClient.get<unknown>(STAFF_PROFILE_ENDPOINTS.OVERVIEW(pk));
};

export const getPublicProfileCVData = async (pk: number): Promise<unknown> => {
	return apiClient.get<unknown>(STAFF_PROFILE_ENDPOINTS.CV(pk));
};

export const updateStaffHeroSection = async ({
	pk,
	keyword_tags,
}: IUpdateStaffHeroSection): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(
		STAFF_PROFILE_ENDPOINTS.UPDATE(pk),
		{
			keyword_tags,
		}
	);
};

export const updateStaffProfileOverviewSection = async ({
	pk,
	about,
	expertise,
	keyword_tags,
}: IUpdateStaffOverviewSection): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(
		STAFF_PROFILE_ENDPOINTS.UPDATE(pk),
		{
			about,
			expertise,
			keyword_tags,
		}
	);
};

export const updateCustomTitle = async ({
	staff_profile_pk,
	custom_title,
	custom_title_on,
}: IUpdateCustomTitle): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(
		STAFF_PROFILE_ENDPOINTS.UPDATE(staff_profile_pk),
		{
			custom_title,
			custom_title_on,
		}
	);
};

export const updatePublicEmail = async ({
	staff_profile_pk,
	public_email,
}: IUpdatePublicEmail): Promise<{ success: boolean }> => {
	return apiClient.put<{ success: boolean }>(
		STAFF_PROFILE_ENDPOINTS.UPDATE(staff_profile_pk),
		{
			public_email,
		}
	);
};

// EMPLOYMENT ==============================================================

export const createEmployment = async (
	data: IStaffEmploymentEntry
): Promise<IStaffEmploymentEntry> => {
	return apiClient.post<IStaffEmploymentEntry>(
		STAFF_PROFILE_ENDPOINTS.EMPLOYMENT.LIST,
		{
			...data,
			end_year: data.end_year === "" ? null : data.end_year,
		}
	);
};

export const editEmployment = async ({
	pk,
	position_title,
	start_year,
	end_year,
	section,
	employer,
}: IStaffEmploymentEntry): Promise<IStaffEmploymentEntry> => {
	return apiClient.put<IStaffEmploymentEntry>(
		STAFF_PROFILE_ENDPOINTS.EMPLOYMENT.DETAIL(pk!),
		{
			position_title,
			start_year,
			end_year: end_year === "" ? null : end_year,
			section,
			employer,
		}
	);
};

export const deleteEmployment = async ({
	pk,
}: ISimplePkProp): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		STAFF_PROFILE_ENDPOINTS.EMPLOYMENT.DETAIL(pk)
	);
};

// EDUCATION ==============================================================

export const createEducation = async (
	data: IStaffEducationEntry
): Promise<IStaffEducationEntry> => {
	return apiClient.post<IStaffEducationEntry>(
		STAFF_PROFILE_ENDPOINTS.EDUCATION.LIST,
		data
	);
};

export const editEducation = async (
	data: IStaffEducationEntry
): Promise<IStaffEducationEntry> => {
	return apiClient.put<IStaffEducationEntry>(
		STAFF_PROFILE_ENDPOINTS.EDUCATION.DETAIL(data.pk!),
		data
	);
};

export const deleteEducation = async ({
	pk,
}: ISimplePkProp): Promise<{ success: boolean }> => {
	return apiClient.delete<{ success: boolean }>(
		STAFF_PROFILE_ENDPOINTS.EDUCATION.DETAIL(pk)
	);
};

// EMAIL ==============================================================

export const publicEmailStaffMember = async ({
	pk,
	senderEmail,
	message,
}: IStaffPublicEmail): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		STAFF_PROFILE_ENDPOINTS.PUBLIC_EMAIL(pk),
		{
			senderEmail,
			message,
		}
	);
};

export const getStaffProfileEmailList = async (): Promise<unknown> => {
	return apiClient.get<unknown>(STAFF_PROFILE_ENDPOINTS.EMAIL_LIST);
};

// RELATED DATA ==============================================================

export const getUsersProjectsForStaffProfile = async (
	pk: number
): Promise<unknown> => {
	return apiClient.get<unknown>(STAFF_PROFILE_ENDPOINTS.PROJECTS(pk));
};

export const getITAssetUser = async (pk: number): Promise<unknown> => {
	if (!pk || pk === 0) {
		return null;
	}
	return apiClient.get<unknown>(STAFF_PROFILE_ENDPOINTS.IT_ASSETS(pk));
};

export const toggleProjectVisibilityOnStaffProfile = async ({
	userPk,
	projectPk,
}: {
	userPk: number;
	projectPk: number;
}): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		STAFF_PROFILE_ENDPOINTS.TOGGLE_PROJECT_VISIBILITY(projectPk),
		{
			user_pk: userPk,
		}
	);
};
