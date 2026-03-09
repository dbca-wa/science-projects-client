import { describe, it, expect } from "vitest";
import {
	getActionTitle,
	getActionDescription,
	getFinalApprovalDescription,
	getEmailCheckboxLabel,
	getActionButtonText,
	getActionButtonColor,
	getTextareaLabel,
	getTextareaPlaceholder,
	isReasonRequired,
	shouldShowFinalApprovalInfo,
	shouldShowSendBackWarning,
} from "./document-action.utils";
import type {
	DocumentAction,
	ApprovalStage as _ApprovalStage,
} from "../components/documents/UnifiedDocumentActionModal";
import type { DocumentType as _DocumentType } from "./document.utils";

describe("document-action.utils", () => {
	describe("getActionTitle", () => {
		it("should return correct title for submit action", () => {
			expect(getActionTitle("submit", "concept")).toBe(
				"Submit concept plan for Approval"
			);
			expect(getActionTitle("submit", "projectplan")).toBe(
				"Submit project plan for Approval"
			);
		});

		it("should return correct title for approve action", () => {
			expect(getActionTitle("approve", "concept")).toBe("Approve concept plan");
		});

		it("should return correct title for recall action", () => {
			expect(getActionTitle("recall", "progressreport")).toBe(
				"Recall progress report Approval"
			);
		});

		it("should return correct title for send_back action", () => {
			expect(getActionTitle("send_back", "studentreport")).toBe(
				"Send student report Back for Revisions"
			);
		});

		it("should return correct title for reopen action", () => {
			expect(getActionTitle("reopen", "projectclosure")).toBe("Reopen Project");
		});

		it("should return default title for unknown action", () => {
			expect(getActionTitle("unknown" as DocumentAction, "concept")).toBe(
				"Document Action"
			);
		});
	});

	describe("getActionDescription", () => {
		it("should return correct description for submit action", () => {
			expect(getActionDescription("submit", "project_lead", "concept")).toBe(
				"Submit this document for approval by the Business Area Lead."
			);
		});

		it("should return correct description for approve at business_area_lead stage", () => {
			expect(
				getActionDescription("approve", "business_area_lead", "concept")
			).toBe(
				"Approve this document and forward to Directorate for final approval."
			);
		});

		it("should return correct description for approve at directorate stage", () => {
			expect(getActionDescription("approve", "directorate", "concept")).toBe(
				"Provide final approval for this document. This is the last approval stage."
			);
		});

		it("should return correct description for approve at other stages", () => {
			expect(getActionDescription("approve", "project_lead", "concept")).toBe(
				"Approve this document and move it to the next approval stage."
			);
		});

		it("should return correct description for recall action", () => {
			expect(getActionDescription("recall", "project_lead", "concept")).toBe(
				"Recall your approval and return the document to the previous stage."
			);
		});

		it("should return correct description for send_back action", () => {
			expect(getActionDescription("send_back", "project_lead", "concept")).toBe(
				"Send this document back to the Project Lead for revisions."
			);
		});

		it("should return correct description for reopen action", () => {
			expect(
				getActionDescription("reopen", "project_lead", "projectclosure")
			).toBe("Reopen this project by removing the project closure document.");
		});

		it("should return empty string for unknown action", () => {
			expect(
				getActionDescription(
					"unknown" as DocumentAction,
					"project_lead",
					"concept"
				)
			).toBe("");
		});
	});

	describe("getFinalApprovalDescription", () => {
		it("should return correct description for concept_plan", () => {
			expect(getFinalApprovalDescription("concept")).toBe(
				"This is the final approval stage for the concept plan. Once approved, the document will be fully approved and can proceed to the next phase."
			);
		});

		it("should return correct description for project_plan", () => {
			expect(getFinalApprovalDescription("projectplan")).toBe(
				"This is the final approval stage for the project plan. Once approved, the document will be fully approved and can proceed to the next phase."
			);
		});

		it("should handle underscores in document type", () => {
			expect(getFinalApprovalDescription("progressreport")).toBe(
				"This is the final approval stage for the progress report. Once approved, the document will be fully approved and can proceed to the next phase."
			);
		});
	});

	describe("getEmailCheckboxLabel", () => {
		it("should return correct label for submit action", () => {
			expect(getEmailCheckboxLabel("submit", "project_lead")).toBe(
				"Send email notification to Business Area Lead"
			);
		});

		it("should return correct label for approve at business_area_lead stage", () => {
			expect(getEmailCheckboxLabel("approve", "business_area_lead")).toBe(
				"Send email notification to Directorate members"
			);
		});

		it("should return correct label for approve at directorate stage", () => {
			expect(getEmailCheckboxLabel("approve", "directorate")).toBe(
				"Send email notification to Project Lead"
			);
		});

		it("should return correct label for approve at other stages", () => {
			expect(getEmailCheckboxLabel("approve", "project_lead")).toBe(
				"Send email notification"
			);
		});

		it("should return correct label for recall action", () => {
			expect(getEmailCheckboxLabel("recall", "project_lead")).toBe(
				"Send email notification to Project Lead"
			);
		});

		it("should return correct label for send_back action", () => {
			expect(getEmailCheckboxLabel("send_back", "project_lead")).toBe(
				"Send email notification to Project Lead"
			);
		});

		it("should return correct label for reopen action", () => {
			expect(getEmailCheckboxLabel("reopen", "project_lead")).toBe(
				"Send email notification to team members"
			);
		});

		it("should return default label for unknown action", () => {
			expect(
				getEmailCheckboxLabel("unknown" as DocumentAction, "project_lead")
			).toBe("Send email notification");
		});
	});

	describe("getActionButtonText", () => {
		it("should return correct text for submit action", () => {
			expect(getActionButtonText("submit")).toBe("Submit for Approval");
		});

		it("should return correct text for approve action", () => {
			expect(getActionButtonText("approve")).toBe("Approve");
		});

		it("should return correct text for recall action", () => {
			expect(getActionButtonText("recall")).toBe("Recall Approval");
		});

		it("should return correct text for send_back action", () => {
			expect(getActionButtonText("send_back")).toBe("Send Back");
		});

		it("should return correct text for reopen action", () => {
			expect(getActionButtonText("reopen")).toBe("Reopen Project");
		});

		it("should return default text for unknown action", () => {
			expect(getActionButtonText("unknown" as DocumentAction)).toBe("Confirm");
		});
	});

	describe("getActionButtonColor", () => {
		it("should return green colour for submit action", () => {
			expect(getActionButtonColor("submit")).toBe(
				"bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-600"
			);
		});

		it("should return green colour for approve action", () => {
			expect(getActionButtonColor("approve")).toBe(
				"bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-600"
			);
		});

		it("should return blue colour for recall action", () => {
			expect(getActionButtonColor("recall")).toBe(
				"bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-600"
			);
		});

		it("should return orange colour for send_back action", () => {
			expect(getActionButtonColor("send_back")).toBe(
				"bg-orange-600 hover:bg-orange-700 text-white focus-visible:ring-orange-600"
			);
		});

		it("should return orange colour for reopen action", () => {
			expect(getActionButtonColor("reopen")).toBe(
				"bg-orange-600 hover:bg-orange-700 text-white focus-visible:ring-orange-600"
			);
		});

		it("should return empty string for unknown action", () => {
			expect(getActionButtonColor("unknown" as DocumentAction)).toBe("");
		});
	});

	describe("getTextareaLabel", () => {
		it("should return correct label for submit action", () => {
			expect(getTextareaLabel("submit")).toBe("Comment (optional)");
		});

		it("should return correct label for approve action", () => {
			expect(getTextareaLabel("approve")).toBe("Comment (optional)");
		});

		it("should return correct label for recall action", () => {
			expect(getTextareaLabel("recall")).toBe("Reason for recall (optional)");
		});

		it("should return correct label for send_back action", () => {
			expect(getTextareaLabel("send_back")).toBe(
				"Reason for sending back (required)"
			);
		});

		it("should return correct label for reopen action", () => {
			expect(getTextareaLabel("reopen")).toBe(
				"Reason for reopening (optional)"
			);
		});

		it("should return default label for unknown action", () => {
			expect(getTextareaLabel("unknown" as DocumentAction)).toBe("Comment");
		});
	});

	describe("getTextareaPlaceholder", () => {
		it("should return correct placeholder for submit action", () => {
			expect(getTextareaPlaceholder("submit")).toBe(
				"Add any comments about this submission..."
			);
		});

		it("should return correct placeholder for approve action", () => {
			expect(getTextareaPlaceholder("approve")).toBe(
				"Add any comments about this approval..."
			);
		});

		it("should return correct placeholder for recall action", () => {
			expect(getTextareaPlaceholder("recall")).toBe(
				"Explain why you are recalling this approval..."
			);
		});

		it("should return correct placeholder for send_back action", () => {
			expect(getTextareaPlaceholder("send_back")).toBe(
				"Explain what revisions are needed..."
			);
		});

		it("should return correct placeholder for reopen action", () => {
			expect(getTextareaPlaceholder("reopen")).toBe(
				"Explain why you are reopening this project..."
			);
		});

		it("should return empty string for unknown action", () => {
			expect(getTextareaPlaceholder("unknown" as DocumentAction)).toBe("");
		});
	});

	describe("isReasonRequired", () => {
		it("should return true for send_back action", () => {
			expect(isReasonRequired("send_back")).toBe(true);
		});

		it("should return false for submit action", () => {
			expect(isReasonRequired("submit")).toBe(false);
		});

		it("should return false for approve action", () => {
			expect(isReasonRequired("approve")).toBe(false);
		});

		it("should return false for recall action", () => {
			expect(isReasonRequired("recall")).toBe(false);
		});

		it("should return false for reopen action", () => {
			expect(isReasonRequired("reopen")).toBe(false);
		});
	});

	describe("shouldShowFinalApprovalInfo", () => {
		it("should return true for approve action at directorate stage", () => {
			expect(shouldShowFinalApprovalInfo("approve", "directorate")).toBe(true);
		});

		it("should return false for approve action at business_area_lead stage", () => {
			expect(shouldShowFinalApprovalInfo("approve", "business_area_lead")).toBe(
				false
			);
		});

		it("should return false for approve action at project_lead stage", () => {
			expect(shouldShowFinalApprovalInfo("approve", "project_lead")).toBe(
				false
			);
		});

		it("should return false for submit action at directorate stage", () => {
			expect(shouldShowFinalApprovalInfo("submit", "directorate")).toBe(false);
		});

		it("should return false for recall action at directorate stage", () => {
			expect(shouldShowFinalApprovalInfo("recall", "directorate")).toBe(false);
		});
	});

	describe("shouldShowSendBackWarning", () => {
		it("should return true for send_back action", () => {
			expect(shouldShowSendBackWarning("send_back")).toBe(true);
		});

		it("should return false for submit action", () => {
			expect(shouldShowSendBackWarning("submit")).toBe(false);
		});

		it("should return false for approve action", () => {
			expect(shouldShowSendBackWarning("approve")).toBe(false);
		});

		it("should return false for recall action", () => {
			expect(shouldShowSendBackWarning("recall")).toBe(false);
		});

		it("should return false for reopen action", () => {
			expect(shouldShowSendBackWarning("reopen")).toBe(false);
		});
	});
});
