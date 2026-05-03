import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

/**
 * Generate a single test PDF for the given document kind.
 */
export const useGenerateTestPDF = () => {
	return useMutation({
		mutationFn: (documentKind: string) =>
			apiClient.postBlob("documents/test-pdf", {
				document_kind: documentKind,
			}),
	});
};

/**
 * Generate all test PDFs as a compressed ZIP file.
 */
export const useGenerateAllTestPDFs = () => {
	return useMutation({
		mutationFn: () => apiClient.postBlob("documents/test-pdf-all"),
	});
};
