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
import { useServices } from "@/shared/hooks/queries/useServices";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { useProjectAreas } from "@/shared/hooks/queries/useProjectAreas";
import { ProjectStatusBadge } from "@/shared/components/projects/ProjectStatusBadge";
import { ProjectKindBadge } from "@/shared/components/projects/ProjectKindBadge";
import { formatYearRange } from "@/features/projects/utils/year.utils";
import { Info, Building2, Calendar, Layers, Users, Crown } from "lucide-react";

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

/** Role value → human-readable label */
const ROLE_LABELS: Record<string, string> = {
	research: "Science Support",
	supervising: "Project Leader",
	academicsuper: "Academic Supervisor",
	student: "Supervised Student",
	technical: "Technical Support",
	consulted: "Consulted Peer",
	externalcol: "External Collaborator",
	externalpeer: "External Peer",
	group: "Involved Group",
};

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
	const { data: services } = useServices();
	const { data: projectAreas } = useProjectAreas();

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

	// Resolve project area names from IDs
	const resolvedAreas = useMemo(() => {
		if (!debouncedFormData.location.areas.length || !projectAreas) return [];
		return debouncedFormData.location.areas
			.map((areaId) => {
				const area = projectAreas.find((a) => a.id === areaId);
				return area?.area_name || null;
			})
			.filter((name): name is string => name !== null);
	}, [debouncedFormData.location.areas, projectAreas]);

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
		<div className="space-y-4">
			{/* Project Image — matches overview page aspect ratio */}
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

			{/* Title and Authors — matching overview page styling */}
			<div className="pb-1">
				<h2 className="text-2xl font-semibold mb-2 break-words">
					{plainTextTitle ? (
						<span className="text-[#62a0f2] dark:text-[#62a0f2]">
							{plainTextTitle}
						</span>
					) : (
						<span className="text-muted-foreground italic">
							Project title (required)
						</span>
					)}
				</h2>

				{authorsDisplay && (
					<p className="mt-2 text-md font-normal text-gray-500 dark:text-gray-500">
						{authorsDisplay}
					</p>
				)}
			</div>

			{/* Status Badge — always "New" for wizard */}
			<div className="pb-1">
				<div className="flex items-center gap-2 mb-1">
					<Info className="h-5 w-5 text-muted-foreground" />
					<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
						Status
					</p>
				</div>
				<ProjectStatusBadge status="new" />
			</div>

			{/* Kind Badge */}
			{projectKind && (
				<div className="pb-1">
					<div className="flex items-center gap-2 mb-1">
						<Layers className="h-5 w-5 text-muted-foreground" />
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Kind
						</p>
					</div>
					<ProjectKindBadge kind={projectKind} />
				</div>
			)}

			{/* Business Area */}
			{businessAreaName && (
				<div className="pb-1">
					<div className="flex items-center gap-2 mb-1">
						<Building2 className="h-5 w-5 text-muted-foreground" />
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Business Area
						</p>
					</div>
					<p className="text-base text-gray-600 dark:text-gray-400">
						{businessAreaName}
					</p>
				</div>
			)}

			{/* Year — using formatYearRange matching overview page */}
			{yearDisplay && (
				<div className="pb-1">
					<div className="flex items-center gap-2 mb-1">
						<Calendar className="h-5 w-5 text-muted-foreground" />
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Year
						</p>
					</div>
					<p className="text-base text-gray-600 dark:text-gray-400">
						{yearDisplay}
					</p>
				</div>
			)}

			{/* Description */}
			{debouncedFormData.baseInformation.description && (
				<div>
					<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
						Description
					</h3>
					<div className="prose prose-sm max-w-none">
						<div
							dangerouslySetInnerHTML={{
								__html: debouncedFormData.baseInformation.description,
							}}
						/>
					</div>
				</div>
			)}

			{/* Keywords — purple badge styling matching ProjectKeywords */}
			{debouncedFormData.baseInformation.keywords.length > 0 && (
				<div>
					<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
						Keywords
					</h3>
					<div className="flex flex-wrap gap-2">
						{debouncedFormData.baseInformation.keywords.map(
							(keyword, index) => (
								<span
									key={index}
									className="px-3 py-1 text-sm rounded bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800"
								>
									{keyword}
								</span>
							)
						)}
					</div>
				</div>
			)}

			{/* Service */}
			{debouncedFormData.projectDetails.departmental_service ? (
				<div>
					<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
						Service
					</h3>
					<p className="text-base text-gray-600 dark:text-gray-400">
						{services?.find(
							(s) =>
								s.id === debouncedFormData.projectDetails.departmental_service
						)?.name || "Unknown service"}
					</p>
				</div>
			) : null}

			{/* Team Members — avatar circles with name and role */}
			{teamMembers.length > 0 && (
				<div>
					<div className="flex items-center gap-2 mb-2">
						<Users className="h-5 w-5 text-muted-foreground" />
						<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
							Team
						</h3>
					</div>
					<div className="space-y-2">
						{teamMembers.map((member) => {
							const initials = member.displayName
								.split(" ")
								.map((part) => part[0])
								.filter(Boolean)
								.slice(0, 2)
								.join("")
								.toUpperCase();

							return (
								<div key={member.userId} className="flex items-center gap-3">
									{/* Avatar circle with initials */}
									<div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
										{initials || "?"}
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-1.5">
											<span className="text-sm font-medium truncate">
												{member.displayName}
											</span>
											{member.isLeader && (
												<Crown className="h-3 w-3 text-amber-500 flex-shrink-0" />
											)}
										</div>
										<span className="text-xs text-muted-foreground">
											{ROLE_LABELS[member.role] || member.role}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Project Areas — resolved by name */}
			{resolvedAreas.length > 0 && (
				<div>
					<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
						Project Areas
					</h3>
					<div className="space-y-1">
						{resolvedAreas.map((name) => (
							<div
								key={name}
								className="text-sm text-gray-600 dark:text-gray-400"
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
					<div>
						<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
							External Partnership
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Collaboration:{" "}
							{debouncedFormData.externalDetails.collaboration_with}
						</p>
						{debouncedFormData.externalDetails.budget && (
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Budget: {debouncedFormData.externalDetails.budget}
							</p>
						)}
					</div>
				)}

			{/* Student Details */}
			{projectKind === "student" &&
				debouncedFormData.studentDetails?.organisation && (
					<div>
						<h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
							Student Project
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Organisation: {debouncedFormData.studentDetails.organisation}
						</p>
						{debouncedFormData.studentDetails.level && (
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Level: {debouncedFormData.studentDetails.level}
							</p>
						)}
					</div>
				)}
		</div>
	);
});
