import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, {
	type Crop,
	type PixelCrop,
	centerCrop,
	makeAspectCrop,
} from "react-image-crop";
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

interface AdjustImageModalProps {
	isOpen: boolean;
	onClose: () => void;
	imageUrl: string;
	onCropComplete: (croppedFile: File) => void;
	fileName?: string;
	defaultAspect?: number;
	variant?: "avatar" | "project" | "banner" | "default";
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
}: AdjustImageModalProps) => {
	const imgRef = useRef<HTMLImageElement>(null);
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

	const [previewUrls, setPreviewUrls] = useState<{
		avatar: string | null;
		profile: string | null;
		projectCard: string | null;
	}>({ avatar: null, profile: null, projectCard: null });

	const setAspectRatio = useCallback((aspectRatio: number | undefined) => {
		setAspect(aspectRatio);

		if (aspectRatio && imgRef.current) {
			const { width, height } = imgRef.current;
			const imageAspect = width / height;
			let cropWidth = 50;
			let cropHeight = 50;

			if (aspectRatio > imageAspect) {
				cropWidth = 100;
				cropHeight = 100 / aspectRatio;
			} else {
				cropHeight = 100;
				cropWidth = 100 * aspectRatio;
			}

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
	}, []);

	const generateCroppedImage = useCallback(
		async (
			image: HTMLImageElement,
			crop: PixelCrop,
			scale: number,
			rotate: number
		): Promise<Blob | null> => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (!ctx) return null;

			const scaleX = image.naturalWidth / image.width;
			const scaleY = image.naturalHeight / image.height;

			const cropWidthNatural = crop.width * scaleX;
			const cropHeightNatural = crop.height * scaleY;

			// Calculate canvas size based on rotation
			let canvasWidth = cropWidthNatural;
			let canvasHeight = cropHeightNatural;

			if (rotate !== 0 && rotate % 360 !== 0) {
				const rotateRads = (rotate * Math.PI) / 180;
				const rotatedWidth =
					Math.abs(Math.cos(rotateRads) * cropWidthNatural) +
					Math.abs(Math.sin(rotateRads) * cropHeightNatural);
				const rotatedHeight =
					Math.abs(Math.sin(rotateRads) * cropWidthNatural) +
					Math.abs(Math.cos(rotateRads) * cropHeightNatural);

				canvasWidth = rotatedWidth;
				canvasHeight = rotatedHeight;
			}

			const pixelRatio = window.devicePixelRatio || 1;
			canvas.width = canvasWidth * pixelRatio;
			canvas.height = canvasHeight * pixelRatio;

			ctx.scale(pixelRatio, pixelRatio);
			ctx.imageSmoothingQuality = "high";
			ctx.imageSmoothingEnabled = true;

			const cropX = crop.x * scaleX;
			const cropY = crop.y * scaleY;

			ctx.save();
			ctx.translate(canvasWidth / 2, canvasHeight / 2);
			ctx.rotate((rotate * Math.PI) / 180);
			ctx.scale(scale, scale);
			ctx.translate(-cropWidthNatural / 2, -cropHeightNatural / 2);

			ctx.drawImage(
				image,
				cropX,
				cropY,
				cropWidthNatural,
				cropHeightNatural,
				0,
				0,
				cropWidthNatural,
				cropHeightNatural
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
		},
		[]
	);

	const generatePreviewUrl = useCallback(
		async (
			image: HTMLImageElement,
			crop: PixelCrop,
			scale: number,
			rotate: number
		): Promise<string | null> => {
			const blob = await generateCroppedImage(image, crop, scale, rotate);
			if (!blob) return null;
			return URL.createObjectURL(blob);
		},
		[generateCroppedImage]
	);

	useEffect(() => {
		const timeoutId = setTimeout(async () => {
			if (completedCrop && imgRef.current) {
				try {
					const previewUrl = await generatePreviewUrl(
						imgRef.current,
						completedCrop,
						scale,
						rotate
					);

					if (previewUrl) {
						// Store old URLs to revoke after setting new ones
						const oldAvatarUrl = previewUrls.avatar;
						const oldProfileUrl = previewUrls.profile;
						const oldProjectCardUrl = previewUrls.projectCard;

						// Set new URLs first (prevents flicker)
						setPreviewUrls({
							avatar: previewUrl,
							profile: previewUrl,
							projectCard: previewUrl,
						});

						// Then revoke old URLs after a brief delay
						setTimeout(() => {
							if (oldAvatarUrl) URL.revokeObjectURL(oldAvatarUrl);
							if (oldProfileUrl) URL.revokeObjectURL(oldProfileUrl);
							if (oldProjectCardUrl) URL.revokeObjectURL(oldProjectCardUrl);
						}, 50);
					}
				} catch (error) {
					console.error("Error generating preview:", error);
				}
			}
		}, 100);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [completedCrop, scale, rotate, generatePreviewUrl]);

	// Cleanup URLs on unmount
	useEffect(() => {
		return () => {
			if (previewUrls.avatar) URL.revokeObjectURL(previewUrls.avatar);
			if (previewUrls.profile) URL.revokeObjectURL(previewUrls.profile);
			if (previewUrls.projectCard) URL.revokeObjectURL(previewUrls.projectCard);
		};
	}, []);

	const handleApplyCrop = async () => {
		if (!completedCrop || !imgRef.current) return;

		try {
			const blob = await generateCroppedImage(
				imgRef.current,
				completedCrop,
				scale,
				rotate
			);

			if (blob) {
				const file = new File([blob], fileName, { type: "image/jpeg" });

				if (previewUrls.avatar) URL.revokeObjectURL(previewUrls.avatar);
				if (previewUrls.profile) URL.revokeObjectURL(previewUrls.profile);
				if (previewUrls.projectCard)
					URL.revokeObjectURL(previewUrls.projectCard);
				setPreviewUrls({ avatar: null, profile: null, projectCard: null });

				onCropComplete(file);
				onClose();
			}
		} catch (error) {
			console.error("Error applying crop:", error);
		}
	};

	const resetTransforms = () => {
		setScale(1);
		setRotate(0);

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
	};

	const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const { width, height } = e.currentTarget;
		const crop = centerCrop(
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
		setCrop(crop);

		const pixelCrop: PixelCrop = {
			unit: "px",
			width: (crop.width * width) / 100,
			height: (crop.height * height) / 100,
			x: (crop.x * width) / 100,
			y: (crop.y * height) / 100,
		};
		setCompletedCrop(pixelCrop);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="overflow-hidden">
				<DialogHeader>
					<DialogTitle>Adjust Image</DialogTitle>
					<DialogDescription>
						Crop, rotate, and scale your image
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col md:flex-row gap-6 overflow-y-auto h-[calc(90vh-180px)]">
					<div className="md:flex-[3] space-y-4 min-w-0">
						{/* Aspect Ratio Buttons */}
						<div className="flex flex-wrap gap-2">
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
						</div>

						{/* Crop Area */}
						<div className="flex justify-center items-center bg-muted p-4 rounded-lg min-h-[400px] md:min-h-[500px]">
							<ReactCrop
								crop={crop}
								onChange={(c) => setCrop(c)}
								onComplete={(c) => setCompletedCrop(c)}
								aspect={aspect}
							>
								<img
									ref={imgRef}
									src={imageUrl}
									alt="Crop preview"
									crossOrigin="anonymous"
									style={{
										transform: `scale(${scale}) rotate(${rotate}deg)`,
										maxHeight: "60vh",
										maxWidth: "100%",
									}}
									onLoad={onImageLoad}
								/>
							</ReactCrop>
						</div>

						{/* Rotation Controls */}
						<div className="flex flex-wrap items-center gap-4">
							<Label className="min-w-[80px]">Rotation:</Label>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setRotate((r) => r - 90)}
							>
								<RotateCcw className="size-4" />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setRotate((r) => r + 90)}
							>
								<RotateCw className="size-4" />
							</Button>
							<span className="text-sm text-muted-foreground">{rotate}°</span>
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
						<div className="space-y-2">
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

					{/* Right side - Live previews */}
					<div className="md:flex-1 space-y-6 min-w-[200px]">
						{completedCrop && (
							<>
								<div>
									<Label className="text-base font-semibold mb-3 block">
										Live Previews
									</Label>

									{/* Avatar variant previews */}
									{variant === "avatar" && (
										<>
											{/* Avatar Preview */}
											<div className="space-y-2 mb-6">
												<Label className="text-sm text-muted-foreground">
													Avatar Preview:
												</Label>
												<div className="h-[200px] w-[200px] mx-auto rounded-full overflow-hidden border border-border bg-muted">
													{previewUrls.avatar ? (
														<img
															src={previewUrls.avatar}
															alt="Avatar preview"
															className="h-full w-full object-cover"
														/>
													) : (
														<div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
															Preview
														</div>
													)}
												</div>
											</div>

											{/* Public Profile Preview */}
											<div className="space-y-2">
												<Label className="text-sm text-muted-foreground">
													Public Profile Preview:
												</Label>
												<div className="w-[200px] h-[200px] mx-auto rounded-lg overflow-hidden border border-border">
													{previewUrls.profile ? (
														<img
															src={previewUrls.profile}
															alt="Public profile preview"
															className="h-full w-full object-cover"
														/>
													) : (
														<div className="h-full w-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
															Preview
														</div>
													)}
												</div>
											</div>
										</>
									)}

									{/* Project variant preview */}
									{variant === "project" && (
										<div className="space-y-2">
											<Label className="text-sm text-muted-foreground">
												Project Card Preview:
											</Label>
											<div className="w-full max-w-[250px] mx-auto">
												<div className="relative h-[200px] w-full rounded-lg overflow-hidden border border-border bg-muted">
													{previewUrls.projectCard ? (
														<>
															<img
																src={previewUrls.projectCard}
																alt="Project card preview"
																className="h-full w-full object-cover"
															/>
															{/* Gradient overlay matching ProjectCard */}
															<div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-black/75 to-transparent" />
															{/* Sample project title */}
															<div className="absolute bottom-0 left-0 z-10 p-3">
																<p className="text-sm font-semibold text-white line-clamp-2">
																	Project Title
																</p>
															</div>
														</>
													) : (
														<div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
															Preview
														</div>
													)}
												</div>
												<p className="text-xs text-muted-foreground text-center mt-2 italic">
													How it appears in project cards
												</p>
											</div>
										</div>
									)}

									{/* Banner variant preview */}
									{variant === "banner" && (
										<div className="space-y-2">
											<Label className="text-sm text-muted-foreground">
												Banner Preview:
											</Label>
											<div className="w-full max-w-[250px] mx-auto">
												<div className="relative h-[140px] w-full rounded-lg overflow-hidden border border-border bg-muted">
													{previewUrls.projectCard ? (
														<img
															src={previewUrls.projectCard}
															alt="Banner preview"
															className="h-full w-full object-cover"
														/>
													) : (
														<div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
															Preview
														</div>
													)}
												</div>
											</div>
										</div>
									)}

									{/* Default variant preview */}
									{variant === "default" && (
										<div className="space-y-2">
											<Label className="text-sm text-muted-foreground">
												Preview:
											</Label>
											<div className="w-[200px] h-[200px] mx-auto rounded-lg overflow-hidden border border-border">
												{previewUrls.projectCard ? (
													<img
														src={previewUrls.projectCard}
														alt="Image preview"
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="h-full w-full bg-muted flex items-center justify-center text-sm text-muted-foreground">
														Preview
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</>
						)}
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
