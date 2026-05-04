/** Problematic project as returned by the backend serialiser */
export interface IProblematicProject {
	id: number;
	title: string;
	tag: string;
	status: string;
	kind: string;
	year: number;
	number: number;
	created_at: string;
}

/** Categorised response from the problematic projects GET endpoint */
export interface IProblematicProjectsResponse {
	no_members: IProblematicProject[];
	no_leader: IProblematicProject[];
	external_leader: IProblematicProject[];
	multiple_leads: IProblematicProject[];
}

/** Problem category union type */
export type ProblemKind =
	| "memberless"
	| "leaderless"
	| "externally_led"
	| "multiple_leaders";

/** Flattened row for the problematic projects data table */
export interface IProblematicProjectRow extends IProblematicProject {
	problemKind: ProblemKind;
}

/** User who must act next on a document */
export interface IWaitingOnUser {
	id: number;
	display_first_name: string;
	display_last_name: string;
	role: "Project Lead" | "Business Area Lead" | "Directorate";
}

/** Unapproved document as returned by the backend serialiser */
export interface IUnapprovedDoc {
	id: number;
	kind: string;
	status: string;
	project_lead_approval_granted: boolean;
	business_area_lead_approval_granted: boolean;
	directorate_approval_granted: boolean;
	report_year: number | null;
	waiting_on: IWaitingOnUser | null;
	project: {
		id: number;
		title: string;
		status: string;
		kind: string;
		year: number;
		number: number;
		business_area: {
			id: number;
			name: string;
		};
	};
}

/** Keyed response from the unapproved docs POST endpoint */
export interface IUnapprovedDocsResponse {
	[baId: number]: {
		linked: IUnapprovedDoc[];
		unlinked: IUnapprovedDoc[];
	};
}
