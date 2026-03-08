import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

interface SingleFileUploadProps {
	accept?: string;
	maxSize?: number; // in bytes
	onFileSelect: (file: File | null) => void;
	uploadedFile?: File | null;
	helperText?: string;
	className?: string;
	disabled?: boolean;
}

export function SingleFileUpload({
	accept = ".pdf",
	maxSize = 3 * 1024 * 1024, // 3MB default
	onFileSelect,
	uploadedFile,
	helperText,
	className,
	disabled = false,
}: SingleFileUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const validateFile = (file: File): string | null => {
		// Check file type
		const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
		const acceptedTypes = accept.split(",").map((type) => type.trim());

		if (!acceptedTypes.includes(fileExtension)) {
			const errorMsg = `File type not accepted. Please upload ${accept} files only.`;
			toast.error(errorMsg);
			return errorMsg;
		}

		// Check file size
		if (file.size > maxSize) {
			const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
			const errorMsg = `File size exceeds ${maxSizeMB}MB limit.`;
			toast.error(errorMsg);
			return errorMsg;
		}

		return null;
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (disabled) return;

		const file = event.target.files?.[0];
		if (!file) return;

		const validationError = validateFile(file);
		if (validationError) {
			setError(validationError);
			onFileSelect(null);
			return;
		}

		setError(null);
		onFileSelect(file);
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		if (disabled) return;
		event.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
		if (disabled) return;
		event.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		if (disabled) return;
		event.preventDefault();
		setIsDragging(false);

		const file = event.dataTransfer.files?.[0];
		if (!file) return;

		const validationError = validateFile(file);
		if (validationError) {
			setError(validationError);
			onFileSelect(null);
			return;
		}

		setError(null);
		onFileSelect(file);
	};

	const handleRemoveFile = () => {
		if (disabled) return;
		setError(null);
		onFileSelect(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleClick = () => {
		if (disabled) return;
		fileInputRef.current?.click();
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (disabled) return;
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleClick();
		}
	};

	return (
		<div className={cn("space-y-2", className)}>
			{/* Upload Area */}
			<div
				onClick={handleClick}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onKeyDown={handleKeyDown}
				role="button"
				tabIndex={disabled ? -1 : 0}
				aria-label={helperText || "Upload file"}
				className={cn(
					"border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
					isDragging && !disabled
						? "border-primary bg-primary/10"
						: "border-gray-300 hover:border-gray-400",
					error && "border-red-500",
					disabled && "opacity-50 cursor-not-allowed"
				)}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept={accept}
					onChange={handleFileChange}
					disabled={disabled}
					className="hidden"
					aria-label="File input"
				/>

				{uploadedFile ? (
					<div className="flex items-center justify-center gap-2">
						<FileText className="h-5 w-5 text-red-500" />
						<span className="text-sm font-medium">{uploadedFile.name}</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							disabled={disabled}
							onClick={(e) => {
								e.stopPropagation();
								handleRemoveFile();
							}}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				) : (
					<div className="space-y-2">
						<Upload className="h-8 w-8 mx-auto text-muted-foreground" />
						<div className="text-sm text-muted-foreground">
							<span className="font-medium text-primary">Click to upload</span>{" "}
							or drag and drop
						</div>
						<div className="text-xs text-muted-foreground">
							{accept.toUpperCase()} (max {(maxSize / (1024 * 1024)).toFixed(1)}
							MB)
						</div>
					</div>
				)}
			</div>

			{/* Helper Text */}
			{helperText && !error && (
				<p className="text-sm text-muted-foreground" id="file-upload-helper">
					{helperText}
				</p>
			)}

			{/* Error Message */}
			{error && (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
