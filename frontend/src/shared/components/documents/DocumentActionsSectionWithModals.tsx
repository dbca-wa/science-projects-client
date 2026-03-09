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
} from "@/features/projects/hooks/useDocumentAction";
import {
	useDownloadPdf,
	useGeneratePdf,
} from "@/features/projects/hooks/usePdfOperations";
import { getCurrentApprovalStage } from "@/features/projects/utils/authors/approval.utils";

interface DocumentActionsSectionWithModalsProps {
	document: IMainDoc;
	project: IProjectData;
	members: IProjectMember[] | null;
	documentType: DocumentType;
	canDelete: boolean;
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
	onCreateProgressReport?: () => void;
	onSetAreas?: () => void;
	onReopenProject?: () => void;

	creator?: IUserData | null;
}

type DocumentAction = "submit" | "approve" | "recall" | "send_back" | "reopen";

export function DocumentActionsSectionWithModals({
	document,
	project,
	members,
	documentType,
	canDelete,
	userIsCaretakerOfAdmin,
	userIsCaretakerOfBaLeader,
	userIsCaretakerOfProjectLeader,
	all_documents,
	documents,
	setToLastTab,
	isBaLead,
	onCreateProgressReport,
	onSetAreas,
	onReopenProject,
}: DocumentActionsSectionWithModalsProps) {
	const navigate = useNavigate();

	// Modal state
	const [actionModalOpen, setActionModalOpen] = useState(false);
	const [currentAction, setCurrentAction] = useState<DocumentAction | null>(
		null
	);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);

	// Mutations
	const documentActionMutation = useDocumentAction(documentType, project.id);
	const deleteDocumentMutation = useDeleteDocument(documentType, project.id);
	const downloadPdfMutation = useDownloadPdf();
	const generatePdfMutation = useGeneratePdf();

	// Action handlers
	const handleSubmit = () => {
		setCurrentAction("submit");
		setActionModalOpen(true);
	};

	const handleApprove = () => {
		setCurrentAction("approve");
		setActionModalOpen(true);
	};

	const handleRecall = () => {
		setCurrentAction("recall");
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
		});
	};

	// Modal submit handlers
	const handleActionSubmit = (data: {
		comment?: string;
		reason?: string;
		sendEmail: boolean;
	}) => {
		if (!currentAction) return;

		documentActionMutation.mutate(
			{
				documentId: document.id,
				data: {
					action: currentAction,
					comment: data.comment,
					reason: data.reason,
					send_email: data.sendEmail,
				},
			},
			{
				onSuccess: () => {
					setActionModalOpen(false);
					setCurrentAction(null);
				},
			}
		);
	};

	const handleDeleteConfirm = async () => {
		try {
			console.log("Deleting document:", document.id);
			await deleteDocumentMutation.mutateAsync(document.id);
			console.log("Document deleted, closing modal and navigating");
			setDeleteModalOpen(false);
			// Navigate to project overview tab
			navigate(`/projects/${project.id}/overview`);
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
				/>
			)}

			{/* Delete Document Modal */}
			<DeleteDocumentModal
				isOpen={deleteModalOpen}
				onClose={() => setDeleteModalOpen(false)}
				onConfirm={handleDeleteConfirm}
				documentType={documentType}
				isDeleting={deleteDocumentMutation.isPending}
			/>
		</>
	);
}
