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
	date_open: string;
	date_closed: string;
	dm?: string;
	dm_sign?: string;
	service_delivery_intro?: string;
	research_intro?: string;
	student_intro?: string;
	publications?: string;
}
