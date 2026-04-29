// REPORT ============================================================================

export interface ILegacyPDF {
	id: number;
	file: string;
	report: { id: number; year: number };
	year: number;
}

export interface ITinyReportMedia {
	id: number;
	kind: string;
	old_file: string;
	file: string;
	report: number;
}

export interface ISmallReport {
	id: number;
	date_open?: Date | null;
	date_closed?: Date | null;
	year: number | null;
	creator?: number;
	media?: ITinyReportMedia;
	pdf?: IReportPDF;
}

export interface IReportPDF {
	id: number;
	file: string | null;
	old_file: string | null;
}

export interface IReport {
	id: number;
	created_at?: Date;
	updated_at?: Date | null;
	date_open: Date | null;
	date_closed: Date | null;
	year: number;

	creator?: number;
	modifier?: number;

	dm: string | null;
	publications: string | null;
	research_intro: string | null;
	service_delivery_intro: string | null;
	student_intro: string | null;
}

export interface IReportCreation {
	id?: number;
	created_at?: Date;
	updated_at?: Date | null;
	// date_open: Date | null;
	// date_closed: Date | null;
	year: number;

	creator?: number;
	modifier?: number;

	dm: string | null;
	publications: string | null;
	research_intro: string | null;
	service_delivery_intro: string | null;
	student_intro: string | null;
	seek_update: boolean;
}

/**
 * Annual report as returned by the reports API.
 * Canonical definition — all consumers should import from here.
 */
export interface IAnnualReport {
	id: number;
	year: number;
	creator: number | null;
	division: { id: number; name: string } | null;
	dm: string | null;
	dm_sign: string | null;
	service_delivery_intro: string | null;
	research_intro: string | null;
	student_intro: string | null;
	publications: string | null;
	date_open: string | null;
	date_closed: string | null;
	pdf_generation_in_progress: boolean;
	is_published: boolean;
	created_at: string;
	updated_at: string;
}
