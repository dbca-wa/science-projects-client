export interface IAnnualReport {
	id: number;
	year: number;
	creator: number | null;
	modifier: number | null;
	dm: string | null;
	dm_sign: string | null;
	service_delivery_intro: string | null;
	research_intro: string | null;
	student_intro: string | null;
	publications: string | null;
	date_open: string;
	date_closed: string;
	pdf_generation_in_progress: boolean;
	is_published: boolean;
	created_at: string;
	updated_at: string;
}

export interface IAnnualReportPDF {
	id: number;
	report: number;
	file: string;
	year: number;
	creator: number | null;
	created_at: string;
}

/** Shape returned by MiniProjectMemberSerializer via TeamMemberMixin. */
export interface IReportTeamMember {
	user: {
		id: number;
		display_first_name: string | null;
		display_last_name: string | null;
		email: string;
		is_active: boolean;
		is_staff: boolean;
	};
	is_leader: boolean;
	position: number;
	role: string;
}

/**
 * Progress report as returned by LatestYearsProgressReports / LatestYearsInactiveReports.
 */
export interface IARProgressReport {
	id: number;
	document: {
		id: number;
		status: string;
		project: {
			id: number;
			title: string;
			status: string;
			kind: string;
			year: number;
			number: number;
			image?: { file: string } | null;
			business_area?: { name: string } | null;
		};
		creator: number | null;
		modifier: number | null;
	};
	report: number;
	project: number;
	year: number;
	team_members?: IReportTeamMember[];
	context: string | null;
	aims: string | null;
	progress: string | null;
	implications: string | null;
	future: string | null;
}

/**
 * Student report as returned by LatestYearsStudentReports / LatestYearsInactiveReports.
 */
export interface IARStudentReport {
	id: number;
	document: {
		id: number;
		status: string;
		project: {
			id: number;
			title: string;
			status: string;
			kind: string;
			year: number;
			number: number;
			image?: { file: string } | null;
			business_area?: { name: string } | null;
		};
		creator: number | null;
		modifier: number | null;
	};
	report: number;
	project: number;
	year: number;
	team_members?: IReportTeamMember[];
	progress_report: string | null;
}

/**
 * The inactive reports endpoint returns both student and progress reports.
 */
export interface IInactiveReportsResponse {
	student_reports: IARStudentReport[];
	progress_reports: IARProgressReport[];
}

/** SSE progress event from the generation-progress endpoint */
export interface IProgressEvent {
	phase: string;
	phase_label: string;
	percentage: number;
	generation_kind: "all" | "approved";
	status: "in_progress" | "completed" | "error" | "idle";
	error_message?: string;
	started_at?: number;
}
