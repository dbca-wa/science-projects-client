import type { DocumentType } from "./document.utils";
import type {
	DocumentAction,
	ApprovalStage,
} from "../components/documents/UnifiedDocumentActionModal";

/**
 * Document Action Utility Functions
 *
 * Helper functions for generating modal content based on document actions and stages.
 */

/**
 * Format document type for display in lowercase
 */
function formatDocumentType(documentType: DocumentType): string {
	const mapping: Record<DocumentType, string> = {
		concept: "concept plan",
		projectplan: "project plan",
		progressreport: "progress report",
		studentreport: "student report",
		projectclosure: "project closure",
	};
	return mapping[documentType] || documentType;
}

/**
 * Get the title for a document action modal
 */
export function getActionTitle(
	action: DocumentAction,
	documentType: DocumentType
): string {
	const docTypeName = formatDocumentType(documentType);

	switch (action) {
		case "submit":
			return `Submit ${docTypeName} for Approval`;
		case "approve":
			return `Approve ${docTypeName}`;
		case "recall":
			return `Recall ${docTypeName} Approval`;
		case "send_back":
			return `Send ${docTypeName} Back for Revisions`;
		case "reopen":
			return `Reopen Project`;
		default:
			return "Document Action";
	}
}

/**
 * Get the description for a document action modal
 */
export function getActionDescription(
	action: DocumentAction,
	stage: ApprovalStage,
	_documentType: DocumentType
): string {
	switch (action) {
		case "submit":
			return "Submit this document for approval by the Business Area Lead.";
		case "approve":
			if (stage === "business_area_lead") {
				return "Approve this document and forward to Directorate for final approval.";
			} else if (stage === "directorate") {
				return "Provide final approval for this document. This is the last approval stage.";
			}
			return "Approve this document and move it to the next approval stage.";
		case "recall":
			return "Recall your approval and return the document to the previous stage.";
		case "send_back":
			return "Send this document back to the Project Lead for revisions.";
		case "reopen":
			return "Reopen this project by removing the project closure document.";
		default:
			return "";
	}
}

/**
 * Get the final approval description for directorate stage
 */
export function getFinalApprovalDescription(
	documentType: DocumentType
): string {
	const docTypeName = formatDocumentType(documentType);
	return `This is the final approval stage for the ${docTypeName}. Once approved, the document will be fully approved and can proceed to the next phase.`;
}

/**
 * Get the email checkbox label based on action and stage
 */
export function getEmailCheckboxLabel(
	action: DocumentAction,
	stage: ApprovalStage
): string {
	switch (action) {
		case "submit":
			return "Send email notification to Business Area Lead";
		case "approve":
			if (stage === "business_area_lead") {
				return "Send email notification to Directorate members";
			} else if (stage === "directorate") {
				return "Send email notification to Project Lead";
			}
			return "Send email notification";
		case "recall":
			return "Send email notification to Project Lead";
		case "send_back":
			return "Send email notification to Project Lead";
		case "reopen":
			return "Send email notification to team members";
		default:
			return "Send email notification";
	}
}

/**
 * Get the action button text
 */
export function getActionButtonText(action: DocumentAction): string {
	switch (action) {
		case "submit":
			return "Submit for Approval";
		case "approve":
			return "Approve";
		case "recall":
			return "Recall Approval";
		case "send_back":
			return "Send Back";
		case "reopen":
			return "Reopen Project";
		default:
			return "Confirm";
	}
}

/**
 * Get the action button colour classes
 */
export function getActionButtonColor(action: DocumentAction): string {
	switch (action) {
		case "submit":
		case "approve":
			return "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-600";
		case "recall":
			return "bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-600";
		case "send_back":
		case "reopen":
			return "bg-orange-600 hover:bg-orange-700 text-white focus-visible:ring-orange-600";
		default:
			return "";
	}
}

/**
 * Get the textarea label based on action
 */
export function getTextareaLabel(action: DocumentAction): string {
	switch (action) {
		case "submit":
			return "Comment (optional)";
		case "approve":
			return "Comment (optional)";
		case "recall":
			return "Reason for recall (optional)";
		case "send_back":
			return "Reason for sending back (required)";
		case "reopen":
			return "Reason for reopening (optional)";
		default:
			return "Comment";
	}
}

/**
 * Get the textarea placeholder based on action
 */
export function getTextareaPlaceholder(action: DocumentAction): string {
	switch (action) {
		case "submit":
			return "Add any comments about this submission...";
		case "approve":
			return "Add any comments about this approval...";
		case "recall":
			return "Explain why you are recalling this approval...";
		case "send_back":
			return "Explain what revisions are needed...";
		case "reopen":
			return "Explain why you are reopening this project...";
		default:
			return "";
	}
}

/**
 * Check if action requires a reason (not optional)
 */
export function isReasonRequired(action: DocumentAction): boolean {
	return action === "send_back";
}

/**
 * Check if action should show final approval info
 */
export function shouldShowFinalApprovalInfo(
	action: DocumentAction,
	stage: ApprovalStage
): boolean {
	return action === "approve" && stage === "directorate";
}

/**
 * Check if action should show send back warning
 */
export function shouldShowSendBackWarning(action: DocumentAction): boolean {
	return action === "send_back";
}
