import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { getImageUrl } from "@/shared/utils/image.utils";
import { ImageUpload } from "@/shared/components/media/ImageUpload";
import type { IMethodologyImage } from "@/shared/types/document.types";
import {
	uploadMethodologyImage,
	updateMethodologyImage,
	deleteMethodologyImage,
} from "@/features/projects/services/project.service";

interface MethodologyImageProps {
	methodologyImage: IMethodologyImage | null;
	projectPlanId: number;
	canEdit: boolean;
}

/**
 * MethodologyImage — displays and manages the methodology diagram
 * for a project plan. Uses the shared ImageUpload component for
 * upload, cropping, and compression.
 */
export const MethodologyImage = ({
	methodologyImage,
	projectPlanId,
	canEdit,
}: MethodologyImageProps) => {
	const queryClient = useQueryClient();
	const [localPreview, setLocalPreview] = useState<string | null>(null);

	const imageUrl = methodologyImage?.file
		? getImageUrl(methodologyImage.file)
		: undefined;

	const hasExistingImage = !!methodologyImage && !!imageUrl;

	// Upload / update mutation
	const uploadMutation = useMutation({
		mutationFn: async (file: File) => {
			return hasExistingImage
				? await updateMethodologyImage(projectPlanId, file)
				: await uploadMethodologyImage(projectPlanId, file);
		},
		onSuccess: () => {
			toast.success("Methodology image uploaded");
			setLocalPreview(null);
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to upload methodology image");
			setLocalPreview(null);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: () => deleteMethodologyImage(projectPlanId),
		onSuccess: () => {
			toast.success("Methodology image deleted");
			setLocalPreview(null);
			queryClient.invalidateQueries({ queryKey: ["projects"] });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete methodology image");
		},
	});

	const isUploading = uploadMutation.isPending;
	const isDeleting = deleteMutation.isPending;

	/**
	 * Handle image selection from the shared ImageUpload component.
	 * When a File is received, trigger the upload mutation.
	 * When null is received (user clicked Remove inside ImageUpload),
	 * clear the local preview only — the server image stays until
	 * the user explicitly deletes via the Delete button.
	 */
	const handleImageChange = useCallback(
		(value: File | string | null) => {
			if (value instanceof File) {
				// Show an optimistic local preview while uploading
				setLocalPreview(URL.createObjectURL(value));
				uploadMutation.mutate(value);
			} else {
				// User removed the image inside ImageUpload (e.g. clicked Remove)
				setLocalPreview(null);
			}
		},
		[uploadMutation]
	);

	// Determine the value to pass to ImageUpload:
	// - While uploading, show the local preview
	// - Otherwise show the server image URL (or null)
	const displayValue: string | null = localPreview ?? imageUrl ?? null;

	return (
		<div className="space-y-2">
			<h3 className="text-sm font-semibold text-foreground">
				Methodology Image
			</h3>

			{canEdit ? (
				<div className="space-y-3">
					{/* Upload progress overlay */}
					{(isUploading || isDeleting) && (
						<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>{isDeleting ? "Deleting..." : "Uploading..."}</span>
						</div>
					)}

					<div className="flex justify-center">
						<div className="w-full max-w-2xl">
							<ImageUpload
								value={displayValue}
								onChange={handleImageChange}
								variant="project"
								disabled={isUploading || isDeleting}
								placeholder="Upload a methodology diagram (JPEG or PNG)"
								helperText="Upload a diagram illustrating the project methodology"
							/>
						</div>
					</div>

					{/* Delete button — only shown when a server image exists */}
					{hasExistingImage && !isUploading && !isDeleting && (
						<div className="flex justify-center">
							<Button
								variant="destructive"
								size="sm"
								onClick={() => deleteMutation.mutate()}
								className="gap-2"
							>
								<Trash2 className="h-4 w-4" />
								Delete Image
							</Button>
						</div>
					)}
				</div>
			) : hasExistingImage ? (
				/* Read-only: display the existing image centred */
				<div className="rounded-lg border overflow-hidden max-w-2xl mx-auto">
					<img
						src={imageUrl}
						alt="Methodology diagram"
						className="w-full max-h-[500px] object-contain"
						draggable={false}
					/>
				</div>
			) : (
				/* Read-only empty state */
				<div className="rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30">
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
						<p className="text-sm text-muted-foreground">
							No methodology image uploaded
						</p>
					</div>
				</div>
			)}
		</div>
	);
};
