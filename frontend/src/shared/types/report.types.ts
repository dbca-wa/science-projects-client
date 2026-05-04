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
