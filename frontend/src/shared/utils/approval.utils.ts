import type { IMainDoc } from "@/shared/types/document.types";

/**
 * Approval State Utilities
 *
 * Utilities for managing document approval workflows.
 */

/**
 * Approval stage type
 */
export type ApprovalStage =
	| "project_lead"
	| "business_area_lead"
	| "directorate"
	| "complete";

/**
 * Approval state for a document
 */
export interface ApprovalState {
	projectLead: "granted" | "required";
	businessAreaLead: "granted" | "required";
	directorate: "granted" | "required";
}

/**
 * Get approval state for a document
 *
 * Returns the approval status for each stage (project lead, business area lead, directorate).
 *
 * @param document - Document to get approval state for
 * @returns Approval state object with status for each stage
 */
export function getApprovalState(document: IMainDoc): ApprovalState {
	return {
		projectLead: document.project_lead_approval_granted
			? "granted"
			: "required",
		businessAreaLead: document.business_area_lead_approval_granted
			? "granted"
			: "required",
		directorate: document.directorate_approval_granted ? "granted" : "required",
	};
}

/**
 * Get current approval stage for a document
 *
 * Returns the first stage that hasn't been approved yet, or "complete" if all approved.
 *
 * @param document - Document to get current stage for
 * @returns Current approval stage
 */
export function getCurrentApprovalStage(document: IMainDoc): ApprovalStage {
	if (!document.project_lead_approval_granted) return "project_lead";
	if (!document.business_area_lead_approval_granted)
		return "business_area_lead";
	if (!document.directorate_approval_granted) return "directorate";
	return "complete";
}
