import type { IAffiliation } from "./org.types";
import type { ITaskDocument, ITaskUser } from "./project.types";
import type { IMiniUser, IUserData } from "./user.types";

export interface BumpEmailData {
	documentId: number;
	documentKind: string;
	projectId: number;
	projectTitle: string;
	userToTakeAction: number;
	userToTakeActionEmail: string;
	userToTakeActionFirstName: string;
	userToTakeActionLastName: string;
	actionCapacity: string;
	requestingUser: number;
	requestingUserEmail: string;
	requestingUserFirstName: string;
	requestingUserLastName: string;
}

export interface IMaintainer {
	maintainer: IMiniUser;
}

export interface IAdminOptions {
	pk: number;
	email_options: string;
	updated_at: Date;
	created_at: Date;
	maintainer: IMiniUser;

	// New guide_content field (JSON object with dynamic keys)
	guide_content: {
		[key: string]: string; // Allows any field key with string content
	};

	// Legacy fields - keeping for backward compatibility
	guide_admin?: string; // Made optional since we're transitioning away from these
	guide_about?: string;
	guide_login?: string;
	guide_profile?: string;
	guide_user_creation?: string;
	guide_user_view?: string;
	guide_project_creation?: string;
	guide_project_view?: string;
	guide_project_team?: string;
	guide_documents?: string;
	guide_report?: string;
}

export interface IGuideContent {
	guide_admin?: string;
	guide_about?: string;
	guide_login?: string;
	guide_profile?: string;
	guide_user_creation?: string;
	guide_user_view?: string;
	guide_project_creation?: string;
	guide_project_view?: string;
	guide_project_team?: string;
	guide_documents?: string;
	guide_report?: string;
	[key: string]: string | undefined; // Allow additional dynamic fields
}

export interface IAdminOptionsTypeSafe {
	pk: number;
	email_options: string;
	updated_at: Date;
	created_at: Date;
	maintainer: IMiniUser;
	guide_content: IGuideContent;

	// Legacy fields - keeping for backward compatibility
	guide_admin?: string;
	guide_about?: string;
	guide_login?: string;
	guide_profile?: string;
	guide_user_creation?: string;
	guide_user_view?: string;
	guide_project_creation?: string;
	guide_project_view?: string;
	guide_project_team?: string;
	guide_documents?: string;
	guide_report?: string;
}

export interface ISetCaretaker {
	primaryUserPk: number;
	caretakerUserPk: number;
}

export interface IMergeUser {
	primaryUser: IUserData;
	secondaryUsers: IUserData[];
}

export interface IMergeUserPk {
	primaryUserPk: number;
	secondaryUserPks: number[];
}

export interface IMergeAffiliation {
	primaryAffiliation: IAffiliation; // or IAffiliation and extract pk
	secondaryAffiliations: IAffiliation[]; // or IAffiliation and extract pk
}

export interface ICaretakerEntry {
	pk?: number;
	userPk: number;
	caretakerPk: number;
	// startDate: Date;
	endDate: Date;
	reason: "leave" | "resignation" | "other";
	notes?: string; // if other is selected
}

export interface IAdminRequestUser {
	pk: number;
	display_first_name?: string;
	display_last_name?: string;
}

export interface IMakeRequestToAdmins {
	action: "deleteproject" | "mergeuser" | "setcaretaker";

	// Project deletion
	project?: number;

	// Merging and caretaking
	primaryUserPk?: number;
	secondaryUserPks?: number[];
	reason?: string;
	startDate?: Date;
	endDate?: Date | null;
	notes?: string;
}

export interface IActionAdminTask {
	action: "approve" | "reject";
	taskPk: number;
}

export interface IAdminTask {
	action: "deleteproject" | "mergeuser" | "setcaretaker";
	//  | "mergeaffiliation";
	status: "pending" | "approved" | "fulfilled" | "rejected";
	project?: {
		pk: number;
		title: string;
	};
	requester?: IAdminRequestUser;
	primary_user?: IAdminRequestUser;
	secondary_users?: IAdminRequestUser[];
	reason?: string;
	notes?: string;
	start_date?: Date;
	end_date?: Date;
	pk: number;
	created_at?: Date;
}

export interface ITaskDisplayCard {
	pk: number;
	creator: ITaskUser;
	user: ITaskUser;
	// project: ITaskProject;
	document: ITaskDocument;

	name: string;
	description: string;
	notes: string;
	status: string;
	task_type: string;

	date_assigned: Date;
}
