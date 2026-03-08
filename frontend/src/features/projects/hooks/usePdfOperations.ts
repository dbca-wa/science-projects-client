import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	downloadPdf,
	generatePdf,
	triggerBlobDownload,
} from "../services/pdf.service";
import type { DocumentType } from "@/shared/utils/document.utils";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

/**
 * Hook for downloading PDF for a document
 *
 * @param documentType - Type of document (concept_plan, project_plan, etc.)
 * @param documentId - ID of the document
 */
export const useDownloadPdf = () => {
	return useMutation({
		mutationFn: async ({
			documentType,
			documentId,
			filename,
		}: {
			documentType: DocumentType;
			documentId: number;
			filename: string;
		}) => {
			const blob = await downloadPdf(documentType, documentId);
			triggerBlobDownload(blob, filename);
			return { success: true };
		},
		onSuccess: () => {
			toast.success("PDF downloaded successfully");
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Failed to download PDF"
			);
			toast.error(message);
		},
	});
};

/**
 * Hook for generating new PDF for a document
 * Generates the PDF and automatically downloads it
 *
 * @param documentType - Type of document (concept_plan, project_plan, etc.)
 * @param documentId - ID of the document
 */
export const useGeneratePdf = () => {
	return useMutation({
		mutationFn: async ({
			documentType,
			documentId,
			filename,
		}: {
			documentType: DocumentType;
			documentId: number;
			filename: string;
		}) => {
			const blob = await generatePdf(documentType, documentId);
			triggerBlobDownload(blob, filename);
			return { success: true };
		},
		onSuccess: () => {
			toast.success("PDF generated and downloaded successfully");
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(
				error,
				"Failed to generate PDF"
			);
			toast.error(message);
		},
	});
};
