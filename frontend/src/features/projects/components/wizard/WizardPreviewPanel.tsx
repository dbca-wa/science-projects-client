import { useState, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import type {
	IBaseInformationData,
	IProjectDetailsData,
	ILocationData,
	IExternalDetailsData,
	IStudentDetailsData,
	IWizardTeamMember,
} from "@/app/stores/derived/project-wizard.store";
import type { ProjectKind } from "@/shared/types/project.types";
import { getImageUrl } from "@/shared/utils/image.utils";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { useLocations } from "@/shared/hooks/queries/useLocations";
import { ProjectStatusBadge } from "@/shared/components/projects/ProjectStatusBadge";
import { ProjectKindBadge } from "@/shared/components/projects/ProjectKindBadge";
import { formatYearRange } from "@/features/projects/utils/year.utils";
import { Building2, Calendar, Users } from "lucide-react";
import { PreviewTeamMemberRow } from "./PreviewTeamMemberRow";
import { STUDY_LEVEL_LABELS } from "../../constants/studyLevels";

interface WizardFormData {
	baseInformation: IBaseInformationData;
	projectDetails: IProjectDetailsData;
	location: ILocationData;
	externalDetails: IExternalDetailsData | null;
	studentDetails: IStudentDetailsData | null;
}

interface WizardPreviewPanelProps {
	formData: WizardFormData;
	projectKind: ProjectKind | null;
	teamMembers?: IWizardTeamMember[];
}

/**
 * WizardPreviewPanel - Live preview matching the project overview page design
 *
 * Mirrors the OverviewTab layout with the same icons, labels, badges,
 * and formatting so users see exactly how their project will appear.
 */
export const WizardPreviewPanel = observer(function WizardPreviewPanel({
	formData,
	projectKind,
	teamMembers = [],
}: WizardPreviewPanelProps) {
	const [debouncedFormData, setDebouncedFormData] = useState(formData);

	// Fetch dropdown data for display
	const { data: businessAreas } = useBusinessAreas();
	const { dbcaRegions, dbcaDistricts } = useLocations();

	// Fetch user data for team members
	const { data: dataCustodian } = useUserDetail(
		debouncedFormData.projectDetails.data_custodian || undefined
	);
	const { data: projectLeader } = useUserDetail(
		debouncedFormData.projectDetails.project_leader || undefined
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
		if (!debouncedFormData.baseInformation.image) return null;

		if (typeof debouncedFormData.baseInformation.image === "string") {
			return getImageUrl(debouncedFormData.baseInformation.image);
		}

		if (debouncedFormData.baseInformation.image instanceof File) {
			return URL.createObjectURL(debouncedFormData.baseInformation.image);
		}

		return null;
	}, [debouncedFormData.baseInformation.image]);

	// Cleanup object URL on unmount
	useEffect(() => {
		return () => {
			if (
				imagePreview &&
				debouncedFormData.baseInformation.image instanceof File
			) {
				URL.revokeObjectURL(imagePreview);
			}
		};
	}, [imagePreview, debouncedFormData.baseInformation.image]);

	// Sanitised title text
	const plainTextTitle = debouncedFormData.baseInformation.title
		? sanitizeInput(debouncedFormData.baseInformation.title)
		: "";

	// Format authors from team member data
	const authorsDisplay = useMemo(() => {
		const parts: string[] = [];
		if (projectLeader) {
			parts.push(
				`${projectLeader.display_first_name} ${projectLeader.display_last_name}`
			);
		}
		if (dataCustodian && dataCustodian.id !== projectLeader?.id) {
			parts.push(
				`${dataCustodian.display_first_name} ${dataCustodian.display_last_name}`
			);
		}
		return parts.join(", ");
	}, [projectLeader, dataCustodian]);

	// Resolve business area name
	const businessAreaName = useMemo(() => {
		if (!debouncedFormData.projectDetails.business_area) return null;
		return (
			businessAreas?.find(
				(ba) => ba.id === debouncedFormData.projectDetails.business_area
			)?.name || null
		);
	}, [businessAreas, debouncedFormData.projectDetails.business_area]);

	// Resolve project area names from IDs using location data
	const resolvedAreas = useMemo(() => {
		if (!debouncedFormData.location.areas.length) return [];
		const allLocations = [...dbcaRegions, ...dbcaDistricts];
		return debouncedFormData.location.areas
			.map((areaId) => {
				const location = allLocations.find((loc) => loc.id === areaId);
				return location?.name || null;
			})
			.filter((name): name is string => name !== null);
	}, [debouncedFormData.location.areas, dbcaRegions, dbcaDistricts]);

	// Format year range using the same utility as the overview page
	const yearDisplay = useMemo(() => {
		if (!debouncedFormData.projectDetails.start_date) return null;
		return formatYearRange(
			debouncedFormData.projectDetails.start_date,
			debouncedFormData.projectDetails.end_date || null
		);
	}, [
		debouncedFormData.projectDetails.start_date,
		debouncedFormData.projectDetails.end_date,
	]);

	return (
		<div className="space-y-5">
			{/* Top row: Image on left, base details on right */}
			<div className="rounded-lg border shadow-sm p-5">
				<div className="flex gap-5">
					{/* Image — left side, project card aspect ratio (25:18) */}
					<div className="w-[312px] flex-shrink-0 aspect-[25/18] bg-muted rounded-2xl flex items-center justify-center overflow-hidden">
						{imagePreview ? (
							<img
								src={imagePreview}
								alt="Project preview"
								className="w-full h-full object-cover"
							/>
						) : (
							<p className="text-sm text-muted-foreground text-center px-2">
								No image
							</p>
						)}
					</div>

					{/* Base details — right side */}
					<div className="flex-1 min-w-0 space-y-3">
						{/* Title */}
						<h2 className="text-2xl font-semibold break-words leading-tight">
							{plainTextTitle ? (
								<span className="text-[#62a0f2] dark:text-[#62a0f2]">
									{plainTextTitle}
								</span>
							) : (
								<span className="text-muted-foreground italic text-lg">
									Project title (required)
								</span>
							)}
						</h2>

						{authorsDisplay && (
							<p className="text-base text-gray-500 dark:text-gray-500">
								{authorsDisplay}
							</p>
						)}

						{/* Status */}
						<div>
							<ProjectStatusBadge status="new" />
						</div>

						{/* Kind */}
						{projectKind && (
							<div>
								<ProjectKindBadge kind={projectKind} />
							</div>
						)}

						{/* Business Area */}
						{businessAreaName && (
							<div className="flex items-center gap-2">
								<Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
								<span className="text-base text-gray-600 dark:text-gray-400">
									{businessAreaName}
								</span>
							</div>
						)}

						{/* Year */}
						{yearDisplay && (
							<div className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
								<span className="text-base text-gray-600 dark:text-gray-400">
									{yearDisplay}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Description */}
			{debouncedFormData.baseInformation.description && (
				<div className="rounded-lg border shadow-sm p-5">
					<h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
						Description
					</h3>
					<div className="prose prose-base max-w-none">
						<div
							dangerouslySetInnerHTML={{
								__html: debouncedFormData.baseInformation.description,
							}}
						/>
					</div>
				</div>
			)}

			{/* Keywords */}
			{debouncedFormData.baseInformation.keywords.length > 0 && (
				<div className="rounded-lg border shadow-sm p-5">
					<h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
						Keywords
					</h3>
					<div className="flex flex-wrap gap-2">
						{debouncedFormData.baseInformation.keywords.map(
							(keyword, index) => (
								<span
									key={index}
									className="px-3 py-1.5 text-sm rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800"
								>
									{keyword}
								</span>
							)
						)}
					</div>
				</div>
			)}

			{/* Team Members */}
			{teamMembers.length > 0 && (
				<div className="rounded-lg border shadow-sm p-5">
					<div className="flex items-center gap-2 mb-3">
						<Users className="h-5 w-5 text-muted-foreground" />
						<h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
							Team
						</h3>
					</div>
					<div className="space-y-3">
						{teamMembers.map((member) => (
							<PreviewTeamMemberRow key={member.userId} member={member} />
						))}
					</div>
				</div>
			)}

			{/* Project Areas */}
			{resolvedAreas.length > 0 && (
				<div className="rounded-lg border shadow-sm p-5">
					<h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
						Project Areas
					</h3>
					<div className="space-y-1.5">
						{resolvedAreas.map((name) => (
							<div
								key={name}
								className="text-base text-gray-600 dark:text-gray-400"
							>
								• {name}
							</div>
						))}
					</div>
				</div>
			)}

			{/* External Details */}
			{projectKind === "external" &&
				debouncedFormData.externalDetails?.collaboration_with && (
					<div className="rounded-lg border shadow-sm p-5">
						<h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
							External Partnership
						</h3>
						<p className="text-base text-gray-600 dark:text-gray-400">
							Collaboration:{" "}
							{debouncedFormData.externalDetails.collaboration_with}
						</p>
						{debouncedFormData.externalDetails.budget && (
							<p className="text-base text-gray-600 dark:text-gray-400 mt-1">
								Budget: ${debouncedFormData.externalDetails.budget}
							</p>
						)}
					</div>
				)}

			{/* Student Details */}
			{projectKind === "student" &&
				debouncedFormData.studentDetails?.organisation && (
					<div className="rounded-lg border shadow-sm p-5">
						<h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
							Student Project
						</h3>
						<p className="text-base text-gray-600 dark:text-gray-400">
							Organisation: {debouncedFormData.studentDetails.organisation}
						</p>
						{debouncedFormData.studentDetails.level && (
							<p className="text-base text-gray-600 dark:text-gray-400 mt-1">
								Level:{" "}
								{STUDY_LEVEL_LABELS[debouncedFormData.studentDetails.level] ||
									debouncedFormData.studentDetails.level}
							</p>
						)}
					</div>
				)}
		</div>
	);
});
