/**
 * Document API Endpoints
 *
 * Endpoint definitions for document-related API calls.
 * Maps to backend routes: documents/actions/approve, documents/actions/recall, documents/actions/send_back
 */

export const DOCUMENT_ENDPOINTS = {
	APPROVE: "documents/actions/approve",
	RECALL: "documents/actions/recall",
	SEND_BACK: "documents/actions/send_back",
	DELETE: (documentId: number) => `documents/projectdocuments/${documentId}`,

	// Bump emails
	SEND_BUMP: "documents/sendbumpemails",
	SEND_BUMP_ALL: "documents/sendbumpall",
	BUMP_PREVIEW: "documents/bumppreview",

	// Batch approve
	BATCH_APPROVE_CURRENT: "documents/batchapprovecurrent",
	BATCH_APPROVE_OLD: "documents/batchapproveold",
} as const;
