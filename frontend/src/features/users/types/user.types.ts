import type { IAffiliation } from "@/shared/types/org.types";

// ============================================================================
// USER CREATION (Feature-specific form data)
// ============================================================================

export interface UserCreationFormData {
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	isStaff?: boolean;
	branch?: number;
	businessArea?: number;
	affiliation?: number;
}

// ============================================================================
// USER UPDATE (Feature-specific mutation variables)
// ============================================================================

export interface IProfileUpdateVariables {
	userPk: string;
	image?: File | string | null | undefined;
	about?: string;
	expertise?: string;
}

export interface IPIUpdateVariables {
	display_first_name: string;
	display_last_name: string;
	userPk: string;
	title: string;
	phone: string;
	fax: string;
}

export interface IFullUserUpdateVariables {
	display_first_name?: string;
	display_last_name?: string;
	userPk: string | number;
	title?: string;
	phone?: string;
	fax?: string;
	branch?: number | string;
	business_area?: number | string;
	image?: File | string | null | undefined;
	about?: string;
	expertise?: string;
	affiliation?: IAffiliation | number;
}

export interface IMembershipUpdateVariables {
	userPk: string | number;
	branch: number;
	business_area: number;
	affiliation?: number;
}

// ============================================================================
// DOWNLOADS/EXPORTS (Feature-specific)
// ============================================================================

export interface IDownloadBCSStaffCSVParams {
	in_spms?: boolean;
	is_active?: boolean;
}
