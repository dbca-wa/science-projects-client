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
 * - Handles error states with fallback image
 * - Shows loading skeleton while image loads
 */
export function ProjectImage({
	image,
	alt = "Project image",
	className,
	fallbackSrc = "/no-image-light.jpg",
}: ProjectImageProps) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);

	const imageUrl = getImageUrl(image);
	const displayUrl = imageError || !imageUrl ? fallbackSrc : imageUrl;

	return (
		<div className={cn("relative overflow-hidden rounded-2xl", className)}>
			{/* Loading skeleton */}
			{!imageLoaded && (
				<div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800" />
			)}

			{/* Image */}
			<img
				src={displayUrl}
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
		</div>
	);
}
