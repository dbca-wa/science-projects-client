/**
 * Document Utilities
 *
 * Utilities for working with project documents.
 */

/**
 * Document type enum for type safety
 *
 * Note: These match the backend API format (compact, no underscores)
 */
export type DocumentType =
	| "concept"
	| "projectplan"
	| "progressreport"
	| "studentreport"
	| "projectclosure";

/**
 * Document type with underscores (used in some component props)
 */
export type DocumentTypeWithUnderscores =
	| "concept_plan"
	| "project_plan"
	| "progress_report"
	| "student_report"
	| "project_closure";

/**
 * Convert underscore format to compact format
 *
 * @param type - Document type with underscores
 * @returns Document type in compact format
 */
export function toCompactDocumentType(
	type: DocumentTypeWithUnderscores
): DocumentType {
	const mapping: Record<DocumentTypeWithUnderscores, DocumentType> = {
		concept_plan: "concept",
		project_plan: "projectplan",
		progress_report: "progressreport",
		student_report: "studentreport",
		project_closure: "projectclosure",
	};
	return mapping[type];
}

/**
 * Get document type display name
 *
 * @param type - Document type from API
 * @returns Human-readable document type name
 */
export function getDocumentTypeName(type: string): string {
	const names: Record<string, string> = {
		concept: "Concept Plan",
		projectplan: "Project Plan",
		progressreport: "Progress Report",
		studentreport: "Student Report",
		projectclosure: "Project Closure",
	};
	return names[type] || type;
}

/**
 * Get document type label for ID display
 *
 * @param type - Document type from API
 * @returns Label for the type-specific ID row (e.g., "Concept Plan ID")
 */
export function getDocumentTypeIdLabel(type: string): string {
	const labels: Record<string, string> = {
		concept: "Concept Plan ID",
		projectplan: "Project Plan ID",
		progressreport: "Progress Report ID",
		studentreport: "Student Report ID",
		projectclosure: "Project Closure ID",
	};
	return labels[type] || "Document Type ID";
}

/**
 * Document status display labels
 *
 * Maps backend status values to human-readable labels.
 */
const DOCUMENT_STATUS_LABELS: Record<string, string> = {
	draft: "Draft",
	new: "New Document",
	revising: "Revising",
	inreview: "Review Requested",
	inapproval: "Approval Requested",
	approved: "Approved",
	pending_approval: "Pending Approval",
	requires_revision: "Requires Revision",
};

/**
 * Get display label for a document status
 *
 * @param status - Backend status value (e.g. "inreview", "revising")
 * @returns Human-readable status label
 */
export function getDocumentStatusLabel(status: string): string {
	return DOCUMENT_STATUS_LABELS[status] ?? status;
}

/**
 * Get URL slug for a document kind (used in navigation)
 *
 * @param kind - Document kind from API (e.g. "projectplan")
 * @returns URL-friendly slug (e.g. "project")
 */
export function getDocumentKindSlug(kind: string): string {
	const slugs: Record<string, string> = {
		concept: "concept",
		projectplan: "project",
		progressreport: "progress",
		studentreport: "student",
		projectclosure: "closure",
	};
	return slugs[kind] ?? kind;
}
