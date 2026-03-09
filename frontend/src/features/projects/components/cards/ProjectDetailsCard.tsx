import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { ProjectStatusBadge } from "@/shared/components/projects/ProjectStatusBadge";
import { ProjectKindBadge } from "@/shared/components/projects/ProjectKindBadge";
import { EditProjectDropdownButton } from "../form/EditProjectDropdownButton";
import { DatasetReviewLink } from "../DatasetReviewLink";
import { formatAuthors } from "../../utils/authors/authors.utils";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import type {
	IProjectData,
	IProjectMember,
} from "@/shared/types/project.types";

interface ProjectDetailsCardProps {
	project: IProjectData;
	members: IProjectMember[];
	canEdit: boolean;
	onEditClick: () => void;
}

/**
 * ProjectDetailsCard component
 *
 * Displays project metadata in a card format with responsive grid layout.
 * Shows title, authors, status, kind, year, number, and business area.
 * Includes EditProjectButton when user has permissions.
 * Includes DatasetReviewLink to external data catalogue.
 *
 * Layout:
 * - Desktop (lg+): 4-column grid for metadata
 * - Tablet (md): 2-column grid
 * - Mobile: 1-column stack
 */
export function ProjectDetailsCard({
	project,
	members,
	canEdit,
	onEditClick,
}: ProjectDetailsCardProps) {
	// Sanitise title to remove HTML tags
	const plainTextTitle = sanitizeInput(project.title);

	// Format authors from team members
	const authorsDisplay = formatAuthors(members);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1 min-w-0">
						{/* Project Title - Blue colour matching original */}
						<h2 className="text-xl font-bold text-blue-500 dark:text-blue-300 mb-2 break-words">
							{plainTextTitle}
						</h2>

						{/* Authors */}
						{authorsDisplay && (
							<p className="text-sm text-muted-foreground">{authorsDisplay}</p>
						)}
					</div>

					{/* Edit Button */}
					{canEdit && (
						<div className="flex-shrink-0">
							<EditProjectDropdownButton onClick={onEditClick} />
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Metadata Grid */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

				{/* Business Area */}
				<div>
					<p className="text-sm font-semibold text-muted-foreground">
						Business Area
					</p>
					<p className="mt-1 text-base">{project.business_area.name}</p>
				</div>

				{/* Dataset Review Link */}
				<div className="pt-2 border-t">
					<DatasetReviewLink project={project} />
				</div>
			</CardContent>
		</Card>
	);
}
