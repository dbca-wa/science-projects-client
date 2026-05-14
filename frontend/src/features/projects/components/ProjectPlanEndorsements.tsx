import { useState, useMemo } from "react";
import type { IProjectPlan } from "@/shared/types/document.types";
import type { IUserData } from "@/shared/types/user.types";
import type { IProjectMember } from "@/shared/types/project.types";
import { ProjectSection } from "@/shared/components/ProjectSection";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { getImageUrl } from "@/shared/utils/image.utils";
import { SingleFileUpload } from "@/shared/components/upload/SingleFileUpload";
import { DeletePDFEndorsementModal } from "./modals/DeletePDFEndorsementModal";
import { useUpdateEndorsements } from "../hooks/useUpdateEndorsements";
import { useDeleteEndorsementPDF } from "../hooks/useDeleteEndorsementPDF";

interface ProjectPlanEndorsementsProps {
	projectPlan: IProjectPlan;
	userData: IUserData | null;
	members?: IProjectMember[] | null;
	isBaLead?: boolean;
	userIsCaretakerOfAdmin?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	refetchDocument?: () => void;
	locked?: boolean;
}

export const ProjectPlanEndorsements = ({
	projectPlan,
	userData,
	members,
	isBaLead,
	userIsCaretakerOfAdmin,
	userIsCaretakerOfBaLeader,
}: ProjectPlanEndorsementsProps) => {
	// Permissions: project member, BA lead, superuser, or caretaker of admin/BA lead
	// Always editable regardless of document lock status
	const canEdit = useMemo(() => {
		if (!userData) return false;
		if (userData.is_superuser) return true;
		if (userIsCaretakerOfAdmin) return true;
		if (isBaLead) return true;
		if (userIsCaretakerOfBaLeader) return true;
		// Check if user is a project member
		if (members?.some((m) => m.user.id === userData.id)) return true;
		return false;
	}, [
		userData,
		members,
		isBaLead,
		userIsCaretakerOfAdmin,
		userIsCaretakerOfBaLeader,
	]);

	// State management
	const [localAecRequired, setLocalAecRequired] = useState<boolean | null>(
		null
	);
	const [uploadedPDF, setUploadedPDF] = useState<File | null>(null);
	const [isDeletePDFModalOpen, setIsDeletePDFModalOpen] = useState(false);

	// Use local state if it exists, otherwise use prop value
	const aecEndorsementRequired =
		localAecRequired !== null
			? localAecRequired
			: (projectPlan.endorsements?.ae_endorsement_required ?? false);

	// Derive aecEndorsementProvided from uploadedPDF and projectPlan
	const aecEndorsementProvided = useMemo(() => {
		if (uploadedPDF && uploadedPDF.type === "application/pdf") return true;
		return projectPlan.endorsements?.ae_endorsement_provided ?? false;
	}, [uploadedPDF, projectPlan.endorsements?.ae_endorsement_provided]);

	// Mutations
	const updateEndorsementsMutation = useUpdateEndorsements(projectPlan.id);
	const deletePDFMutation = useDeleteEndorsementPDF(projectPlan.id);

	// Extract filename from path
	const extractFilename = (filePath: string) => {
		const parts = filePath.split("/");
		return parts[parts.length - 1];
	};

	// Compute if there are changes
	const hasChanges = useMemo(() => {
		return (
			aecEndorsementRequired !==
				(projectPlan.endorsements?.ae_endorsement_required ?? false) ||
			aecEndorsementProvided !==
				(projectPlan.endorsements?.ae_endorsement_provided ?? false) ||
			uploadedPDF !== null
		);
	}, [
		aecEndorsementRequired,
		aecEndorsementProvided,
		uploadedPDF,
		projectPlan.endorsements,
	]);

	// Handle save — direct save with toast, no modal
	const handleSave = () => {
		updateEndorsementsMutation.mutate(
			{
				ae_endorsement_required: aecEndorsementRequired,
				ae_endorsement_provided: aecEndorsementProvided,
				aec_pdf: uploadedPDF || undefined,
			},
			{
				onSuccess: () => {
					setLocalAecRequired(null);
					setUploadedPDF(null);
				},
			}
		);
	};

	// Handle delete PDF confirmation
	const handleDeletePDFConfirm = () => {
		deletePDFMutation.mutate(undefined, {
			onSuccess: () => {
				setUploadedPDF(null);
				setIsDeletePDFModalOpen(false);
			},
		});
	};

	// Don't render if endorsements don't exist
	if (!projectPlan.endorsements) {
		return null;
	}

	return (
		<>
			<DeletePDFEndorsementModal
				isOpen={isDeletePDFModalOpen}
				onClose={() => setIsDeletePDFModalOpen(false)}
				onConfirm={handleDeletePDFConfirm}
				isLoading={deletePDFMutation.isPending}
			/>

			<ProjectSection id="endorsements">
				{/* Section Title */}
				<h3 className="text-lg font-semibold">Endorsements</h3>

				{/* Inner card with border */}
				<div className="border border-border rounded-lg p-6 space-y-6 bg-white dark:bg-gray-900">
					{/* AEC Endorsement Required Checkbox */}
					<div className="flex items-center justify-between gap-4">
						<Label htmlFor="aec-required" className="font-semibold text-base">
							<span className="hidden md:inline">
								Animal Ethics Committee Endorsement Required?
							</span>
							<span className="md:hidden">Endorsement Required?</span>
						</Label>
						<Checkbox
							id="aec-required"
							checked={aecEndorsementRequired}
							onCheckedChange={(checked) => setLocalAecRequired(!!checked)}
							disabled={!canEdit}
							className="size-5 border-2 border-gray-300 dark:border-gray-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 dark:data-[state=checked]:bg-green-600"
						/>
					</div>

					{/* AEC Endorsement Provided Switch/Tag */}
					<div className="flex items-center justify-between gap-4">
						<Label
							htmlFor="aec-provided"
							className={
								aecEndorsementRequired
									? "text-base"
									: "text-base text-muted-foreground"
							}
						>
							<span className="hidden md:inline">
								Animal Ethics Committee's Endorsement
							</span>
							<span className="md:hidden">AEC Endorsement</span>
						</Label>
						<Badge
							variant={
								!aecEndorsementRequired
									? "secondary"
									: aecEndorsementProvided
										? "default"
										: "destructive"
							}
						>
							{!aecEndorsementRequired
								? "Not Required"
								: aecEndorsementProvided
									? "Granted"
									: "Required"}
						</Badge>
					</div>

					{/* Current PDF Display */}
					{projectPlan.endorsements.aec_pdf?.file && (
						<div className="flex items-center justify-between gap-4 min-h-[40px]">
							<Label
								className={
									aecEndorsementRequired
										? "text-base"
										: "text-base text-muted-foreground"
								}
							>
								<span className="hidden md:inline">Current Approval PDF</span>
								<span className="md:hidden">PDF</span>
							</Label>
							<div className="flex items-center gap-2 min-w-0">
								<a
									href={getImageUrl(projectPlan.endorsements.aec_pdf.file)}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-primary hover:underline cursor-pointer min-w-0"
								>
									<FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
									<span className="text-sm truncate hidden md:inline">
										{extractFilename(projectPlan.endorsements.aec_pdf.file)}
									</span>
								</a>
								{canEdit && (
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 flex-shrink-0"
										onClick={() => setIsDeletePDFModalOpen(true)}
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								)}
							</div>
						</div>
					)}

					{/* PDF Upload Area */}
					{canEdit && aecEndorsementRequired && (
						<div className="pt-2">
							<SingleFileUpload
								accept=".pdf"
								maxSize={3 * 1024 * 1024}
								onFileSelect={setUploadedPDF}
								uploadedFile={uploadedPDF}
								helperText="Upload PDF to provide your endorsement or update the file"
								disabled={!canEdit}
							/>
						</div>
					)}
				</div>

				{/* Save Button */}
				{canEdit && (
					<div className="flex justify-end">
						<Button
							onClick={handleSave}
							disabled={!hasChanges || updateEndorsementsMutation.isPending}
							size="lg"
						>
							{updateEndorsementsMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								"Save Endorsements"
							)}
						</Button>
					</div>
				)}
			</ProjectSection>
		</>
	);
};
