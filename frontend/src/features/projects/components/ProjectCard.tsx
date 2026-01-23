import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { IProjectData } from "@/shared/types/project.types";
import {
	getProjectStatusDisplay,
	getProjectTag,
	getProjectStatusColor,
	getProjectKindColor,
} from "../utils/project.utils";

interface ProjectCardProps {
	project: IProjectData;
	layout?: "modern" | "traditional";
}

/**
 * ProjectCard component displays individual project information
 * - Shows project image with fallback
 * - Displays title, status, kind, year, and number
 * - Click to navigate to detail page
 * - Ctrl+click to open in new tab
 * - Responsive layout
 */
export function ProjectCard({ project, layout: _layout = "modern" }: ProjectCardProps) {
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
	const statusColor = getProjectStatusColor(project.status);
	const kindColor = getProjectKindColor(project.kind);

	// Get image URL
	const imageUrl = project.image?.file || "/no-image-placeholder.png";

	return (
		<Card
			className={cn(
				"group relative h-[325px] cursor-pointer overflow-hidden rounded-2xl transition-all duration-300",
				"hover:scale-105 hover:shadow-2xl",
				"border border-gray-200 dark:border-gray-700"
			)}
			onClick={handleClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Project Tag (top-left) */}
			<div className="absolute left-2 top-2 z-10">
				<Badge
					className={cn(
						"px-2 py-1 text-xs font-semibold text-white",
						kindColor === "blue" && "bg-blue-600",
						kindColor === "green" && "bg-green-500",
						kindColor === "purple" && "bg-purple-500",
						kindColor === "orange" && "bg-orange-500",
						kindColor === "gray" && "bg-gray-500"
					)}
				>
					{projectTag}
				</Badge>
			</div>

			{/* Status Badge (top-right, shows on hover) */}
			{hovered && (
				<div className="absolute right-0 top-2 z-10 animate-in slide-in-from-right duration-300">
					<Badge
						className={cn(
							"rounded-l-2xl px-5 py-1 text-xs font-normal text-white",
							statusColor === "blue" && "bg-blue-600",
							statusColor === "green" && "bg-green-500",
							statusColor === "yellow" && "bg-yellow-500",
							statusColor === "orange" && "bg-orange-500",
							statusColor === "purple" && "bg-purple-500",
							statusColor === "red" && "bg-red-500",
							statusColor === "gray" && "bg-gray-500"
						)}
					>
						{statusDisplay}
					</Badge>
				</div>
			)}

			{/* Image */}
			<div className="relative h-full w-full">
				{!imageLoaded && !imageError && (
					<div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800" />
				)}
				<img
					src={imageUrl}
					alt={project.title}
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

				{/* Gradient overlay */}
				<div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-black/75 to-transparent" />

				{/* Title (bottom-left) */}
				<div className="absolute bottom-0 left-0 z-10 p-4">
					<h3
						className="line-clamp-3 text-[17px] font-semibold text-white"
						dangerouslySetInnerHTML={{ __html: project.title }}
					/>
				</div>
			</div>
		</Card>
	);
}
