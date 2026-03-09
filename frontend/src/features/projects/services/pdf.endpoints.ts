/**
 * PDF API Endpoints
 *
 * Endpoint definitions for PDF-related API calls.
 */

export const PDF_ENDPOINTS = {
	DOWNLOAD: (documentId: number) =>
		`documents/downloadProjectDocument/${documentId}`,
	GENERATE: (documentId: number) =>
		`documents/generate_project_document/${documentId}`,
} as const;
