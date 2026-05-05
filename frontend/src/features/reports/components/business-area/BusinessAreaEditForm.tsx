import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { inlineEditStore } from "@/app/stores/InlineEditStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
	ArrowLeft,
	Loader2,
	Upload,
	Trash2,
	Replace,
	Maximize2,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
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
import { AdjustImageModal } from "@/shared/components/media/AdjustImageModal";
import { FormRichTextEditor } from "@/shared/components/editor/FormRichTextEditor";
import { compressImage } from "@/shared/utils/image-compression.utils";
import { ACCEPTED_IMAGE_TYPES } from "@/shared/constants/image.constants";
import { getImageUrl } from "@/shared/utils/image.utils";
import {
	useMyBusinessAreas,
	useUpdateBusinessAreaLead,
} from "../../hooks/useBusinessAreaLead";

const editSchema = z.object({
	name: z.string().min(1, "Name is required"),
});

type EditFormData = z.infer<typeof editSchema>;

interface BusinessAreaEditFormProps {
	businessAreaId: number;
}

/**
 * Full-page form for editing a business area's name, image, and introduction.
 * Uses the same image card pattern as MediaTab for consistency.
 */
export const BusinessAreaEditForm = ({
	businessAreaId,
}: BusinessAreaEditFormProps) => {
	const navigate = useNavigate();

	const { data: myBAs, isLoading: isLoadingBA } = useMyBusinessAreas();
	const existingBA = myBAs?.find((ba) => ba.id === businessAreaId);
	const updateMutation = useUpdateBusinessAreaLead();

	// Image state
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
	const [imageRemoved, setImageRemoved] = useState(false);
	const [isCropModalOpen, setIsCropModalOpen] = useState(false);
	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const [originalFileName, setOriginalFileName] = useState("image.jpg");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Introduction managed via state for RichTextEditor integration
	const [introductionHtml, setIntroductionHtml] = useState<string>("");

	// Track whether we've initialised from fetched data
	const [initialised, setInitialised] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isDirty: isNameDirty },
	} = useForm<EditFormData>({
		resolver: zodResolver(editSchema) as never,
		defaultValues: { name: "" },
	});

	// Populate form when data arrives
	useEffect(() => {
		if (existingBA && !initialised) {
			reset({ name: existingBA.name ?? "" });
			// eslint-disable-next-line react-hooks/set-state-in-effect -- sync from fetched data
			setIntroductionHtml(existingBA.introduction ?? "");
			setInitialised(true);
		}
	}, [existingBA, initialised, reset]);

	/** Resolve the existing image URL */
	const existingImageUrl = (() => {
		if (imageRemoved) return null;
		if (!existingBA?.image) return null;
		if (typeof existingBA.image === "string")
			return getImageUrl(existingBA.image);
		if (typeof existingBA.image === "object" && "file" in existingBA.image) {
			return getImageUrl(existingBA.image);
		}
		return null;
	})();

	const displayImageUrl = imagePreviewUrl ?? existingImageUrl ?? null;

	// Image handling
	const handleFileSelect = async (file: File) => {
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
		if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
		setImageFile(croppedFile);
		setImagePreviewUrl(URL.createObjectURL(croppedFile));
		setImageRemoved(false);
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

	const handleRemoveImage = () => {
		if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
		setImageFile(null);
		setImagePreviewUrl(null);
		setImageRemoved(true);
		setShowDeleteConfirm(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleFileSelect(file);
		e.target.value = "";
	};

	const handleEditExistingImage = () => {
		if (displayImageUrl) {
			setImageToCrop(displayImageUrl);
			setOriginalFileName("business-area.jpg");
			setIsCropModalOpen(true);
		}
	};

	// Determine whether the introduction has meaningful content
	const introHasContent =
		introductionHtml.replace(/<[^>]*>/g, "").trim().length > 10;

	// Determine whether an image is present
	const hasImage = !!displayImageUrl || !!imageFile;

	// Form validity for submission
	const canSubmit = !updateMutation.isPending && introHasContent && hasImage;

	// Track whether the user has actually changed the introduction content.
	// Compare normalised text (strip HTML tags and collapse whitespace) to avoid
	// false positives from Lexical re-serialising the same content differently.
	const originalIntroText = useRef("");

	const handleIntroChange = (html: string) => {
		setIntroductionHtml(html);
	};

	// Normalise HTML to plain text for comparison
	const normalise = (html: string) =>
		html
			.replace(/<[^>]*>/g, "")
			.replace(/\s+/g, " ")
			.trim();

	// Set the original text baseline once data loads
	useEffect(() => {
		if (existingBA && !originalIntroText.current) {
			originalIntroText.current = normalise(existingBA.introduction ?? "");
		}
	}, [existingBA]);

	// Track whether introduction has unsaved changes
	const [_hasIntroChanges, setHasIntroChanges] = useState(false);
	useEffect(() => {
		if (!initialised) return;
		const original = originalIntroText.current ?? "";
		setHasIntroChanges(normalise(introductionHtml) !== original);
	}, [introductionHtml, initialised]);

	const goBack = () => {
		// Reset form state so dirty effects don't re-register after unregister
		reset();
		setImageFile(null);
		setImagePreviewUrl(null);
		setImageRemoved(false);
		inlineEditStore.unregisterEditor("introduction" as never, 0);
		inlineEditStore.unregisterEditor(
			"business-area-form" as never,
			businessAreaId
		);
		navigate("/reports/business-area");
	};

	// Register name/image dirty state with InlineEditStore for navigation blocking
	const isFormDirty = isNameDirty || !!imageFile || imageRemoved;
	const formRef = useRef<HTMLFormElement>(null);
	useEffect(() => {
		if (isFormDirty) {
			inlineEditStore.registerEditor({
				contentType: "business-area-form" as never,
				entityId: businessAreaId,
				originalContent: "clean",
				elementRef: formRef.current,
			});
			inlineEditStore.updateCurrentContent(
				"business-area-form" as never,
				businessAreaId,
				"dirty"
			);
		} else {
			inlineEditStore.unregisterEditor(
				"business-area-form" as never,
				businessAreaId
			);
		}
		return () => {
			inlineEditStore.unregisterEditor(
				"business-area-form" as never,
				businessAreaId
			);
		};
	}, [isFormDirty, businessAreaId]);

	// Form submission
	const onSubmit = async (data: EditFormData) => {
		const formData = new FormData();
		formData.append("name", data.name);
		formData.append("introduction", introductionHtml);

		if (imageFile) {
			formData.append("image", imageFile);
		} else if (imageRemoved) {
			formData.append("selectedImageUrl", "delete");
		}

		try {
			await updateMutation.mutateAsync({ id: businessAreaId, formData });
			toast.success("Business area updated successfully");
			goBack();
		} catch {
			// Error toast handled by onError in the hook
		}
	};

	if (isLoadingBA) {
		return (
			<div className="container mx-auto flex justify-center p-12">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-3xl space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={goBack}
					aria-label="Back to business areas"
				>
					<ArrowLeft className="size-5" />
				</Button>
				<div>
					<h1 className="text-2xl font-semibold">Edit Business Area</h1>
					<p className="text-sm text-muted-foreground">
						Update the business area name, image, and introduction.
					</p>
				</div>
			</div>

			<form
				ref={formRef}
				onSubmit={handleSubmit(onSubmit as never)}
				className="space-y-6"
				id="ba-edit-form"
			>
				{/* Name */}
				<div className="space-y-2">
					<Label htmlFor="ba-name">
						Name <span className="text-destructive">*</span>
					</Label>
					<Input
						id="ba-name"
						autoComplete="off"
						placeholder="Enter business area name"
						{...register("name")}
					/>
					{errors.name && (
						<p className="text-sm text-destructive">{errors.name.message}</p>
					)}
				</div>

				{/* Image — card pattern matching MediaTab */}
				<div className="space-y-2">
					<Label>Image</Label>
					<input
						ref={fileInputRef}
						type="file"
						accept={ACCEPTED_IMAGE_TYPES.join(",")}
						className="hidden"
						onChange={handleInputChange}
						aria-label="Upload business area image"
					/>

					<div className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
						<div className="relative aspect-[16/10] bg-white dark:bg-gray-800">
							{displayImageUrl ? (
								<>
									<img
										src={displayImageUrl}
										alt="Business area"
										draggable={false}
										className="w-full h-full object-contain cursor-pointer select-none"
										onClick={handleEditExistingImage}
									/>

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
														window.open(displayImageUrl, "_blank");
													}}
													aria-label="View fullscreen"
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
													aria-label="Replace image"
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
													aria-label="Delete image"
												>
													<Trash2 className="size-3.5" />
												</button>
											</TooltipTrigger>
											<TooltipContent side="bottom">Delete</TooltipContent>
										</Tooltip>
									</div>
								</>
							) : (
								/* Empty state — dashed border dropzone */
								<div
									className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer m-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
									onClick={() => fileInputRef.current?.click()}
									onDragOver={(e) => e.preventDefault()}
									onDrop={(e) => {
										e.preventDefault();
										const file = e.dataTransfer.files[0];
										if (file) handleFileSelect(file);
									}}
									role="button"
									tabIndex={0}
									aria-label="Upload business area image"
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
					</div>
					{!hasImage && (
						<p className="text-sm text-destructive">An image is required</p>
					)}
				</div>

				{/* Introduction — uses FormRichTextEditor for consistent styling and dirty tracking */}
				<div className="space-y-2">
					<FormRichTextEditor
						value={introductionHtml}
						onChange={handleIntroChange}
						toolbar="businessArea"
						placeholder="A brief introduction for the annual report"
						label="Introduction"
						aria-label="Business area introduction"
						initialValue={existingBA?.introduction ?? ""}
						editorId="introduction"
					/>
					{!introHasContent && (
						<p className="text-sm text-destructive">
							Introduction must contain at least a few words
						</p>
					)}
				</div>

				{/* Actions */}
				<div className="flex items-center justify-end gap-3 pt-4">
					<Button type="button" variant="outline" onClick={goBack}>
						Cancel
					</Button>
					<Button type="submit" disabled={!canSubmit}>
						{updateMutation.isPending && (
							<Loader2 className="mr-2 size-4 animate-spin" />
						)}
						Save
					</Button>
				</div>
			</form>

			{/* Crop modal */}
			<AdjustImageModal
				isOpen={isCropModalOpen}
				onClose={handleCropCancel}
				imageUrl={imageToCrop ?? ""}
				onCropComplete={handleCropComplete}
				fileName={originalFileName}
				defaultAspect={210 / 78}
				variant="report"
				reportPreviewType="chapter"
				reportSectionLabel={existingBA?.name || "Business Area"}
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
							This will remove the business area image. You can upload a new one
							at any time.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
							onClick={handleRemoveImage}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};
