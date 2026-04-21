import { useState, useEffect, type RefObject } from "react";
import type { PixelCrop } from "react-image-crop";
import { generatePreviewUrl } from "@/shared/utils/image-canvas.utils";

interface PreviewUrls {
	avatar: string | null;
	profile: string | null;
	projectCard: string | null;
}

/**
 * Custom hook for managing image preview generation and cleanup
 *
 * @param completedCrop - The completed crop area in pixels
 * @param imgRef - Ref to the image element
 * @param scale - Scale factor
 * @param rotate - Rotation angle in degrees
 * @param variant - Image variant (avatar, project, banner, default)
 * @returns Preview URLs for different contexts
 */
export const useImagePreview = (
	completedCrop: PixelCrop | null,
	imgRef: RefObject<HTMLImageElement | null>,
	scale: number,
	rotate: number,
	variant: "avatar" | "project" | "banner" | "report" | "default"
): PreviewUrls => {
	const [previewUrls, setPreviewUrls] = useState<PreviewUrls>({
		avatar: null,
		profile: null,
		projectCard: null,
	});

	// Generate previews with debouncing
	useEffect(() => {
		const timeoutId = setTimeout(async () => {
			if (completedCrop && imgRef.current) {
				try {
					// For project variant, generate larger legible previews
					if (variant === "project") {
						// Project Card Preview (200px width with 25:18 aspect ratio)
						const projectCardUrl = await generatePreviewUrl(
							imgRef.current,
							completedCrop,
							scale,
							0, // Rotation already applied to image
							200,
							Math.round((200 * 18) / 25) // 144px height
						);

						// Annual Report Preview (180×130px - smaller visual size, maintains aspect ratio)
						const annualReportUrl = await generatePreviewUrl(
							imgRef.current,
							completedCrop,
							scale,
							0, // Rotation already applied to image
							180,
							130
						);

						if (projectCardUrl && annualReportUrl) {
							const oldProjectCardUrl = previewUrls.projectCard;
							const oldProfileUrl = previewUrls.profile;

							setPreviewUrls({
								avatar: null,
								profile: annualReportUrl, // Reuse for annual report
								projectCard: projectCardUrl,
							});

							// Cleanup old URLs after a short delay
							setTimeout(() => {
								if (oldProjectCardUrl) URL.revokeObjectURL(oldProjectCardUrl);
								if (oldProfileUrl) URL.revokeObjectURL(oldProfileUrl);
							}, 50);
						}
					} else if (variant === "avatar") {
						// For avatar variant, always generate square previews (200x200)
						const avatarUrl = await generatePreviewUrl(
							imgRef.current,
							completedCrop,
							scale,
							0, // Rotation already applied to image
							200,
							200 // Force square aspect ratio
						);

						const profileUrl = await generatePreviewUrl(
							imgRef.current,
							completedCrop,
							scale,
							0, // Rotation already applied to image
							200,
							200 // Force square aspect ratio
						);

						if (avatarUrl && profileUrl) {
							const oldAvatarUrl = previewUrls.avatar;
							const oldProfileUrl = previewUrls.profile;
							const oldProjectCardUrl = previewUrls.projectCard;

							setPreviewUrls({
								avatar: avatarUrl,
								profile: profileUrl,
								projectCard: avatarUrl, // Use avatar for project card too
							});

							// Cleanup old URLs after a short delay
							setTimeout(() => {
								if (oldAvatarUrl) URL.revokeObjectURL(oldAvatarUrl);
								if (oldProfileUrl) URL.revokeObjectURL(oldProfileUrl);
								if (oldProjectCardUrl) URL.revokeObjectURL(oldProjectCardUrl);
							}, 50);
						}
					} else {
						// For other variants (banner, default), generate preview without fixed dimensions
						const previewUrl = await generatePreviewUrl(
							imgRef.current,
							completedCrop,
							scale,
							0 // Rotation already applied to image
						);

						if (previewUrl) {
							const oldAvatarUrl = previewUrls.avatar;
							const oldProfileUrl = previewUrls.profile;
							const oldProjectCardUrl = previewUrls.projectCard;

							setPreviewUrls({
								avatar: previewUrl,
								profile: previewUrl,
								projectCard: previewUrl,
							});

							// Cleanup old URLs after a short delay
							setTimeout(() => {
								if (oldAvatarUrl) URL.revokeObjectURL(oldAvatarUrl);
								if (oldProfileUrl) URL.revokeObjectURL(oldProfileUrl);
								if (oldProjectCardUrl) URL.revokeObjectURL(oldProjectCardUrl);
							}, 50);
						}
					}
				} catch (error) {
					console.error("Error generating preview:", error);
				}
			}
		}, 100);

		return () => {
			clearTimeout(timeoutId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [completedCrop, scale, rotate, variant]);

	// Cleanup URLs on unmount
	useEffect(() => {
		return () => {
			if (previewUrls.avatar) URL.revokeObjectURL(previewUrls.avatar);
			if (previewUrls.profile) URL.revokeObjectURL(previewUrls.profile);
			if (previewUrls.projectCard) URL.revokeObjectURL(previewUrls.projectCard);
		};
	}, [previewUrls]);

	return previewUrls;
};
