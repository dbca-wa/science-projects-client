import type { KeywordTag } from "@/shared/types/staff-profile.types";

// ============================================================================
// STAFF PROFILE UPDATE (Feature-specific mutation variables)
// ============================================================================

export interface IUpdateStaffOverviewSection {
	pk: number;
	about?: string;
	expertise?: string;
	keyword_tags?: KeywordTag[];
}

export interface IUpdateStaffHeroSection {
	pk: number;
	keyword_tags?: KeywordTag[];
}

export interface IUpdatePublicEmail {
	staff_profile_pk: number;
	public_email: string;
}

export interface IUpdateCustomTitle {
	staff_profile_pk: number;
	custom_title: string;
	custom_title_on: boolean;
}

// ============================================================================
// EMAIL (Feature-specific)
// ============================================================================

export interface IStaffPublicEmail {
	pk: number;
	senderEmail: string;
	message: string;
}
