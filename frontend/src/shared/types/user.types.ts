import type { IImageData } from "./media.types";
import type {
	IAffiliation,
	IAgency,
	IBranch,
	IBusinessArea,
} from "./org.types";

// ============================================================================
// CORE USER TYPES (Domain Models)
// ============================================================================

export interface IUserData {
	pk: number;
	username: string;
	email: string;
	display_first_name: string;
	display_last_name: string;
	first_name: string;
	last_name: string;
	is_superuser: boolean;
	is_staff: boolean;
	is_active: boolean;
	image: IImageData;
	business_area: IBusinessArea | undefined;
	role: string;
	branch: IBranch;
	affiliation: IAffiliation;
	branches?: IBranch[];
	businessAreas?: IBusinessArea[];
	name?: string;
	// Extended profile fields (from ProfilePageSerializer)
	phone?: string;
	fax?: string;
	title?: string;
	about?: string;
	expertise?: string;
}

export interface IMiniUser {
	pk: number;
	first_name: string;
	last_name: string;
	username: string;
	email: string;
	is_active: boolean;
	is_superuser: boolean;
}

export interface IUserMe {
	staff_profile_pk?: number;
	public_email?: string;
	custom_title?: string;
	custom_title_on?: boolean;
	staff_profile_hidden?: boolean;
	id?: number;
	pk?: number;
	caretakers: ICaretakerSimpleUserData[];
	caretaking_for: ICaretakerSimpleUserData[];
	display_first_name: string;
	display_last_name: string;
	about: string;
	agency: IAgency;
	branch: IBranch;
	business_area: IBusinessArea | undefined;
	date_joined: Date;
	email: string;
	expertise: string;
	phone: string;
	fax: string;
	username: string;
	first_name: string;
	last_name: string;
	title: string;
	is_superuser: boolean;
	is_staff: boolean;
	is_active: boolean;
	is_biometrician: boolean;
	is_aec: boolean;
	is_herbarium_curator: boolean;
	image: IImageData;
	role: string | null;
	affiliation: IAffiliation;
	branches?: IBranch[];
	businessAreas?: IBusinessArea[];
	business_areas_led: number[];
}

export interface IMemberUserDetails extends IUserData {
	caretaking_for: ICaretakerSimpleUserData[];
	caretakers: ICaretakerSimpleUserData[];
}

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

export interface IPersonalInformation {
	display_first_name: string | null;
	display_last_name: string | null;
	first_name: string;
	last_name: string;
	email: string;
	title: string;
	phone: string;
	fax: string;
}

export interface IProfile {
	image: {
		file: string;
		user: IUserData;
	};
	about: string;
	expertise: string;
}

// ============================================================================
// CARETAKER TYPES
// ============================================================================

export interface ICaretakerSimpleUserData {
	pk: number;
	is_superuser: boolean;
	caretaker_obj_id?: number;
	display_first_name: string | null;
	display_last_name: string | null;
	email: string;
	image: string;
	end_date: Date | null;
	caretakers: ICaretakerSimpleUserData[];
	caretaking_for: ICaretakerSimpleUserData[];
}

export interface ICaretakerRequestObject {
	id: number;
	action: string;
	created_at: Date;
	end_date: Date | null;
	notes: string | null;
	primary_user: {
		pk: number;
		display_first_name: string;
		display_last_name: string;
		image: IImageData;
	};
	reason: string | null;
	secondary_users: {
		pk: number;
		display_first_name: string;
		display_last_name: string;
		image: IImageData;
	}[];
	status: string;
}

export interface ICheckCaretakerStatus {
	caretaker_request_object: ICaretakerRequestObject | null;
	become_caretaker_request_object: ICaretakerRequestObject | null;
	caretaker_object: ICaretakerObject | null;
}

export interface ICaretakerObject {
	pk?: number;
	id?: number;
	caretaker_obj_id?: number;
	user:
		| number
		| {
				pk: number;
				display_first_name: string;
				display_last_name: string;
				image: string;
		  };
	caretaker: {
		pk: number;
		display_first_name: string;
		display_last_name: string;
		image: IImageData;
	};
	end_date: Date | null;
	reason: string | null;
	notes: string | null;
}

export interface ICaretakerSubsections {
	userData: IUserMe;
	refetchCaretakerData: () => void;
	caretakerData: ICheckCaretakerStatus;
}

export interface ICaretakerPermissions {
	userIsCaretakerOfMember: boolean;
	userIsCaretakerOfProjectLeader: boolean;
	userIsCaretakerOfBaLeader: boolean;
	userIsCaretakerOfAdmin: boolean;
}

// ============================================================================
// SHARED QUERY/FILTER TYPES
// ============================================================================

export interface IUserSearchFilters {
	onlyExternal?: boolean;
	onlyStaff?: boolean;
	onlySuperuser?: boolean;
	businessArea?: string | number;
}
