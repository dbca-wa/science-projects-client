export type TaskLevel = "team" | "lead" | "ba" | "directorate";
export type DocumentKind =
	| "concept"
	| "projectplan"
	| "progressreport"
	| "studentreport"
	| "projectclosure";
export type ProjectKind = "core_function" | "science" | "student" | "external";

interface TaskLevelConfig {
	title: string;
	description: string;
	color: string;
}

interface DocumentKindConfig {
	title: string;
	urlPath: string;
	order: number;
}

interface ProjectKindConfig {
	tag: string;
	color: string;
}

export const TASK_LEVEL_CONFIG: Record<TaskLevel, TaskLevelConfig> = {
	team: {
		title: "Team Member",
		description: "Fill in document details",
		color: "blue",
	},
	lead: {
		title: "Project Lead",
		description: "Determine if document ready for business area lead review",
		color: "green",
	},
	ba: {
		title: "Business Area Lead",
		description: "Determine if document ready for directorate review",
		color: "orange",
	},
	directorate: {
		title: "Directorate",
		description: "Determine if document should be approved",
		color: "red",
	},
};

export const DOCUMENT_KIND_CONFIG: Record<DocumentKind, DocumentKindConfig> = {
	concept: {
		title: "Concept Plan",
		urlPath: "concept",
		order: 0,
	},
	projectplan: {
		title: "Project Plan",
		urlPath: "project",
		order: 1,
	},
	progressreport: {
		title: "Progress Report",
		urlPath: "progress",
		order: 2,
	},
	studentreport: {
		title: "Student Report",
		urlPath: "student",
		order: 3,
	},
	projectclosure: {
		title: "Project Closure",
		urlPath: "closure",
		order: 4,
	},
};

export const PROJECT_KIND_CONFIG: Record<ProjectKind, ProjectKindConfig> = {
	core_function: {
		tag: "CF",
		color: "red",
	},
	science: {
		tag: "SP",
		color: "green",
	},
	student: {
		tag: "STP",
		color: "blue",
	},
	external: {
		tag: "EXT",
		color: "gray",
	},
};

export const TASK_LEVEL_ORDER: TaskLevel[] = ["team", "lead", "ba", "directorate"];
