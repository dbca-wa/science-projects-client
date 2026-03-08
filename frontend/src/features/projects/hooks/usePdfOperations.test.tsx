import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useDownloadPdf, useGeneratePdf } from "./usePdfOperations";
import * as pdfService from "../services/pdf.service";
import { toast } from "sonner";

// Mock dependencies
vi.mock("../services/pdf.service");
vi.mock("sonner");

describe("usePdfOperations", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		vi.clearAllMocks();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};

	describe("useDownloadPdf", () => {
		describe("Rendering", () => {
			it("should return mutation object with correct properties", () => {
				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				expect(result.current).toHaveProperty("mutate");
				expect(result.current).toHaveProperty("mutateAsync");
				expect(result.current).toHaveProperty("isPending");
				expect(result.current).toHaveProperty("isSuccess");
				expect(result.current).toHaveProperty("isError");
			});
		});

		describe("Initial State", () => {
			it("should have isPending false initially", () => {
				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				expect(result.current.isPending).toBe(false);
			});

			it("should have isSuccess false initially", () => {
				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				expect(result.current.isSuccess).toBe(false);
			});

			it("should have isError false initially", () => {
				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				expect(result.current.isError).toBe(false);
			});
		});

		describe("Download Functionality", () => {
			it("should call downloadPdf service with correct parameters", async () => {
				const mockBlob = new Blob(["test"], { type: "application/pdf" });
				(pdfService.downloadPdf as Mock).mockResolvedValue(mockBlob);
				(pdfService.triggerBlobDownload as Mock).mockImplementation(() => {});

				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(pdfService.downloadPdf).toHaveBeenCalledWith("concept", 123);
				});
			});

			it("should trigger blob download with correct filename", async () => {
				const mockBlob = new Blob(["test"], { type: "application/pdf" });
				(pdfService.downloadPdf as Mock).mockResolvedValue(mockBlob);
				(pdfService.triggerBlobDownload as Mock).mockImplementation(() => {});

				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				result.current.mutate({
					documentType: "projectplan",
					documentId: 456,
					filename: "project-plan.pdf",
				});

				await waitFor(() => {
					expect(pdfService.triggerBlobDownload).toHaveBeenCalledWith(
						mockBlob,
						"project-plan.pdf"
					);
				});
			});

			it("should show success toast on successful download", async () => {
				const mockBlob = new Blob(["test"], { type: "application/pdf" });
				(pdfService.downloadPdf as Mock).mockResolvedValue(mockBlob);
				(pdfService.triggerBlobDownload as Mock).mockImplementation(() => {});

				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(toast.success).toHaveBeenCalledWith(
						"PDF downloaded successfully"
					);
				});
			});

			it("should set isSuccess to true after successful download", async () => {
				const mockBlob = new Blob(["test"], { type: "application/pdf" });
				(pdfService.downloadPdf as Mock).mockResolvedValue(mockBlob);
				(pdfService.triggerBlobDownload as Mock).mockImplementation(() => {});

				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(result.current.isSuccess).toBe(true);
				});
			});
		});

		describe("Error Handling", () => {
			it("should show error toast on download failure", async () => {
				const error = new Error("Download failed");
				(pdfService.downloadPdf as Mock).mockRejectedValue(error);

				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(toast.error).toHaveBeenCalledWith("Download failed");
				});
			});

			it("should show generic error message when error has no message", async () => {
				(pdfService.downloadPdf as Mock).mockRejectedValue(new Error());

				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(toast.error).toHaveBeenCalledWith("Failed to download PDF");
				});
			});

			it("should set isError to true on download failure", async () => {
				const error = new Error("Download failed");
				(pdfService.downloadPdf as Mock).mockRejectedValue(error);

				const { result } = renderHook(() => useDownloadPdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(result.current.isError).toBe(true);
				});
			});
		});
	});

	describe("useGeneratePdf", () => {
		describe("Rendering", () => {
			it("should return mutation object with correct properties", () => {
				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				expect(result.current).toHaveProperty("mutate");
				expect(result.current).toHaveProperty("mutateAsync");
				expect(result.current).toHaveProperty("isPending");
				expect(result.current).toHaveProperty("isSuccess");
				expect(result.current).toHaveProperty("isError");
			});
		});

		describe("Initial State", () => {
			it("should have isPending false initially", () => {
				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				expect(result.current.isPending).toBe(false);
			});

			it("should have isSuccess false initially", () => {
				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				expect(result.current.isSuccess).toBe(false);
			});

			it("should have isError false initially", () => {
				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				expect(result.current.isError).toBe(false);
			});
		});

		describe("Generate Functionality", () => {
			it("should call generatePdf service with correct parameters", async () => {
				(pdfService.generatePdf as Mock).mockResolvedValue({
					success: true,
					message: "PDF generated successfully",
				});

				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(pdfService.generatePdf).toHaveBeenCalledWith("concept", 123);
				});
			});

			it("should show success toast on successful generation", async () => {
				(pdfService.generatePdf as Mock).mockResolvedValue({
					success: true,
					message: "PDF generated successfully",
				});

				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				result.current.mutate({
					documentType: "projectplan",
					documentId: 456,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(toast.success).toHaveBeenCalledWith(
						"PDF generated successfully"
					);
				});
			});

			it("should show custom success message from response", async () => {
				(pdfService.generatePdf as Mock).mockResolvedValue({
					success: true,
					message: "Custom success message",
				});

				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(toast.success).toHaveBeenCalledWith("Custom success message");
				});
			});

			it("should show error toast when response indicates failure", async () => {
				(pdfService.generatePdf as Mock).mockResolvedValue({
					success: false,
					message: "Generation failed",
				});

				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(toast.error).toHaveBeenCalledWith("Generation failed");
				});
			});

			it("should set isSuccess to true after successful generation", async () => {
				(pdfService.generatePdf as Mock).mockResolvedValue({
					success: true,
					message: "PDF generated successfully",
				});

				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(result.current.isSuccess).toBe(true);
				});
			});
		});

		describe("Error Handling", () => {
			it("should show error toast on generation failure", async () => {
				const error = new Error("Generation failed");
				(pdfService.generatePdf as Mock).mockRejectedValue(error);

				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(toast.error).toHaveBeenCalledWith("Generation failed");
				});
			});

			it("should show generic error message when error has no message", async () => {
				(pdfService.generatePdf as Mock).mockRejectedValue(new Error());

				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(toast.error).toHaveBeenCalledWith("Failed to generate PDF");
				});
			});

			it("should set isError to true on generation failure", async () => {
				const error = new Error("Generation failed");
				(pdfService.generatePdf as Mock).mockRejectedValue(error);

				const { result } = renderHook(() => useGeneratePdf(), { wrapper });

				result.current.mutate({
					documentType: "concept",
					documentId: 123,
					filename: "test.pdf",
				});

				await waitFor(() => {
					expect(result.current.isError).toBe(true);
				});
			});
		});
	});
});
