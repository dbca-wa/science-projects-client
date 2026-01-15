// PROJECT MEMBERS ============================================================================

import type { IImageData } from "./media.types";
import type {
	IAffiliation,
	IBusinessArea,
	ISimpleLocationData,
} from "./org.types";
import type { IMemberUserDetails } from "./user.types";

export interface IProjectMember {
	id?: number;
	pk?: number;
	project: number;
	is_leader: boolean;
	user: IMemberUserDetails;
	// caretakers: IMemberUserDetails[] | null;
	role: string;
	time_allocation: number;
	position: number;
	short_code: number | null;
	affiliation: IAffiliation;
}

export interface ProjectImage {
	pk: number;
	old_file: string;
	file: string;
}

// PROJECT DETAILS =============================================================================

interface ISmallUser {
	id: number;
	username: string;
}

interface ISmallProject {
	id: number;
	title: string;
}

export interface ISmallService {
	id?: number;
	pk?: number;
	name: string;
}

interface IBaseProjectDetails {
	id: number;
	created_at: Date;
	updated_at: Date;
	creator: ISmallUser;
	modifier: ISmallUser;
	data_custodian: ISmallUser | null;
	site_custodian: ISmallUser | null;
	owner: ISmallUser;
	project: ISmallProject;
	service: ISmallService | null;
}

export interface IStudentProjectDetails {
	id: number;
	old_id: number | null;
	level: string;
	organisation: string;
	project: ISmallProject;
}

export interface IExternalProjectDetails {
	id: number;
	old_id: number | null;
	project: ISmallProject;
	aims: string | null;
	budget: string | null;
	collaboration_with: string | null;
	description: string | null;
}

export interface IExtendedProjectDetails {
	base: IBaseProjectDetails;
	external: IExternalProjectDetails | [];
	student: IStudentProjectDetails | [];
}

// PROJECT ============================================================================

// interface IMiniEndorsement {
// 	pk: number;
// 	project_plan: IProjectPlan;
// }

// interface ITinyProjectData {
// 	pk?: number | undefined;
// 	id?: number | undefined;
// 	title: string;
// 	image: ProjectImage;
// 	tag: string;
// 	// year: number;
// 	// kind: string;
// 	// number: number;
// }

export interface Position {
	x: number;
	y: number;
}

type ProjectRoles =
	| "supervising"
	| "research"
	| "technical"
	| "externalcol"
	| "externalpeer"
	| "academicsuper"
	| "student"
	| "consulted"
	| "group";

export interface IProjectData {
	pk: number | undefined;
	id?: number;
	areas: ISimpleLocationData[];
	kind: string;
	title: string;
	status: string;
	description: string;
	tagline: string;
	image: ProjectImage;
	keywords: string;
	year: number;
	number: number;
	start_date: Date;
	end_date: Date;
	business_area: IBusinessArea;
	deletion_requested: boolean;
	deletion_request_id: number | null;

	created_at: Date;
	updated_at: Date;
	tag?: string;
	role?: ProjectRoles;

	hidden_from_staff_profiles?: number[];
}

export interface IProblematicData {
	no_progress: IProjectData[];
	open_closed: IProjectData[];
	no_members: IProjectData[];
	no_leader: IProjectData[];
	multiple_leads: IProjectData[];
	external_leader: IProjectData[];
	inactive_lead_active_project: IProjectData[];
}

// interface IFullProjectDetails {
// 	project: IProjectData;
// 	details: IExtendedProjectDetails;
// 	documents: IProjectDocuments;
// 	members: IProjectMember[] | null;
// }

// TASKS ============================================================================

export interface ITaskUser {
	pk: number;
	first_name: string;
	last_name: string;
}

export type ProjectStatus =
	| "new"
	| "pending"
	| "active"
	| "updating"
	| "closure_requested"
	| "closing"
	| "final_update"
	| "completed"
	| "terminated"
	| "suspended";

interface ITaskProject {
	pk: number;
	title: string;
	status: string;
	kind: string;
	year: number;
	business_area: IBusinessArea;
	image: IImageData;
}

export interface ITaskDocument {
	pk: number;
	kind: string;
	status: string;
	project: ITaskProject;
}

export interface IApproveDocument {
	shouldSendEmail?: boolean;
	feedbackHTML?: string;
	action: "approve" | "recall" | "send_back" | "reopen";
	stage: number; // 1-3
	documentPk: number;
}
