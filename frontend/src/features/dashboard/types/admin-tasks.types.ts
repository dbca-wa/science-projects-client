import type { IImageData } from "@/shared/types/media.types";

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

export interface AdminTaskCardProps {
	task: IAdminTask;
}

export interface CaretakerTaskCardProps {
	task: IAdminTask;
}

export interface MyTasksSectionPhase1Props {
	adminTasks: IAdminTask[];
	adminTasksLoading: boolean;
	adminTasksError?: Error | null;
	refetchAdminTasks?: () => void;
}

export interface SectionDividerProps {
	title: string;
}
