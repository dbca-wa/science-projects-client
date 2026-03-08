import { useState, useCallback, useEffect, type RefObject } from "react";
import {
	type Crop,
	type PixelCrop,
	centerCrop,
	makeAspectCrop,
} from "react-image-crop";

interface UseImageCropReturn {
	crop: Crop;
	setCrop: (crop: Crop) => void;
	completedCrop: PixelCrop | null;
	setCompletedCrop: (crop: PixelCrop | null) => void;
	scale: number;
	setScale: (scale: number) => void;
	rotate: number;
	setRotate: (rotate: number) => void;
	aspect: number | undefined;
	setAspectRatio: (aspectRatio: number | undefined) => void;
	resetTransforms: () => void;
	onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
	rotatedImageUrl: string | null;
	imageBounds: { width: number; height: number; x: number; y: number } | null;
	canvasDimensions: { width: number; height: number } | null;
	constrainCrop: (crop: Crop) => Crop;
}

/**
 * Create a rotated version of the image that fits in the original dimensions
 * For 90/270 degree rotations, the image is scaled to fit within the original aspect ratio
 * Returns both the image URL and the bounds of the actual image within the canvas
 */
const createRotatedImage = async (
	imageUrl: string,
	rotation: number,
	originalWidth: number,
	originalHeight: number
): Promise<{
	url: string;
	bounds: { width: number; height: number; x: number; y: number };
} | null> => {
	if (rotation === 0) return null;

	return new Promise((resolve) => {
		const image = new Image();
		image.crossOrigin = "anonymous";
		image.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				resolve(null);
				return;
			}

			const rotRad = (rotation * Math.PI) / 180;

			// Keep canvas at original dimensions
			canvas.width = originalWidth;
			canvas.height = originalHeight;

			// Calculate the final drawn dimensions and position
			let drawWidth = image.width;
			let drawHeight = image.height;
			let finalWidth = image.width;
			let finalHeight = image.height;

			if (rotation === 90 || rotation === 270) {
				// For 90/270 degree rotations, scale the image to fit in the swapped dimensions
				const scaleX = originalWidth / image.height;
				const scaleY = originalHeight / image.width;
				const scale = Math.min(scaleX, scaleY);

				drawWidth = image.width * scale;
				drawHeight = image.height * scale;

				// After rotation, width and height are swapped
				finalWidth = drawHeight;
				finalHeight = drawWidth;
			} else if (rotation === 180) {
				// 180 degree rotation doesn't swap dimensions, but may need scaling
				const scaleX = originalWidth / image.width;
				const scaleY = originalHeight / image.height;
				const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

				drawWidth = image.width * scale;
				drawHeight = image.height * scale;
				finalWidth = drawWidth;
				finalHeight = drawHeight;
			}

			// Calculate bounds (where the image actually is in the canvas)
			const bounds = {
				width: finalWidth,
				height: finalHeight,
				x: (canvas.width - finalWidth) / 2,
				y: (canvas.height - finalHeight) / 2,
			};

			ctx.save();
			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.rotate(rotRad);
			ctx.drawImage(
				image,
				-drawWidth / 2,
				-drawHeight / 2,
				drawWidth,
				drawHeight
			);
			ctx.restore();

			resolve({
				url: canvas.toDataURL("image/jpeg", 0.95),
				bounds,
			});
		};
		image.src = imageUrl;
	});
};

/**
 * Custom hook for managing image crop state and operations
 *
 * @param defaultAspect - Default aspect ratio for the crop
 * @param imgRef - Ref to the image element
 * @returns Crop state and control functions
 */
export const useImageCrop = (
	defaultAspect: number,
	imgRef: RefObject<HTMLImageElement | null>,
	imageUrl: string
): UseImageCropReturn => {
	const [crop, setCrop] = useState<Crop>({
		unit: "%",
		width: 50,
		height: 50,
		x: 25,
		y: 25,
	});
	const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
	const [scale, setScale] = useState(1);
	const [rotate, setRotate] = useState(0);
	const [aspect, setAspect] = useState<number | undefined>(defaultAspect);
	const [rotatedImageUrl, setRotatedImageUrl] = useState<string | null>(null);
	const [originalDimensions, setOriginalDimensions] = useState<{
		width: number;
		height: number;
	} | null>(null);
	const [imageBounds, setImageBounds] = useState<{
		width: number;
		height: number;
		x: number;
		y: number;
	} | null>(null);
	const [canvasDimensions, setCanvasDimensions] = useState<{
		width: number;
		height: number;
	} | null>(null);

	// Create rotated image when rotation changes
	useEffect(() => {
		let cancelled = false;

		const updateRotatedImage = async () => {
			if (!originalDimensions) return;

			const result = await createRotatedImage(
				imageUrl,
				rotate,
				originalDimensions.width,
				originalDimensions.height
			);
			if (!cancelled && result) {
				setRotatedImageUrl(result.url);
				setImageBounds(result.bounds);
			} else if (!cancelled && rotate === 0) {
				setRotatedImageUrl(null);
				setImageBounds(null);
			}
		};

		updateRotatedImage();

		return () => {
			cancelled = true;
		};
	}, [imageUrl, rotate, originalDimensions]);

	const setAspectRatio = useCallback(
		(aspectRatio: number | undefined) => {
			setAspect(aspectRatio);

			if (aspectRatio && imgRef.current) {
				const { width, height } = imgRef.current;
				const imageAspect = width / height;

				// Calculate crop dimensions based on aspect ratio
				const cropWidth = aspectRatio > imageAspect ? 100 : 100 * aspectRatio;
				const cropHeight = aspectRatio > imageAspect ? 100 / aspectRatio : 100;

				const newCrop = centerCrop(
					makeAspectCrop(
						{
							unit: "%",
							width: cropWidth,
							height: cropHeight,
						},
						aspectRatio,
						width,
						height
					),
					width,
					height
				);

				setCrop(newCrop);
			}
		},
		[imgRef]
	);

	const resetTransforms = useCallback(() => {
		setScale(1);
		setRotate(0);
		setOriginalDimensions(null);
		setImageBounds(null);

		if (imgRef.current) {
			const { width, height } = imgRef.current;
			const newCrop = centerCrop(
				makeAspectCrop(
					{
						unit: "%",
						width: 100,
					},
					aspect || 1,
					width,
					height
				),
				width,
				height
			);
			setCrop(newCrop);
		}
	}, [aspect, imgRef]);

	const onImageLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement>) => {
			const { width, height } = e.currentTarget;

			// Store canvas dimensions for bounds overlay
			setCanvasDimensions({ width, height });

			// Store original dimensions on first load (when rotate is 0)
			if (rotate === 0 && !originalDimensions) {
				setOriginalDimensions({ width, height });
			}

			// Calculate the actual image bounds within the canvas
			let imageWidth = width;
			let imageHeight = height;
			let imageX = 0;
			let imageY = 0;

			if (imageBounds) {
				// Use the bounds from the rotated image
				imageWidth = imageBounds.width;
				imageHeight = imageBounds.height;
				imageX = imageBounds.x;
				imageY = imageBounds.y;
			}

			// Calculate crop dimensions that fit within the image bounds
			// while maintaining the fixed aspect ratio
			const targetAspect = aspect || 1;
			const imageAspect = imageWidth / imageHeight;

			let cropWidth: number;
			let cropHeight: number;

			if (targetAspect > imageAspect) {
				// Crop is wider than image - fit to width
				cropWidth = imageWidth * 0.9; // 90% of image width
				cropHeight = cropWidth / targetAspect;
			} else {
				// Crop is taller than image - fit to height
				cropHeight = imageHeight * 0.9; // 90% of image height
				cropWidth = cropHeight * targetAspect;
			}

			// Convert to percentages relative to canvas
			const cropWidthPercent = (cropWidth / width) * 100;
			const cropHeightPercent = (cropHeight / height) * 100;

			// Center the crop within the image bounds
			const cropX = imageX + (imageWidth - cropWidth) / 2;
			const cropY = imageY + (imageHeight - cropHeight) / 2;
			const cropXPercent = (cropX / width) * 100;
			const cropYPercent = (cropY / height) * 100;

			const newCrop: Crop = {
				unit: "%",
				width: cropWidthPercent,
				height: cropHeightPercent,
				x: cropXPercent,
				y: cropYPercent,
			};

			setCrop(newCrop);

			const pixelCrop: PixelCrop = {
				unit: "px",
				width: (newCrop.width * width) / 100,
				height: (newCrop.height * height) / 100,
				x: (newCrop.x * width) / 100,
				y: (newCrop.y * height) / 100,
			};
			setCompletedCrop(pixelCrop);
		},
		[rotate, originalDimensions, imageBounds, aspect]
	);

	// Constrain crop to stay within image bounds
	// This function clamps the crop values to prevent going into black areas
	const constrainCrop = useCallback(
		(newCrop: Crop): Crop => {
			// If no image bounds (rotation = 0), no constraint needed
			if (!imgRef.current || !imageBounds) {
				return newCrop;
			}

			const { width: canvasWidth, height: canvasHeight } = imgRef.current;
			const {
				width: imageWidth,
				height: imageHeight,
				x: imageX,
				y: imageY,
			} = imageBounds;

			// CRITICAL: Convert crop to percentages if it's in pixels
			let cropInPercent: Crop;
			if (newCrop.unit === "px") {
				cropInPercent = {
					unit: "%",
					x: (newCrop.x / canvasWidth) * 100,
					y: (newCrop.y / canvasHeight) * 100,
					width: (newCrop.width / canvasWidth) * 100,
					height: (newCrop.height / canvasHeight) * 100,
				};
			} else {
				cropInPercent = newCrop;
			}

			// Convert image bounds to percentages
			const minXPercent = (imageX / canvasWidth) * 100;
			const minYPercent = (imageY / canvasHeight) * 100;
			const maxXPercent = ((imageX + imageWidth) / canvasWidth) * 100;
			const maxYPercent = ((imageY + imageHeight) / canvasHeight) * 100;

			// Start with the crop values in percentages
			let { x, y, width, height } = cropInPercent;

			// First, constrain dimensions to fit within available space
			const maxAllowedWidth = maxXPercent - minXPercent;
			const maxAllowedHeight = maxYPercent - minYPercent;

			// If width is too large, reduce it and maintain aspect ratio
			if (width > maxAllowedWidth) {
				width = maxAllowedWidth;
				if (aspect) {
					height = width / aspect;
					// If height is now too large, scale down both
					if (height > maxAllowedHeight) {
						height = maxAllowedHeight;
						width = height * aspect;
					}
				}
			}

			// If height is too large, reduce it and maintain aspect ratio
			if (height > maxAllowedHeight) {
				height = maxAllowedHeight;
				if (aspect) {
					width = height * aspect;
					// If width is now too large, scale down both
					if (width > maxAllowedWidth) {
						width = maxAllowedWidth;
						height = width / aspect;
					}
				}
			}

			// Now constrain position to keep crop within bounds
			// Use Math.max/min for smooth clamping without jumps
			x = Math.max(minXPercent, Math.min(x, maxXPercent - width));
			y = Math.max(minYPercent, Math.min(y, maxYPercent - height));

			// Return in the same unit as input
			if (newCrop.unit === "px") {
				return {
					unit: "px",
					x: (x / 100) * canvasWidth,
					y: (y / 100) * canvasHeight,
					width: (width / 100) * canvasWidth,
					height: (height / 100) * canvasHeight,
				};
			}

			return {
				unit: "%",
				x,
				y,
				width,
				height,
			};
		},
		[imgRef, imageBounds, aspect]
	);

	return {
		crop,
		setCrop,
		completedCrop,
		setCompletedCrop,
		scale,
		setScale,
		rotate,
		setRotate,
		aspect,
		setAspectRatio,
		resetTransforms,
		onImageLoad,
		rotatedImageUrl,
		imageBounds,
		canvasDimensions,
		constrainCrop,
	};
};
