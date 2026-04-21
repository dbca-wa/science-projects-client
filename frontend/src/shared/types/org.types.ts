// AGENCY ============================================================================

import type { IEmailListUser } from "./email.types";

export interface IAgency {
	id: number;
	name: string;
	key_stakeholder: number;
	is_active: boolean;
}

// AFFILIATION ============================================================================

export interface IAffiliation {
	id: number;
	created_at?: Date;
	updated_at?: Date;
	name: string;
	slug?: string;
}

// BRANCH ============================================================================

export interface IBranchManager {
	id: number;
	display_first_name: string | null;
	display_last_name: string | null;
	email: string;
}

export interface IBranch {
	id: number;
	agency: number;
	name: string;
	manager: IBranchManager | null;
}

// SERVICE ============================================================================

export interface IDepartmentalService {
	name: string;
	director?: number;
	id: number;
}

// BUSINESS AREA ============================================================================

export interface IBusinessAreaUpdate {
	agency?: number;
	id?: number;
	slug?: string;
	division?: IDivision;
	is_active: boolean;
	name: string;
	focus: string;
	introduction: string;
	image: BusinessAreaImage | File | null;
	leader?: number;
	finance_admin?: number;
	data_custodian?: number;
}

/** Lightweight user object returned by TinyBusinessAreaSerializer */
export interface IBusinessAreaUser {
	id: number;
	display_first_name: string | null;
	display_last_name: string | null;
	email: string;
}

export interface IBusinessArea {
	agency?: number;
	id?: number;
	slug?: string;
	division?: IDivision | number;
	is_active: boolean;
	name: string;
	focus: string;
	introduction: string;
	image: BusinessAreaImage | string | null;
	leader?: IBusinessAreaUser | number | null;
	caretaker?: number;
	finance_admin?: IBusinessAreaUser | number | null;
	data_custodian?: IBusinessAreaUser | number | null;
	project_count?: number;
}

export interface IBusinessAreaCreate {
	agency?: number;
	id?: number;
	slug?: string;
	division?: number;
	is_active: boolean;
	name: string;
	focus: string;
	introduction: string;
	image: BusinessAreaImage | File | null;
	leader?: number;
	finance_admin?: number;
	data_custodian?: number;
}

export interface BusinessAreaImage {
	id: number;
	old_file: string;
	file: string;
}

// DIVISIONS ============================================================================

export interface IDivision {
	id: number;
	name: string;
	slug: string;
	director: number;
	approver: number;
	directorate_email_list?: IEmailListUser[];
	key_stakeholder: IEmailListUser | null;
	approvers: IEmailListUser[];
}

// ADDRESS ============================================================================

/**
 * Nested branch object returned by TinyAddressSerializer.
 * The address list endpoint returns branch as a nested object,
 * while the form sends branch as a plain ID.
 */
export interface IAddressBranch {
	id: number;
	name: string;
	agency: number;
	manager: IBranchManager | null;
}

export interface IAddress {
	id: number;
	agency?: number | IAgency | null;
	branch?: number | IAddressBranch | null;
	street: string;
	suburb?: string;
	city: string;
	zipcode?: number;
	state: string;
	country: string;
	pobox?: string;
}

// LOCATION ============================================================================

export interface OrganisedLocationData {
	[key: string]: ISimpleLocationData[];

	dbcaregion: ISimpleLocationData[];
	dbcadistrict: ISimpleLocationData[];
	ibra: ISimpleLocationData[];
	imcra: ISimpleLocationData[];
	nrm: ISimpleLocationData[];
}

export interface ISimpleLocationData {
	id: number;
	name: string;
	area_type: string;
}

export interface IProjectAreas {
	created_at: Date;
	updated_at: Date;
	project: number;
	id: number;
	areas: ISimpleLocationData[];
}

export interface IAddLocationForm {
	id: number;
	name: string;
	area_type: string;
}
