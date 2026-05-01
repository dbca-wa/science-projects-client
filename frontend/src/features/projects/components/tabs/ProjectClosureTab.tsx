import { useState } from "react";
import type { IProjectClosure } from "@/shared/types/document.types";
import type {
	IProjectData,
	IProjectMember,
	IProjectDocuments,
} from "@/shared/types/project.types";
import type { IUserData } from "@/shared/types/user.types";
import { useCurrentUser } from "@/features/auth";
import { calculateDocumentEditPermission } from "@/features/projects/utils/permissions";
import { DocumentTabLayout } from "@/shared/components/documents";
import { InlineSaveEditor } from "@/shared/components/editor";
import { ProjectSection } from "@/shared/components/ProjectSection";
import { ReopenProjectModal } from "../modals/ReopenProjectModal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { useUpdateContent } from "@/shared/hooks/queries/useUpdateContent";
import { CommentSection } from "@/features/projects/components/comments";

interface ProjectClosureTabProps {
	projectClosure: IProjectClosure | null;
	project: IProjectData;
	members: IProjectMember[] | null;
	projectId: number;
	// New props for DocumentActionsSection
	creator?: IUserData | null;
	modifier?: IUserData | null;
	userIsCaretakerOfAdmin?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	userIsCaretakerOfProjectLeader?: boolean;
	all_documents?: IProjectDocuments;
	isBaLead?: boolean;
}

export function ProjectClosureTab({
	projectClosure,
	project,
	members,
	projectId,
	creator,
	modifier,
	userIsCaretakerOfAdmin,
	userIsCaretakerOfBaLeader,
	userIsCaretakerOfProjectLeader,
	all_documents,
	isBaLead,
}: ProjectClosureTabProps) {
	// Modal state for reopen project action
	const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
	const { data: currentUser } = useCurrentUser();

	// Update mutation for intended_outcome
	const updateIntendedOutcome = useUpdateContent({
		contentType: "project-closure-intended-outcome",
		entityId: projectClosure?.id || 0,
	});

	if (!projectClosure) {
		return (
			<div className="rounded-lg border bg-card p-6">
				<p className="text-muted-foreground">No project closure available.</p>
			</div>
		);
	}

	const canEdit = calculateDocumentEditPermission({
		currentUser,
		members,
		document: projectClosure.document,
		isBaLead,
		userIsCaretakerOfBaLeader,
		userIsCaretakerOfAdmin,
	});

	// Handle intended outcome change
	const handleIntendedOutcomeChange = (value: string) => {
		updateIntendedOutcome.mutate(value);
	};

	return (
		<>
			<DocumentTabLayout
				document={projectClosure.document}
				project={project}
				members={members}
				documentType="project_closure"
				typeSpecificId={projectClosure.id}
				canDelete={true}
				creator={creator}
				modifier={modifier}
				userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
				userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
				userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
				all_documents={all_documents}
				isBaLead={isBaLead}
				onReopenProject={() => setIsReopenModalOpen(true)}
				commentsSection={
					<CommentSection
						documentId={projectClosure.document.id}
						projectId={projectId}
					/>
				}
			>
				<div className="space-y-6">
					{/* Intended Outcome - SELECT component */}
					<div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
							<Label
								htmlFor="intended-outcome"
								className="text-lg font-semibold"
							>
								Select an Intended Outcome:
							</Label>
						</div>
						<div className="px-6 py-5">
							<Select
								value={projectClosure.intended_outcome || "completed"}
								onValueChange={handleIntendedOutcomeChange}
								disabled={!canEdit || updateIntendedOutcome.isPending}
							>
								<SelectTrigger id="intended-outcome" className="w-full">
									<SelectValue placeholder="Select intended outcome" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="terminated">Terminated</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Reason */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-closure-reason"
							entityId={projectClosure.id}
							initialContent={projectClosure.reason || ""}
							canEdit={canEdit}
							label="Reason"
						/>
					</ProjectSection>

					{/* Knowledge Transfer */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-closure-knowledge-transfer"
							entityId={projectClosure.id}
							initialContent={projectClosure.knowledge_transfer || ""}
							canEdit={canEdit}
							label="Knowledge Transfer"
						/>
					</ProjectSection>

					{/* Data Location */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-closure-data-location"
							entityId={projectClosure.id}
							initialContent={projectClosure.data_location || ""}
							canEdit={canEdit}
							label="Data Location"
						/>
					</ProjectSection>

					{/* Hardcopy Location */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-closure-hardcopy-location"
							entityId={projectClosure.id}
							initialContent={projectClosure.hardcopy_location || ""}
							canEdit={canEdit}
							label="Hardcopy Location"
						/>
					</ProjectSection>

					{/* Backup Location */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-closure-backup-location"
							entityId={projectClosure.id}
							initialContent={projectClosure.backup_location || ""}
							canEdit={canEdit}
							label="Backup Location"
						/>
					</ProjectSection>

					{/* Scientific Outputs */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-closure-scientific-outputs"
							entityId={projectClosure.id}
							initialContent={projectClosure.scientific_outputs || ""}
							canEdit={canEdit}
							label="Scientific Outputs"
						/>
					</ProjectSection>
				</div>
			</DocumentTabLayout>

			{/* Reopen Project Modal */}
			<ReopenProjectModal
				isOpen={isReopenModalOpen}
				onClose={() => setIsReopenModalOpen(false)}
				projectId={project.id}
			/>
		</>
	);
}
