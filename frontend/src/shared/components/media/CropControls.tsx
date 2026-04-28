import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { Label } from "@/shared/components/ui/label";
import {
	RotateCcw,
	RotateCw,
	Maximize,
	Square,
	RectangleHorizontal,
	RectangleVertical,
} from "lucide-react";

interface CropControlsProps {
	imageUrl: string;
	crop: Crop;
	setCrop: (crop: Crop) => void;
	setCompletedCrop: (crop: PixelCrop) => void;
	aspect: number | undefined;
	setAspectRatio: (aspect: number | undefined) => void;
	scale: number;
	setScale: (scale: number) => void;
	rotate: number;
	setRotate: (rotate: number) => void;
	resetTransforms: () => void;
	onImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => void;
	imgRef: React.RefObject<HTMLImageElement | null>;
	variant: "avatar" | "project" | "banner" | "report" | "default";
	constrainCrop: (crop: Crop) => Crop;
	imageBounds: { width: number; height: number; x: number; y: number } | null;
	canvasDimensions: { width: number; height: number } | null;
}

/**
 * CropControls Component
 * Handles all crop-related controls: aspect ratio, rotation, scale
 */
/**
 * Validates image URL to prevent XSS attacks
 * Only allows safe protocols: http, https, blob, data
 * Rejects javascript: and other malicious URIs
 */
function isValidImageUrl(url: string): boolean {
	if (!url) return false;

	try {
		const parsed = new URL(url, window.location.href);

		// Allow only safe protocols
		const safeProtocols = ["http:", "https:", "blob:", "data:"];
		if (!safeProtocols.includes(parsed.protocol)) {
			console.warn(`Rejected unsafe image URL protocol: ${parsed.protocol}`);
			return false;
		}

		return true;
	} catch {
		// Invalid URL
		console.warn("Rejected invalid image URL");
		return false;
	}
}

export const CropControls = ({
	imageUrl,
	crop,
	setCrop,
	setCompletedCrop,
	aspect,
	setAspectRatio,
	scale,
	setScale,
	rotate,
	setRotate,
	resetTransforms,
	onImageLoad,
	imgRef,
	variant,
	constrainCrop,
	imageBounds,
	canvasDimensions,
}: CropControlsProps) => {
	// Validate image URL to prevent XSS
	const isUrlValid = isValidImageUrl(imageUrl);

	return (
		<div className="space-y-4 min-w-0">
			{/* Aspect Ratio Buttons */}
			<div className="flex flex-wrap gap-2">
				{/* Project variant: Only show 25:18 (locked) */}
				{variant === "project" && (
					<Button type="button" variant="default" size="sm" disabled>
						<RectangleHorizontal className="mr-2 size-4" />
						25:18 (Fixed)
					</Button>
				)}

				{/* Avatar variant: Only show 1:1 (locked) */}
				{variant === "avatar" && (
					<Button type="button" variant="default" size="sm" disabled>
						<Square className="mr-2 size-4" />
						1:1 (Fixed)
					</Button>
				)}

				{/* Report variant: Show locked aspect ratio */}
				{variant === "report" && (
					<Button type="button" variant="default" size="sm" disabled>
						<RectangleHorizontal className="mr-2 size-4" />
						Fixed Aspect
					</Button>
				)}

				{/* Banner variant: Only show 16:9 and Free */}
				{variant === "banner" && (
					<>
						<Button
							type="button"
							variant={aspect === 16 / 9 ? "default" : "outline"}
							size="sm"
							onClick={() => setAspectRatio(16 / 9)}
						>
							<RectangleHorizontal className="mr-2 size-4" />
							16:9 (Recommended)
						</Button>
						<Button
							type="button"
							variant={aspect === undefined ? "default" : "outline"}
							size="sm"
							onClick={() => setAspectRatio(undefined)}
						>
							<Maximize className="mr-2 size-4" />
							Free
						</Button>
					</>
				)}

				{/* Default variant: Show all options */}
				{variant === "default" && (
					<>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setAspectRatio(16 / 9)}
						>
							<RectangleHorizontal className="mr-2 size-4" />
							16:9
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setAspectRatio(4 / 3)}
						>
							<RectangleHorizontal className="mr-2 size-4" />
							4:3
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setAspectRatio(1)}
						>
							<Square className="mr-2 size-4" />
							1:1
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setAspectRatio(3 / 4)}
						>
							<RectangleVertical className="mr-2 size-4" />
							3:4
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setAspectRatio(undefined)}
						>
							<Maximize className="mr-2 size-4" />
							Free
						</Button>
					</>
				)}
			</div>

			{/* Crop Area */}
			<div className="flex justify-center items-center bg-muted p-4 rounded-lg min-h-[300px]">
				{isUrlValid ? (
					<div className="relative">
						<ReactCrop
							crop={crop}
							onChange={(c) => {
								// Apply constraint in real-time to prevent dragging outside bounds
								const constrained = constrainCrop(c);
								setCrop(constrained);
							}}
							onComplete={(c) => setCompletedCrop(c)}
							aspect={aspect}
						>
							<img
								ref={imgRef}
								src={imageUrl}
								alt="Crop preview"
								crossOrigin="anonymous"
								style={{
									transform: `scale(${scale})`,
									maxHeight: "50vh",
									maxWidth: "100%",
								}}
								onLoad={onImageLoad}
								onError={() => console.error("Failed to load image")}
							/>
						</ReactCrop>
						{/* Bounds overlay - shows actual image area */}
						{canvasDimensions && (
							<div
								style={{
									position: "absolute",
									left: imageBounds
										? `${(imageBounds.x / canvasDimensions.width) * 100}%`
										: "0%",
									top: imageBounds
										? `${(imageBounds.y / canvasDimensions.height) * 100}%`
										: "0%",
									width: imageBounds
										? `${(imageBounds.width / canvasDimensions.width) * 100}%`
										: "100%",
									height: imageBounds
										? `${(imageBounds.height / canvasDimensions.height) * 100}%`
										: "100%",
									border: "2px solid rgba(59, 130, 246, 0.5)",
									pointerEvents: "none",
									zIndex: 1000,
								}}
							/>
						)}
					</div>
				) : (
					<div className="text-destructive">Invalid image URL</div>
				)}
			</div>

			{/* Rotation Controls */}
			<div className="flex flex-wrap items-center gap-4">
				<Label className="min-w-[80px]">Rotation:</Label>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						const newRotate = rotate - 90;
						setRotate(newRotate < 0 ? 270 : newRotate);
					}}
				>
					<RotateCcw className="size-4" />
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => {
						const newRotate = rotate + 90;
						setRotate(newRotate > 270 ? 0 : newRotate);
					}}
				>
					<RotateCw className="size-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={resetTransforms}
				>
					Reset
				</Button>
			</div>

			{/* Scale Control */}
			<div className="space-y-2 pb-4">
				<div className="flex items-center justify-between">
					<Label>Scale: {scale.toFixed(2)}x</Label>
				</div>
				<Slider
					value={[scale]}
					onValueChange={(value) => setScale(value[0])}
					min={1}
					max={2}
					step={0.02}
					className="w-full"
				/>
			</div>
		</div>
	);
};
