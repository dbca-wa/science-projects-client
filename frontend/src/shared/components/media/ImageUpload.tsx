import { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Upload, X, Link as LinkIcon, Crop } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { ImageCropModal } from "./ImageCropModal";
import {
  type ImageUploadProps,
  type ImageUploadMode,
  VARIANT_CONFIG,
  FILE_ERRORS,
  URL_ERRORS,
  DEFAULT_MAX_SIZE,
  DEFAULT_ACCEPTED_TYPES,
} from "@/shared/types/media.types";

/**
 * Validate image file type and size
 */
const validateImageFile = (
  file: File,
  maxSize: number,
  acceptedTypes: string[]
): boolean => {
  if (!acceptedTypes.includes(file.type)) {
    toast.error(FILE_ERRORS.INVALID_TYPE);
    return false;
  }

  if (file.size > maxSize) {
    toast.error(FILE_ERRORS.FILE_TOO_LARGE(maxSize / (1024 * 1024)));
    return false;
  }

  return true;
};

/**
 * Validate image URL
 */
const validateImageUrl = (url: string): boolean => {
  if (!url.startsWith('https://')) {
    toast.error(URL_ERRORS.NOT_HTTPS);
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    toast.error(URL_ERRORS.INVALID_FORMAT);
    return false;
  }
};

/**
 * Type guard to check if value is a File
 */
const isFile = (value: unknown): value is File => {
  return value instanceof File;
};

/**
 * ImageUpload Component
 * Reusable image upload component with file and URL support
 * 
 * Features:
 * - File upload with drag and drop
 * - URL input support
 * - Multiple variants (avatar, banner, project)
 * - File validation (type and size)
 * - Image preview
 * - Accessibility support
 */
export const ImageUpload = ({
  value,
  onChange,
  variant = 'default',
  allowUrl = false,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  placeholder,
  helperText,
  disabled = false,
  error,
}: ImageUploadProps) => {
  const [mode, setMode] = useState<ImageUploadMode>('file');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('image.jpg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = VARIANT_CONFIG[variant];
  const displayPlaceholder = placeholder || config.placeholder;

  // Generate preview for File objects
  useEffect(() => {
    if (!value || !isFile(value)) {
      setFilePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(value);
    
    return () => {
      setFilePreview(null);
    };
  }, [value]);

  // Derive preview from value
  const preview = value && isFile(value) 
    ? filePreview 
    : typeof value === 'string' 
    ? value 
    : null;

  const handleFileSelect = (file: File | null) => {
    if (!file || disabled) return;
    
    if (validateImageFile(file, maxSize, acceptedTypes)) {
      setOriginalFileName(file.name);
      onChange(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim() || disabled) return;
    
    if (validateImageUrl(urlInput)) {
      onChange(urlInput);
      setUrlInput('');
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    onChange(null);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleCropClick = () => {
    if (!preview || disabled) return;
    setImageToCrop(preview);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = (croppedFile: File) => {
    onChange(croppedFile);
    setIsCropModalOpen(false);
  };

  const renderPreview = () => {
    if (!preview) return null;

    if (config.previewShape === 'circle') {
      return (
        <Avatar className={cn(config.defaultSize, "mx-auto")}>
          <AvatarImage src={preview} alt="Preview" />
          <AvatarFallback>Preview</AvatarFallback>
        </Avatar>
      );
    }

    return (
      <div className={cn("relative overflow-hidden rounded-lg", config.defaultSize)}>
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      {allowUrl && !preview && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('file')}
            disabled={disabled}
          >
            <Upload className="size-4 mr-2" />
            Upload File
          </Button>
          <Button
            type="button"
            variant={mode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('url')}
            disabled={disabled}
          >
            <LinkIcon className="size-4 mr-2" />
            Use URL
          </Button>
        </div>
      )}

      {/* File Upload Mode */}
      {mode === 'file' && !preview && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragging && !disabled && "border-primary bg-primary/10",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={displayPlaceholder}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              handleSelectClick();
            }
          }}
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {displayPlaceholder}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, or GIF (max {maxSize / (1024 * 1024)}MB)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleSelectClick}
            disabled={disabled}
            className="mt-4"
          >
            Select Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            className="hidden"
            onChange={handleFileInputChange}
            disabled={disabled}
            aria-label="File input"
          />
        </div>
      )}

      {/* URL Input Mode */}
      {mode === 'url' && !preview && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
              disabled={disabled}
              aria-label="Image URL input"
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={disabled || !urlInput.trim()}
            >
              Load
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter an HTTPS URL to an image
          </p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-4">
          {renderPreview()}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCropClick}
              disabled={disabled}
              className="flex-1 sm:flex-none min-w-[80px]"
            >
              <Crop className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Crop</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="flex-1 sm:flex-none min-w-[80px]"
            >
              <X className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Remove</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMode('file');
                handleRemove();
              }}
              disabled={disabled}
              className="flex-1 sm:flex-none min-w-[80px]"
            >
              <span className="hidden sm:inline">Change</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground" id="image-upload-helper">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Crop Modal */}
      {imageToCrop && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          imageUrl={imageToCrop}
          onCropComplete={handleCropComplete}
          fileName={originalFileName}
          defaultAspect={variant === 'avatar' ? 1 : variant === 'banner' ? 16 / 9 : undefined}
        />
      )}
    </div>
  );
};
