import imageCompression from "browser-image-compression";
import {
	ACCEPTED_IMAGE_TYPES,
	MAX_IMAGE_SIZE_MB,
	MAX_IMAGE_DIMENSION,
} from "@/shared/constants/image.constants";
import {
	getWorkerConfig,
	logWorkerMetrics,
	type WorkerMetrics,
} from "./worker.utils";
import { getCompressionWorkerUrl } from "./compression-worker";

/**
 * Error types for image compression
 */
export class ImageCompressionError extends Error {
	public code: "INVALID_TYPE" | "COMPRESSION_FAILED" | "INVALID_FILE";

	constructor(
		message: string,
		code: "INVALID_TYPE" | "COMPRESSION_FAILED" | "INVALID_FILE"
	) {
		super(message);
		this.name = "ImageCompressionError";
		this.code = code;
	}
}

/**
 * Options for image compression
 */
export interface CompressImageOptions {
	acceptedTypes?: readonly string[];
	maxSizeMB?: number;
	maxDimension?: number;
	useWebWorker?: boolean;
	onProgress?: (progress: number) => void;
}

/**
 * Result of image compression including metrics
 */
export interface CompressionResult {
	file: File;
	metrics: WorkerMetrics;
}

/**
 * Convert a Blob to a File object
 *
 * @param blob - The Blob to convert
 * @param fileName - The name for the resulting File
 * @returns A File object
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
	return new File([blob], fileName, {
		type: blob.type,
		lastModified: Date.now(),
	});
};

/**
 * Validate image file type
 *
 * @param file - The file to validate
 * @param acceptedTypes - Array of accepted MIME types
 * @throws ImageCompressionError if file type is invalid
 */
export const validateImageType = (
	file: File,
	acceptedTypes: readonly string[] = ACCEPTED_IMAGE_TYPES
): void => {
	if (!file.type) {
		throw new ImageCompressionError(
			"File has no type information",
			"INVALID_FILE"
		);
	}

	if (!acceptedTypes.includes(file.type)) {
		throw new ImageCompressionError(
			`Invalid file type: ${file.type}. Accepted types: ${acceptedTypes.join(", ")}`,
			"INVALID_TYPE"
		);
	}
};

/**
 * Check if file needs compression
 *
 * @param file - The file to check
 * @param maxSizeMB - Maximum size in MB
 * @returns True if file exceeds size limit
 */
export const needsCompression = (
	file: File,
	maxSizeMB: number = MAX_IMAGE_SIZE_MB
): boolean => {
	const fileSizeMB = file.size / (1024 * 1024);
	return fileSizeMB > maxSizeMB;
};

/**
 * Read the pixel dimensions of an image file
 *
 * @param file - The image file to measure
 * @returns The dimensions, or null if they cannot be determined
 */
export const getImageDimensions = async (
	file: File
): Promise<{ width: number; height: number } | null> => {
	// createImageBitmap decodes without attaching to the DOM and, unlike the
	// Image element, always settles. Environments without it (jsdom) fall back
	// to the size-only check.
	if (typeof createImageBitmap !== "function") {
		return null;
	}

	try {
		const bitmap = await createImageBitmap(file);
		const { width, height } = bitmap;
		bitmap.close?.();
		return width && height ? { width, height } : null;
	} catch {
		return null;
	}
};

/**
 * Check whether an image exceeds the maximum pixel dimension
 *
 * A file can sit comfortably under the size limit while still being many
 * thousands of pixels wide. Those images have to be downscaled too, because
 * anything that later re-encodes them at high quality (such as the crop
 * canvas) will inflate them well beyond the size limit.
 *
 * @param file - The image file to check
 * @param maxDimension - Maximum allowed width or height in pixels
 * @returns True if the image is larger than maxDimension on either axis
 */
export const exceedsMaxDimension = async (
	file: File,
	maxDimension: number = MAX_IMAGE_DIMENSION
): Promise<boolean> => {
	const dimensions = await getImageDimensions(file);
	if (!dimensions) return false;
	return Math.max(dimensions.width, dimensions.height) > maxDimension;
};

/**
 * Compress an image file with Web Worker support
 *
 * This is the main compression function that should be used throughout the application.
 * It validates the file type, compresses if needed using Web Workers (when available),
 * and returns the processed file with performance metrics.
 *
 * @param file - The image file to compress
 * @param options - Compression options (uses defaults from constants)
 * @returns Promise resolving to compression result with file and metrics
 * @throws ImageCompressionError if validation or compression fails
 *
 * @example
 * ```typescript
 * try {
 *   const result = await compressImage(file);
 *   // Upload result.file
 *   console.log('Compression metrics:', result.metrics);
 * } catch (error) {
 *   if (error instanceof ImageCompressionError) {
 *     toast.error(error.message);
 *   }
 * }
 * ```
 */
export const compressImage = async (
	file: File,
	options: CompressImageOptions = {}
): Promise<CompressionResult> => {
	const startTime = performance.now();
	const originalSize = file.size;

	const {
		acceptedTypes = ACCEPTED_IMAGE_TYPES,
		maxSizeMB = MAX_IMAGE_SIZE_MB,
		maxDimension = MAX_IMAGE_DIMENSION,
		useWebWorker = getWorkerConfig().useWebWorker, // Auto-detect Web Worker support
		onProgress,
	} = options;

	// Validate file type
	validateImageType(file, acceptedTypes);

	// Compress when the file is too large OR too many pixels. Checking pixel
	// dimensions matters because a modest file can still be very high
	// resolution — manually shrinking a photo to just under the size limit
	// used to bypass compression entirely and keep its full resolution.
	const oversized = needsCompression(file, maxSizeMB);
	const tooManyPixels = oversized
		? false
		: await exceedsMaxDimension(file, maxDimension);

	if (!oversized && !tooManyPixels) {
		return {
			file,
			metrics: {
				workerCreated: false,
				compressionTime: 0,
				originalSize,
				compressedSize: originalSize,
				compressionRatio: 1,
			},
		};
	}

	try {
		// Get local worker URL if using Web Workers
		// This prevents the library from loading from CDN, which would violate CSP
		const workerUrl = useWebWorker ? getCompressionWorkerUrl() : undefined;

		// If worker URL creation failed, fall back to main thread
		const actualUseWebWorker = useWebWorker && workerUrl !== null;

		if (useWebWorker && !actualUseWebWorker) {
			console.warn(
				"Worker URL creation failed, falling back to main thread compression"
			);
		}

		const compressionOptions = {
			maxSizeMB,
			useWebWorker: actualUseWebWorker,
			maxWidthOrHeight: maxDimension,
			onProgress,
			// Pass local worker URL to prevent CDN loading (CSP compliance)
			...(workerUrl && { libURL: workerUrl }),
		};

		const compressedBlob = await imageCompression(file, compressionOptions);
		const compressedFile = blobToFile(compressedBlob, file.name);
		const compressionTime = performance.now() - startTime;

		const metrics: WorkerMetrics = {
			workerCreated: actualUseWebWorker,
			compressionTime,
			originalSize,
			compressedSize: compressedFile.size,
			compressionRatio: compressedFile.size / originalSize,
		};

		logWorkerMetrics(metrics);

		return { file: compressedFile, metrics };
	} catch (error) {
		console.error("Error during image compression:", error);

		// If Web Worker failed, try fallback to main thread
		if (useWebWorker && getWorkerConfig().fallbackToMainThread) {
			console.warn("Retrying compression on main thread...");
			return compressImage(file, { ...options, useWebWorker: false });
		}

		throw new ImageCompressionError(
			"Failed to compress image. Please try a different file.",
			"COMPRESSION_FAILED"
		);
	}
};
