import type { QueryKey } from "@tanstack/react-query";

/**
 * Content type identifier for inline editing
 * Format: "{document-type}-{field-name}"
 */
export type ContentType =
	// Project fields
	| "project-description"
	// External Project fields (stored in external_project_details table)
	| "external-project-description"
	| "external-project-aims"
	| "external-project-budget"
	| "external-project-collaboration-with"
	// Concept Plan fields
	| "concept-plan-background"
	| "concept-plan-aims"
	| "concept-plan-outcome"
	| "concept-plan-collaborations"
	| "concept-plan-strategic-context"
	| "concept-plan-staff-time-allocation"
	| "concept-plan-budget"
	// Project Plan fields
	| "project-plan-background"
	| "project-plan-aims"
	| "project-plan-outcome"
	| "project-plan-knowledge-transfer"
	| "project-plan-project-tasks"
	| "project-plan-listed-references"
	| "project-plan-methodology"
	| "project-plan-data-management"
	| "project-plan-specimens"
	| "project-plan-operating-budget"
	| "project-plan-operating-budget-external"
	| "project-plan-related-projects"
	// Progress Report fields
	| "progress-report-context"
	| "progress-report-aims"
	| "progress-report-progress"
	| "progress-report-implications"
	| "progress-report-future"
	// Student Report fields
	| "student-report-progress-report"
	// Project Closure fields
	| "project-closure-intended-outcome"
	| "project-closure-reason"
	| "project-closure-scientific-outputs"
	| "project-closure-knowledge-transfer"
	| "project-closure-data-location"
	| "project-closure-hardcopy-location"
	| "project-closure-backup-location"
	// Annual Report fields
	| "annual-report-dm"
	| "annual-report-dm-sign"
	| "annual-report-service-delivery-intro"
	| "annual-report-research-intro"
	| "annual-report-student-intro"
	| "annual-report-publications";

/**
 * Configuration for a content type
 */
export interface ContentTypeConfig {
	fieldName: string;
	queryKey: (entityId: number) => QueryKey;
	invalidateKeys: (entityId: number) => QueryKey[];
	updateFn: (entityId: number, content: string) => Promise<void>;
	defaultPlaceholder: string;
	defaultEmptyMessage: string;
}

/**
 * Props for InlineSaveEditor component
 */
export interface InlineSaveEditorProps {
	contentType: ContentType;
	entityId: number;
	content: string;
	placeholder?: string;
	emptyMessage?: string;
	canEdit: boolean;
	className?: string;
	editorClassName?: string;
	onSaveSuccess?: () => void;
	onSaveError?: (error: Error) => void;
	onEditStart?: () => void;
	onEditCancel?: () => void;
}

/**
 * Props for RichTextDisplay component
 */
export interface RichTextDisplayProps {
	content: string;
	emptyMessage?: string;
	className?: string;
}

/**
 * Props for RichTextEditor component
 */
export interface RichTextEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
	className?: string;
	autoFocus?: boolean;
}

/**
 * Props for EditControls component
 */
export interface EditControlsProps {
	onSave: () => void;
	onCancel: () => void;
	isSaving: boolean;
	hasChanges: boolean;
}
