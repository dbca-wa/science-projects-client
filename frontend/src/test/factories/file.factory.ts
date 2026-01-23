/**
 * Test data factories for File objects
 * Used in unit tests for image compression and validation
 */

import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/shared/constants/image.constants";

export interface MockFileOptions {
  name?: string;
  type?: string;
  size?: number;
  lastModified?: number;
}

/**
 * Create a mock File object with configurable overrides
 */
export const createMockFile = (overrides?: MockFileOptions): File => {
  const options = {
    name: "test-image.jpg",
    type: "image/jpeg",
    size: 500_000, // 500KB - under 1MB limit
    lastModified: Date.now(),
    ...overrides,
  };

  // Create a Blob with the specified size
  const content = new Uint8Array(options.size);
  const blob = new Blob([content], { type: options.type });

  // Create File from Blob
  return new File([blob], options.name, {
    type: options.type,
    lastModified: options.lastModified,
  });
};

/**
 * Create an oversized file (> 1MB)
 */
export const createOversizedFile = (sizeMB = 2): File => {
  return createMockFile({
    name: `oversized-${sizeMB}mb.jpg`,
    size: sizeMB * 1024 * 1024,
    type: "image/jpeg",
  });
};

/**
 * Create a file with invalid type (non-image)
 */
export const createInvalidTypeFile = (type = "application/pdf"): File => {
  return createMockFile({
    name: "document.pdf",
    type,
    size: 100_000,
  });
};

/**
 * Create a small file (< 1MB)
 */
export const createSmallFile = (sizeKB = 500): File => {
  return createMockFile({
    name: `small-${sizeKB}kb.jpg`,
    size: sizeKB * 1024,
    type: "image/jpeg",
  });
};

/**
 * Create a file at exactly the max size limit
 */
export const createMaxSizeFile = (): File => {
  return createMockFile({
    name: "max-size.jpg",
    size: MAX_IMAGE_SIZE_BYTES,
    type: "image/jpeg",
  });
};

/**
 * Create a PNG file
 */
export const createPngFile = (sizeKB = 500): File => {
  return createMockFile({
    name: "test-image.png",
    type: "image/png",
    size: sizeKB * 1024,
  });
};

/**
 * Create a file with special characters in name
 */
export const createFileWithSpecialChars = (): File => {
  return createMockFile({
    name: "test image (1) [copy] #2.jpg",
    type: "image/jpeg",
    size: 500_000,
  });
};

/**
 * Create a file with very long name
 */
export const createFileWithLongName = (): File => {
  const longName = "a".repeat(200) + ".jpg";
  return createMockFile({
    name: longName,
    type: "image/jpeg",
    size: 500_000,
  });
};

/**
 * Create an empty file (0 bytes)
 */
export const createEmptyFile = (): File => {
  return createMockFile({
    name: "empty.jpg",
    type: "image/jpeg",
    size: 0,
  });
};

/**
 * Create files for all accepted image types
 */
export const createFilesForAllTypes = (): File[] => {
  return ACCEPTED_IMAGE_TYPES.map((type, index) => {
    const extension = type.split("/")[1];
    return createMockFile({
      name: `test-${index}.${extension}`,
      type,
      size: 500_000,
    });
  });
};
