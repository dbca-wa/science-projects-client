import { useNavigate } from "react-router";
import type { IProjectData } from "@/shared/types/project.types";
import { extractTextFromHTML } from "@/shared/utils/html.utils";
import { ProjectStatusBadge } from "../ProjectStatusBadge";

interface ProjectPopupProps {
	projects: IProjectData[];
}

/**
 * Status priority for sorting (higher = more important)
 */
const STATUS_PRIORITY: Record<string, number> = {
	active: 5,
	pending: 4,
	updating: 3,
	new: 2,
	completed: 1,
	terminated: 0,
	suspended: 0,
};

/**
 * Get status priority for sorting
 */
function getStatusPriority(status: string): number {
	return STATUS_PRIORITY[status] || 0;
}

/**
 * Single Project Popup
 * 
 * Displays details for a single project:
 * - Title
 * - Status badge
 * - Business area
 * - Description (truncated)
 * - Link to project detail page
 */
function SingleProjectPopup({ project }: { project: IProjectData }) {
	const navigate = useNavigate();
	const plainTextTitle = extractTextFromHTML(project.title);

	// Truncate description to 150 characters
	const description = project.description
		? extractTextFromHTML(project.description).substring(0, 150) +
		  (project.description.length > 150 ? "..." : "")
		: "No description available";

	const handleClick = () => {
		navigate(`/projects/${project.id}/overview`);
	};

	return (
		<div className="space-y-2">
			<div>
				<h3
					className="text-base font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
					onClick={handleClick}
				>
					{plainTextTitle}
				</h3>
				<div className="flex items-center gap-2 mt-1">
					<ProjectStatusBadge status={project.status} />
				</div>
			</div>

			{project.business_area && (
				<div className="text-sm text-gray-600 dark:text-gray-400">
					<span className="font-medium">Business Area:</span>{" "}
					{project.business_area.name}
				</div>
			)}

			<p className="text-sm text-gray-700 dark:text-gray-300">
				{description}
			</p>

			<button
				onClick={handleClick}
				className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
			>
				View Details →
			</button>
		</div>
	);
}

/**
 * Multi Project Popup
 * 
 * Displays a list of projects at the same location:
 * - Sorted by status priority (active > pending > completed)
 * - Each project shows title, status, and link
 * - Limited to prevent excessive DOM size
 */
function MultiProjectPopup({ projects }: { projects: IProjectData[] }) {
	const navigate = useNavigate();

	// Sort projects by status priority
	const sortedProjects = [...projects].sort(
		(a, b) =>
			getStatusPriority(b.status) - getStatusPriority(a.status)
	);

	// Limit to 20 projects to prevent excessive DOM size
	const displayProjects = sortedProjects.slice(0, 20);
	const hasMore = projects.length > 20;

	return (
		<div className="space-y-2">
			<h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
				{projects.length} Projects at this location
			</h3>

			<div className="space-y-2 max-h-80 overflow-y-auto">
				{displayProjects.map((project) => {
					const plainTextTitle = extractTextFromHTML(project.title);

					return (
						<div
							key={project.id}
							className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0"
						>
							<div
								className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
								onClick={() =>
									navigate(`/projects/${project.id}/overview`)
								}
							>
								{plainTextTitle}
							</div>
							<div className="flex items-center gap-2 mt-1">
								<ProjectStatusBadge status={project.status} />
								{project.business_area && (
									<span className="text-xs text-gray-600 dark:text-gray-400">
										{project.business_area.name}
									</span>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{hasMore && (
				<p className="text-xs text-gray-500 dark:text-gray-400 italic">
					Showing first 20 of {projects.length} projects
				</p>
			)}
		</div>
	);
}

/**
 * ProjectPopup component
 * 
 * Renders appropriate popup based on number of projects:
 * - Single project: Detailed view with description
 * - Multiple projects: List view sorted by status
 */
export function ProjectPopup({ projects }: ProjectPopupProps) {
	if (projects.length === 1) {
		return <SingleProjectPopup project={projects[0]} />;
	}

	return <MultiProjectPopup projects={projects} />;
}
