import imageCompression from "browser-image-compression";
import {
	ACCEPTED_IMAGE_TYPES,
	MAX_IMAGE_SIZE_MB,
	MAX_IMAGE_DIMENSION,
} from "@/shared/constants/image.constants";

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
 * Compress an image file
 *
 * This is the main compression function that should be used throughout the application.
 * It validates the file type, compresses if needed, and returns the processed file.
 *
 * @param file - The image file to compress
 * @param options - Compression options (uses defaults from constants)
 * @returns Promise resolving to the compressed (or original) file
 * @throws ImageCompressionError if validation or compression fails
 *
 * @example
 * ```typescript
 * try {
 *   const compressed = await compressImage(file);
 *   // Upload compressed file
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
): Promise<File> => {
	const {
		acceptedTypes = ACCEPTED_IMAGE_TYPES,
		maxSizeMB = MAX_IMAGE_SIZE_MB,
		maxDimension = MAX_IMAGE_DIMENSION,
		useWebWorker = false, // Disabled to avoid CSP issues with CDN worker loading
	} = options;

	// Validate file type
	validateImageType(file, acceptedTypes);

	// Check if compression is needed
	if (!needsCompression(file, maxSizeMB)) {
		console.log(
			`File size ${(file.size / (1024 * 1024)).toFixed(2)}MB is within limit, skipping compression`
		);
		return file;
	}

	// Compress the file
	console.log(
		`File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds limit, compressing...`
	);

	try {
		const compressionOptions = {
			maxSizeMB,
			useWebWorker,
			maxWidthOrHeight: maxDimension,
		};

		const compressedBlob = await imageCompression(file, compressionOptions);
		const compressedFile = blobToFile(compressedBlob, file.name);

		console.log(
			`Compressed to ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`
		);

		return compressedFile;
	} catch (error) {
		console.error("Error during image compression:", error);
		throw new ImageCompressionError(
			"Failed to compress image. Please try a different file.",
			"COMPRESSION_FAILED"
		);
	}
};

/**
 * Callbacks for stateful compression (used by UI components)
 */
export interface ImageCompressionCallbacks {
	setIsError: (value: boolean) => void;
	setIsUploading: (value: boolean) => void;
	setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
	setSelectedImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
	setUploadProgress: (progress: number) => void;
	setProgressInterval: (interval: NodeJS.Timeout | null) => void;
	startSimulatedProgress: () => NodeJS.Timeout;
}

/**
 * Parameters for stateful image compression
 */
interface HandleImageCompressionParams {
	acceptedFile: File[];
	options?: CompressImageOptions;
	callbacks: ImageCompressionCallbacks;
	progressInterval: NodeJS.Timeout | null;
}

/**
 * Handle image compression with UI state management
 *
 * This function is used by components that need to show progress and handle errors.
 * For simple use cases, use `compressImage` instead.
 *
 * @param params - Compression parameters including callbacks
 * @returns Promise resolving to the compressed file or null if validation fails
 *
 * @example
 * ```typescript
 * const file = await handleImageFileCompression({
 *   acceptedFile: [selectedFile],
 *   options: { maxSizeMB: 1 },
 *   callbacks: {
 *     setIsError,
 *     setIsUploading,
 *     setSelectedFile,
 *     setSelectedImageUrl,
 *     setUploadProgress,
 *     setProgressInterval,
 *     startSimulatedProgress,
 *   },
 *   progressInterval,
 * });
 * ```
 */
export const handleImageFileCompression = async ({
	acceptedFile,
	options = {},
	callbacks,
	progressInterval,
}: HandleImageCompressionParams): Promise<File | null> => {
	const {
		setIsError,
		setIsUploading,
		setSelectedFile,
		setSelectedImageUrl,
		setUploadProgress,
		setProgressInterval,
		startSimulatedProgress,
	} = callbacks;

	// Reset state
	setIsError(false);
	setIsUploading(true);

	// Start progress simulation
	const newProgressInterval = startSimulatedProgress();
	setProgressInterval(newProgressInterval);

	const clearProgressInterval = () => {
		if (progressInterval) {
			clearInterval(progressInterval);
		}
	};

	try {
		const file = acceptedFile[0];
		if (!file) {
			throw new ImageCompressionError("No file provided", "INVALID_FILE");
		}

		// Compress the image
		const compressedFile = await compressImage(file, options);

		// Success - update state
		setSelectedFile(compressedFile);
		setSelectedImageUrl(URL.createObjectURL(compressedFile));
		clearProgressInterval();
		setUploadProgress(100);
		setIsUploading(false);

		return compressedFile;
	} catch (error) {
		console.error("Error in handleImageFileCompression:", error);
		clearProgressInterval();
		setIsError(true);
		setIsUploading(false);
		return null;
	}
};
