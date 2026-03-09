import { ProjectImage } from "./ProjectImage";
import { ProjectTag } from "../badges/ProjectTag";
import { ProjectStatusOverlay } from "../ProjectStatusOverlay";
import type { IProjectData } from "@/shared/types/project.types";
import { cn } from "@/shared/lib/utils";

interface ProjectImageWithTagProps {
	project: IProjectData;
	alt?: string;
	className?: string;
}

/**
 * ProjectImageWithTag component
 *
 * Displays project image with ProjectTag overlay in top-right corner.
 * Uses responsive sizing with max-width constraint for optimal display.
 *
 * Layout:
 * - Image fills container with rounded corners
 * - Tag positioned absolutely in top-right corner with padding
 * - Responsive sizing ensures readability at all viewport sizes
 */
export function ProjectImageWithTag({
	project,
	alt,
	className,
}: ProjectImageWithTagProps) {
	return (
		<div className={cn("relative w-full h-full", className)}>
			{/* Project Image - More square aspect ratio */}
			<ProjectImage
				image={project.image}
				alt={alt || `${project.title} project image`}
				className="w-full h-full"
			/>

			{/* Status Overlay - Shows for suspended/terminated projects */}
			<ProjectStatusOverlay status={project.status} />

			{/* Project Tag Overlay */}
			<div className="absolute right-3 top-3">
				<ProjectTag project={project} />
			</div>
		</div>
	);
}
