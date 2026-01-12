import { apiClient } from "@/shared/services/api/client.service";
import { ADMIN_ENDPOINTS } from "./admin.endpoints";
import type {
	IActionAdminTask,
	IAdminOptions,
	IMakeRequestToAdmins,
} from "@/shared/types/admin.types";
import type {
	ContentField,
	ContentType,
	GuideSection,
	IHTMLGuideSave,
} from "../types/admin.types";

// Admin Options
export const getMaintainer = async (): Promise<IAdminOptions> => {
	return apiClient.get<IAdminOptions>(ADMIN_ENDPOINTS.OPTIONS.MAINTAINER);
};

export const getAdminOptionsByPk = async (
	pk: number
): Promise<IAdminOptions> => {
	return apiClient.get<IAdminOptions>(ADMIN_ENDPOINTS.OPTIONS.DETAIL(pk));
};

export const updateAdminOptions = async (
	formData: IAdminOptions
): Promise<IAdminOptions> => {
	return apiClient.put<IAdminOptions>(
		ADMIN_ENDPOINTS.OPTIONS.UPDATE(formData.pk),
		formData
	);
};

// Guide Sections
export const getGuideSections = async (): Promise<GuideSection[]> => {
	return apiClient.get<GuideSection[]>(ADMIN_ENDPOINTS.GUIDE.SECTIONS);
};

export const createGuideSection = async (
	section: GuideSection
): Promise<GuideSection> => {
	return apiClient.post<GuideSection>(
		ADMIN_ENDPOINTS.GUIDE.SECTIONS,
		section
	);
};

export const updateGuideSection = async (
	section: GuideSection
): Promise<GuideSection> => {
	return apiClient.put<GuideSection>(
		ADMIN_ENDPOINTS.GUIDE.SECTION_DETAIL(section.id),
		section
	);
};

export const deleteGuideSection = async (
	sectionId: string
): Promise<boolean> => {
	await apiClient.delete(ADMIN_ENDPOINTS.GUIDE.SECTION_DETAIL(sectionId));
	return true;
};

// Content Fields
export const addContentField = async (
	sectionId: string,
	field: ContentField
): Promise<ContentField> => {
	return apiClient.post<ContentField>(ADMIN_ENDPOINTS.GUIDE.CONTENT_FIELDS, {
		...field,
		section: sectionId,
	});
};

export const updateContentField = async (
	fieldId: string,
	field: Partial<ContentField>
): Promise<ContentField> => {
	return apiClient.patch<ContentField>(
		ADMIN_ENDPOINTS.GUIDE.CONTENT_FIELD_DETAIL(fieldId),
		field
	);
};

export const deleteContentField = async (fieldId: string): Promise<boolean> => {
	await apiClient.delete(ADMIN_ENDPOINTS.GUIDE.CONTENT_FIELD_DETAIL(fieldId));
	return true;
};

export const saveGuideContentToDB = async ({
	fieldKey,
	content,
	adminOptionsPk,
}: ContentType): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		ADMIN_ENDPOINTS.OPTIONS.UPDATE_GUIDE_CONTENT(adminOptionsPk),
		{
			field_key: fieldKey,
			content: content,
		}
	);
};

export const reorderGuideSections = async (
	sectionIds: string[]
): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		ADMIN_ENDPOINTS.GUIDE.REORDER_SECTIONS,
		{
			section_ids: sectionIds,
		}
	);
};

export const reorderContentFields = async (
	sectionId: string,
	fieldIds: string[]
): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		ADMIN_ENDPOINTS.GUIDE.REORDER_FIELDS(sectionId),
		{
			field_ids: fieldIds,
		}
	);
};

export const saveGuideHtmlToDB = async ({
	htmlData,
	adminOptionsPk,
	section,
	isUpdate,
}: IHTMLGuideSave): Promise<IAdminOptions> => {
	const params = {
		[section as string]: htmlData,
	};

	const method = isUpdate ? apiClient.put : apiClient.post;
	return method<IAdminOptions>(
		ADMIN_ENDPOINTS.OPTIONS.UPDATE(adminOptionsPk!),
		params,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}
	);
};

// Admin Tasks
export const actionAdminRequestCall = async ({
	action,
	taskPk,
}: IActionAdminTask): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		ADMIN_ENDPOINTS.TASKS.ACTION(taskPk, action)
	);
};

export const requestDeleteProjectCall = async ({
	action,
	project,
	reason,
}: IMakeRequestToAdmins): Promise<{ success: boolean } | undefined> => {
	if (project !== undefined) {
		return apiClient.post<{ success: boolean }>(
			ADMIN_ENDPOINTS.TASKS.LIST,
			{
				project,
				action,
				reason,
			}
		);
	}
};

export const requestMergeUserCall = async ({
	action,
	primaryUserPk,
	secondaryUserPks,
	reason,
}: IMakeRequestToAdmins): Promise<{ success: boolean } | undefined> => {
	if (
		primaryUserPk !== undefined &&
		secondaryUserPks &&
		secondaryUserPks.length > 0
	) {
		return apiClient.post<{ success: boolean }>(
			ADMIN_ENDPOINTS.TASKS.LIST,
			{
				primary_user: primaryUserPk,
				secondary_users: secondaryUserPks,
				action,
				reason,
			}
		);
	}
};

export const cancelAdminTaskRequestCall = async ({
	taskPk,
}: {
	taskPk: number;
}): Promise<{ success: boolean }> => {
	return apiClient.post<{ success: boolean }>(
		ADMIN_ENDPOINTS.TASKS.CANCEL(taskPk)
	);
};
