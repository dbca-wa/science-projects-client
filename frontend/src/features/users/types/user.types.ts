import type { IAffiliation } from "@/shared/types/org.types";
import type { KeywordTag } from "@/shared/types/staff-profile.types";

// User-related types
export interface UserData {
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	isStaff?: boolean;
	branch?: number;
	businessArea?: number;
	affiliation?: number;
}

// export interface IUser {
// 	pk: number;
// 	username: string;
// 	email: string;
// 	first_name: string;
// 	last_name: string;
// 	is_staff: boolean;
// 	is_superuser: boolean;
// 	is_active: boolean;
// 	branch?: number;
// 	business_area?: number;
// 	affiliation?: number;
// 	image?: string;
// 	about?: string;
// 	expertise?: string;
// }

export interface IPersonalInformation {
	display_first_name: string;
	display_last_name: string;
	title: string;
	phone: string;
	fax: string;
}

export interface IProfile {
	image?: string;
	about?: string;
	expertise?: string;
}

export interface IUserSearchFilters {
	onlyExternal?: boolean;
	onlyStaff?: boolean;
	onlySuperuser?: boolean;
	businessArea?: number;
}

// Request/Response types
export interface IDownloadBCSStaffCSVParams {
	in_spms?: boolean;
	is_active?: boolean;
}

export interface UserData {
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	isStaff?: boolean;
	branch?: number;
	businessArea?: number;
	affiliation?: number;
}

export interface NameData {
	firstName: string;
	lastName: string;
}

export interface AdminSwitchVar {
	userPk: number | string;
}

export interface PRPopulationVar {
	writeable_document_kind: string;
	section: string;
	project_pk: number;
}

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

export interface IMyBAUpdateSubmissionData {
	pk: number;
	introduction: string;
	image: File | null;
}

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

export interface IStaffPublicEmail {
	pk: number;
	senderEmail: string;
	message: string;
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

export interface IApproveProgressReport {
	kind: "studentreport" | "progressreport";
	isActive: number;
	reportPk: number;
	documentPk: number;
}

export interface IUnapprovedDocsForBAProps {
	baArray: number[];
}

export interface INewCycle {
	alsoUpdate: boolean;
	shouldSendEmails: boolean;
	shouldPrepopulate: boolean;
}

export interface IExtendCaretakerProps {
	id: number;
	currentEndDate: Date;
	newEndDate: Date;
}

export interface ICaretakerEntry {
	userPk: number;
	caretakerPk: number;
	endDate: Date;
	reason: string;
	notes: string;
}
