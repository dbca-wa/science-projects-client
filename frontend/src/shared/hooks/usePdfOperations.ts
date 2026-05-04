import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	downloadPdf,
	generatePdf,
	openBlobInNewTab,
} from "../services/pdf.service";
import type { DocumentType } from "@/shared/utils/document.utils";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

/**
 * Hook for downloading PDF for a document
 * Opens the PDF in a new browser tab instead of downloading directly.
 */
export const useDownloadPdf = () => {
	return useMutation({
		mutationFn: async ({
			documentType,
			documentId,
		}: {
			documentType: DocumentType;
			documentId: number;
			filename?: string;
		}) => {
			const blob = await downloadPdf(documentType, documentId);
			openBlobInNewTab(blob);
			return { success: true };
		},
		onError: (error: Error) => {
			const message = extractUserFriendlyMessage(error, "Failed to open PDF");
			toast.error(message);
		},
	});
};

/**
 * Hook for generating new PDF for a document
 * Generates the PDF and opens it in a new browser tab.
 */
export const useGeneratePdf = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			documentType,
			documentId,
			projectId,
		}: {
			documentType: DocumentType;
			documentId: number;
			filename?: string;
			projectId?: number;
		}) => {
			const blob = await generatePdf(documentType, documentId);
			openBlobInNewTab(blob);
			return { success: true, projectId };
		},
		onSuccess: (_data, variables) => {
			toast.success("PDF generated successfully");
			// Invalidate project detail so document.pdf updates and download button becomes active
			if (variables.projectId) {
				queryClient.invalidateQueries({
					queryKey: ["projects", "detail", variables.projectId],
				});
			}
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
