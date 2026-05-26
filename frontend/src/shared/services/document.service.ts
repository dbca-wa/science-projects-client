import { apiClient } from "@/shared/services/api/client.service";
import { DOCUMENT_ENDPOINTS } from "./document.endpoints";
import type { DocumentType } from "@/shared/utils/document.utils";
import type { DocumentAction } from "@/shared/components/documents/UnifiedDocumentActionModal";

/**
 * Document API Service
 *
 * Handles all document-related API calls (approve, recall, send back, delete).
 * Routes each action to the correct backend endpoint with the expected payload.
 */

export interface DocumentActionRequest {
	action: DocumentAction;
	stage: number; // 1 = project_lead, 2 = business_area_lead, 3 = directorate
	documentPk: number;
	reason?: string;
	feedbackHTML?: string;
	send_email: boolean;
}

/**
 * Perform a document action (approve, recall, send_back)
 *
 * Routes to the correct backend endpoint based on the action type.
 * The backend expects { stage, documentPk, reason? } in the request body.
 */
export const performDocumentAction = async (
	_documentType: DocumentType,
	documentId: number,
	data: DocumentActionRequest
): Promise<Record<string, unknown>> => {
	const endpointMap: Record<string, string> = {
		approve: DOCUMENT_ENDPOINTS.APPROVE,
		recall: DOCUMENT_ENDPOINTS.RECALL,
		send_back: DOCUMENT_ENDPOINTS.SEND_BACK,
	};

	const endpoint = endpointMap[data.action];
	if (!endpoint) throw new Error(`Unknown action: ${data.action}`);

	return apiClient.post<Record<string, unknown>>(endpoint, {
		stage: data.stage,
		documentPk: documentId,
		reason: data.reason,
		feedbackHTML: data.feedbackHTML,
		send_email: data.send_email,
	});
};

/**
 * Delete a document
 */
export const deleteDocument = async (
	_documentType: DocumentType,
	documentId: number
): Promise<{ success: boolean; message: string }> => {
	// All document types use the same endpoint: documents/projectdocuments/{id}
	return apiClient.delete<{ success: boolean; message: string }>(
		DOCUMENT_ENDPOINTS.DELETE(documentId)
	);
};
