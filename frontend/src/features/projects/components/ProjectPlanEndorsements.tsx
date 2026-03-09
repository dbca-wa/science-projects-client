import { useState, useMemo } from "react";
import type { IProjectPlan } from "@/shared/types/document.types";
import type { IUserData } from "@/shared/types/user.types";
import { ProjectSection } from "@/shared/components/ProjectSection";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { FileText, Trash2 } from "lucide-react";
import { getImageUrl } from "@/shared/utils/image.utils";
import { SingleFileUpload } from "@/shared/components/upload/SingleFileUpload";
import { SeekEndorsementModal } from "./modals/SeekEndorsementModal";
import { DeletePDFEndorsementModal } from "./modals/DeletePDFEndorsementModal";
import { useUpdateEndorsements } from "../hooks/useUpdateEndorsements";
import { useDeleteEndorsementPDF } from "../hooks/useDeleteEndorsementPDF";

interface ProjectPlanEndorsementsProps {
	projectPlan: IProjectPlan;
	userData: IUserData | null;
	isBaLead?: boolean;
	userIsCaretakerOfAdmin?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	refetchDocument?: () => void;
}

export function ProjectPlanEndorsements({
	projectPlan,
	userData,
	isBaLead,
	userIsCaretakerOfAdmin,
	userIsCaretakerOfBaLeader,
}: ProjectPlanEndorsementsProps) {
	// Permissions logic
	const canEdit = useMemo(() => {
		return (
			userData?.is_superuser ||
			userIsCaretakerOfAdmin ||
			userData?.is_aec ||
			isBaLead ||
			userIsCaretakerOfBaLeader
		);
	}, [userData, isBaLead, userIsCaretakerOfAdmin, userIsCaretakerOfBaLeader]);

	// State management
	// Track local changes to ae_endorsement_required (checkbox state)
	const [localAecRequired, setLocalAecRequired] = useState<boolean | null>(
		null
	);

	// Use local state if it exists, otherwise use prop value
	const aecEndorsementRequired =
		localAecRequired !== null
			? localAecRequired
			: (projectPlan.endorsements?.ae_endorsement_required ?? false);

	const [uploadedPDF, setUploadedPDF] = useState<File | null>(null);

	// Derive aecEndorsementProvided from uploadedPDF and projectPlan
	const aecEndorsementProvided = useMemo(() => {
		// If there's an uploaded PDF, endorsement is provided
		if (uploadedPDF && uploadedPDF.type === "application/pdf") {
			return true;
		}
		// Otherwise use the value from projectPlan
		return projectPlan.endorsements?.ae_endorsement_provided ?? false;
	}, [uploadedPDF, projectPlan.endorsements?.ae_endorsement_provided]);

	// Modal states
	const [isSeekEndorsementModalOpen, setIsSeekEndorsementModalOpen] =
		useState(false);
	const [isDeletePDFModalOpen, setIsDeletePDFModalOpen] = useState(false);

	// Mutations
	const updateEndorsementsMutation = useUpdateEndorsements(projectPlan.id);
	const deletePDFMutation = useDeleteEndorsementPDF(projectPlan.id);

	// Extract filename from path
	const extractFilename = (filePath: string) => {
		const parts = filePath.split("/");
		const filename = parts[parts.length - 1];
		return filename;
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

	// Handle save button click
	const handleSaveClick = () => {
		setIsSeekEndorsementModalOpen(true);
	};

	// Handle save confirmation from modal
	const handleSaveConfirm = (shouldSendEmails: boolean) => {
		updateEndorsementsMutation.mutate(
			{
				ae_endorsement_required: aecEndorsementRequired,
				ae_endorsement_provided: aecEndorsementProvided,
				aec_pdf: uploadedPDF || undefined,
				should_send_emails: shouldSendEmails,
			},
			{
				onSuccess: () => {
					// Reset local state after successful save
					setLocalAecRequired(null);
					setUploadedPDF(null);
					setIsSeekEndorsementModalOpen(false);
				},
			}
		);
	};

	// Handle delete PDF button click
	const handleDeletePDFClick = () => {
		setIsDeletePDFModalOpen(true);
	};

	// Handle delete PDF confirmation from modal
	const handleDeletePDFConfirm = () => {
		deletePDFMutation.mutate(undefined, {
			onSuccess: () => {
				// Reset states after successful deletion
				// Note: aecEndorsementProvided is computed from uploadedPDF and projectPlan
				// so we only need to reset uploadedPDF
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
			{/* Modals - always render, controlled by isOpen */}
			<SeekEndorsementModal
				isOpen={isSeekEndorsementModalOpen}
				onClose={() => setIsSeekEndorsementModalOpen(false)}
				onConfirm={handleSaveConfirm}
				isLoading={updateEndorsementsMutation.isPending}
				aecEndorsementRequired={aecEndorsementRequired}
				aecEndorsementProvided={aecEndorsementProvided}
				uploadedPDFName={uploadedPDF?.name}
			/>

			<DeletePDFEndorsementModal
				isOpen={isDeletePDFModalOpen}
				onClose={() => setIsDeletePDFModalOpen(false)}
				onConfirm={handleDeletePDFConfirm}
				isLoading={deletePDFMutation.isPending}
			/>

			<ProjectSection>
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
							className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 dark:data-[state=checked]:bg-green-600"
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
						<div>
							{!canEdit ? (
								<Badge
									variant={aecEndorsementProvided ? "default" : "destructive"}
								>
									{aecEndorsementProvided ? "Granted" : "Required"}
								</Badge>
							) : (
								<Switch
									id="aec-provided"
									checked={aecEndorsementProvided}
									disabled={true}
									className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-600"
								/>
							)}
						</div>
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
										onClick={handleDeletePDFClick}
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

				{/* Save Button - Outside the card */}
				<div className="flex justify-end">
					<Button
						onClick={handleSaveClick}
						disabled={!hasChanges || !canEdit}
						size="lg"
					>
						Save Endorsements
					</Button>
				</div>
			</ProjectSection>
		</>
	);
}
