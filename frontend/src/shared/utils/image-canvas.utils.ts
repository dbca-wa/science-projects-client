import type { PixelCrop } from "react-image-crop";

/**
 * Generate a cropped image blob from an image element with crop, scale, and rotation
 *
 * @param image - The source image element
 * @param crop - The crop area in pixels
 * @param scale - Scale factor (1 = original size)
 * @param rotate - Rotation angle in degrees
 * @param targetWidth - Optional target width for the output
 * @param targetHeight - Optional target height for the output
 * @param pixelRatio - Canvas scaling factor. Defaults to the device pixel
 *   ratio, which keeps on-screen previews crisp. Pass 1 when the blob is
 *   destined for upload: scaling past the source resolution only interpolates
 *   pixels, so it inflates the file without adding any detail.
 * @returns Promise resolving to a Blob or null if canvas context unavailable
 */
export const generateCroppedImage = async (
	image: HTMLImageElement,
	crop: PixelCrop,
	scale: number,
	rotate: number,
	targetWidth?: number,
	targetHeight?: number,
	pixelRatio?: number
): Promise<Blob | null> => {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (!ctx) return null;

	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;

	// Crop dimensions in natural image coordinates
	const cropX = crop.x * scaleX;
	const cropY = crop.y * scaleY;
	const cropWidth = crop.width * scaleX;
	const cropHeight = crop.height * scaleY;

	// Calculate rotated dimensions
	const rotRad = (rotate * Math.PI) / 180;
	const rotatedWidth =
		Math.abs(Math.cos(rotRad) * cropWidth) +
		Math.abs(Math.sin(rotRad) * cropHeight);
	const rotatedHeight =
		Math.abs(Math.sin(rotRad) * cropWidth) +
		Math.abs(Math.cos(rotRad) * cropHeight);

	// Determine final canvas size
	let finalWidth: number;
	let finalHeight: number;

	if (targetWidth && targetHeight) {
		// Use target dimensions
		finalWidth = targetWidth;
		finalHeight = targetHeight;
	} else {
		// Use rotated dimensions
		finalWidth = rotatedWidth;
		finalHeight = rotatedHeight;
	}

	const effectivePixelRatio = pixelRatio ?? (window.devicePixelRatio || 1);
	canvas.width = finalWidth * effectivePixelRatio;
	canvas.height = finalHeight * effectivePixelRatio;

	ctx.scale(effectivePixelRatio, effectivePixelRatio);
	ctx.imageSmoothingQuality = "high";
	ctx.imageSmoothingEnabled = true;

	// Fill with white so transparent PNGs don't render with black backgrounds
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, finalWidth, finalHeight);

	ctx.save();

	// Move to center of canvas
	ctx.translate(finalWidth / 2, finalHeight / 2);

	// Apply rotation
	ctx.rotate(rotRad);

	// Apply scale
	ctx.scale(scale, scale);

	// If we have target dimensions, scale to fit/cover
	if (targetWidth && targetHeight) {
		const scaleToFitWidth = finalWidth / rotatedWidth;
		const scaleToFitHeight = finalHeight / rotatedHeight;
		const scaleToFit = Math.max(scaleToFitWidth, scaleToFitHeight);
		ctx.scale(scaleToFit, scaleToFit);
	}

	// Draw the cropped portion centered
	ctx.drawImage(
		image,
		cropX,
		cropY,
		cropWidth,
		cropHeight,
		-cropWidth / 2,
		-cropHeight / 2,
		cropWidth,
		cropHeight
	);

	ctx.restore();

	return new Promise((resolve) => {
		canvas.toBlob(
			(blob) => {
				resolve(blob);
			},
			"image/jpeg",
			0.95
		);
	});
};

/**
 * Generate a preview URL from a cropped image
 *
 * @param image - The source image element
 * @param crop - The crop area in pixels
 * @param scale - Scale factor (1 = original size)
 * @param rotate - Rotation angle in degrees
 * @param targetWidth - Optional target width for the output
 * @param targetHeight - Optional target height for the output
 * @returns Promise resolving to an object URL or null
 */
export const generatePreviewUrl = async (
	image: HTMLImageElement,
	crop: PixelCrop,
	scale: number,
	rotate: number,
	targetWidth?: number,
	targetHeight?: number
): Promise<string | null> => {
	const blob = await generateCroppedImage(
		image,
		crop,
		scale,
		rotate,
		targetWidth,
		targetHeight
	);
	if (!blob) return null;
	return URL.createObjectURL(blob);
};
