import type { ProjectKind } from "@/shared/types/project.types";

export type DocumentType =
	| "concept"
	| "projectplan"
	| "progressreport"
	| "studentreport"
	| "projectclosure";

export const ALLOWED_DOCUMENT_TYPES: Record<ProjectKind, DocumentType[]> = {
	science: ["concept", "projectplan", "progressreport", "projectclosure"],
	core_function: ["concept", "projectplan", "progressreport", "projectclosure"],
	student: ["studentreport", "projectclosure"],
	external: ["projectclosure"],
} as const;

/** Kinds that follow the full workflow (concept → project plan → progress reports → closure) */
export const FULL_WORKFLOW_KINDS: ProjectKind[] = ["science", "core_function"];

/** Check if a document type is allowed for a project kind */
export const isDocumentTypeAllowed = (
	kind: ProjectKind,
	docType: DocumentType
): boolean => ALLOWED_DOCUMENT_TYPES[kind]?.includes(docType) ?? false;
