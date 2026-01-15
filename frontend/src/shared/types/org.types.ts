// AGENCY ============================================================================

import type { IEmailListUser } from "./email.types";

export interface IAgency {
	pk: number;
	name: string;
	key_stakeholder: number;
	is_active: boolean;
}

// AFFILIATION ============================================================================

export interface IAffiliation {
	pk: number;
	created_at?: Date;
	updated_at?: Date;
	name: string;
}

// BRANCH ============================================================================

export interface IBranch {
	pk: number;
	old_id?: number;

	agency: number;
	name: string;
	manager: number;
}

// SERVICE ============================================================================

export interface IDepartmentalService {
	name: string;
	director?: number;
	pk: number;
	old_id?: number;
}

// BUSINESS AREA ============================================================================

export interface IBusinessAreaUpdate {
	agency?: number;
	old_id?: number;
	pk?: number;
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

export interface IBusinessArea {
	agency?: number;
	old_id?: number;
	pk?: number;
	slug?: string;
	division?: IDivision | number;
	is_active: boolean;
	name: string;
	focus: string;
	introduction: string;
	image: BusinessAreaImage;
	// | File | null
	leader?: number;
	finance_admin?: number;
	data_custodian?: number;
}

export interface IBusinessAreaCreate {
	agency?: number;
	old_id?: number;
	pk?: number;
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
	pk: number;
	old_file: string;
	file: string;
}

// DIVISIONS ============================================================================

export interface IDivision {
	pk: number;
	old_id?: number;
	name: string;
	slug: string;
	director: number;
	approver: number;
	directorate_email_list?: IEmailListUser[];
}

// ADDRESS ============================================================================

export interface IAddress {
	pk: number;
	agency?: number;
	branch?: number;
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
	pk: number;
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
	old_id?: number;
	pk: number;
	name: string;
	area_type: string;
}
