import type { IAdminTask } from "@/shared/types/admin.types";

export type {
	IAdminTask,
	CaretakerTaskCardProps,
} from "@/shared/types/admin.types";

export interface AdminTaskCardProps {
	task: IAdminTask;
}

export interface MyTasksSectionPhase1Props {
	adminTasks: IAdminTask[];
	adminTasksLoading: boolean;
	adminTasksError?: Error | null;
	refetchAdminTasks?: () => void;
	endorsementTasks?: import("../types/dashboard.types").EndorsementTasksResponse;
	endorsementTasksLoading: boolean;
	endorsementTasksError?: Error | null;
}

export interface SectionDividerProps {
	title: string;
}
