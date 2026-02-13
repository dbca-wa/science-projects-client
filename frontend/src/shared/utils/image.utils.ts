import { API_CONFIG } from "@/shared/services/api/config";
import type { IImageData } from "@/shared/types/media.types";

/**
 * Get full image URL from various image data formats
 * Handles both absolute URLs and relative paths
 *
 * @param image - Image data (can be string, object with file/old_file, or IImageData)
 * @returns Full image URL or undefined if no valid image
 */
export const getImageUrl = (
	image:
		| string
		| { file?: string; old_file?: string }
		| IImageData
		| null
		| undefined
): string | undefined => {
	if (!image) return undefined;

	// If it's a string
	if (typeof image === "string") {
		// Already a full URL
		if (image.startsWith("http")) {
			return image;
		}
		// Relative path - prepend backend URL
		return `${API_CONFIG.BASE_URL.replace("/api/v1/", "")}${image}`;
	}

	// If it's an object, try file first, then old_file
	const imagePath = image.file || image.old_file;

	if (!imagePath) return undefined;

	// Already a full URL
	if (imagePath.startsWith("http")) {
		return imagePath;
	}

	// Relative path - prepend backend URL
	return `${API_CONFIG.BASE_URL.replace("/api/v1/", "")}${imagePath}`;
};

/**
 * Get avatar URL specifically for user images
 * Alias for getImageUrl with better naming for user context
 */
export const getAvatarUrl = getImageUrl;
