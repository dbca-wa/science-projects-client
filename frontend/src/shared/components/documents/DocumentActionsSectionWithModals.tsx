import { useState } from "react";
import { useNavigate } from "react-router";
import { DocumentActionsSection } from "./DocumentActionsSection";
import { UnifiedDocumentActionModal } from "./UnifiedDocumentActionModal";
import { DeleteDocumentModal } from "./DeleteDocumentModal";
import type { IMainDoc } from "@/shared/types/document.types";
import type {
	IProjectData,
	IProjectMember,
	IProjectDocuments,
} from "@/shared/types/project.types";
import type { IUserData } from "@/shared/types/user.types";
import type { DocumentType } from "@/shared/utils/document.utils";
import {
	useDocumentAction,
	useDeleteDocument,
} from "@/shared/hooks/useDocumentAction";
import {
	useDownloadPdf,
	useGeneratePdf,
} from "@/shared/hooks/usePdfOperations";
import { getCurrentApprovalStage } from "@/shared/utils/approval.utils";

/**
 * Determine which tab to navigate to after deleting a document.
 * Navigates to the previous document in the lifecycle that still exists,
 * falling back to overview if nothing else is available.
 */
const getPostDeleteTab = (
	deletedDocumentType: DocumentType,
	allDocuments?: IProjectDocuments
): string => {
	// Tab priority order (reverse lifecycle): closure → student → progress → project → concept → overview
	// After deleting a document, go to the previous one that exists.
	switch (deletedDocumentType) {
		case "concept":
			return "overview";
		case "projectplan":
			if (allDocuments?.concept_plan) return "concept";
			return "overview";
		case "progressreport":
			// Check if other progress reports still exist (we're deleting one, so check count > 1)
			if (
				allDocuments?.progress_reports &&
				allDocuments.progress_reports.length > 1
			)
				return "progress";
			if (allDocuments?.project_plan) return "project";
			if (allDocuments?.concept_plan) return "concept";
			return "overview";
		case "studentreport":
			if (
				allDocuments?.student_reports &&
				allDocuments.student_reports.length > 1
			)
				return "student";
			if (
				allDocuments?.progress_reports &&
				allDocuments.progress_reports.length > 0
			)
				return "progress";
			if (allDocuments?.project_plan) return "project";
			if (allDocuments?.concept_plan) return "concept";
			return "overview";
		case "projectclosure":
			if (
				allDocuments?.student_reports &&
				allDocuments.student_reports.length > 0
			)
				return "student";
			if (
				allDocuments?.progress_reports &&
				allDocuments.progress_reports.length > 0
			)
				return "progress";
			if (allDocuments?.project_plan) return "project";
			if (allDocuments?.concept_plan) return "concept";
			return "overview";
		default:
			return "overview";
	}
};

interface DocumentActionsSectionWithModalsProps {
	document: IMainDoc;
	project: IProjectData;
	members: IProjectMember[] | null;
	documentType: DocumentType;
	canDelete: boolean;
	locked?: boolean;
	// Caretaker permissions
	userIsCaretakerOfAdmin?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	userIsCaretakerOfProjectLeader?: boolean;
	// Additional props for special actions
	all_documents?: IProjectDocuments;
	documents?: IMainDoc[];
	setToLastTab?: (tabToGoTo?: number) => void;
	isBaLead?: boolean;
	// Special action callbacks (passed through from parent)
	onCreateConceptPlan?: () => void;
	onCreateProgressReport?: () => void;
	onSetAreas?: () => void;
	onReopenProject?: () => void;

	creator?: IUserData | null;
}

type DocumentAction = "approve" | "recall" | "send_back" | "reopen";

export const DocumentActionsSectionWithModals = ({
	document,
	project,
	members,
	documentType,
	canDelete,
	locked = false,
	userIsCaretakerOfAdmin,
	userIsCaretakerOfBaLeader,
	userIsCaretakerOfProjectLeader,
	all_documents,
	documents,
	setToLastTab,
	isBaLead,
	onCreateConceptPlan,
	onCreateProgressReport,
	onSetAreas,
	onReopenProject,
}: DocumentActionsSectionWithModalsProps) => {
	const navigate = useNavigate();

	// Modal state
	const [actionModalOpen, setActionModalOpen] = useState(false);
	const [currentAction, setCurrentAction] = useState<DocumentAction | null>(
		null
	);
	const [recallStage, setRecallStage] = useState<number | null>(null);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);
	const [isActionSuccess, setIsActionSuccess] = useState(false);

	// Mutations
	const documentActionMutation = useDocumentAction(documentType, project.id);
	const deleteDocumentMutation = useDeleteDocument(documentType, project.id);
	const downloadPdfMutation = useDownloadPdf();
	const generatePdfMutation = useGeneratePdf();

	// Action handlers
	const handleSubmit = () => {
		setCurrentAction("approve");
		setActionModalOpen(true);
	};

	const handleApprove = () => {
		setCurrentAction("approve");
		setActionModalOpen(true);
	};

	const handleRecall = (stage: number) => {
		setCurrentAction("recall");
		setRecallStage(stage);
		setActionModalOpen(true);
	};

	const handleSendBack = () => {
		setCurrentAction("send_back");
		setActionModalOpen(true);
	};

	const handleDelete = () => {
		setDeleteModalOpen(true);
	};

	const handleDownloadPdf = () => {
		if (document.pdf?.file) {
			// Extract filename from path (e.g., "pdfs/1120_concept_3216.pdf" -> "1120_concept_3216.pdf")
			const filename =
				document.pdf.file.split("/").pop() ||
				`${project.id}_${document.kind}_${document.id}.pdf`;
			downloadPdfMutation.mutate({
				documentType,
				documentId: document.id,
				filename,
			});
		}
	};

	const handleGeneratePdf = () => {
		// Construct filename: {project_pk}_{kind}_{document_pk}.pdf
		const filename = `${project.id}_${document.kind}_${document.id}.pdf`;
		generatePdfMutation.mutate({
			documentType,
			documentId: document.id,
			filename,
			projectId: project.id,
		});
	};

	// Stage mapping: approval stage string → backend stage number
	const STAGE_MAP: Record<string, number> = {
		project_lead: 1,
		business_area_lead: 2,
		directorate: 3,
		complete: 3, // Recall from "complete" = directorate recalling their approval
	};

	// Modal submit handlers
	const handleActionSubmit = (data: {
		comment?: string;
		reason?: string;
		sendEmail: boolean;
		feedbackHTML?: string;
	}) => {
		if (!currentAction) return;

		// For recall, use the explicit stage from the button that was clicked.
		// For other actions, derive from the current approval state.
		const currentStage = getCurrentApprovalStage(document);
		const stage =
			currentAction === "recall" && recallStage != null
				? recallStage
				: (STAGE_MAP[currentStage] ?? 1);

		documentActionMutation.mutate(
			{
				documentId: document.id,
				data: {
					action: currentAction,
					stage,
					documentPk: document.id,
					reason: data.reason,
					feedbackHTML: data.feedbackHTML,
					send_email: data.sendEmail,
				},
			},
			{
				onSuccess: () => {
					// Show success animation if email was sent
					if (data.sendEmail) {
						setIsActionSuccess(true);
						setTimeout(() => {
							setIsActionSuccess(false);
							setActionModalOpen(false);
							setCurrentAction(null);
							setRecallStage(null);
						}, 1500);
					} else {
						setActionModalOpen(false);
						setCurrentAction(null);
						setRecallStage(null);
					}
				},
			}
		);
	};

	const handleDeleteConfirm = async () => {
		try {
			await deleteDocumentMutation.mutateAsync(document.id);

			// Show success animation in the modal
			setIsDeleteSuccess(true);

			// Wait for the animation to play, then close and navigate
			await new Promise((resolve) => setTimeout(resolve, 1500));

			setDeleteModalOpen(false);
			setIsDeleteSuccess(false);

			// Navigate to the previous available document tab after deletion
			const fallbackTab = getPostDeleteTab(documentType, all_documents);
			navigate(`/projects/${project.id}/${fallbackTab}`);
		} catch (error) {
			console.error("Delete document error:", error);
			// Error toast is handled by the mutation
		}
	};

	return (
		<>
			<DocumentActionsSection
				document={document}
				project={project}
				members={members}
				documentType={documentType}
				canDelete={canDelete}
				locked={locked}
				userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
				userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
				userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
				all_documents={all_documents}
				projectAreas={
					project.areas
						? {
								id: 0,
								project: project.id,
								areas: project.areas,
								created_at: new Date(),
								updated_at: new Date(),
							}
						: undefined
				}
				documents={documents}
				setToLastTab={setToLastTab}
				isBaLead={isBaLead}
				onSubmit={handleSubmit}
				onApprove={handleApprove}
				onRecall={handleRecall}
				onSendBack={handleSendBack}
				onDownloadPdf={handleDownloadPdf}
				onGeneratePdf={handleGeneratePdf}
				onDelete={handleDelete}
				onCreateConceptPlan={onCreateConceptPlan}
				onCreateProgressReport={onCreateProgressReport}
				onSetAreas={onSetAreas}
				onReopenProject={onReopenProject}
			/>

			{/* Unified Document Action Modal */}
			{currentAction && (
				<UnifiedDocumentActionModal
					isOpen={actionModalOpen}
					onClose={() => {
						setActionModalOpen(false);
						setCurrentAction(null);
					}}
					onSubmit={handleActionSubmit}
					action={currentAction}
					currentStage={getCurrentApprovalStage(document)}
					documentType={documentType}
					document={document}
					project={project}
					isSubmitting={documentActionMutation.isPending}
					isSuccess={isActionSuccess}
				/>
			)}

			{/* Delete Document Modal */}
			<DeleteDocumentModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				documentType={documentType}
				isDeleting={deleteDocumentMutation.isPending}
				isDeleteSuccess={isDeleteSuccess}
			/>
		</>
	);
};
