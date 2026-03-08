import { useState, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import type { CreateProjectFormData } from "@/app/stores/derived/create-project-wizard.store";
import type { ProjectKind } from "@/shared/types/project.types";
import { getImageUrl } from "@/shared/utils/image.utils";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useServices } from "@/features/agencies/hooks/useServices";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { useProjectAreas } from "@/features/locations/hooks/useProjectAreas";

interface WizardPreviewPanelProps {
	formData: CreateProjectFormData;
	projectKind: ProjectKind;
}

/**
 * WizardPreviewPanel - Live preview of project as it will appear in overview tab
 *
 * Features:
 * - Reuses components from OverviewTab
 * - Shows all form data with placeholders for empty fields
 * - Indicates missing required fields
 * - Debounced updates (300ms)
 *
 * Component Reuse:
 * - ProjectSection for layout
 * - ProjectImageWithTag for image display
 * - ProjectStatusBadge (show as "New")
 * - ProjectKindBadge for kind display
 * - Rich text display components for description
 *
 * TODO: Implement full preview with OverviewTab components
 */
export const WizardPreviewPanel = observer(function WizardPreviewPanel({
	formData,
	projectKind,
}: WizardPreviewPanelProps) {
	const [debouncedFormData, setDebouncedFormData] = useState(formData);

	// Fetch dropdown data for display
	const { data: businessAreas } = useBusinessAreas();
	const { data: services } = useServices();
	const { data: projectAreas } = useProjectAreas();

	// Fetch user data for team members
	const { data: dataCustodian } = useUserDetail(
		debouncedFormData.data_custodian || undefined
	);
	const { data: projectLeader } = useUserDetail(
		debouncedFormData.project_leader || undefined
	);

	// Debounce form data updates (300ms)
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedFormData(formData);
		}, 300);

		return () => clearTimeout(timer);
	}, [formData]);

	// Generate image preview URL
	const imagePreview = useMemo(() => {
		if (!debouncedFormData.image) return null;

		if (typeof debouncedFormData.image === "string") {
			return getImageUrl(debouncedFormData.image);
		}

		// For File objects, create object URL
		if (debouncedFormData.image instanceof File) {
			return URL.createObjectURL(debouncedFormData.image);
		}

		return null;
	}, [debouncedFormData.image]);

	// Cleanup object URL on unmount
	useEffect(() => {
		return () => {
			if (imagePreview && debouncedFormData.image instanceof File) {
				URL.revokeObjectURL(imagePreview);
			}
		};
	}, [imagePreview, debouncedFormData.image]);

	return (
		<div className="space-y-6">
			{/* Project Image */}
			<div className="w-full aspect-[25/18] bg-muted rounded-3xl flex items-center justify-center overflow-hidden">
				{imagePreview ? (
					<img
						src={imagePreview}
						alt="Project preview"
						className="w-full h-full object-cover"
					/>
				) : (
					<p className="text-sm text-muted-foreground">No image uploaded</p>
				)}
			</div>

			{/* Title */}
			<div>
				<h2 className="text-2xl font-bold">
					{debouncedFormData.title || (
						<span className="text-muted-foreground italic">
							Project title (required)
						</span>
					)}
				</h2>
			</div>

			{/* Description */}
			<div>
				<h3 className="text-lg font-semibold mb-2">Description</h3>
				{debouncedFormData.description ? (
					<div className="prose prose-sm max-w-none">
						<div
							dangerouslySetInnerHTML={{
								__html: debouncedFormData.description,
							}}
						/>
					</div>
				) : (
					<p className="text-muted-foreground italic">
						Project description (required)
					</p>
				)}
			</div>

			{/* Keywords */}
			<div>
				<h3 className="text-lg font-semibold mb-2">Keywords</h3>
				{debouncedFormData.keywords.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{debouncedFormData.keywords.map((keyword, index) => (
							<span
								key={index}
								className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
							>
								{keyword}
							</span>
						))}
					</div>
				) : (
					<p className="text-muted-foreground italic">
						At least one keyword required
					</p>
				)}
			</div>

			{/* Business Area */}
			{debouncedFormData.business_area ? (
				<div>
					<h3 className="text-lg font-semibold mb-2">Business Area</h3>
					<p>
						{businessAreas?.find(
							(ba) => ba.id === debouncedFormData.business_area
						)?.name || `Business Area ID: ${debouncedFormData.business_area}`}
					</p>
				</div>
			) : null}

			{/* Service */}
			{debouncedFormData.service && (
				<div>
					<h3 className="text-lg font-semibold mb-2">Service</h3>
					<p>
						{services?.find((s) => s.id === debouncedFormData.service)?.name ||
							`Service ID: ${debouncedFormData.service}`}
					</p>
				</div>
			)}

			{/* Timeline */}
			{debouncedFormData.start_date && (
				<div>
					<h3 className="text-lg font-semibold mb-2">Timeline</h3>
					<p>
						Start: {new Date(debouncedFormData.start_date).toLocaleDateString()}
						{debouncedFormData.end_date &&
							` - End: ${new Date(debouncedFormData.end_date).toLocaleDateString()}`}
					</p>
				</div>
			)}

			{/* Team Members */}
			{(debouncedFormData.project_leader ||
				debouncedFormData.data_custodian) && (
				<div>
					<h3 className="text-lg font-semibold mb-2">Team</h3>
					<div className="space-y-2">
						{debouncedFormData.project_leader && (
							<div>
								<span className="font-medium">Project Leader: </span>
								<span>
									{projectLeader
										? `${projectLeader.display_first_name} ${projectLeader.display_last_name}`
										: "Loading..."}
								</span>
							</div>
						)}
						{debouncedFormData.data_custodian && (
							<div>
								<span className="font-medium">Data Custodian: </span>
								<span>
									{dataCustodian
										? `${dataCustodian.display_first_name} ${dataCustodian.display_last_name}`
										: "Loading..."}
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Project Areas */}
			{debouncedFormData.project_areas.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-2">Project Areas</h3>
					<div className="space-y-1">
						{debouncedFormData.project_areas.map((areaId) => {
							const area = projectAreas?.find((a) => a.id === areaId);
							return (
								<div key={areaId} className="text-sm">
									• {area?.area_name || `Area ID: ${areaId}`}
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* External Details */}
			{projectKind === "external" && debouncedFormData.collaboration_with && (
				<div>
					<h3 className="text-lg font-semibold mb-2">External Partnership</h3>
					<p>Collaboration: {debouncedFormData.collaboration_with}</p>
					{debouncedFormData.budget && (
						<p>Budget: {debouncedFormData.budget}</p>
					)}
				</div>
			)}

			{/* Student Details */}
			{projectKind === "student" && debouncedFormData.organisation && (
				<div>
					<h3 className="text-lg font-semibold mb-2">Student Project</h3>
					<p>Organisation: {debouncedFormData.organisation}</p>
					{debouncedFormData.level && <p>Level: {debouncedFormData.level}</p>}
				</div>
			)}

			<p className="text-xs text-muted-foreground mt-8">
				Full preview with OverviewTab components will be implemented in Phase 6
			</p>
		</div>
	);
});
