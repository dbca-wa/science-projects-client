import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getPublishedReports,
	getLegacyReports,
	getLatestYear,
	getLatestReport,
	getReportDetail,
	getLatestProgressReports,
	getLatestStudentReports,
	getLatestInactiveReports,
	getLatestReportMedia,
	getReportMedia,
	approveReport,
	getReportPDFStatus,
	generateReportPDF,
	cancelReportPDFGen,
	publishReportPDF,
	getReportsWithoutPDF,
	addReportPDF,
	addLegacyPDF,
	updateReportPDF,
	updateLegacyPDF,
	deleteReportPDFFile,
	deleteLegacyPDFFile,
	toggleReportPublished,
	getReportsForDivision,
} from "../services/report.service";

/**
 * Fetch published annual report PDFs
 */
export const usePublishedReports = () =>
	useQuery({
		queryKey: ["reports", "published"],
		queryFn: getPublishedReports,
		staleTime: 5 * 60_000,
	});

/**
 * Fetch legacy annual report PDFs
 */
export const useLegacyReports = () =>
	useQuery({
		queryKey: ["reports", "legacy"],
		queryFn: getLegacyReports,
		staleTime: 5 * 60_000,
	});

/**
 * Fetch the latest reporting year
 */
export const useLatestYear = () =>
	useQuery({
		queryKey: ["reports", "latest-year"],
		queryFn: getLatestYear,
		staleTime: 5 * 60_000,
	});

/**
 * Fetch the latest annual report, optionally filtered by division slug.
 * Returns null (not an error) when no report exists for the division.
 */
export const useLatestReport = (divisionSlug?: string) =>
	useQuery({
		queryKey: ["reports", "latest", divisionSlug ?? "all"],
		queryFn: () => getLatestReport(divisionSlug),
		staleTime: 5 * 60_000,
		retry: (failureCount, error) => {
			// Don't retry on 404 — it means no report exists for this division
			if (
				error &&
				"status" in error &&
				(error as { status: number }).status === 404
			)
				return false;
			return failureCount < 3;
		},
	});

/**
 * Fetch all reports for a specific division, sorted by year descending.
 */
export const useReportsForDivision = (divisionSlug?: string) =>
	useQuery({
		queryKey: ["reports", "list", divisionSlug ?? "all"],
		queryFn: () => getReportsForDivision(divisionSlug),
		staleTime: 5 * 60_000,
	});

/**
 * Fetch a specific annual report by ID (full detail with all fields)
 */
export const useReportDetail = (reportId?: number) =>
	useQuery({
		queryKey: ["reports", "detail", reportId],
		queryFn: () => getReportDetail(reportId!),
		enabled: !!reportId,
		staleTime: 5 * 60_000,
	});

/**
 * Fetch active progress reports, optionally scoped to a specific annual report
 */
export const useLatestProgressReports = (reportId?: number) =>
	useQuery({
		queryKey: ["reports", "progress", reportId ?? "latest"],
		queryFn: () => getLatestProgressReports(reportId),
		staleTime: 5 * 60_000,
		enabled: !!reportId,
	});

/**
 * Fetch active student reports, optionally scoped to a specific annual report
 */
export const useLatestStudentReports = (reportId?: number) =>
	useQuery({
		queryKey: ["reports", "students", reportId ?? "latest"],
		queryFn: () => getLatestStudentReports(reportId),
		staleTime: 5 * 60_000,
		enabled: !!reportId,
	});

/**
 * Fetch inactive reports (both student and progress), optionally scoped to a specific annual report
 */
export const useLatestInactiveReports = (reportId?: number) =>
	useQuery({
		queryKey: ["reports", "inactive", reportId ?? "latest"],
		queryFn: () => getLatestInactiveReports(reportId),
		staleTime: 5 * 60_000,
		enabled: !!reportId,
	});

/**
 * Fetch media items for the latest annual report
 */
export const useLatestReportMedia = () =>
	useQuery({
		queryKey: ["reports", "media"],
		queryFn: getLatestReportMedia,
		staleTime: 5 * 60_000,
	});

/**
 * Fetch media items for a specific annual report by ID
 */
export const useReportMedia = (reportId?: number) =>
	useQuery({
		queryKey: ["reports", "media", reportId],
		queryFn: () => getReportMedia(reportId!),
		enabled: !!reportId,
		staleTime: 5 * 60_000,
	});

/**
 * Approve or recall a progress/student report
 */
export const useApproveReport = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: approveReport,
		onSuccess: async (_data, variables) => {
			const action = variables.isActive ? "set to pending" : "approved";
			toast.success(`Report ${action} successfully`);
			await queryClient.invalidateQueries({
				queryKey: ["reports", "inactive"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["reports", "progress"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["reports", "students"],
			});
		},
		onError: (error: Error, variables) => {
			const action = variables.isActive ? "set to pending" : "approve";
			toast.error(error.message || `Failed to ${action} report`);
		},
	});
};

/**
 * Fetch the generated PDF for a report.
 * Polls every 5 seconds while generation is in progress.
 */
export const useReportPDF = (pk: number | undefined) =>
	useQuery({
		queryKey: ["reports", "pdf", pk],
		queryFn: () => getReportPDFStatus(pk!),
		enabled: !!pk,
		staleTime: 5 * 60_000,
		gcTime: 60_000,
	});

/**
 * Start PDF generation for a report
 */
export const useGenerateReportPDF = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			pk,
			genkind,
		}: {
			pk: number;
			genkind: "all" | "approved";
		}) => generateReportPDF(pk, genkind),
		onSuccess: async (_data, variables) => {
			toast.success("PDF generation started");
			await queryClient.invalidateQueries({
				queryKey: ["reports", "pdf", variables.pk],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to start PDF generation");
		},
	});
};

/**
 * Cancel an in-progress PDF generation
 */
export const useCancelReportPDFGen = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (pk: number) => cancelReportPDFGen(pk),
		onSuccess: async (_data, pk) => {
			toast.success("PDF generation cancelled");
			await queryClient.invalidateQueries({ queryKey: ["reports", "pdf", pk] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to cancel generation");
		},
	});
};

/**
 * Publish a draft PDF — promotes draft to published
 */
export const usePublishReportPDF = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (pk: number) => publishReportPDF(pk),
		onSuccess: async (_data, pk) => {
			toast.success("PDF published successfully");
			await queryClient.invalidateQueries({ queryKey: ["reports", "pdf", pk] });
			await queryClient.invalidateQueries({
				queryKey: ["reports", "published"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to publish PDF");
		},
	});
};

/**
 * Fetch reports that don't yet have a PDF attached
 */
export const useReportsWithoutPDF = () =>
	useQuery({
		queryKey: ["reports", "without-pdf"],
		queryFn: getReportsWithoutPDF,
		staleTime: 5 * 60_000,
	});

/**
 * Upload a PDF for an existing report (Add Official)
 */
export const useAddReportPDF = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ reportId, file }: { reportId: number; file: File }) =>
			addReportPDF(reportId, file),
		onSuccess: async () => {
			toast.success("PDF added successfully");
			await queryClient.invalidateQueries({
				queryKey: ["reports", "published"],
			});
			await queryClient.invalidateQueries({
				queryKey: ["reports", "without-pdf"],
			});
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add PDF");
		},
	});
};

/**
 * Upload a legacy PDF with a year (Add Legacy)
 */
export const useAddLegacyPDF = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ year, file }: { year: number; file: File }) =>
			addLegacyPDF(year, file),
		onSuccess: async () => {
			toast.success("Legacy PDF added successfully");
			await queryClient.invalidateQueries({ queryKey: ["reports", "legacy"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add legacy PDF");
		},
	});
};

/**
 * Update (replace) a report or legacy PDF file
 */
export const useUpdateReportPDF = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			pdfId,
			file,
			isLegacy,
		}: {
			pdfId: number;
			file: File;
			isLegacy: boolean;
		}) =>
			isLegacy ? updateLegacyPDF(pdfId, file) : updateReportPDF(pdfId, file),
		onSuccess: async () => {
			toast.success("PDF updated successfully");
			await queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update PDF");
		},
	});
};

/**
 * Delete a report or legacy PDF file
 */
export const useDeleteReportPDFFile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ pdfId, isLegacy }: { pdfId: number; isLegacy: boolean }) =>
			isLegacy ? deleteLegacyPDFFile(pdfId) : deleteReportPDFFile(pdfId),
		onSuccess: async () => {
			toast.success("PDF deleted");
			await queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete PDF");
		},
	});
};

/**
 * Toggle the is_published flag on an annual report
 */
export const useToggleReportPublished = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			reportId,
			isPublished,
		}: {
			reportId: number;
			isPublished: boolean;
		}) => toggleReportPublished(reportId, isPublished),
		onSuccess: async () => {
			toast.success("Report status updated");
			await queryClient.invalidateQueries({ queryKey: ["reports"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update status");
		},
	});
};
