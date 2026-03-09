import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { downloadPdf, generatePdf } from "./pdf.service";
import { apiClient } from "@/shared/services/api/client.service";
import type { DocumentType } from "@/shared/utils/document.utils";

// Mock the API client
vi.mock("@/shared/services/api/client.service", () => ({
	apiClient: {
		getBlob: vi.fn(),
		postBlob: vi.fn(),
	},
}));

describe("pdf.service - Bug Condition Exploration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Property 1: Fault Condition - Correct Endpoints for Project Documents", () => {
		describe("Download Operations", () => {
			const documentTypes: DocumentType[] = [
				"concept",
				"projectplan",
				"progressreport",
				"studentreport",
				"projectclosure",
			];

			documentTypes.forEach((documentType) => {
				it(`should construct correct download URL for ${documentType}`, async () => {
					const mockBlob = new Blob(["test"], { type: "application/pdf" });
					(apiClient.getBlob as Mock).mockResolvedValue(mockBlob);

					await downloadPdf(documentType, 3216);

					// Expected: documents/downloadProjectDocument/3216
					// Current (buggy): documents/{documentType}/3216/pdf
					expect(apiClient.getBlob).toHaveBeenCalledWith(
						"documents/downloadProjectDocument/3216"
					);
				});
			});
		});

		describe("Generate Operations", () => {
			const documentTypes: DocumentType[] = [
				"concept",
				"projectplan",
				"progressreport",
				"studentreport",
				"projectclosure",
			];

			documentTypes.forEach((documentType) => {
				it(`should construct correct generate URL for ${documentType}`, async () => {
					const mockBlob = new Blob(["test"], { type: "application/pdf" });
					(apiClient.postBlob as Mock).mockResolvedValue(mockBlob);

					await generatePdf(documentType, 3216);

					// Expected: documents/generate_project_document/3216
					// Current (buggy): documents/{documentType}/3216/pdf/generate
					expect(apiClient.postBlob).toHaveBeenCalledWith(
						"documents/generate_project_document/3216",
						{}
					);
				});
			});
		});
	});
});
