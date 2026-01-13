export const REPORT_ENDPOINTS = {
	LIST: "documents/reports",
	CREATE: "documents/reports",
	DETAIL: (pk: string | number) => `documents/reports/${pk}`,
	UPDATE: (pk: number) => `documents/reports/${pk}`,
	DELETE: (pk: number) => `documents/reports/${pk}`,
	LATEST: "documents/reports/latest",
	COMPLETED: "documents/reports/completed",
	LATEST_YEAR: "documents/reports/latestyear",
	AVAILABLE_YEARS: {
		PROGRESS: (pk: string | number) =>
			`documents/reports/availableyears/${pk}/progressreport`,
		STUDENT: (pk: string | number) =>
			`documents/reports/availableyears/${pk}/studentreport`,
	},
	PDF: (pk: string | number) => `documents/reports/pdf/${pk}`,
	MEDIA: {
		LIST: "medias/report_pdfs",
		DETAIL: (pk: string | number) => `medias/report_medias/${pk}/media`,
		LATEST: "medias/report_medias/latest/media",
		UPLOAD: (pk: number) => `medias/report_medias/${pk}/media`,
		DELETE: (pk: number, section: string) =>
			`medias/report_medias/${pk}/media/${section}`,
	},
	BATCH_APPROVE_OLD: "documents/batchapproveold",
	BATCH_APPROVE: "documents/batchapprove",
	GET_PREVIOUS_REPORTS_DATA: "documents/get_previous_reports_data",
	OPEN_NEW_CYCLE: "documents/opennewcycle",
	FINAL_APPROVAL: "documents/actions/finalApproval",
	PROJECT_LEAD_EMAILS: "documents/get_project_lead_emails",
};
