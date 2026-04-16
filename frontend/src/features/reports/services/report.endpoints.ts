/**
 * Report API endpoints
 *
 * Paths are relative to the base URL which already includes /api/v1/.
 */
export const REPORT_ENDPOINTS = {
	PUBLISHED_PDFS: "documents/reports/withPDF",
	LEGACY_PDFS: "documents/reports/legacyPDF",
	LATEST_YEAR: "documents/reports/latestyear",
	LATEST_REPORT: "documents/reports/latest",
	REPORT_DETAIL: (id: number) => `documents/reports/${id}`,
	REPORT_PDF: (id: number) => `documents/reports/pdf/${id}`,
	DOWNLOAD: (id: number) => `documents/reports/download/${id}`,
	MY_BUSINESS_AREAS: "agencies/business_areas/mine",
	LATEST_PROGRESS_REPORTS: "documents/latest_active_progress_reports",
	LATEST_STUDENT_REPORTS: "documents/latest_active_student_reports",
	LATEST_INACTIVE_REPORTS: "documents/latest_inactive_reports",

	// Report media
	LATEST_REPORT_MEDIA: "medias/report_medias/latest/media",
	REPORT_MEDIA_UPLOAD: (pk: number) => `medias/report_medias/${pk}/media`,
	REPORT_MEDIA_DELETE: (pk: number, section: string) =>
		`medias/report_medias/${pk}/media/${section}`,

	// Report PDF status (lightweight — no base64 data)
	REPORT_PDF_STATUS: (pk: number) => `documents/reports/pdf/${pk}/status`,
	REPORT_PDF_DATA: (pk: number) => `documents/reports/pdf/${pk}`,
	GENERATE_PDF: (pk: number) => `documents/reports/${pk}/generate_pdf`,
	CANCEL_PDF_GEN: (pk: number) => `documents/reports/${pk}/cancel_doc_gen`,

	// SSE progress stream
	GENERATION_PROGRESS: (pk: number) =>
		`documents/reports/${pk}/generation-progress`,

	// Reports without a PDF (for Add Official dropdown)
	REPORTS_WITHOUT_PDF: "documents/reports/withoutPDF",

	// Upload endpoints
	ADD_REPORT_PDF: "medias/report_pdfs",
	ADD_LEGACY_PDF: "medias/legacy_report_pdfs",

	// Update/delete endpoints
	UPDATE_REPORT_PDF: (pk: number) => `medias/report_pdfs/${pk}`,
	UPDATE_LEGACY_PDF: (pk: number) => `medias/legacy_report_pdfs/${pk}`,

	// Report approval
	FINAL_APPROVAL: "documents/actions/finalApproval",
} as const;
