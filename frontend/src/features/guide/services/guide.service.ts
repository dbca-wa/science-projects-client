/**
 * Knowledge Base Service
 *
 * API functions for fetching and managing guide sections and articles.
 */
import { apiClient } from "@/shared/services/api/client.service";
import { GUIDE_ENDPOINTS } from "./guide.endpoints";
import type {
	IGuideSection,
	IGuideSectionPayload,
	IContentField,
	IContentFieldPayload,
} from "../types/guide.types";

// Fetch all active guide sections with their content fields
export const getGuideSections = async (): Promise<IGuideSection[]> => {
	return apiClient.get<IGuideSection[]>(GUIDE_ENDPOINTS.SECTIONS);
};

// Create a new guide section
export const createGuideSection = async (
	data: IGuideSectionPayload
): Promise<IGuideSection> => {
	return apiClient.post<IGuideSection>(GUIDE_ENDPOINTS.SECTIONS, data);
};

// Update an existing guide section
export const updateGuideSection = async (
	id: string,
	data: Partial<IGuideSectionPayload>
): Promise<IGuideSection> => {
	return apiClient.patch<IGuideSection>(
		GUIDE_ENDPOINTS.SECTION_DETAIL(id),
		data
	);
};

// Delete a guide section
export const deleteGuideSection = async (id: string): Promise<void> => {
	return apiClient.delete(GUIDE_ENDPOINTS.SECTION_DETAIL(id));
};

// Reorder guide sections
export const reorderGuideSections = async (
	sectionIds: string[]
): Promise<void> => {
	return apiClient.post(GUIDE_ENDPOINTS.SECTIONS_REORDER, {
		section_ids: sectionIds,
	});
};

// Reorder content fields within a section
export const reorderContentFields = async (
	sectionId: string,
	fieldIds: string[]
): Promise<void> => {
	return apiClient.post(GUIDE_ENDPOINTS.SECTION_REORDER_FIELDS(sectionId), {
		field_ids: fieldIds,
	});
};

// Create a new content field (article)
export const createContentField = async (
	data: IContentFieldPayload
): Promise<IContentField> => {
	return apiClient.post<IContentField>(GUIDE_ENDPOINTS.CONTENT_FIELDS, data);
};

// Update an existing content field
export const updateContentField = async (
	id: string,
	data: Partial<IContentFieldPayload>
): Promise<IContentField> => {
	return apiClient.patch<IContentField>(
		GUIDE_ENDPOINTS.CONTENT_FIELD_DETAIL(id),
		data
	);
};

// Delete a content field
export const deleteContentField = async (id: string): Promise<void> => {
	return apiClient.delete(GUIDE_ENDPOINTS.CONTENT_FIELD_DETAIL(id));
};
