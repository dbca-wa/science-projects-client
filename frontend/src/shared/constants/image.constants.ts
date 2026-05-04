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
