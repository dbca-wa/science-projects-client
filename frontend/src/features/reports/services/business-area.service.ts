import { apiClient } from "@/shared/services/api/client.service";
import { BA_ENDPOINTS } from "./business-area.endpoints";
import type {
	IProblematicProjectsResponse,
	IUnapprovedDocsResponse,
} from "../types/business-area.types";
import type { IBusinessArea } from "@/shared/types/org.types";

/**
 * Fetch problematic projects for a business area
 */
export const getProblematicProjects = async (
	baId: number
): Promise<IProblematicProjectsResponse> => {
	return apiClient.get<IProblematicProjectsResponse>(
		`${BA_ENDPOINTS.PROBLEMATIC_PROJECTS}?business_area_id=${baId}`
	);
};

/**
 * Fetch unapproved documents for a business area
 */
export const getUnapprovedDocs = async (
	baId: number
): Promise<IUnapprovedDocsResponse> => {
	return apiClient.post<IUnapprovedDocsResponse>(BA_ENDPOINTS.UNAPPROVED_DOCS, {
		baArray: [baId],
	});
};

/**
 * Fetch a single business area by ID
 */
export const getBusinessAreaDetail = async (
	id: number
): Promise<IBusinessArea> => {
	return apiClient.get<IBusinessArea>(BA_ENDPOINTS.DETAIL(id));
};

/**
 * Update a business area (name, image, introduction) via FormData PUT
 */
export const updateBusinessAreaLead = async (
	id: number,
	formData: FormData
): Promise<void> => {
	await apiClient.put(BA_ENDPOINTS.DETAIL(id), formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};
