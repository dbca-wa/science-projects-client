// IMAGE ============================================================================

export interface IImageData {
	file: string;
	old_file: string;
	pk: number;
	user: number;
}


/**
 * Image Upload Component Types
 */

export type ImageUploadVariant = 'avatar' | 'banner' | 'project' | 'default';

export type ImageUploadMode = 'file' | 'url';

export interface ImageUploadProps {
  // React Hook Form integration
  value?: File | string | null;
  onChange: (value: File | string | null) => void;
  
  // Configuration
  variant?: ImageUploadVariant;
  allowUrl?: boolean;
  maxSize?: number; // in bytes
  acceptedTypes?: string[]; // MIME types
  
  // UI customization
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  
  // Validation
  error?: string;
}

export interface VariantConfig {
  aspectRatio: string;
  previewShape: 'circle' | 'rectangle' | 'square';
  defaultSize: string;
  placeholder: string;
}

export const VARIANT_CONFIG: Record<ImageUploadVariant, VariantConfig> = {
  avatar: {
    aspectRatio: '1:1',
    previewShape: 'circle',
    defaultSize: 'h-32 w-32',
    placeholder: 'Upload avatar image',
  },
  banner: {
    aspectRatio: '16:9',
    previewShape: 'rectangle',
    defaultSize: 'h-48 w-full',
    placeholder: 'Upload banner image',
  },
  project: {
    aspectRatio: '4:3',
    previewShape: 'rectangle',
    defaultSize: 'h-64 w-full',
    placeholder: 'Upload project image',
  },
  default: {
    aspectRatio: '1:1',
    previewShape: 'square',
    defaultSize: 'h-48 w-48',
    placeholder: 'Upload image',
  },
};

export const FILE_ERRORS = {
  INVALID_TYPE: 'Invalid file type. Please upload JPG, PNG, or GIF.',
  FILE_TOO_LARGE: (maxSize: number) => `File too large. Maximum size is ${maxSize}MB.`,
  UPLOAD_FAILED: 'Failed to upload image. Please try again.',
};

export const URL_ERRORS = {
  INVALID_FORMAT: 'Invalid URL format. Please enter a valid HTTPS URL.',
  LOAD_FAILED: 'Failed to load image from URL. Please check the URL.',
  NOT_HTTPS: 'Only HTTPS URLs are supported for security.',
};

export const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
