// Re-export all document task utilities from shared for backward compatibility
export {
	type IDocumentTaskWithLevel,
	formatProjectCode,
	getDocumentUrlPath,
	sortTasksByLevel,
	sortTasksByDocumentKind,
	combineProjectLevelTasks,
	addTaskLevelMetadata,
	getDocumentKindTitle,
	extractPlainTextTitle,
} from "@/shared/utils/document-tasks.utils";
