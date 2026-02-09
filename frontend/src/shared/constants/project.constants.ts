import type { ProjectKind, ProjectRoles, ProjectStatus } from "@/shared/types/project.types";
import { FlaskConical, GraduationCap, Building, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Project configuration constants
 * 
 * Display configurations for project kinds, roles, and statuses.
 * Used across the application for consistent rendering.
 */

// Project Role Configuration
export const PROJECT_ROLE_CONFIG: Record<ProjectRoles, {
	label: string;
	color: string;
}> = {
	supervising: { label: "Leader", color: "orange" },
	research: { label: "Science Support", color: "green" },
	technical: { label: "Technical Support", color: "brown" },
	academicsuper: { label: "Academic Supervisor", color: "blue" },
	student: { label: "Supervised Student", color: "blue" },
	group: { label: "Involved Group", color: "gray" },
	externalcol: { label: "External Collaborator", color: "gray" },
	externalpeer: { label: "External Peer", color: "gray" },
	consulted: { label: "Consulted Peer", color: "gray" },
};

// Project Kind Configuration
export const PROJECT_KIND_CONFIG: Record<ProjectKind, {
	label: string;
	tag: string;
	color: string;
	icon: LucideIcon;
}> = {
	science: {
		label: "Science",
		tag: "SP",
		color: "green",
		icon: FlaskConical,
	},
	student: {
		label: "Student",
		tag: "STP",
		color: "blue",
		icon: GraduationCap,
	},
	core_function: {
		label: "Core Function",
		tag: "CF",
		color: "red",
		icon: Building,
	},
	external: {
		label: "External",
		tag: "EXT",
		color: "gray",
		icon: Users,
	},
};

// Project Status Configuration
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, {
	label: string;
	variant: "default" | "secondary" | "destructive" | "outline";
}> = {
	new: { label: "New", variant: "default" },
	pending: { label: "Pending Project Plan", variant: "outline" },
	active: { label: "Active (Approved)", variant: "default" },
	updating: { label: "Update Requested", variant: "secondary" },
	final_update: { label: "Final Update Requested", variant: "secondary" },
	closure_requested: { label: "Closure Requested", variant: "secondary" },
	closing: { label: "Closing", variant: "secondary" },
	completed: { label: "Completed", variant: "outline" },
	terminated: { label: "Terminated and Closed", variant: "destructive" },
	suspended: { label: "Suspended", variant: "outline" },
};

// Role sorting order (for table sorting)
export const ROLE_ORDER: ProjectRoles[] = [
	"supervising",
	"research",
	"technical",
	"externalcol",
	"externalpeer",
	"academicsuper",
	"student",
	"consulted",
	"group",
];

// Kind sorting order (for table sorting)
export const KIND_ORDER: ProjectKind[] = [
	"science",
	"student",
	"core_function",
	"external",
];

// Status sorting order (for table sorting)
export const STATUS_ORDER: ProjectStatus[] = [
	"final_update",
	"updating",
	"active",
	"pending",
	"new",
	"closure_requested",
	"closing",
	"suspended",
	"completed",
	"terminated",
];

// Inactive project statuses (for filtering)
export const INACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
	"completed",
	"terminated",
	"suspended",
];
