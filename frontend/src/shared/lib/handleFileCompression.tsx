import imageCompression from "browser-image-compression";

export interface ImageCompressionOptions {
	acceptedImageTypes: string[];
	maxSizeMB: number;
	maxWidthOrHeight: number;
}

export interface ImageCompressionCallbacks {
	setIsError: (value: boolean) => void;
	setIsUploading: (value: boolean) => void;
	setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
	setSelectedImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
	setUploadProgress: (progress: number) => void;
	setProgressInterval: (interval: NodeJS.Timeout | null) => void;
	startSimulatedProgress: () => NodeJS.Timeout;
}
interface HandleImageCompressionParams {
	acceptedFile: File[];
	options: ImageCompressionOptions;
	callbacks: ImageCompressionCallbacks;
	progressInterval: NodeJS.Timeout | null;
}

/**
 * Convert a Blob to a File object
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
	return new File([blob], fileName, {
		type: blob.type,
		lastModified: Date.now(),
	});
};

/**
 * Validate, compress, and prepare an image file for upload
 * @returns The processed file or null if validation fails
 */
export const handleImageFileCompression = async ({
	acceptedFile,
	options,
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

	const { acceptedImageTypes, maxSizeMB, maxWidthOrHeight } = options;

	// Reset state
	setIsError(false);
	setIsUploading(true);

	// Start progress simulation
	const newProgressInterval = startSimulatedProgress();
	setProgressInterval(newProgressInterval);

	let fileToUpload = acceptedFile[0];

	if (!fileToUpload?.type) {
		clearProgressInterval();
		setIsError(true);
		return null;
	}

	// Validate file type
	if (!acceptedImageTypes.includes(fileToUpload.type)) {
		console.error("Invalid file type:", fileToUpload.type);
		clearProgressInterval();
		setIsError(true);
		return null;
	}

	console.log("File type validated:", fileToUpload.type);

	// Check if compression is needed
	const fileSizeMB = fileToUpload.size / (1024 * 1024);
	if (fileSizeMB > maxSizeMB) {
		console.log(
			`File size ${fileSizeMB.toFixed(2)}MB exceeds limit, compressing...`
		);

		try {
			const compressionOptions = {
				maxSizeMB,
				useWebWorker: true,
				maxWidthOrHeight,
			};

			const compressedBlob = await imageCompression(
				fileToUpload,
				compressionOptions
			);
			fileToUpload = blobToFile(compressedBlob, fileToUpload.name);

			const compressedSizeMB = fileToUpload.size / (1024 * 1024);
			console.log(`Compressed to ${compressedSizeMB.toFixed(2)}MB`);
		} catch (error) {
			console.error("Error during image compression:", error);
			clearProgressInterval();
			setIsError(true);
			setIsUploading(false);
			return null;
		}
	}

	// Success - update state
	setSelectedFile(fileToUpload);
	setSelectedImageUrl(URL.createObjectURL(fileToUpload));
	clearProgressInterval();
	setUploadProgress(100);

	return fileToUpload;

	// Helper to clear interval
	function clearProgressInterval() {
		if (progressInterval) {
			clearInterval(progressInterval);
		}
	}
};

/**
 * Simplified wrapper for common use cases
 */
export const compressImage = async (
	file: File,
	options: Partial<ImageCompressionOptions> = {}
): Promise<File> => {
	const defaultOptions: ImageCompressionOptions = {
		acceptedImageTypes: ["image/jpeg", "image/png", "image/jpg"],
		maxSizeMB: 3,
		maxWidthOrHeight: 1920,
		...options,
	};

	// Validate file type
	if (!defaultOptions.acceptedImageTypes.includes(file.type)) {
		throw new Error(
			`Invalid file type: ${
				file.type
			}. Accepted types: ${defaultOptions.acceptedImageTypes.join(", ")}`
		);
	}

	const fileSizeMB = file.size / (1024 * 1024);

	// Return original if already small enough
	if (fileSizeMB <= defaultOptions.maxSizeMB) {
		return file;
	}

	// Compress
	const compressionOptions = {
		maxSizeMB: defaultOptions.maxSizeMB,
		useWebWorker: true,
		maxWidthOrHeight: defaultOptions.maxWidthOrHeight,
	};

	const compressedBlob = await imageCompression(file, compressionOptions);
	return blobToFile(compressedBlob, file.name);
};
