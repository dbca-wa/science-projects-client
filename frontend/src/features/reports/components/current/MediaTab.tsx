import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
	Loader2,
	AlertCircle,
	Upload,
	Trash2,
	ImageOff,
	Replace,
	Maximize2,
	ZoomIn,
	ZoomOut,
	X,
	RotateCcw,
	AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useReportMedia } from "@/features/reports/hooks/useReports";
import {
	useUploadReportMedia,
	useDeleteReportMedia,
} from "@/features/reports/hooks/useReportMedia";
import type { IReportMedia } from "@/features/reports/services/report.service";
import type { IAnnualReport } from "@/features/reports/types/report.types";
import { compressImage } from "@/shared/utils/image-compression.utils";
import { ACCEPTED_IMAGE_TYPES } from "@/shared/constants/image.constants";
import { getImageUrl } from "@/shared/utils/image.utils";
import { AdjustImageModal } from "@/shared/components/media/AdjustImageModal";

const SECTION_TITLES: Record<string, string> = {
	dbca_banner: "DBCA Banner (bottom of front page)",
	dbca_banner_cropped: "Header of main pages next to year",
	sdchart: "Service Delivery Org Chart",
	service_delivery: "Service Delivery Chapter Image",
	research: "Research Chapter Image",
	partnerships: "Partnerships Chapter Image",
	// collaborations: not used in the annual report template
	student_projects: "Student Projects Chapter Image",
	publications: "Publications Chapter Image",
} as const;

const SECTION_KEYS = Object.keys(SECTION_TITLES);

const SECTION_CONFIG: Record<
	string,
	{
		preview: "chapter" | "banner-full" | "banner-cropped" | "chart";
		cropAspect: number;
		chapterTitle?: string;
	}
> = {
	dbca_banner: { preview: "banner-full", cropAspect: 5 },
	dbca_banner_cropped: { preview: "banner-cropped", cropAspect: 6 },
	sdchart: { preview: "chart", cropAspect: 0 },
	service_delivery: {
		preview: "chapter",
		cropAspect: 210 / 78,
		chapterTitle: "Service Delivery Structure",
	},
	research: {
		preview: "chapter",
		cropAspect: 210 / 78,
		chapterTitle: "Summary of Research Projects",
	},
	partnerships: {
		preview: "chapter",
		cropAspect: 210 / 78,
		chapterTitle: "External Partnerships",
	},
	// collaborations: not used in the annual report template
	student_projects: {
		preview: "chapter",
		cropAspect: 210 / 78,
		chapterTitle: "Student Projects",
	},
	publications: {
		preview: "chapter",
		cropAspect: 210 / 78,
		chapterTitle: "Publications and Reports",
	},
};

/* ------------------------------------------------------------------ */
/*  Image Lightbox — portal-based viewer with pan and zoom             */
/* ------------------------------------------------------------------ */

interface ImageLightboxProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	src: string;
	alt: string;
}

const ImageLightbox = ({
	open,
	onOpenChange,
	src,
	alt,
}: ImageLightboxProps) => {
	const [scale, setScale] = useState(1);
	const [translate, setTranslate] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const isDragging = useRef(false);
	const dragStart = useRef({ x: 0, y: 0 });
	const translateStart = useRef({ x: 0, y: 0 });

	const reset = useCallback(() => {
		setScale(1);
		setTranslate({ x: 0, y: 0 });
	}, []);

	const close = useCallback(() => {
		reset();
		onOpenChange(false);
	}, [reset, onOpenChange]);

	const zoomIn = () => setScale((s) => Math.min(s + 0.5, 8));
	const zoomOut = () => setScale((s) => Math.max(s - 0.5, 0.25));

	// Use a ref for the image container so we can attach a non-passive wheel listener
	const imageContainerRef = useRef<HTMLDivElement>(null);

	// Native wheel listener with { passive: false } to prevent page scroll
	React.useEffect(() => {
		const el = imageContainerRef.current;
		if (!el || !open) return;

		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setScale((s) => {
				const delta = e.deltaY > 0 ? -0.15 : 0.15;
				return Math.min(Math.max(s + delta, 0.25), 8);
			});
		};

		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [open]);

	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			isDragging.current = true;
			setIsPanning(true);
			dragStart.current = { x: e.clientX, y: e.clientY };
			translateStart.current = { ...translate };
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
		},
		[translate]
	);

	const handlePointerMove = useCallback((e: React.PointerEvent) => {
		if (!isDragging.current) return;
		setTranslate({
			x: translateStart.current.x + (e.clientX - dragStart.current.x),
			y: translateStart.current.y + (e.clientY - dragStart.current.y),
		});
	}, []);

	const handlePointerUp = useCallback(() => {
		isDragging.current = false;
		setIsPanning(false);
	}, []);

	// Escape key closes the lightbox
	React.useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [open, close]);

	// Lock body scroll while open
	React.useEffect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, [open]);

	if (!open) return null;

	return ReactDOM.createPortal(
		<div
			className="fixed inset-0 z-[100] flex flex-col"
			role="dialog"
			aria-modal="true"
			aria-label={alt}
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/95" onClick={close} />

			{/* Toolbar */}
			<div className="relative z-10 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
				<p className="text-sm text-white/80 truncate max-w-[50%]">{alt}</p>
				<div className="flex items-center gap-1.5">
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="cursor-pointer size-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
								onClick={zoomOut}
								aria-label="Zoom out"
							>
								<ZoomOut className="size-4" />
							</button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Zoom out</TooltipContent>
					</Tooltip>

					<span className="text-xs text-white/70 w-14 text-center tabular-nums select-none">
						{Math.round(scale * 100)}%
					</span>

					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="cursor-pointer size-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
								onClick={zoomIn}
								aria-label="Zoom in"
							>
								<ZoomIn className="size-4" />
							</button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Zoom in</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="cursor-pointer size-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
								onClick={reset}
								aria-label="Reset view"
							>
								<RotateCcw className="size-4" />
							</button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Reset view</TooltipContent>
					</Tooltip>

					<div className="w-px h-5 bg-white/20 mx-1" />

					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="cursor-pointer size-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
								onClick={close}
								aria-label="Close"
							>
								<X className="size-4" />
							</button>
						</TooltipTrigger>
						<TooltipContent side="bottom">Close</TooltipContent>
					</Tooltip>
				</div>
			</div>

			{/* Pannable / zoomable image area */}
			<div
				ref={imageContainerRef}
				className="relative flex-1 overflow-hidden select-none"
				style={{ cursor: isPanning ? "grabbing" : "grab" }}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
			>
				<img
					src={src}
					alt={alt}
					draggable={false}
					className="absolute inset-0 w-full h-full object-contain"
					style={{
						transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
						transformOrigin: "center center",
					}}
				/>
			</div>
		</div>,
		document.body
	);
};

/* ------------------------------------------------------------------ */
/*  Report Media Card                                                  */
/* ------------------------------------------------------------------ */

interface ReportMediaCardProps {
	section: string;
	title: string;
	currentMedia: IReportMedia | undefined;
	reportPk: number;
}

const ReportMediaCard = ({
	section,
	title,
	currentMedia,
	reportPk,
}: ReportMediaCardProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [imgError, setImgError] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	// Optimistic preview: show the selected file immediately while uploading
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	// Crop modal state
	const [isCropModalOpen, setIsCropModalOpen] = useState(false);
	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const [originalFileName, setOriginalFileName] = useState("image.jpg");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const uploadMutation = useUploadReportMedia(reportPk, section, {
		onSuccess: () => {
			setImgError(false);
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
		},
		onError: () => {
			setPreviewUrl(null);
		},
	});

	const deleteMutation = useDeleteReportMedia(reportPk, section);

	const handleFile = async (file: File) => {
		if (
			!ACCEPTED_IMAGE_TYPES.includes(
				file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
			)
		) {
			toast.error("Only JPG and PNG images are accepted");
			return;
		}
		try {
			const result = await compressImage(file);
			const objectUrl = URL.createObjectURL(result.file);
			setImageToCrop(objectUrl);
			setOriginalFileName(file.name);
			setIsCropModalOpen(true);
		} catch {
			toast.error("Failed to process image");
		}
	};

	const handleCropComplete = (croppedFile: File) => {
		setPreviewUrl(URL.createObjectURL(croppedFile));
		uploadMutation.mutate(croppedFile);
		setIsCropModalOpen(false);
		if (imageToCrop) {
			URL.revokeObjectURL(imageToCrop);
			setImageToCrop(null);
		}
	};

	const handleCropCancel = () => {
		setIsCropModalOpen(false);
		if (imageToCrop) {
			URL.revokeObjectURL(imageToCrop);
			setImageToCrop(null);
		}
	};

	const handleEdit = () => {
		if (resolvedUrl) {
			setImageToCrop(resolvedUrl);
			setOriginalFileName(`${section}.jpg`);
			setIsCropModalOpen(true);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleFile(file);
		e.target.value = "";
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file) handleFile(file);
	};

	const resolvedUrl = currentMedia?.file
		? getImageUrl(currentMedia.file)
		: undefined;
	// Use optimistic preview during upload, otherwise the real image
	const displayUrl = previewUrl ?? resolvedUrl;
	const hasImage = !!displayUrl && !imgError;
	const hasBrokenImage = !!resolvedUrl && !previewUrl && imgError;
	const isUploading = uploadMutation.isPending;
	const isDeleting = deleteMutation.isPending;

	return (
		<>
			<div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
				{/* Hidden file input */}
				<input
					ref={fileInputRef}
					type="file"
					accept={ACCEPTED_IMAGE_TYPES.join(",")}
					className="hidden"
					onChange={handleFileSelect}
					aria-label={`Upload image for ${title}`}
				/>

				{/* Image area */}
				<div className="relative aspect-[16/10] bg-white dark:bg-gray-800">
					{isDeleting ? (
						/* Deleting — skeleton shimmer */
						<div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
							<div className="text-center">
								<Loader2 className="size-8 animate-spin text-muted-foreground mx-auto mb-2" />
								<p className="text-sm text-muted-foreground">Deleting…</p>
							</div>
						</div>
					) : hasImage ? (
						<>
							<img
								src={displayUrl}
								alt={title}
								draggable={false}
								className="w-full h-full object-contain cursor-pointer select-none"
								onClick={handleEdit}
								onError={() => {
									if (!previewUrl) setImgError(true);
								}}
							/>

							{/* Upload overlay — shimmer + preview */}
							{isUploading && (
								<div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
									<div className="text-center">
										<Loader2 className="size-8 animate-spin text-white mx-auto mb-2" />
										<p className="text-sm text-white/80">Uploading…</p>
									</div>
								</div>
							)}

							{/* Hover overlay with action buttons — hidden during upload */}
							{!isUploading && (
								<>
									{/* Scrim overlay */}
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 pointer-events-none" />

									{/* Bottom gradient scrim behind buttons */}
									<div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

									{/* Action buttons — centred bottom row */}
									<div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="cursor-pointer size-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
													onClick={(e) => {
														e.stopPropagation();
														setLightboxOpen(true);
													}}
													aria-label={`Enlarge ${title}`}
												>
													<Maximize2 className="size-3.5" />
												</button>
											</TooltipTrigger>
											<TooltipContent side="bottom">Fullscreen</TooltipContent>
										</Tooltip>

										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="cursor-pointer size-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
													onClick={(e) => {
														e.stopPropagation();
														fileInputRef.current?.click();
													}}
													disabled={isUploading || isDeleting}
													aria-label={`Replace ${title}`}
												>
													<Replace className="size-3.5" />
												</button>
											</TooltipTrigger>
											<TooltipContent side="bottom">Replace</TooltipContent>
										</Tooltip>

										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="cursor-pointer size-8 rounded-full bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
													onClick={(e) => {
														e.stopPropagation();
														setShowDeleteConfirm(true);
													}}
													disabled={isUploading || isDeleting}
													aria-label={`Delete ${title}`}
												>
													<Trash2 className="size-3.5" />
												</button>
											</TooltipTrigger>
											<TooltipContent side="bottom">Delete</TooltipContent>
										</Tooltip>
									</div>
								</>
							)}
						</>
					) : hasBrokenImage ? (
						<>
							<div
								className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
								onClick={() => fileInputRef.current?.click()}
								onDragOver={(e) => e.preventDefault()}
								onDrop={handleDrop}
								role="button"
								tabIndex={0}
								aria-label={`Replace broken image for ${title}`}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										fileInputRef.current?.click();
									}
								}}
							>
								<ImageOff className="size-10 text-muted-foreground/40 mb-3" />
								<p className="text-sm text-muted-foreground">
									Image unavailable
								</p>
								<p className="text-xs text-muted-foreground/50 mt-1">
									Click to upload a replacement
								</p>
							</div>

							{/* Delete button on hover for broken images */}
							<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											className="cursor-pointer size-9 rounded-full bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center shadow-lg"
											onClick={(e) => {
												e.stopPropagation();
												setShowDeleteConfirm(true);
											}}
											disabled={isUploading || isDeleting}
											aria-label={`Delete ${title}`}
										>
											<Trash2 className="size-4" />
										</button>
									</TooltipTrigger>
									<TooltipContent>Delete image</TooltipContent>
								</Tooltip>
							</div>
						</>
					) : (
						/* Empty state — dashed border dropzone */
						<div
							className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer m-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
							onClick={() => fileInputRef.current?.click()}
							onDragOver={(e) => e.preventDefault()}
							onDrop={handleDrop}
							role="button"
							tabIndex={0}
							aria-label={`Upload image for ${title}`}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									fileInputRef.current?.click();
								}
							}}
						>
							<Upload className="size-8 text-muted-foreground/50 mb-2" />
							<p className="text-sm text-muted-foreground">
								Drop image here or click to upload
							</p>
							<p className="text-xs text-muted-foreground/50 mt-1">
								JPG or PNG, max 1 MB
							</p>
						</div>
					)}
				</div>

				{/* Title overlay — gradient at bottom of card */}
				<div className="px-4 py-3.5 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200/80 dark:border-gray-700/50">
					<p
						className="text-[13px] font-semibold text-center text-gray-700 dark:text-gray-100 tracking-wide uppercase"
						title={title}
					>
						{title}
					</p>
				</div>
			</div>

			{/* Lightbox */}
			{hasImage && resolvedUrl && (
				<ImageLightbox
					open={lightboxOpen}
					onOpenChange={setLightboxOpen}
					src={resolvedUrl}
					alt={title}
				/>
			)}

			{/* Crop modal */}
			<AdjustImageModal
				isOpen={isCropModalOpen}
				onClose={handleCropCancel}
				imageUrl={imageToCrop ?? ""}
				onCropComplete={handleCropComplete}
				fileName={originalFileName}
				defaultAspect={SECTION_CONFIG[section]?.cropAspect || undefined}
				variant="report"
				reportSectionLabel={
					SECTION_CONFIG[section]?.chapterTitle ?? SECTION_TITLES[section]
				}
				reportPreviewType={SECTION_CONFIG[section]?.preview}
			/>

			{/* Delete confirmation modal */}
			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
								<AlertTriangle className="h-5 w-5 text-destructive" />
							</div>
							<AlertDialogTitle>Delete Image?</AlertDialogTitle>
						</div>
						<AlertDialogDescription className="pt-3">
							This will remove the {title} image. You can upload a new one at
							any time.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							disabled={isDeleting}
							onClick={() => setShowDeleteConfirm(false)}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
							onClick={() => {
								deleteMutation.mutate();
								setShowDeleteConfirm(false);
							}}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

/* ------------------------------------------------------------------ */
/*  Media Tab                                                          */
/* ------------------------------------------------------------------ */

const MediaTab = ({ report }: { report: IAnnualReport }) => {
	const { data: mediaItems, isLoading, error } = useReportMedia(report.id);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load report media: {error.message}
				</AlertDescription>
			</Alert>
		);
	}

	const media = mediaItems ?? [];
	const reportPk =
		media.length > 0 && media[0].report
			? typeof media[0].report === "object"
				? media[0].report.id
				: media[0].report
			: report.id;

	return (
		<div className="py-4">
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				{SECTION_KEYS.map((section) => (
					<ReportMediaCard
						key={section}
						section={section}
						title={SECTION_TITLES[section]}
						currentMedia={media.find((m) => m.kind === section)}
						reportPk={reportPk}
					/>
				))}
			</div>
		</div>
	);
};

export default MediaTab;
