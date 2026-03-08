import { apiClient } from "@/shared/services/api/client.service";
import type { DocumentType } from "@/shared/utils/document.utils";

/**
 * PDF Operations API Service
 *
 * Handles PDF download and generation for documents.
 */

/**
 * Download PDF for a document
 */
export const downloadPdf = async (
	_documentType: DocumentType,
	documentId: number
): Promise<Blob> => {
	const url = `documents/downloadProjectDocument/${documentId}`;
	return apiClient.getBlob(url);
};

/**
 * Generate new PDF for a document
 * Returns the generated PDF as a blob for immediate download
 */
export const generatePdf = async (
	_documentType: DocumentType,
	documentId: number
): Promise<Blob> => {
	const url = `documents/generate_project_document/${documentId}`;
	return apiClient.postBlob(url, {});
};

/**
 * Helper function to trigger browser download of a blob
 */
export const triggerBlobDownload = (blob: Blob, filename: string): void => {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};
