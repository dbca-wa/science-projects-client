import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import type { IProjectData } from "@/shared/types/project.types";
import { getProjectStatusDisplay, getProjectTag } from "../utils/project.utils";
import { getImageUrl } from "@/shared/utils/image.utils";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import {
	PROJECT_KIND_COLORS,
	PROJECT_STATUS_COLORS,
} from "@/shared/constants/project-colors";

interface ProjectCardProps {
	project: IProjectData;
}

/**
 * ProjectCard component displays individual project information
 * - Shows project image with fallback
 * - Displays title, status, kind, year, and number
 * - Click to navigate to detail page
 * - Ctrl+click to open in new tab
 * - Responsive layout
 */
export function ProjectCard({ project }: ProjectCardProps) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);
	const [hovered, setHovered] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const handleClick = (e: React.MouseEvent) => {
		if (e.ctrlKey || e.metaKey) {
			// Ctrl/Cmd + Click: Open in new tab
			window.open(`/projects/${project.id}/overview`, "_blank");
		} else {
			// Normal click: Navigate
			if (location.pathname.endsWith("/projects")) {
				navigate(`${project.id}/overview`);
			} else {
				navigate(`/projects/${project.id}/overview`);
			}
		}
	};

	const projectTag = getProjectTag(project);
	const statusDisplay = getProjectStatusDisplay(project.status);

	// Get colors from constants
	const kindColor = project.kind
		? PROJECT_KIND_COLORS[project.kind]
		: PROJECT_KIND_COLORS.science;
	const statusColor = project.status
		? PROJECT_STATUS_COLORS[project.status]
		: PROJECT_STATUS_COLORS.new;

	// Get image URL using shared utility
	const imageUrl = getImageUrl(project.image);
	const hasImage = !!imageUrl;

	// Sanitise title to remove HTML tags (including bold)
	const plainTextTitle = sanitizeInput(project.title);

	return (
		<Card
			className={cn(
				"group relative h-[325px] cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 p-0",
				"hover:scale-105 hover:shadow-2xl",
				"border border-gray-200 dark:border-gray-700"
			)}
			onClick={handleClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Project Tag (top-left) */}
			<div className="absolute left-2 top-2 z-10">
				<span
					className="inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold text-white"
					style={{ backgroundColor: kindColor }}
				>
					{projectTag}
				</span>
			</div>

			{/* Status Badge (top-right, shows on hover) */}
			{hovered && (
				<div className="absolute right-0 top-2 z-10 animate-in slide-in-from-right duration-300">
					<span
						className="inline-flex items-center justify-center rounded-l-2xl px-5 py-1 text-xs font-normal text-white"
						style={{ backgroundColor: statusColor }}
					>
						{statusDisplay}
					</span>
				</div>
			)}

			{/* Image */}
			<div className="relative h-full w-full">
				{!imageLoaded && !imageError && (
					<div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800" />
				)}
				{hasImage && !imageError ? (
					<img
						src={imageUrl}
						alt={plainTextTitle}
						className={cn(
							"h-full w-full object-cover transition-opacity duration-300",
							imageLoaded ? "opacity-100" : "opacity-0"
						)}
						onLoad={() => setImageLoaded(true)}
						onError={() => {
							setImageError(true);
							setImageLoaded(true);
						}}
						loading="lazy"
					/>
				) : (
					<div className="project-fallback-image h-full w-full bg-cover bg-center bg-no-repeat" />
				)}

				{/* Gradient overlay */}
				<div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-black/75 to-transparent" />

				{/* Title (bottom-left) */}
				<div className="absolute bottom-0 left-0 z-10 p-4">
					<h3 className="line-clamp-3 text-[17px] font-semibold text-white">
						{plainTextTitle}
					</h3>
				</div>
			</div>
		</Card>
	);
}
