import { useState, useEffect } from "react";
import type { Control, ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

// Type constraint for forms that have image field
type ImageFieldType = {
  image?: File | string | null;
};

interface ImageUploadFieldProps<T extends FieldValues & ImageFieldType> {
  control: Control<T>;
  disabled?: boolean;
}

/**
 * Validate image file type and size
 */
const validateImageFile = (file: File): boolean => {
  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    toast.error("Invalid file type. Please upload JPG, PNG, or GIF.");
    return false;
  }

  if (file.size > maxSize) {
    toast.error("File too large. Maximum size is 5MB.");
    return false;
  }

  return true;
};

/**
 * Type guard to check if value is a File
 */
const isFile = (value: unknown): value is File => {
  return value instanceof File;
};

/**
 * ImageFieldContent - Inner component that uses hooks
 */
const ImageFieldContent = <T extends FieldValues & ImageFieldType>({ 
  field,
  disabled 
}: { 
  field: ControllerRenderProps<T, Path<T>>;
  disabled?: boolean;
}) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate preview for File objects only
  useEffect(() => {
    if (!field.value || !isFile(field.value)) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(field.value);
    
    return () => {
      setFilePreview(null);
    };
  }, [field.value]);

  // Derive preview from field value (string URL) or filePreview (File object)
  const preview = field.value && isFile(field.value) 
    ? filePreview 
    : typeof field.value === "string" 
    ? field.value 
    : null;

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && validateImageFile(file)) {
      field.onChange(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      field.onChange(file);
    }
  };

  const handleRemove = () => {
    if (disabled) return;
    field.onChange(null);
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
        isDragging && !disabled && "border-primary bg-primary/10",
        field.value && "border-solid",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {preview ? (
        <div className="space-y-4">
          <Avatar className="h-32 w-32 mx-auto">
            <AvatarImage src={preview} alt="Avatar preview" />
            <AvatarFallback>Preview</AvatarFallback>
          </Avatar>
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="size-4 mr-2" />
              Remove
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("image-input")?.click()}
              disabled={disabled}
            >
              Change
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Drag and drop an image, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, or GIF (max 5MB)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("image-input")?.click()}
            disabled={disabled}
          >
            Select Image
          </Button>
        </div>
      )}

      <input
        id="image-input"
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
    </div>
  );
};

/**
 * ImageUploadField component
 * File input with drag-and-drop support for user avatar
 * 
 * Features:
 * - Drag and drop support
 * - Image preview
 * - File type validation (JPG, PNG, GIF)
 * - File size validation (max 5MB)
 * - Remove image functionality
 * 
 * @param control - React Hook Form control
 * @param disabled - Whether the field should be disabled
 */
export const ImageUploadField = <T extends FieldValues & ImageFieldType>({ control, disabled }: ImageUploadFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={"image" as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Avatar Image</FormLabel>
          <FormControl>
            <ImageFieldContent field={field} disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
