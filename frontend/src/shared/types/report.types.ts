// REPORT ============================================================================

export interface ILegacyPDF {
	pk: number;
	file: string;
	report: { id: number; year: number };
	year: number;
}

export interface ITinyReportMedia {
	pk: number;
	kind: string;
	old_file: string;
	file: string;
	report: number;
}

export interface ISmallReport {
	pk: number;
	date_open?: Date | null;
	date_closed?: Date | null;
	year: number | null;
	creator?: number;
	media?: ITinyReportMedia;
	pdf?: IReportPDF;
}

export interface IReportPDF {
	pk: number;
	file: string | null;
	old_file: string | null;
}

export interface IReport {
	old_id?: number;
	pk?: number;
	id?: number;
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
	old_id?: number;
	pk?: number;
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
