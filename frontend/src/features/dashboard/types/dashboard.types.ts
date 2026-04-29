// Re-export IProjectDocument from shared for backward compatibility
export type { IProjectDocument } from "@/shared/types/document.types";
import type { IProjectDocument } from "@/shared/types/document.types";

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Response from /documents/projectdocuments/pendingmyaction endpoint
 * Contains categorised document tasks requiring user action
 */
export interface DocumentTasksResponse {
	all: IProjectDocument[];
	team: IProjectDocument[];
	lead: IProjectDocument[];
	ba: IProjectDocument[];
	directorate: IProjectDocument[];
}

/**
 * Response from /documents/endorsements/pendingmyaction endpoint
 * Contains categorised endorsement tasks requiring user approval
 */
export interface EndorsementTasksResponse {
	aec: IEndorsement[];
	bm: IEndorsement[];
	hc: IEndorsement[];
}

// ============================================================================
// DOCUMENT & ENDORSEMENT TYPES
// ============================================================================

/**
 * Endorsement task requiring user approval
 * Represents AEC, Biometrician, or Herbarium Curator endorsements
 */
export interface IEndorsement {
	id: number;
	project_plan: {
		document: {
			project: {
				id: number;
				title: string;
				kind: string;
			};
		};
	};
	ae_endorsement_required: boolean;
	ae_endorsement_provided: boolean;
	bm_endorsement_required: boolean;
	bm_endorsement_provided: boolean;
	hc_endorsement_required: boolean;
	hc_endorsement_provided: boolean;
}

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

/**
 * Props for MyTasksSection component
 * Main container for displaying all user tasks
 */
export interface MyTasksSectionProps {
	documentTasks: DocumentTasksResponse;
	documentTasksLoading: boolean;
	endorsementTasks: EndorsementTasksResponse;
	endorsementTasksLoading: boolean;
}

/**
 * Props for DocumentTaskCard component
 * Displays a single document task card
 */
export interface DocumentTaskCardProps {
	document: IProjectDocument;
	kind: "team" | "project_lead" | "ba_lead" | "directorate";
}

/**
 * Props for EndorsementTaskCard component
 * Displays a single endorsement task card
 */
export interface EndorsementTaskCardProps {
	endorsement: IEndorsement;
	kind: "aec" | "bm" | "hc";
}

/**
 * Props for SectionDivider component
 * Displays a horizontal divider with centered heading
 */
export interface SectionDividerProps {
	title: string;
}
