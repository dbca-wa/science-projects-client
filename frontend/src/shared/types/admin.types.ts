import type { IImageData } from "./media.types";

// ============================================================================
// ADMIN TASKS
// ============================================================================

export type AdminTaskAction = "deleteproject" | "mergeuser" | "setcaretaker";

export type AdminTaskStatus =
	| "pending"
	| "approved"
	| "fulfilled"
	| "cancelled"
	| "rejected";

export interface IAdminTaskUser {
	id: number;
	display_first_name: string;
	display_last_name: string;
	email: string;
	image?: IImageData;
}

export interface IAdminTaskProject {
	id: number;
	title: string;
}

/**
 * Canonical admin task type — consolidated from dashboard, caretakers,
 * and shared definitions. Matches AdminTaskSerializer from backend.
 */
export interface IAdminTask {
	id: number;
	action: AdminTaskAction;
	status: AdminTaskStatus;
	project?: IAdminTaskProject;
	requester: IAdminTaskUser;
	primary_user?: IAdminTaskUser;
	secondary_users?: IAdminTaskUser[];
	reason?: string;
	start_date?: string;
	end_date?: string;
	notes?: string;
	created_at: string;
	updated_at: string;
}
