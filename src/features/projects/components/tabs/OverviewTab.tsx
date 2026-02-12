import type {
	IProjectData,
	IExtendedProjectDetails,
	IProjectMember,
} from "@/shared/types/project.types";
import { ProjectStatusBadge } from "../ProjectStatusBadge";
import { ProjectKindBadge } from "../ProjectKindBadge";
import { ProjectKeywords } from "../ProjectKeywords";
import { ProjectImage } from "../ProjectImage";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";

interface OverviewTabProps {
	project: IProjectData;
	details: IExtendedProjectDetails;
	members: IProjectMember[] | null;
}

export function OverviewTab({
	project,
	details: _details,
	members: _members,
}: OverviewTabProps) {
	// Sanitise title to remove HTML tags (including bold)
	const plainTextTitle = sanitizeInput(project.title);

	return (
		<div className="space-y-6">
			{/* Project Image */}
			<ProjectImage
				image={project.image}
				alt={plainTextTitle}
				className="h-[380px] xl:h-[400px] 2xl:h-[600px]"
			/>

			{/* Project Header Card */}
			<div className="rounded-lg border bg-card p-6">
				<h1 className="text-2xl font-bold">{plainTextTitle}</h1>
				<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<p className="text-sm font-semibold text-muted-foreground">
							Status
						</p>
						<div className="mt-1">
							<ProjectStatusBadge status={project.status} />
						</div>
					</div>
					<div>
						<p className="text-sm font-semibold text-muted-foreground">Kind</p>
						<div className="mt-1">
							<ProjectKindBadge kind={project.kind} />
						</div>
					</div>
					<div>
						<p className="text-sm font-semibold text-muted-foreground">Year</p>
						<p className="mt-1 text-base">{project.year}</p>
					</div>
					<div>
						<p className="text-sm font-semibold text-muted-foreground">
							Number
						</p>
						<p className="mt-1 text-base">{project.number}</p>
					</div>
				</div>
				<div className="mt-4">
					<p className="text-sm font-semibold text-muted-foreground">
						Business Area
					</p>
					<p className="mt-1 text-base">{project.business_area.name}</p>
				</div>
			</div>

			{/* Description */}
			{project.description && (
				<div className="rounded-lg border bg-card p-6">
					<h2 className="text-lg font-semibold">Description</h2>
					<div
						className="prose prose-sm mt-4 max-w-none dark:prose-invert"
						dangerouslySetInnerHTML={{ __html: project.description }}
					/>
				</div>
			)}

			{/* Tagline */}
			{project.tagline && (
				<div className="rounded-lg border bg-card p-6">
					<h2 className="text-lg font-semibold">Tagline</h2>
					<div
						className="prose prose-sm mt-4 max-w-none dark:prose-invert"
						dangerouslySetInnerHTML={{ __html: project.tagline }}
					/>
				</div>
			)}

			{/* Keywords */}
			<div className="rounded-lg border bg-card p-6">
				<h2 className="text-lg font-semibold mb-4">Keywords</h2>
				<ProjectKeywords keywords={project.keywords} />
			</div>

			{/* Placeholder for Team Management */}
			<div className="rounded-lg border bg-card p-6">
				<h2 className="text-lg font-semibold">Team Management</h2>
				<p className="mt-4 text-sm text-muted-foreground">
					Team management section will be displayed here.
				</p>
			</div>
		</div>
	);
}
