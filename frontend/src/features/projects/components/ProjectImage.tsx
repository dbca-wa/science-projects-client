import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { getImageUrl } from "@/shared/utils/image.utils";
import type { ProjectImage } from "@/shared/types/project.types";

interface ProjectImageProps {
	image: ProjectImage | null | undefined;
	alt?: string;
	className?: string;
	fallbackSrc?: string;
}

/**
 * ProjectImage component displays project image with fallback
 * - Uses getImageUrl utility for URL handling
 * - Implements lazy loading
 * - Handles error states with dark/light mode fallback images
 * - Shows loading skeleton while image loads
 * - Uses CSS for theme-aware fallback (no re-renders)
 */
export function ProjectImage({
	image,
	alt = "Project image",
	className,
	fallbackSrc: _fallbackSrc, // Deprecated - now uses CSS-based fallback
}: ProjectImageProps) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);

	const imageUrl = getImageUrl(image);
	const hasImage = !!imageUrl;

	return (
		<div className={cn("relative overflow-hidden rounded-2xl", className)}>
			{/* Loading skeleton */}
			{!imageLoaded && !imageError && hasImage && (
				<div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800" />
			)}

			{/* Image or Fallback */}
			{hasImage && !imageError ? (
				<img
					src={imageUrl}
					alt={alt}
					loading="lazy"
					onLoad={() => setImageLoaded(true)}
					onError={() => {
						setImageError(true);
						setImageLoaded(true);
					}}
					className={cn(
						"h-full w-full object-cover transition-opacity duration-300",
						imageLoaded ? "opacity-100" : "opacity-0",
						"pointer-events-none select-none"
					)}
					style={{ imageRendering: "crisp-edges" }}
				/>
			) : (
				<div className="project-fallback-image h-full w-full bg-cover bg-center bg-no-repeat" />
			)}
		</div>
	);
}
