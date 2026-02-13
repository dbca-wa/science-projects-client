/**
 * Image Compression Standards
 *
 * These constants define the image handling standards for the application.
 * All image uploads should use these values unless there's a specific reason to override.
 *
 * Key Decision: 1MB Maximum File Size
 * =====================================
 * Optimized for annual report generation (240+ pages with many images).
 * 1MB at 1920px provides excellent quality while keeping report size manageable.
 *
 * Benefits:
 * - 50 images at 1MB = 50MB report (vs 150MB at 3MB per image)
 * - Fast PDF generation
 * - Smooth page loads when displaying project lists
 * - 3x reduction in storage and bandwidth
 * - Excellent quality for web and PDF use cases
 */

/** Accepted MIME types for image uploads */
export const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/jpg",
] as const;

/** Maximum file size in bytes (1 MB) */
export const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024;

/** Maximum file size in MB for display */
export const MAX_IMAGE_SIZE_MB = 1;

/** Maximum width or height in pixels */
export const MAX_IMAGE_DIMENSION = 1920;

/** Type for accepted image MIME types */
export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];

/**
 * Variant-specific configurations
 *
 * These can be used to override defaults for specific use cases
 */
export interface ImageCompressionConfig {
	acceptedTypes: readonly string[];
	maxSizeMB: number;
	maxDimension: number;
}

/** Default compression configuration */
export const DEFAULT_COMPRESSION_CONFIG: ImageCompressionConfig = {
	acceptedTypes: ACCEPTED_IMAGE_TYPES,
	maxSizeMB: MAX_IMAGE_SIZE_MB,
	maxDimension: MAX_IMAGE_DIMENSION,
};

/**
 * Variant-specific overrides (if needed in the future)
 *
 * Example: Thumbnails might need smaller dimensions
 */
export const COMPRESSION_VARIANTS = {
	default: DEFAULT_COMPRESSION_CONFIG,
	avatar: DEFAULT_COMPRESSION_CONFIG,
	project: DEFAULT_COMPRESSION_CONFIG,
	banner: DEFAULT_COMPRESSION_CONFIG,
	// Future variants can be added here
} as const;
