import type { IBusinessArea, ISimpleLocationData } from "./org.types";
import type { IAffiliation } from "./org.types";
import type { IImageData } from "./media.types";

// Re-export IImageData for convenience
export type { IImageData };

/**
 * Project Types
 * 
 * Type definitions for project-related data structures.
 * These match the backend API structure.
 */

// Project Status
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

// Project Kind
export type ProjectKind = "core_function" | "science" | "student" | "external";

// Project Roles
export type ProjectRoles =
	| "supervising"
	| "research"
	| "technical"
	| "externalcol"
	| "externalpeer"
	| "academicsuper"
	| "student"
	| "consulted"
	| "group";

// Project Image
export interface ProjectImage {
	id: number;
	file: string;
	old_file: string;
}

// Small User (for project details)
export interface ISmallUser {
	id: number;
	username: string;
}

// Small Project (for nested references)
export interface ISmallProject {
	id: number;
	title: string;
}

// Small Service
export interface ISmallService {
	id?: number;
	name: string;
}

// Main Project Data
export interface IProjectData {
	id: number;
	areas: ISimpleLocationData[];
	kind: ProjectKind;
	title: string;
	status: ProjectStatus;
	description: string;
	tagline: string;
	image: ProjectImage | null;
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

// Base Project Details
export interface IBaseProjectDetails {
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

// Student Project Details
export interface IStudentProjectDetails {
	id: number;
	level: string;
	organisation: string;
	project: ISmallProject;
}

// External Project Details
export interface IExternalProjectDetails {
	id: number;
	project: ISmallProject;
	aims: string | null;
	budget: string | null;
	collaboration_with: string | null;
	description: string | null;
}

// Extended Project Details
export interface IExtendedProjectDetails {
	base: IBaseProjectDetails;
	external: IExternalProjectDetails | [];
	student: IStudentProjectDetails | [];
}

// Project Member User Details
export interface IMemberUserDetails {
	id: number;
	is_staff: boolean;
	is_superuser: boolean;
	username: string | null;
	display_first_name: string | null;
	display_last_name: string | null;
	first_name: string | null;
	last_name: string | null;
	email: string;
	business_area: string | null;
	branch: string | null;
	role: string | null;
	image: IImageData;
}

// Project Member
export interface IProjectMember {
	id: number;
	project: number;
	is_leader: boolean;
	user: IMemberUserDetails;
	role: string;
	time_allocation: number;
	position: number;
	short_code: number | null;
	affiliation: IAffiliation;
}

// Project Documents (placeholder - will be expanded when implementing documents)
export interface IProjectDocuments {
	concept_plan: Record<string, unknown> | null;
	project_plan: Record<string, unknown> | null;
	progress_reports: Record<string, unknown>[];
	student_reports: Record<string, unknown>[];
	project_closure: Record<string, unknown> | null;
}

// Project Areas
export interface IProjectAreas {
	created_at: Date;
	updated_at: Date;
	project: number;
	id: number;
	areas: ISimpleLocationData[];
}

// Full Project Details (for detail page)
export interface IFullProjectDetails {
	project: IProjectData;
	details: IExtendedProjectDetails;
	documents: IProjectDocuments;
	members: IProjectMember[] | null;
}

// Mini Project Data (for cards/lists)
export interface ITinyProjectData {
	id: number;
	title: string;
	image: ProjectImage | null;
	tag: string;
}

// Task-related types (for admin tasks)
export interface ITaskUser {
	id: number;
	display_first_name: string;
	display_last_name: string;
}

export interface ITaskProject {
	id: number;
	title: string;
	status: string;
	kind: string;
	year: number;
	business_area: IBusinessArea;
	image: IImageData;
}

export interface ITaskDocument {
	id: number;
	kind: string;
	status: string;
	project: ITaskProject;
}
