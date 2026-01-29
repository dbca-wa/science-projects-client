import { useNavigate } from "react-router";
import { useEffect, useRef, memo, useState } from "react";
import type { IProjectData } from "@/shared/types/project.types";
import { extractTextFromHTML } from "@/shared/utils/html.utils";
import { ProjectStatusBadge } from "@/features/projects/components/ProjectStatusBadge";
import { mapAnnouncements } from "@/shared/utils/screen-reader.utils";

interface ProjectPopupProps {
	projects: IProjectData[];
	onClose?: () => void; // Optional close handler for escape key
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
 * - Keyboard accessible with Enter key support
 */
function SingleProjectPopup({ project, onClose }: { project: IProjectData; onClose?: () => void }) {
	const navigate = useNavigate();
	const titleRef = useRef<HTMLHeadingElement>(null);
	const plainTextTitle = extractTextFromHTML(project.title);

	// Focus the title when popup opens for keyboard accessibility
	useEffect(() => {
		titleRef.current?.focus();
		// Announce popup opened
		mapAnnouncements.markerSelected(1);
	}, []);

	// Handle escape key to close popup
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && onClose) {
				onClose();
				mapAnnouncements.popupClosed();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	// Truncate description to 150 characters
	const description = project.description
		? extractTextFromHTML(project.description).substring(0, 150) +
		  (project.description.length > 150 ? "..." : "")
		: "No description available";

	const handleClick = () => {
		navigate(`/projects/${project.id}/overview`);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleClick();
		}
	};

	return (
		<div className="space-y-2">
			<div>
				<h3
					ref={titleRef}
					className="text-base font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none rounded"
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					tabIndex={0}
					role="button"
					aria-label={`View details for project: ${plainTextTitle}`}
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
				className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium focus:outline-none rounded"
				aria-label={`View full details for ${plainTextTitle}`}
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
 * - Paginated with "Load More" functionality
 * - Keyboard accessible with proper focus management
 * - Smooth animated caret indicator instead of borders
 */
function MultiProjectPopup({ projects, onClose }: { projects: IProjectData[]; onClose?: () => void }) {
	const navigate = useNavigate();
	const headerRef = useRef<HTMLHeadingElement>(null);
	const [displayCount, setDisplayCount] = useState(20);

	// Focus the first interactive element when popup opens
	useEffect(() => {
		// Focus the first project instead of the header (which is not interactive)
		const firstProject = document.querySelector('[data-project-item="0"]') as HTMLElement;
		if (firstProject) {
			firstProject.focus();
		}
		// Announce popup opened
		mapAnnouncements.markerSelected(projects.length);
	}, [projects.length]);

	// Handle escape key to close popup
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && onClose) {
				onClose();
				mapAnnouncements.popupClosed();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	// Sort projects by status priority
	const sortedProjects = [...projects].sort(
		(a, b) =>
			getStatusPriority(b.status) - getStatusPriority(a.status)
	);

	// Get projects to display based on current display count
	const displayProjects = sortedProjects.slice(0, displayCount);
	const hasMore = projects.length > displayCount;
	const remainingCount = projects.length - displayCount;

	const handleProjectClick = (projectId: number) => {
		navigate(`/projects/${projectId}/overview`);
	};

	const handleLoadMore = () => {
		// Load 10 more projects at a time
		setDisplayCount(prev => Math.min(prev + 10, projects.length));
	};

	const handleProjectKeyDown = (event: React.KeyboardEvent, projectId: number, currentIndex: number) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleProjectClick(projectId);
		} else if (event.key === "Tab") {
			// Handle circular tab navigation within the popup
			const isLastItem = currentIndex === displayProjects.length - 1;
			const isFirstItem = currentIndex === 0;
			
			if (!event.shiftKey && isLastItem && !hasMore) {
				// Tab on last item when no Load More button - go to first item
				event.preventDefault();
				const firstProject = document.querySelector('[data-project-item="0"]') as HTMLElement;
				if (firstProject) {
					firstProject.focus();
				}
			} else if (event.shiftKey && isFirstItem) {
				// Shift+Tab on first item - go to last focusable item
				event.preventDefault();
				if (hasMore) {
					const loadMoreButton = document.querySelector('[data-load-more-button]') as HTMLElement;
					if (loadMoreButton) {
						loadMoreButton.focus();
					}
				} else {
					const lastProject = document.querySelector(`[data-project-item="${displayProjects.length - 1}"]`) as HTMLElement;
					if (lastProject) {
						lastProject.focus();
					}
				}
			}
		}
	};

	const handleLoadMoreKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleLoadMore();
		} else if (event.key === "Tab") {
			if (event.shiftKey) {
				// Shift+Tab on Load More - go to last project
				event.preventDefault();
				const lastProject = document.querySelector(`[data-project-item="${displayProjects.length - 1}"]`) as HTMLElement;
				if (lastProject) {
					lastProject.focus();
				}
			} else {
				// Tab on Load More - go to first project
				event.preventDefault();
				const firstProject = document.querySelector('[data-project-item="0"]') as HTMLElement;
				if (firstProject) {
					firstProject.focus();
				}
			}
		}
	};

	return (
		<div className="space-y-3">
			{/* Non-interactive header - no tabindex */}
			<h3 
				ref={headerRef}
				className="text-base font-semibold text-gray-900 dark:text-gray-100"
			>
				{projects.length} Projects at this location
			</h3>

			<div className="space-y-1 max-h-80 overflow-y-auto">
				{displayProjects.map((project, index) => {
					const plainTextTitle = extractTextFromHTML(project.title);

					return (
						<div
							key={project.id}
							className="group relative py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
						>
							{/* Animated caret indicator - positioned at first line height */}
							<div className="absolute left-0 top-2 translate-y-1 w-1 h-0 bg-blue-500 rounded-full transition-all duration-300 ease-out group-hover:h-4 group-focus-within:h-4"></div>
							
							<div
								data-project-item={index}
								className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors duration-200"
								onClick={() => handleProjectClick(project.id)}
								onKeyDown={(e) => handleProjectKeyDown(e, project.id, index)}
								tabIndex={0}
								role="button"
								aria-label={`View details for project: ${plainTextTitle}`}
							>
								{plainTextTitle}
							</div>
							<div className="flex items-center gap-2 mt-1 ml-0">
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
				<div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
					<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
						Showing {displayCount} of {projects.length} projects
					</p>
					<button
						data-load-more-button
						onClick={handleLoadMore}
						onKeyDown={handleLoadMoreKeyDown}
						tabIndex={0}
						className="cursor-pointer w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 px-3 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
						aria-label={`Load ${Math.min(10, remainingCount)} more projects`}
					>
						Load More ({remainingCount} remaining)
					</button>
				</div>
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
 * - Max width: 300px for responsive design
 * - Keyboard accessible with proper focus management
 * - Escape key support to close popup
 * - Optimized with React.memo to prevent unnecessary re-renders
 */
const ProjectPopupComponent = ({ projects, onClose }: ProjectPopupProps) => {
	if (projects.length === 1) {
		return (
			<div className="max-w-[300px]">
				<SingleProjectPopup project={projects[0]} onClose={onClose} />
			</div>
		);
	}

	return (
		<div className="max-w-[300px]">
			<MultiProjectPopup projects={projects} onClose={onClose} />
		</div>
	);
};

// Memoize the component to prevent unnecessary re-renders
// Only re-render when projects array changes or onClose function changes
export const ProjectPopup = memo(ProjectPopupComponent, (prevProps, nextProps) => {
	// Custom comparison function for better performance
	return (
		prevProps.projects.length === nextProps.projects.length &&
		prevProps.projects.every((project, index) => 
			project.id === nextProps.projects[index]?.id &&
			project.title === nextProps.projects[index]?.title &&
			project.status === nextProps.projects[index]?.status &&
			project.description === nextProps.projects[index]?.description &&
			project.business_area?.id === nextProps.projects[index]?.business_area?.id
		) &&
		prevProps.onClose === nextProps.onClose
	);
});
