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
	id: number;
	username: string | null;
	email: string;
	display_first_name: string | null;
	display_last_name: string | null;
	first_name: string | null;
	last_name: string | null;
	is_superuser: boolean;
	is_staff: boolean;
	is_active: boolean;
	is_aec?: boolean;
	image: IImageData;
	business_area: IBusinessArea | undefined;
	role: string | null;
	// Note: IUserMe has role as string | null
	branch: IBranch;
	affiliation: IAffiliation;
	branches?: IBranch[];
	businessAreas?: IBusinessArea[];
	business_areas_led?: number[] | IBusinessArea[];
	name?: string;
	// Key stakeholder / approver role flags (from TinyUserSerializer)
	is_key_stakeholder?: boolean;
	is_approver?: boolean;
	// Extended profile fields (from ProfilePageSerializer)
	phone?: string;
	fax?: string;
	title?: string;
	about?: string;
	expertise?: string;
	date_joined?: Date;
}

export interface IMiniUser {
	id: number;
	first_name: string | null;
	last_name: string | null;
	username: string;
	email: string;
	is_active: boolean;
	is_superuser: boolean;
}

export interface IUserMe {
	staff_profile_id?: number;
	public_email?: string;
	custom_title?: string;
	custom_title_on?: boolean;
	staff_profile_hidden?: boolean;
	id: number;
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
	first_name: string | null;
	last_name: string | null;
	title: string;
	is_superuser: boolean;
	is_staff: boolean;
	is_active: boolean;
	is_aec: boolean;
	image: IImageData;
	role: string | null;
	affiliation: IAffiliation;
	branches?: IBranch[];
	businessAreas?: IBusinessArea[];
	business_areas_led: IBusinessArea[];
	// Key stakeholder / approver role flags
	is_key_stakeholder?: boolean;
	is_approver?: boolean;
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
	first_name: string | null;
	last_name: string | null;
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
	id: number;
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
		id: number;
		display_first_name: string;
		display_last_name: string;
		image: IImageData;
	};
	reason: string | null;
	secondary_users: {
		id: number;
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
	id: number;
	caretaker_obj_id?: number;
	user:
		| number
		| {
				id: number;
				display_first_name: string;
				display_last_name: string;
				image: string;
		  };
	caretaker: {
		id: number;
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
	roleFilter?: string;
	businessArea?: string | number;
}
