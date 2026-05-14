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
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { AlertTriangle, Info, Mail } from "lucide-react";
import { FormRichTextEditor } from "../editor/FormRichTextEditor";
import { useActionRecipients } from "@/shared/hooks/queries/useActionRecipients";
import { useCurrentUser } from "@/features/auth";
import { SuccessAnimation } from "../SuccessAnimation";
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
type ApprovalStage =
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

/**
 * Map approval stage string to numeric stage for the API.
 * For recall on fully-approved documents, treat as stage 3 (directorate).
 */
function getNumericStage(stage: ApprovalStage, action?: string): number | null {
	if (stage === "complete") {
		// Fully approved — recall means directorate is recalling (stage 3)
		if (action === "recall") return 3;
		return null;
	}
	const stageMap: Record<string, number | null> = {
		project_lead: 1,
		business_area_lead: 2,
		directorate: 3,
	};
	return stageMap[stage] ?? null;
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
	isSuccess?: boolean;
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
	document: doc,
	project: _project,
	currentStage,
	onSubmit,
	isSubmitting = false,
	isSuccess = false,
}: UnifiedDocumentActionModalProps) => {
	const [showEmailCheckbox] = useState(true);
	const [feedbackHTML, setFeedbackHTML] = useState("");

	// Current user — needed to determine if email checkbox can be toggled
	const { data: currentUser } = useCurrentUser();
	const canToggleEmail =
		currentUser?.is_superuser === true ||
		currentStage === "directorate" ||
		currentStage === "complete";

	// Fetch recipients for actions that send emails (not "reopen")
	const numericStage = getNumericStage(currentStage, action);
	const shouldFetchRecipients = action !== "reopen" && !!numericStage;
	const {
		data: recipientsData,
		isLoading: recipientsLoading,
		isError: recipientsError,
	} = useActionRecipients(
		shouldFetchRecipients ? doc.id : null,
		shouldFetchRecipients ? action : null,
		shouldFetchRecipients ? numericStage : null
	);

	const { handleSubmit, watch, setValue, reset } = useForm<FormData>({
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
		// Use actual recipient names when available
		if (recipientsData?.recipients && recipientsData.recipients.length > 0) {
			const names = recipientsData.recipients
				.map((r) => `${r.name} (${r.email})`)
				.join(", ");
			return `Send email notification to ${names}`;
		}

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

		// All actions use the rich text editor for comments/feedback
		formData.comment = feedbackHTML || "";
		formData.feedbackHTML = feedbackHTML || "";

		// For recall and send_back, also set reason
		if (action === "recall" || action === "send_back") {
			formData.reason = feedbackHTML || "";
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
		<Dialog
			open={isOpen}
			onOpenChange={isSubmitting || isSuccess ? () => {} : handleClose}
		>
			<DialogContent className="sm:max-w-2xl">
				{isSuccess ? (
					<SuccessAnimation
						title={
							action === "approve"
								? "Approved"
								: action === "recall"
									? "Recalled"
									: action === "send_back"
										? "Sent back"
										: "Submitted"
						}
						subtitle="Email notification sent successfully."
						duration={1500}
					/>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>{getModalTitle()}</DialogTitle>
							<DialogDescription>{getModalDescription()}</DialogDescription>
						</DialogHeader>

						<form
							onSubmit={handleSubmit(handleFormSubmit)}
							className="space-y-6"
						>
							{/* Final Approval Info */}
							{showFinalApprovalInfo && (
								<Alert>
									<Info className="h-4 w-4" />
									<AlertDescription>
										This is the final approval stage. Once approved, the
										document will be fully approved and can proceed to the next
										phase.
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

							{/* Rich text editor for all actions */}
							<FormRichTextEditor
								label={getTextareaLabel()}
								value={feedbackHTML}
								onChange={setFeedbackHTML}
								toolbar="simple"
								placeholder={getTextareaPlaceholder()}
								wordLimit={2000}
							/>

							{/* Recipient Display */}
							{shouldFetchRecipients && (
								<div className="space-y-2">
									{recipientsLoading && (
										<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-48" />
										</div>
									)}

									{recipientsError && (
										<Alert>
											<Info className="h-4 w-4" />
											<AlertDescription>
												Unable to load recipients. You may still proceed.
											</AlertDescription>
										</Alert>
									)}

									{recipientsData?.warning && (
										<Alert variant="destructive">
											<AlertTriangle className="h-4 w-4" />
											<AlertDescription>
												{recipientsData.warning}
											</AlertDescription>
										</Alert>
									)}

									{recipientsData?.recipients &&
										recipientsData.recipients.length > 0 && (
											<div className="rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4">
												<div className="flex items-center gap-2 mb-3">
													<Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
													<p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
														{recipientsData.role_label}
													</p>
												</div>
												<div className="space-y-2">
													{recipientsData.recipients.map((r, i) => (
														<div
															key={i}
															className="flex items-center gap-2 rounded-md bg-white dark:bg-gray-800/60 px-3 py-2 border border-gray-100 dark:border-gray-700/50"
														>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
																	{r.name}
																</p>
																<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
																	{r.email}
																</p>
															</div>
															{r.role && (
																<span className="shrink-0 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
																	{r.role}
																</span>
															)}
														</div>
													))}
												</div>
											</div>
										)}
								</div>
							)}

							{/* Email Notification Checkbox */}
							{showEmailCheckbox && (
								<div className="flex items-center space-x-2">
									<Checkbox
										id="sendEmail"
										checked={sendEmail}
										disabled={!canToggleEmail}
										onCheckedChange={(checked) =>
											setValue("sendEmail", checked as boolean)
										}
									/>
									<Label
										htmlFor="sendEmail"
										className={`text-sm font-normal ${canToggleEmail ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
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
									disabled={isSubmitting || !!recipientsData?.warning}
								>
									{isSubmitting ? "Processing..." : getActionButtonText()}
								</Button>
							</DialogFooter>
						</form>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
