import type { IConceptPlan } from "@/shared/types/document.types";
import type {
	IProjectData,
	IProjectMember,
	IProjectDocuments,
} from "@/shared/types/project.types";
import type { IUserData } from "@/shared/types/user.types";
import { DocumentTabLayout } from "@/shared/components/documents";
import { InlineSaveEditor } from "@/shared/components/editor";
import { ProjectSection } from "@/shared/components/ProjectSection";
import { CommentSection } from "@/features/projects/components/comments";

interface ConceptPlanTabProps {
	conceptPlan: IConceptPlan | null;
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

export function ConceptPlanTab({
	conceptPlan,
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
}: ConceptPlanTabProps) {
	if (!conceptPlan) {
		return (
			<div className="rounded-lg border bg-card p-6">
				<p className="text-muted-foreground">No concept plan available.</p>
			</div>
		);
	}

	// TODO: Calculate edit permissions using canEditProject utility
	const canEdit = true; // Temporarily true to see the button

	return (
		<DocumentTabLayout
			document={conceptPlan.document}
			project={project}
			members={members}
			documentType="concept_plan"
			typeSpecificId={conceptPlan.id}
			canDelete={true}
			creator={creator}
			modifier={modifier}
			userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
			userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
			userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
			all_documents={all_documents}
			isBaLead={isBaLead}
			commentsSection={
				<CommentSection
					documentId={conceptPlan.document.id}
					projectId={projectId}
				/>
			}
		>
			<div className="space-y-6">
				{/* Background */}
				<ProjectSection>
					<InlineSaveEditor
						contentType="concept-plan-background"
						entityId={conceptPlan.id}
						initialContent={conceptPlan.background || ""}
						canEdit={canEdit}
						wordLimit={500}
						showWordLimitInLabel={true}
						label="Background"
					/>
				</ProjectSection>

				{/* Aims */}
				<ProjectSection>
					<InlineSaveEditor
						contentType="concept-plan-aims"
						entityId={conceptPlan.id}
						initialContent={conceptPlan.aims || ""}
						canEdit={canEdit}
						wordLimit={500}
						showWordLimitInLabel={true}
						label="Aims"
					/>
				</ProjectSection>

				{/* Expected Outcomes */}
				<ProjectSection>
					<InlineSaveEditor
						contentType="concept-plan-outcome"
						entityId={conceptPlan.id}
						initialContent={conceptPlan.outcome || ""}
						canEdit={canEdit}
						wordLimit={500}
						showWordLimitInLabel={true}
						label="Expected Outcomes"
					/>
				</ProjectSection>

				{/* Collaborations */}
				<ProjectSection>
					<InlineSaveEditor
						contentType="concept-plan-collaborations"
						entityId={conceptPlan.id}
						initialContent={conceptPlan.collaborations || ""}
						canEdit={canEdit}
						wordLimit={500}
						showWordLimitInLabel={true}
						label="Collaborations"
					/>
				</ProjectSection>

				{/* Strategic Context */}
				<ProjectSection>
					<InlineSaveEditor
						contentType="concept-plan-strategic-context"
						entityId={conceptPlan.id}
						initialContent={conceptPlan.strategic_context || ""}
						canEdit={canEdit}
						wordLimit={500}
						showWordLimitInLabel={true}
						label="Strategic Context"
					/>
				</ProjectSection>

				{/* Staff Time Allocation (FTE) */}
				<ProjectSection>
					<InlineSaveEditor
						contentType="concept-plan-staff-time-allocation"
						entityId={conceptPlan.id}
						initialContent={conceptPlan.staff_time_allocation || ""}
						canEdit={canEdit}
						wordLimit={500}
						showWordLimitInLabel={true}
						label="Staff Time Allocation (FTE)"
					/>
				</ProjectSection>

				{/* Indicative Operating Budget ($) */}
				<ProjectSection>
					<InlineSaveEditor
						contentType="concept-plan-budget"
						entityId={conceptPlan.id}
						initialContent={conceptPlan.budget || ""}
						canEdit={canEdit}
						wordLimit={500}
						showWordLimitInLabel={true}
						label="Indicative Operating Budget ($)"
					/>
				</ProjectSection>
			</div>
		</DocumentTabLayout>
	);
}
