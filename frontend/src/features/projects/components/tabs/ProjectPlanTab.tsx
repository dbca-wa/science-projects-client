import { useState } from "react";
import type { IProjectPlan } from "@/shared/types/document.types";
import type {
	IProjectData,
	IProjectMember,
	IProjectDocuments,
} from "@/shared/types/project.types";
import type { IUserData } from "@/shared/types/user.types";
import { DocumentTabLayout } from "@/shared/components/documents";
import { InlineSaveEditor } from "@/shared/components/editor";
import { ProjectSection } from "@/shared/components/ProjectSection";
import { SetAreasModal } from "@/features/projects/components/modals/SetAreasModal";
import { CreateProgressReportModal } from "@/features/projects/components/modals/CreateProgressReportModal";
import { MethodologyImagePlaceholder } from "@/features/projects/components/placeholders/MethodologyImagePlaceholder";
import { ProjectPlanEndorsements } from "@/features/projects/components/ProjectPlanEndorsements";
import { CommentSection } from "@/features/projects/components/comments";

interface ProjectPlanTabProps {
	projectPlan: IProjectPlan | null;
	project: IProjectData;
	members: IProjectMember[] | null;
	projectId: number;
	hasProgressReports: boolean;
	// New props for DocumentActionsSection
	creator?: IUserData | null;
	modifier?: IUserData | null;
	userIsCaretakerOfAdmin?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	userIsCaretakerOfProjectLeader?: boolean;
	all_documents?: IProjectDocuments;
	isBaLead?: boolean;
	userData?: IUserData | null;
}

export function ProjectPlanTab({
	projectPlan,
	project,
	members,
	projectId,
	hasProgressReports: _hasProgressReports,
	creator,
	modifier,
	userIsCaretakerOfAdmin,
	userIsCaretakerOfBaLeader,
	userIsCaretakerOfProjectLeader,
	all_documents,
	isBaLead,
	userData,
}: ProjectPlanTabProps) {
	// Modal state for special actions
	const [isSetAreasModalOpen, setIsSetAreasModalOpen] = useState(false);
	const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);

	if (!projectPlan) {
		return (
			<div className="rounded-lg border bg-card p-6">
				<p className="text-muted-foreground">No project plan available.</p>
			</div>
		);
	}

	// TODO: Calculate edit permissions using canEditProject utility
	const canEdit = true; // Temporarily true to see the button

	return (
		<>
			<DocumentTabLayout
				document={projectPlan.document}
				project={project}
				members={members}
				documentType="project_plan"
				typeSpecificId={projectPlan.id}
				canDelete={true}
				creator={creator}
				modifier={modifier}
				userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
				userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
				userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
				all_documents={all_documents}
				isBaLead={isBaLead}
				onSetAreas={() => setIsSetAreasModalOpen(true)}
				onCreateProgressReport={() => setIsCreateReportModalOpen(true)}
				commentsSection={
					<CommentSection
						documentId={projectPlan.document.id}
						projectId={projectId}
					/>
				}
			>
				<div className="space-y-6">
					{/* Endorsements - FIRST SECTION */}
					{projectPlan.endorsements && (
						<ProjectPlanEndorsements
							projectPlan={projectPlan}
							userData={userData ?? null}
							isBaLead={isBaLead}
							userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
							userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
						/>
					)}

					{/* Background */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-background"
							entityId={projectPlan.id}
							initialContent={projectPlan.background || ""}
							canEdit={canEdit}
							label="Background"
						/>
					</ProjectSection>

					{/* Aims */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-aims"
							entityId={projectPlan.id}
							initialContent={projectPlan.aims || ""}
							canEdit={canEdit}
							label="Aims"
						/>
					</ProjectSection>

					{/* Expected Outcomes */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-outcome"
							entityId={projectPlan.id}
							initialContent={projectPlan.outcome || ""}
							canEdit={canEdit}
							label="Expected Outcomes"
						/>
					</ProjectSection>

					{/* Knowledge Transfer */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-knowledge-transfer"
							entityId={projectPlan.id}
							initialContent={projectPlan.knowledge_transfer || ""}
							canEdit={canEdit}
							label="Knowledge Transfer"
						/>
					</ProjectSection>

					{/* Project Tasks */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-project-tasks"
							entityId={projectPlan.id}
							initialContent={projectPlan.project_tasks || ""}
							canEdit={canEdit}
							label="Project Tasks"
						/>
					</ProjectSection>

					{/* Listed References */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-listed-references"
							entityId={projectPlan.id}
							initialContent={projectPlan.listed_references || ""}
							canEdit={canEdit}
							label="Listed References"
						/>
					</ProjectSection>

					{/* Methodology */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-methodology"
							entityId={projectPlan.id}
							initialContent={projectPlan.methodology || ""}
							canEdit={canEdit}
							label="Methodology"
						/>
					</ProjectSection>

					{/* Methodology Image - PLACEHOLDER */}
					<MethodologyImagePlaceholder projectPlanId={projectPlan.id} />

					{/* Number of Voucher Specimens */}
					{projectPlan.endorsements && (
						<ProjectSection>
							<InlineSaveEditor
								contentType="project-plan-specimens"
								entityId={projectPlan.endorsements.id}
								initialContent={projectPlan.endorsements.no_specimens || ""}
								canEdit={canEdit}
								label="Number of Voucher Specimens"
							/>
						</ProjectSection>
					)}

					{/* Data Management */}
					{projectPlan.endorsements && (
						<ProjectSection>
							<InlineSaveEditor
								contentType="project-plan-data-management"
								entityId={projectPlan.endorsements.id}
								initialContent={projectPlan.endorsements.data_management || ""}
								canEdit={canEdit}
								label="Data Management"
							/>
						</ProjectSection>
					)}

					{/* Related Science Projects */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-related-projects"
							entityId={projectPlan.id}
							initialContent={projectPlan.related_projects || ""}
							canEdit={canEdit}
							label="Related Science Projects"
						/>
					</ProjectSection>

					{/* Consolidated Funds */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-operating-budget"
							entityId={projectPlan.id}
							initialContent={projectPlan.operating_budget || ""}
							canEdit={canEdit}
							label="Consolidated Funds"
						/>
					</ProjectSection>

					{/* External Funds */}
					<ProjectSection>
						<InlineSaveEditor
							contentType="project-plan-operating-budget-external"
							entityId={projectPlan.id}
							initialContent={projectPlan.operating_budget_external || ""}
							canEdit={canEdit}
							label="External Funds"
						/>
					</ProjectSection>
				</div>
			</DocumentTabLayout>

			{/* Special action modals for Project Plan */}
			<SetAreasModal
				isOpen={isSetAreasModalOpen}
				onClose={() => setIsSetAreasModalOpen(false)}
				project={project}
				currentAreas={project.areas || []}
			/>

			<CreateProgressReportModal
				isOpen={isCreateReportModalOpen}
				onClose={() => setIsCreateReportModalOpen(false)}
				project={project}
			/>
		</>
	);
}
