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
 * Represents AEC endorsements pending action
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
}
