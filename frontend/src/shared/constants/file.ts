/**
 * File Upload Constants
 * Centralized file size limits and accepted types
 */

/**
 * File size limits in bytes
 */
export const FILE_SIZE = {
  /** 5MB - Maximum file size for image uploads */
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  
  /** 10MB - Maximum file size for document uploads */
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024,
  
  /** 1MB - Maximum file size for avatars */
  MAX_AVATAR_SIZE: 1 * 1024 * 1024,
} as const;

/**
 * Accepted file types for uploads
 */
export const ACCEPTED_FILE_TYPES = {
  /** Image file types */
  IMAGES: ['image/jpeg', 'image/png', 'image/gif'] as const,
  
  /** Document file types */
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const,
} as const;
