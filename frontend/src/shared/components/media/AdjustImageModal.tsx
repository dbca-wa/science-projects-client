import { useRef } from "react";
import "react-image-crop/dist/ReactCrop.css";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { LivePreviews } from "./previews/LivePreviews.tsx";
import { CropControls } from "./CropControls.tsx";
import { useImageCrop } from "@/shared/hooks/useImageCrop";
import { useImagePreview } from "@/shared/hooks/useImagePreview";
import { generateCroppedImage } from "@/shared/utils/image-canvas.utils";
import { useWindowSize } from "@/shared/hooks/useWindowSize";

interface AdjustImageModalProps {
	isOpen: boolean;
	onClose: () => void;
	imageUrl: string;
	onCropComplete: (croppedFile: File) => void;
	fileName?: string;
	defaultAspect?: number;
	variant?: "avatar" | "project" | "banner" | "report" | "default";
	/** Label for report media previews (e.g. "Service Delivery Structure") */
	reportSectionLabel?: string;
	/** Preview layout type for report media */
	reportPreviewType?: "chapter" | "banner-full" | "banner-cropped" | "chart";
}

/**
 * AdjustImageModal Component
 * Modal for cropping, rotating, and scaling images
 * Uses react-image-crop library
 */
export const AdjustImageModal = ({
	isOpen,
	onClose,
	imageUrl,
	onCropComplete,
	fileName = "cropped-image.jpg",
	defaultAspect = 1,
	variant = "default",
	reportSectionLabel,
	reportPreviewType,
}: AdjustImageModalProps) => {
	const imgRef = useRef<HTMLImageElement>(null);
	const previewSectionRef = useRef<HTMLDivElement>(null);
	const { width } = useWindowSize();
	const isLargeScreen = width >= 1140;

	// Use custom hooks for crop state and preview generation
	const cropState = useImageCrop(defaultAspect, imgRef, imageUrl);
	const previewUrls = useImagePreview(
		cropState.completedCrop,
		imgRef,
		cropState.scale,
		cropState.rotate,
		variant
	);

	// Use rotated image URL if rotation is applied, otherwise use original
	const displayImageUrl = cropState.rotatedImageUrl || imageUrl;

	const handleApplyCrop = async () => {
		if (!cropState.completedCrop || !imgRef.current) return;

		try {
			const blob = await generateCroppedImage(
				imgRef.current,
				cropState.completedCrop,
				cropState.scale,
				0 // Rotation already applied to image
			);

			if (blob) {
				const file = new File([blob], fileName, { type: "image/jpeg" });

				// Cleanup preview URLs
				if (previewUrls.avatar) URL.revokeObjectURL(previewUrls.avatar);
				if (previewUrls.profile) URL.revokeObjectURL(previewUrls.profile);
				if (previewUrls.projectCard)
					URL.revokeObjectURL(previewUrls.projectCard);

				onCropComplete(file);
				onClose();
			}
		} catch (error) {
			console.error("Error applying crop:", error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="sm:max-w-[1400px] max-h-[90vh] flex flex-col"
				enableScrollIndicators={true}
			>
				<DialogHeader>
					<DialogTitle>Adjust Image</DialogTitle>
					<DialogDescription>
						Crop, rotate, and scale your image
					</DialogDescription>
				</DialogHeader>

				<div
					className="flex gap-6 overflow-y-auto flex-1 min-h-0"
					data-scrollable
					style={{
						flexDirection: isLargeScreen ? "row" : "column",
					}}
				>
					{/* Left side - Crop controls (takes remaining space on large screens) */}
					<div
						className="flex-1"
						style={{
							minWidth: isLargeScreen ? "600px" : "auto",
						}}
					>
						<CropControls
							imageUrl={displayImageUrl}
							crop={cropState.crop}
							setCrop={cropState.setCrop}
							setCompletedCrop={cropState.setCompletedCrop}
							aspect={cropState.aspect}
							setAspectRatio={cropState.setAspectRatio}
							scale={cropState.scale}
							setScale={cropState.setScale}
							rotate={cropState.rotate}
							setRotate={cropState.setRotate}
							resetTransforms={cropState.resetTransforms}
							onImageLoad={cropState.onImageLoad}
							imgRef={imgRef}
							variant={variant}
							constrainCrop={cropState.constrainCrop}
							imageBounds={cropState.imageBounds}
							canvasDimensions={cropState.canvasDimensions}
						/>
					</div>

					{/* Right side - Live previews (fixed 360px width on large screens, full width below) */}
					<div
						ref={previewSectionRef}
						className="flex-shrink-0"
						style={{
							width: isLargeScreen ? "360px" : "100%",
						}}
					>
						<LivePreviews
							variant={variant}
							previewUrls={previewUrls}
							completedCrop={!!cropState.completedCrop}
							reportSectionLabel={reportSectionLabel}
							reportPreviewType={reportPreviewType}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="button" onClick={handleApplyCrop}>
						Apply
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
