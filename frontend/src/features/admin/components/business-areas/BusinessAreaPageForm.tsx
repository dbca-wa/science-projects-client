import { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/shared/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
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
import { UserSearchDropdown } from "@/shared/components/user/UserSearchDropdown";
import { AdjustImageModal } from "@/shared/components/media/AdjustImageModal";
import { RichTextEditor } from "@/shared/components/editor/RichTextEditor";
import { compressImage } from "@/shared/utils/image-compression.utils";
import { ACCEPTED_IMAGE_TYPES } from "@/shared/constants/image.constants";
import { getImageUrl } from "@/shared/utils/image.utils";
import { useDivisions } from "../../hooks/useDivisions";
import { DivisionSelectItems } from "@/shared/components/DivisionSelectItems";
import {
	useBusinessAreas,
	useBusinessAreaDetail,
	useCreateBusinessAreaFormData,
	useUpdateBusinessAreaFormData,
} from "../../hooks/useBusinessAreas";

const businessAreaSchema = z.object({
	division: z.number({ error: "Division is required" }),
	name: z.string().min(1, "Name is required"),
	focus: z.string().optional().default(""),
	leader: z.number().nullable().optional(),
	finance_admin: z.number().nullable().optional(),
	data_custodian: z.number().nullable().optional(),
});

type BusinessAreaFormData = z.infer<typeof businessAreaSchema>;

interface BusinessAreaPageFormProps {
	businessAreaId?: number;
}

export function BusinessAreaPageForm({
	businessAreaId,
}: BusinessAreaPageFormProps) {
	const navigate = useNavigate();
	const isEditing = !!businessAreaId;

	const { data: existingBA, isLoading: isLoadingBA } =
		useBusinessAreaDetail(businessAreaId);
	const { data: divisions = [] } = useDivisions();
	const { data: allBusinessAreas } = useBusinessAreas();
	const createMutation = useCreateBusinessAreaFormData();
	const updateMutation = useUpdateBusinessAreaFormData();
	const isPending = createMutation.isPending || updateMutation.isPending;

	// Exclude users who already lead another business area from the leader dropdown
	const excludedLeaderIds = useMemo(() => {
		if (!allBusinessAreas) return [];
		return allBusinessAreas
			.filter((ba) => {
				if (isEditing && ba.id === businessAreaId) return false;
				const leaderPk =
					typeof ba.leader === "object" ? ba.leader?.id : ba.leader;
				return leaderPk != null;
			})
			.map((ba) => {
				const leaderPk =
					typeof ba.leader === "object" ? ba.leader?.id : ba.leader;
				return leaderPk!;
			});
	}, [allBusinessAreas, isEditing, businessAreaId]);

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
	const [isEditorFocused, setIsEditorFocused] = useState(false);

	// User PK state
	const [leaderPk, setLeaderPk] = useState<number | null>(null);
	const [financeAdminPk, setFinanceAdminPk] = useState<number | null>(null);
	const [dataCustodianPk, setDataCustodianPk] = useState<number | null>(null);

	// Track whether we've initialised from fetched data
	const [initialised, setInitialised] = useState(false);

	// Track original introduction text for change detection
	const originalIntroText = useRef("");

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		control,
		formState: { errors },
	} = useForm<BusinessAreaFormData>({
		resolver: zodResolver(businessAreaSchema) as never,
		defaultValues: {
			division: undefined as unknown as number,
			name: "",
			focus: "",
			leader: null,
			finance_admin: null,
			data_custodian: null,
		},
	});

	// Populate form when editing and data arrives
	if (isEditing && existingBA && !initialised) {
		const divisionId =
			existingBA.division != null
				? typeof existingBA.division === "object"
					? existingBA.division.id
					: existingBA.division
				: (undefined as unknown as number);

		const leaderVal =
			existingBA.leader != null
				? typeof existingBA.leader === "object"
					? existingBA.leader.id
					: existingBA.leader
				: null;
		const faVal =
			existingBA.finance_admin != null
				? typeof existingBA.finance_admin === "object"
					? existingBA.finance_admin.id
					: existingBA.finance_admin
				: null;
		const dcVal =
			existingBA.data_custodian != null
				? typeof existingBA.data_custodian === "object"
					? existingBA.data_custodian.id
					: existingBA.data_custodian
				: null;

		reset({
			division: divisionId,
			name: existingBA.name ?? "",
			focus: existingBA.focus ?? "",
			leader: leaderVal,
			finance_admin: faVal,
			data_custodian: dcVal,
		});

		setIntroductionHtml(existingBA.introduction ?? "");
		setLeaderPk(leaderVal);
		setFinanceAdminPk(faVal);
		setDataCustodianPk(dcVal);
		setInitialised(true);
	}

	// Set the original introduction text baseline once data loads
	if (existingBA && !originalIntroText.current) {
		originalIntroText.current = normalise(existingBA.introduction ?? "");
	}

	/** Resolve the existing image URL for preview */
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

	const handleEditExistingImage = useCallback(() => {
		if (displayImageUrl) {
			setImageToCrop(displayImageUrl);
			setOriginalFileName("business-area.jpg");
			setIsCropModalOpen(true);
		}
	}, [displayImageUrl]);

	const handleIntroChange = (html: string) => {
		setIntroductionHtml(html);
	};

	// Validation state for submit button
	const introHasContent =
		introductionHtml.replace(/<[^>]*>/g, "").trim().length > 10;
	const hasImage = !!displayImageUrl || !!imageFile;
	// eslint-disable-next-line react-hooks/incompatible-library
	const nameValue = watch("name");
	const canSubmit =
		!isPending &&
		!!nameValue?.trim() &&
		(isEditing ? introHasContent && hasImage : true);

	// Check if introduction has unsaved changes by comparing normalised text
	const hasIntroChanges =
		initialised && normalise(introductionHtml) !== originalIntroText.current;

	// Form submission
	const onSubmit = async (data: BusinessAreaFormData) => {
		if (isEditing && businessAreaId) {
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("focus", data.focus ?? "");
			formData.append("introduction", introductionHtml);
			formData.append("division", String(data.division));
			if (data.leader != null) formData.append("leader", String(data.leader));
			else formData.append("leader", "0");
			if (data.finance_admin != null)
				formData.append("finance_admin", String(data.finance_admin));
			if (data.data_custodian != null)
				formData.append("data_custodian", String(data.data_custodian));

			if (imageFile) {
				formData.append("image", imageFile);
			} else if (imageRemoved) {
				formData.append("selectedImageUrl", "delete");
			}

			try {
				await updateMutation.mutateAsync({ id: businessAreaId, formData });
				navigate("/manage/business-areas");
			} catch {
				// Error toast handled by onError in the hook
			}
		} else {
			// Create — always use FormData
			const formData = new FormData();
			formData.append("agency", "1");
			formData.append("name", data.name);
			formData.append("focus", data.focus ?? "");
			formData.append("introduction", introductionHtml);
			formData.append("division", String(data.division));
			if (data.leader != null) formData.append("leader", String(data.leader));
			if (data.finance_admin != null)
				formData.append("finance_admin", String(data.finance_admin));
			if (data.data_custodian != null)
				formData.append("data_custodian", String(data.data_custodian));
			if (imageFile) formData.append("image", imageFile);

			try {
				await createMutation.mutateAsync(formData);
				navigate("/manage/business-areas");
			} catch {
				// Error toast handled by onError in the hook
			}
		}
	};

	if (isEditing && isLoadingBA) {
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
					onClick={() => navigate("/manage/business-areas")}
					aria-label="Back to business areas"
				>
					<ArrowLeft className="size-5" />
				</Button>
				<div>
					<h1 className="text-2xl font-semibold">
						{isEditing ? "Edit Business Area" : "Add Business Area"}
					</h1>
					<p className="text-sm text-muted-foreground">
						{isEditing
							? "Update the business area details below."
							: "Fill in the details to create a new business area."}
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit as never)} className="space-y-6">
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

				{/* Division */}
				<div className="space-y-2">
					<Label htmlFor="ba-division">
						Division <span className="text-destructive">*</span>
					</Label>
					<Controller
						name="division"
						control={control}
						render={({ field }) => (
							<Select
								value={field.value ? String(field.value) : undefined}
								onValueChange={(val) => field.onChange(Number(val))}
							>
								<SelectTrigger id="ba-division" className="w-full">
									<SelectValue placeholder="Select a division" />
								</SelectTrigger>
								<SelectContent>
									<DivisionSelectItems
										divisions={divisions}
										requireKeyStakeholder={false}
									/>
								</SelectContent>
							</Select>
						)}
					/>
					{errors.division && (
						<p className="text-sm text-destructive">
							{errors.division.message}
						</p>
					)}
				</div>

				{/* Focus */}
				<div className="space-y-2">
					<Label htmlFor="ba-focus">Focus</Label>
					<Textarea
						id="ba-focus"
						placeholder="Primary concerns of the business area"
						rows={4}
						{...register("focus")}
					/>
				</div>

				{/* Image — card pattern with hover overlay buttons */}
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
					{isEditing && !hasImage && (
						<p className="text-sm text-destructive">An image is required</p>
					)}
				</div>

				{/* Introduction — RichTextEditor with border styling */}
				<div className="space-y-2">
					<div
						className={`rounded-lg overflow-hidden transition-all duration-300 border-2 ${
							isEditorFocused
								? "border-blue-500 dark:border-blue-400"
								: hasIntroChanges
									? "border-amber-500 dark:border-amber-400"
									: "border-gray-200 dark:border-gray-700"
						}`}
						onFocus={() => setIsEditorFocused(true)}
						onBlur={(e) => {
							if (!e.currentTarget.contains(e.relatedTarget as Node)) {
								setIsEditorFocused(false);
							}
						}}
					>
						<div className="px-6 pt-4 pb-1">
							<span className="text-lg font-bold">Introduction</span>
						</div>
						<RichTextEditor
							value={introductionHtml}
							onChange={handleIntroChange}
							toolbar="businessArea"
							placeholder="A brief introduction for the annual report"
							minHeight="150px"
							aria-label="Business area introduction"
						/>
					</div>
					{isEditing && !introHasContent && (
						<p className="text-sm text-destructive">
							Introduction must contain at least a few words
						</p>
					)}
				</div>

				{/* Leader */}
				<div className="space-y-2">
					<UserSearchDropdown
						onlyInternal={false}
						isRequired={false}
						setUserFunction={(pk) => {
							setLeaderPk(pk);
							setValue("leader", pk, { shouldValidate: true });
						}}
						preselectedUserPk={leaderPk ?? undefined}
						isEditable
						excludeUserIds={excludedLeaderIds}
						label="Leader"
						placeholder="Search for a user"
						helperText="The leader of the business area (optional)."
					/>
				</div>

				{/* Finance Admin */}
				<div className="space-y-2">
					<UserSearchDropdown
						onlyInternal={false}
						isRequired={false}
						setUserFunction={(pk) => {
							setFinanceAdminPk(pk);
							setValue("finance_admin", pk, { shouldValidate: true });
						}}
						preselectedUserPk={financeAdminPk ?? undefined}
						isEditable
						label="Finance Admin"
						placeholder="Search for a user"
						helperText="The finance administrator (optional)."
					/>
				</div>

				{/* Data Custodian */}
				<div className="space-y-2">
					<UserSearchDropdown
						onlyInternal={false}
						isRequired={false}
						setUserFunction={(pk) => {
							setDataCustodianPk(pk);
							setValue("data_custodian", pk, { shouldValidate: true });
						}}
						preselectedUserPk={dataCustodianPk ?? undefined}
						isEditable
						label="Data Custodian"
						placeholder="Search for a user"
						helperText="The data custodian (optional)."
					/>
				</div>

				{/* Submit */}
				<div className="flex items-center gap-3 pt-4">
					<Button type="submit" disabled={!canSubmit}>
						{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
						{isEditing ? "Update" : "Create"}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate("/manage/business-areas")}
					>
						Cancel
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
}

/** Strip HTML tags and collapse whitespace for comparison */
function normalise(html: string): string {
	return html
		.replace(/<[^>]*>/g, "")
		.replace(/\s+/g, " ")
		.trim();
}
