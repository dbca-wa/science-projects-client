import { apiClient } from "@/shared/services/api/client.service";
import type { DocumentType } from "@/shared/utils/document.utils";
import type { DocumentAction } from "@/shared/components/documents/UnifiedDocumentActionModal";

/**
 * Document Action API Service
 *
 * Handles all document action-related API calls (submit, approve, recall, send back, reopen).
 */

export interface DocumentActionRequest {
	action: DocumentAction;
	comment?: string;
	reason?: string;
	send_email: boolean;
}

export interface DocumentActionResponse {
	success: boolean;
	message: string;
	document: {
		id: number;
		project_lead_approval_granted: boolean;
		business_area_lead_approval_granted: boolean;
		directorate_approval_granted: boolean;
	};
}

/**
 * Perform a document action (submit, approve, recall, send_back, reopen)
 */
export const performDocumentAction = async (
	documentType: DocumentType,
	documentId: number,
	data: DocumentActionRequest
): Promise<DocumentActionResponse> => {
	const url = `documents/${documentType}/${documentId}/action`;
	return apiClient.post<DocumentActionResponse>(url, data);
};

/**
 * Delete a document
 */
export const deleteDocument = async (
	// @ts-expect-error - Parameter kept for API consistency
	documentType: DocumentType, // Parameter kept for API consistency, but all types use same endpoint
	documentId: number
): Promise<{ success: boolean; message: string }> => {
	// All document types use the same endpoint: documents/projectdocuments/{id}
	const url = `documents/projectdocuments/${documentId}`;
	return apiClient.delete<{ success: boolean; message: string }>(url);
};
