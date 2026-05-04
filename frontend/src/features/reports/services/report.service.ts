import { apiClient } from "@/shared/services/api/client.service";
import { API_CONFIG } from "@/shared/services/api/config";
import { REPORT_ENDPOINTS } from "./report.endpoints";
import type {
	IAnnualReportPDF,
	IAnnualReport,
	IARProgressReport,
	IARStudentReport,
	IInactiveReportsResponse,
} from "../types/report.types";

/**
 * Fetch published annual report PDFs
 */
export const getPublishedReports = async (): Promise<IAnnualReportPDF[]> => {
	return apiClient.get<IAnnualReportPDF[]>(REPORT_ENDPOINTS.PUBLISHED_PDFS);
};

/**
 * Fetch legacy annual report PDFs
 */
export const getLegacyReports = async (): Promise<IAnnualReportPDF[]> => {
	return apiClient.get<IAnnualReportPDF[]>(REPORT_ENDPOINTS.LEGACY_PDFS);
};

/**
 * Response shape from the combined all-pdfs endpoint.
 * Each array is pre-categorised by the backend — no frontend merging needed.
 */
export interface AllReportPDFsResponse {
	published: IAnnualReportPDF[];
	drafts: IAnnualReportPDF[];
	legacy: IAnnualReportPDF[];
}

/**
 * Fetch all report PDFs in a single call, pre-categorised into
 * published, drafts, and legacy arrays.
 */
export const getAllReportPDFs = async (): Promise<AllReportPDFsResponse> => {
	return apiClient.get<AllReportPDFsResponse>(REPORT_ENDPOINTS.ALL_REPORT_PDFS);
};

/**
 * Fetch the full latest annual report, optionally filtered by division slug
 */
export const getLatestReport = async (
	divisionSlug?: string
): Promise<IAnnualReport> => {
	const endpoint = divisionSlug
		? `${REPORT_ENDPOINTS.LATEST_REPORT}?division=${divisionSlug}`
		: REPORT_ENDPOINTS.LATEST_REPORT;
	return apiClient.get<IAnnualReport>(endpoint);
};

/**
 * Fetch a specific annual report by ID
 */
export const getReportDetail = async (id: number): Promise<IAnnualReport> => {
	return apiClient.get<IAnnualReport>(REPORT_ENDPOINTS.REPORT_DETAIL(id));
};

/**
 * Fetch business areas where the current user is the leader.
 * Re-exported from shared for backward compatibility.
 */
export { getMyBusinessAreas } from "@/shared/services/org.service";

/**
 * Fetch active progress reports, optionally scoped to a specific annual report
 */
export const getLatestProgressReports = async (
	reportId?: number
): Promise<IARProgressReport[]> => {
	const endpoint = reportId
		? `${REPORT_ENDPOINTS.LATEST_PROGRESS_REPORTS}?report_id=${reportId}`
		: REPORT_ENDPOINTS.LATEST_PROGRESS_REPORTS;
	return apiClient.get<IARProgressReport[]>(endpoint);
};

/**
 * Fetch active student reports, optionally scoped to a specific annual report
 */
export const getLatestStudentReports = async (
	reportId?: number
): Promise<IARStudentReport[]> => {
	const endpoint = reportId
		? `${REPORT_ENDPOINTS.LATEST_STUDENT_REPORTS}?report_id=${reportId}`
		: REPORT_ENDPOINTS.LATEST_STUDENT_REPORTS;
	return apiClient.get<IARStudentReport[]>(endpoint);
};

/**
 * Fetch inactive reports (both student and progress), optionally scoped to a specific annual report
 */
export const getLatestInactiveReports = async (
	reportId?: number
): Promise<IInactiveReportsResponse> => {
	const endpoint = reportId
		? `${REPORT_ENDPOINTS.LATEST_INACTIVE_REPORTS}?report_id=${reportId}`
		: REPORT_ENDPOINTS.LATEST_INACTIVE_REPORTS;
	return apiClient.get<IInactiveReportsResponse>(endpoint);
};

/**
 * Update a single field on an annual report via partial PUT.
 * Re-exported from shared for backward compatibility.
 */
export { updateAnnualReportField } from "@/shared/services/content-update.service";

/** Report media item returned by the API */
export interface IReportMedia {
	id: number;
	kind: string;
	file: string;
	report: { id: number } | number;
}

/**
 * Fetch media items for a specific annual report by ID
 */
export const getReportMedia = async (
	reportId: number
): Promise<IReportMedia[]> => {
	return apiClient.get<IReportMedia[]>(
		REPORT_ENDPOINTS.REPORT_MEDIA_UPLOAD(reportId)
	);
};

/**
 * Upload a media image for a report section
 */
export const uploadReportMedia = async (
	reportPk: number,
	section: string,
	file: File
): Promise<void> => {
	const formData = new FormData();
	formData.append("section", section);
	formData.append("file", file);
	await apiClient.post(
		REPORT_ENDPOINTS.REPORT_MEDIA_UPLOAD(reportPk),
		formData,
		{
			headers: { "Content-Type": "multipart/form-data" },
		}
	);
};

/**
 * Delete a media image for a report section
 */
export const deleteReportMedia = async (
	reportPk: number,
	section: string
): Promise<void> => {
	await apiClient.delete(
		REPORT_ENDPOINTS.REPORT_MEDIA_DELETE(reportPk, section)
	);
};

/** Lightweight PDF status (no base64 data) */
export interface IReportPDFStatus {
	has_draft: boolean;
	has_published: boolean;
	draft_file: string | null;
	published_file: string | null;
	report: {
		id: number;
		pdf_generation_in_progress: boolean;
	};
}

/**
 * Fetch lightweight PDF status — no base64 data, just metadata
 */
export const getReportPDFStatus = async (
	pk: number
): Promise<IReportPDFStatus> => {
	return apiClient.get<IReportPDFStatus>(
		REPORT_ENDPOINTS.REPORT_PDF_STATUS(pk)
	);
};

/**
 * Trigger PDF generation for a report
 */
export const generateReportPDF = async (
	pk: number,
	genkind: "all" | "approved" = "all"
): Promise<void> => {
	await apiClient.post(REPORT_ENDPOINTS.GENERATE_PDF(pk), { genkind });
};

/**
 * Cancel an in-progress PDF generation
 */
export const cancelReportPDFGen = async (pk: number): Promise<void> => {
	await apiClient.post(REPORT_ENDPOINTS.CANCEL_PDF_GEN(pk));
};

/** Payload for approving/recalling a progress or student report */
export interface IApproveReportPayload {
	kind: "studentreport" | "progressreport";
	reportPk: number;
	documentPk: number;
	isActive: boolean;
}

/**
 * Approve or recall a progress/student report via final approval endpoint
 */
export const approveReport = async (
	payload: IApproveReportPayload
): Promise<void> => {
	await apiClient.post(REPORT_ENDPOINTS.FINAL_APPROVAL, payload);
};

/**
 * Construct the full SSE URL for the generation progress stream.
 * Uses the same base URL as the API client to ensure cookies are sent.
 */
/**
 * Construct the full SSE URL for the generation progress stream.
 * Uses the same base URL as the API client to ensure cookies are sent.
 */
export const getSSEUrl = (pk: number): string => {
	const base = API_CONFIG.BASE_URL.replace(/\/+$/, "");
	return `${base}/${REPORT_ENDPOINTS.GENERATION_PROGRESS(pk)}`;
};

/**
 * Publish a draft PDF — promotes draft_file to published_file
 */
export const publishReportPDF = async (pk: number): Promise<void> => {
	await apiClient.post(REPORT_ENDPOINTS.PUBLISH_PDF(pk));
};

/** Fetch reports that don't have a PDF yet (for the Add Official dropdown) */
export const getReportsWithoutPDF = async (): Promise<IAnnualReport[]> => {
	return apiClient.get<IAnnualReport[]>(REPORT_ENDPOINTS.REPORTS_WITHOUT_PDF);
};

/** Upload a PDF file for an existing report (Add Official — saves to published_file) */
export const addReportPDF = async (
	reportId: number,
	file: File
): Promise<void> => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("report", reportId.toString());
	await apiClient.post(REPORT_ENDPOINTS.ADD_REPORT_PDF, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

/** Upload a legacy PDF with a year (Add Legacy) */
export const addLegacyPDF = async (year: number, file: File): Promise<void> => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("year", year.toString());
	await apiClient.post(REPORT_ENDPOINTS.ADD_LEGACY_PDF, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

/** Update (replace) a report PDF file */
export const updateReportPDF = async (
	pdfId: number,
	file: File
): Promise<void> => {
	const formData = new FormData();
	formData.append("file", file);
	await apiClient.put(REPORT_ENDPOINTS.UPDATE_REPORT_PDF(pdfId), formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

/** Update (replace) a legacy report PDF file */
export const updateLegacyPDF = async (
	pdfId: number,
	file: File
): Promise<void> => {
	const formData = new FormData();
	formData.append("file", file);
	await apiClient.put(REPORT_ENDPOINTS.UPDATE_LEGACY_PDF(pdfId), formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

/** Delete a report PDF */
export const deleteReportPDFFile = async (pdfId: number): Promise<void> => {
	await apiClient.delete(REPORT_ENDPOINTS.UPDATE_REPORT_PDF(pdfId));
};

/** Delete a legacy report PDF */
export const deleteLegacyPDFFile = async (pdfId: number): Promise<void> => {
	await apiClient.delete(REPORT_ENDPOINTS.UPDATE_LEGACY_PDF(pdfId));
};

/**
 * Fetch reports for a specific division (or all if no slug provided)
 * Re-exported from shared for backward compatibility.
 */
export { getReportsForDivision } from "@/shared/services/report.service";

/** Toggle the is_published flag on an annual report */
export const toggleReportPublished = async (
	reportId: number,
	isPublished: boolean
): Promise<void> => {
	await apiClient.put(REPORT_ENDPOINTS.REPORT_DETAIL(reportId), {
		is_published: isPublished,
	});
};
