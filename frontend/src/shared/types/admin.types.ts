import type { IAffiliation } from "./org.types";
import type { ITaskDocument, ITaskUser } from "./project.types";
import type { IMiniUser, IUserData } from "./user.types";

// ============================================================================
// ADMIN OPTIONS
// ============================================================================

export interface IMaintainer {
	maintainer: IMiniUser;
}

export interface IAdminOptions {
	id: number;
	email_options: string;
	updated_at: Date;
	created_at: Date;
	maintainer: IMiniUser;

	// New guide_content field (JSON object with dynamic keys)
	guide_content: {
		[key: string]: string; // Allows any field key with string content
	};

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
	id: number;
	email_options: string;
	updated_at: Date;
	created_at: Date;
	maintainer: IMiniUser;
	guide_content: IGuideContent;

	// Legacy fields
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

// ============================================================================
// CARETAKERS (Shared across features)
// ============================================================================

export interface ICaretakerEntry {
	id?: number;
	userId: number;
	caretakerId: number;
	endDate: Date;
	reason: "leave" | "resignation" | "other";
	notes?: string;
}

// ============================================================================
// ADMIN TASKS
// ============================================================================

export interface IAdminRequestUser {
	id: number;
	display_first_name?: string;
	display_last_name?: string;
}

export interface IMakeRequestToAdmins {
	action: "deleteproject" | "mergeuser" | "setcaretaker";
	project?: number;
	primaryUserId?: number;
	secondaryUserIds?: number[];
	reason?: string;
	startDate?: Date;
	endDate?: Date | null;
	notes?: string;
}

export interface IActionAdminTask {
	action: "approve" | "reject";
	taskId: number;
}

export interface IAdminTask {
	action: "deleteproject" | "mergeuser" | "setcaretaker";
	status: "pending" | "approved" | "fulfilled" | "rejected";
	project?: {
		id: number;
		title: string;
	};
	requester?: IAdminRequestUser;
	primary_user?: IAdminRequestUser;
	secondary_users?: IAdminRequestUser[];
	reason?: string;
	notes?: string;
	start_date?: Date;
	end_date?: Date;
	id: number;
	created_at?: Date;
}

export interface ITaskDisplayCard {
	id: number;
	creator: ITaskUser;
	user: ITaskUser;
	document: ITaskDocument;
	name: string;
	description: string;
	notes: string;
	status: string;
	task_type: string;
	date_assigned: Date;
}

// ============================================================================
// MERGE OPERATIONS
// ============================================================================

export interface ISetCaretaker {
	primaryUserId: number;
	caretakerUserId: number;
}

export interface IMergeUser {
	primaryUser: IUserData;
	secondaryUsers: IUserData[];
}

export interface IMergeUserId {
	primaryUserId: number;
	secondaryUserIds: number[];
}

export interface IMergeAffiliation {
	primaryAffiliation: IAffiliation;
	secondaryAffiliations: IAffiliation[];
}

// ============================================================================
// EMAIL (Shared across features)
// ============================================================================

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
