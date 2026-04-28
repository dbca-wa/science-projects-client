/**
 * Image insertion button for the rich text editor toolbar.
 * Uploads images to the backend via /api/v1/medias/editor_images,
 * then inserts the returned URL into the editor content.
 * Uses drag-and-drop with cropping via AdjustImageModal.
 */
import { useState, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes } from "lexical";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BaseToolbarButton } from "./BaseToolbarButton";
import { $createImageNode } from "../nodes/ImageNode";
import { AdjustImageModal } from "@/shared/components/media/AdjustImageModal";
import { apiClient } from "@/shared/services/api/client.service";
import { getImageUrl } from "@/shared/utils/image.utils";
import { compressImage } from "@/shared/utils/image-compression.utils";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";

interface EditorImageResponse {
	id: number;
	file: string;
	alt_text: string;
	size: number;
}

interface ImageButtonProps {
	disabled?: boolean;
}

export const ImageButton = ({ disabled = false }: ImageButtonProps) => {
	const [editor] = useLexicalComposerContext();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [altText, setAltText] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);
	const [croppedFile, setCroppedFile] = useState<File | null>(null);
	const [cropModalOpen, setCropModalOpen] = useState(false);
	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const resetState = () => {
		setAltText("");
		setPreview(null);
		setCroppedFile(null);
		setIsDragging(false);
		setImageToCrop(null);
		setCropModalOpen(false);
		setIsUploading(false);
	};

	const handleClose = () => {
		resetState();
		setDialogOpen(false);
	};

	const handleInsert = async () => {
		if (!croppedFile) return;

		setIsUploading(true);
		try {
			// Compress the image before uploading (same as ImageUpload component)
			const compressed = await compressImage(croppedFile, {
				maxSizeMB: 3, // Match backend IMAGE_MAX_SIZE (3MB)
			});

			// Upload to backend
			const formData = new FormData();
			formData.append("file", compressed.file);
			formData.append("alt_text", altText.trim() || "Image");

			const response = await apiClient.post<EditorImageResponse>(
				"medias/editor_images",
				formData,
				{ headers: { "Content-Type": "multipart/form-data" } }
			);

			// Insert the backend URL into the editor
			const fullUrl = getImageUrl(response.file) ?? response.file;
			editor.update(() => {
				const imageNode = $createImageNode({
					src: fullUrl,
					altText: altText.trim() || "Image",
				});
				$insertNodes([imageNode]);
			});

			toast.success("Image inserted");
			resetState();
			setDialogOpen(false);
		} catch {
			toast.error("Failed to upload image. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const processFile = (file: File) => {
		if (!file.type.startsWith("image/")) return;

		const url = URL.createObjectURL(file);
		setImageToCrop(url);
		setCropModalOpen(true);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) processFile(file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) processFile(file);
	};

	const handleCropComplete = (file: File) => {
		setCroppedFile(file);
		const previewUrl = URL.createObjectURL(file);
		setPreview(previewUrl);
		setCropModalOpen(false);
		if (imageToCrop) {
			URL.revokeObjectURL(imageToCrop);
			setImageToCrop(null);
		}
	};

	return (
		<>
			<BaseToolbarButton
				icon={ImageIcon}
				label="Insert image"
				onClick={() => setDialogOpen(true)}
				isActive={false}
				disabled={disabled}
			/>

			<Dialog open={dialogOpen} onOpenChange={(open) => !open && handleClose()}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Insert Image</DialogTitle>
					</DialogHeader>

					<div className="space-y-4 py-2">
						{/* Upload / preview area */}
						{preview ? (
							<div className="relative rounded-lg border bg-muted/30 p-4">
								<img
									src={preview}
									alt={altText || "Preview"}
									className="max-w-full max-h-64 rounded-md object-contain mx-auto"
								/>
								<Button
									variant="destructive"
									size="icon"
									className="absolute top-2 right-2 h-7 w-7 rounded-full"
									onClick={() => {
										if (preview) URL.revokeObjectURL(preview);
										setPreview(null);
										setCroppedFile(null);
									}}
								>
									<X className="h-3.5 w-3.5" />
								</Button>
							</div>
						) : (
							<div
								className={cn(
									"rounded-lg border-2 border-dashed p-8 flex flex-col items-center justify-center min-h-40 cursor-pointer transition-colors",
									isDragging
										? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30"
										: "border-muted-foreground/25 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:border-blue-600"
								)}
								onClick={() => fileInputRef.current?.click()}
								onDrop={handleDrop}
								onDragOver={(e) => {
									e.preventDefault();
									setIsDragging(true);
								}}
								onDragLeave={() => setIsDragging(false)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										fileInputRef.current?.click();
									}
								}}
							>
								<Upload className="h-8 w-8 text-muted-foreground mb-2" />
								<p className="text-sm font-medium text-muted-foreground">
									Click to upload or drag and drop
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									PNG, JPG, GIF, WebP
								</p>
							</div>
						)}

						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleFileChange}
						/>

						<div className="space-y-2">
							<Label htmlFor="img-alt">
								Alt text
								<span className="text-muted-foreground font-normal ml-1">
									(describes the image for accessibility)
								</span>
							</Label>
							<Input
								id="img-alt"
								placeholder="e.g. Screenshot of the project creation wizard"
								value={altText}
								onChange={(e) => setAltText(e.target.value)}
								onKeyDown={(e) =>
									e.key === "Enter" && croppedFile && handleInsert()
								}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							onClick={handleInsert}
							disabled={!croppedFile || isUploading}
						>
							{isUploading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Uploading...
								</>
							) : (
								"Insert Image"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Crop modal */}
			{imageToCrop && (
				<AdjustImageModal
					isOpen={cropModalOpen}
					onClose={() => {
						setCropModalOpen(false);
						if (imageToCrop) URL.revokeObjectURL(imageToCrop);
						setImageToCrop(null);
					}}
					imageUrl={imageToCrop}
					onCropComplete={handleCropComplete}
					fileName="editor-image.jpg"
					variant="default"
				/>
			)}
		</>
	);
};
