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

export interface IUserMe {
	staff_profile_id?: number;
	public_email?: string;
	public_email_on?: boolean;
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
