import type { IProjectDocument } from "../types/dashboard.types";
import {
	DOCUMENT_KIND_CONFIG,
	PROJECT_KIND_CONFIG,
	TASK_LEVEL_CONFIG,
	TASK_LEVEL_ORDER,
	type DocumentKind,
	type ProjectKind,
	type TaskLevel,
} from "../constants/document-tasks.constants";

export interface IDocumentTaskWithLevel extends IProjectDocument {
	taskLevel: TaskLevel;
	projectCode: string;
	taskDescription: string;
}

/**
 * Format project code from project data
 * @param project Project data with kind, year, and number
 * @returns Formatted project code (e.g., "SP-2024-001")
 */
export const formatProjectCode = (project: {
	kind: string;
	year?: number;
	number?: number;
}): string => {
	const kindConfig = PROJECT_KIND_CONFIG[project.kind as ProjectKind];
	if (!kindConfig) {
		return "UNKNOWN";
	}

	const year = project.year || new Date().getFullYear();
	const number = project.number || 0;

	return `${kindConfig.tag}-${year}-${String(number).padStart(3, "0")}`;
};

/**
 * Get document URL path from document kind
 * @param kind Document kind
 * @returns URL path segment for navigation
 */
export const getDocumentUrlPath = (kind: DocumentKind): string => {
	return DOCUMENT_KIND_CONFIG[kind]?.urlPath || "concept";
};

/**
 * Get task level configuration
 * @param level Task level
 * @returns Task level configuration object
 */
export const getTaskLevelConfig = (level: TaskLevel) => {
	return TASK_LEVEL_CONFIG[level];
};

/**
 * Sort tasks by task level (team → lead → ba → directorate)
 * @param tasks Array of document tasks with levels
 * @returns Sorted array
 */
export const sortTasksByLevel = (
	tasks: IDocumentTaskWithLevel[]
): IDocumentTaskWithLevel[] => {
	return [...tasks].sort((a, b) => {
		const indexA = TASK_LEVEL_ORDER.indexOf(a.taskLevel);
		const indexB = TASK_LEVEL_ORDER.indexOf(b.taskLevel);
		return indexA - indexB;
	});
};

/**
 * Sort tasks by document kind (concept → projectplan → progressreport → studentreport → projectclosure)
 * @param tasks Array of document tasks
 * @returns Sorted array
 */
export const sortTasksByDocumentKind = <T extends { kind: DocumentKind }>(
	tasks: T[]
): T[] => {
	return [...tasks].sort((a, b) => {
		const orderA = DOCUMENT_KIND_CONFIG[a.kind]?.order ?? 999;
		const orderB = DOCUMENT_KIND_CONFIG[b.kind]?.order ?? 999;
		return orderA - orderB;
	});
};

/**
 * Combine team and lead tasks into project level tasks
 * @param teamTasks Tasks where user is team member
 * @param leadTasks Tasks where user is project lead
 * @returns Combined array with task levels assigned
 */
export const combineProjectLevelTasks = (
	teamTasks: IProjectDocument[],
	leadTasks: IProjectDocument[]
): IDocumentTaskWithLevel[] => {
	const teamWithLevel: IDocumentTaskWithLevel[] = teamTasks.map((task) => ({
		...task,
		taskLevel: "team" as const,
		projectCode: formatProjectCode(task.project),
		taskDescription: TASK_LEVEL_CONFIG.team.description,
	}));

	const leadWithLevel: IDocumentTaskWithLevel[] = leadTasks.map((task) => ({
		...task,
		taskLevel: "lead" as const,
		projectCode: formatProjectCode(task.project),
		taskDescription: TASK_LEVEL_CONFIG.lead.description,
	}));

	return [...teamWithLevel, ...leadWithLevel];
};

/**
 * Add task level metadata to document tasks
 * @param tasks Array of document tasks
 * @param level Task level to assign
 * @returns Tasks with level metadata
 */
export const addTaskLevelMetadata = (
	tasks: IProjectDocument[],
	level: TaskLevel
): IDocumentTaskWithLevel[] => {
	return tasks.map((task) => ({
		...task,
		taskLevel: level,
		projectCode: formatProjectCode(task.project),
		taskDescription: TASK_LEVEL_CONFIG[level].description,
	}));
};

/**
 * Get document kind display title
 * @param kind Document kind
 * @returns Display title
 */
export const getDocumentKindTitle = (kind: DocumentKind): string => {
	return DOCUMENT_KIND_CONFIG[kind]?.title || "Unknown Document";
};

/**
 * Extract HTML title from rich text
 * @param htmlTitle HTML string containing title
 * @returns Plain text title
 */
export const extractPlainTextTitle = (htmlTitle: string): string => {
	const wrapper = document.createElement("div");
	wrapper.innerHTML = htmlTitle;
	const tag = wrapper.querySelector("p, span, h1, h2, h3, h4");
	if (tag) {
		return tag.textContent || htmlTitle;
	}
	return wrapper.textContent || htmlTitle;
};
