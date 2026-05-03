// Re-export shared organisational types
export type {
	IBranch,
	IBusinessArea,
	IBusinessAreaCreate,
	IBusinessAreaUpdate,
	IDivision,
	IAffiliation,
	IDepartmentalService,
	IAddress,
	ISimpleLocationData,
} from "@/shared/types/org.types";

// Form types for create/edit operations

export interface IBranchForm {
	name: string;
	manager: number | null;
}

export interface IAddressForm {
	branch: number | null;
	street: string;
	zipcode: number | string;
	city: string;
	state: string;
	country: string;
	pobox?: string;
}

export interface IAffiliationForm {
	name: string;
}

export interface IDivisionForm {
	name: string;
	slug: string;
	director: number | null;
	approver: number | null;
}

export interface ILocationForm {
	name: string;
	area_type: string;
}

export interface IServiceForm {
	name: string;
	director: number | null;
}

export interface IReportInfoForm {
	year: number;
	division?: number;
	date_open?: string;
	date_closed?: string;
	dm?: string;
	dm_sign?: string;
	service_delivery_intro?: string;
	research_intro?: string;
	student_intro?: string;
	publications?: string;
}

// Data list types

/** Unapproved project from the unapprovedFY endpoint */
export interface IUnapprovedProject {
	id: number;
	title: string;
	status: string;
	kind: string;
	year: number;
	business_area: {
		id: number;
		name: string;
	} | null;
	created_at: string;
	updated_at: string;
}

/** Problematic projects response from the problematic endpoint */
export interface IProblematicProjectsData {
	no_progress: IProblematicProject[];
	inactive_lead_active_project: IProblematicProject[];
	open_with_closure: IProblematicProject[];
	memberless: IProblematicProject[];
	leaderless: IProblematicProject[];
	multiple_leaders: IProblematicProject[];
	external_leaders: IProblematicProject[];
	no_business_area: IProblematicProject[];
}

export interface IProblematicProject {
	id: number;
	title: string;
	status: string;
	kind: string;
	year: number;
	business_area: {
		id: number;
		name: string;
	} | null;
}

/** Staff user entry from the users list endpoint */
export interface IStaffUser {
	id: number;
	display_first_name: string | null;
	display_last_name: string | null;
	email: string;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
}
