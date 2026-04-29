import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { RichTextEditor } from "../editor/RichTextEditor";
import type { IMainDoc } from "@/shared/types/document.types";
import type { IProjectData } from "@/shared/types/project.types";
import type { DocumentType } from "@/shared/utils/document.utils";

// Document action types
export type DocumentAction =
	| "submit"
	| "approve"
	| "recall"
	| "send_back"
	| "reopen";

// Approval stages
export type ApprovalStage =
	| "project_lead"
	| "business_area_lead"
	| "directorate"
	| "complete";

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

interface UnifiedDocumentActionModalProps {
	isOpen: boolean;
	onClose: () => void;
	action: DocumentAction;
	documentType: DocumentType;
	document: IMainDoc;
	project: IProjectData;
	currentStage: ApprovalStage;
	onSubmit: (data: DocumentActionFormData) => void;
	isSubmitting?: boolean;
}

// Form data interface
export interface DocumentActionFormData {
	action: DocumentAction;
	comment?: string;
	reason?: string;
	sendEmail: boolean;
	feedbackHTML?: string;
}

// Validation schema
const documentActionSchema = z.object({
	comment: z.string().optional(),
	reason: z.string().optional(),
	sendEmail: z.boolean(),
});

type FormData = z.infer<typeof documentActionSchema>;

export const UnifiedDocumentActionModal = ({
	isOpen,
	onClose,
	action,
	documentType,
	document: _document,
	project: _project,
	currentStage,
	onSubmit,
	isSubmitting = false,
}: UnifiedDocumentActionModalProps) => {
	const [showEmailCheckbox] = useState(true);
	const [feedbackHTML, setFeedbackHTML] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(documentActionSchema),
		defaultValues: {
			comment: "",
			reason: "",
			sendEmail: true,
		},
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const sendEmail = watch("sendEmail");

	// Get modal content based on action and stage
	const getModalTitle = (): string => {
		const docTypeName = formatDocumentType(documentType);

		switch (action) {
			case "submit":
				return `Submit ${docTypeName} for Approval`;
			case "approve":
				if (currentStage === "business_area_lead") {
					return `Approve ${docTypeName} (Business Area Lead)`;
				} else if (currentStage === "directorate") {
					return `Approve ${docTypeName} (Directorate)`;
				}
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
	};

	const getModalDescription = (): string => {
		switch (action) {
			case "submit":
				return "Submit this document for approval by the Business Area Lead.";
			case "approve":
				if (currentStage === "business_area_lead") {
					return "Approve this document and forward to Directorate for final approval.";
				} else if (currentStage === "directorate") {
					return "Provide final approval for this document. This is the last approval stage.";
				}
				return "Approve this document and move it to the next approval stage.";
			case "recall":
				return "Recall your approval and return the document to the previous stage.";
			case "send_back":
				if (currentStage === "directorate") {
					return "Send this document back to the Business Area Lead for revisions.";
				}
				return "Send this document back to the Project Lead for revisions.";
			case "reopen":
				return "Reopen this project by removing the project closure document.";
			default:
				return "";
		}
	};

	const getTextareaLabel = (): string => {
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
	};

	const getTextareaPlaceholder = (): string => {
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
	};

	const getEmailCheckboxLabel = (): string => {
		switch (action) {
			case "submit":
				return "Send email notification to Business Area Lead";
			case "approve":
				if (currentStage === "business_area_lead") {
					return "Send email notification to Directorate members";
				} else if (currentStage === "directorate") {
					return "Send email notification to Project Lead";
				}
				return "Send email notification";
			case "recall":
				return "Send email notification to Project Lead";
			case "send_back":
				if (currentStage === "directorate") {
					return "Send email notification to Business Area Lead";
				}
				return "Send email notification to Project Lead";
			case "reopen":
				return "Send email notification to team members";
			default:
				return "Send email notification";
		}
	};

	const getActionButtonText = (): string => {
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
	};

	const getActionButtonColor = (): string => {
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
	};

	// Show info alert for final approval
	const showFinalApprovalInfo =
		action === "approve" && currentStage === "directorate";

	// Show warning for send back
	const showSendBackWarning = action === "send_back";

	const handleFormSubmit = (data: FormData) => {
		const formData: DocumentActionFormData = {
			action,
			sendEmail: data.sendEmail,
		};

		// For recall and send_back, the rich text editor content is both the reason and the email feedback
		if (action === "recall" || action === "send_back") {
			formData.reason = feedbackHTML || "";
			formData.feedbackHTML = feedbackHTML || "";
		} else {
			formData.comment = data.comment || "";
		}

		onSubmit(formData);
		reset();
		setFeedbackHTML("");
	};

	const handleClose = () => {
		reset();
		setFeedbackHTML("");
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{getModalTitle()}</DialogTitle>
					<DialogDescription>{getModalDescription()}</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
					{/* Final Approval Info */}
					{showFinalApprovalInfo && (
						<Alert>
							<Info className="h-4 w-4" />
							<AlertDescription>
								This is the final approval stage. Once approved, the document
								will be fully approved and can proceed to the next phase.
							</AlertDescription>
						</Alert>
					)}

					{/* Send Back Warning */}
					{showSendBackWarning && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>
								{currentStage === "directorate"
									? "This will send the document back to the Business Area Lead for revisions."
									: "This will send the document back to the Project Lead for revisions. All subsequent approvals will be reset."}
							</AlertDescription>
						</Alert>
					)}

					{/* Comment/Reason field */}
					{action === "recall" || action === "send_back" ? (
						/* Rich text editor for recall and send back — serves as both reason and email feedback */
						<div className="space-y-2">
							<Label>{getTextareaLabel()}</Label>
							<div className="min-h-[120px]">
								<RichTextEditor
									value={feedbackHTML}
									onChange={setFeedbackHTML}
									toolbar="simple"
									placeholder={getTextareaPlaceholder()}
									minHeight="120px"
									wordLimit={2000}
								/>
							</div>
						</div>
					) : (
						/* Plain textarea for submit, approve, reopen */
						<div className="space-y-2">
							<Label htmlFor="comment">{getTextareaLabel()}</Label>
							<Textarea
								id="comment"
								{...register("comment")}
								placeholder={getTextareaPlaceholder()}
								rows={4}
								className="resize-none"
							/>
							{errors.comment && (
								<p className="text-sm text-destructive">
									{errors.comment.message}
								</p>
							)}
						</div>
					)}

					{/* Email Notification Checkbox */}
					{showEmailCheckbox && (
						<div className="flex items-center space-x-2">
							<Checkbox
								id="sendEmail"
								checked={sendEmail}
								onCheckedChange={(checked) =>
									setValue("sendEmail", checked as boolean)
								}
							/>
							<Label
								htmlFor="sendEmail"
								className="text-sm font-normal cursor-pointer"
							>
								{getEmailCheckboxLabel()}
							</Label>
						</div>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className={getActionButtonColor()}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Processing..." : getActionButtonText()}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
