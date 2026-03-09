/**
 * Document API Endpoints
 *
 * Endpoint definitions for document-related API calls.
 */

import type { DocumentType } from "@/shared/utils/document.utils";

export const DOCUMENT_ENDPOINTS = {
	ACTION: (documentType: DocumentType, documentId: number) =>
		`documents/${documentType}/${documentId}/action`,
	DELETE: (documentId: number) => `documents/projectdocuments/${documentId}`,
} as const;
