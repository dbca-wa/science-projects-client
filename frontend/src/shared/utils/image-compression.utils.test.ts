import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	createMockFile,
	createOversizedFile,
	createSmallFile,
	createInvalidTypeFile,
	createEmptyFile,
	createFileWithSpecialChars,
	createFileWithLongName,
} from "@/test/factories/file.factory";
import {
	ACCEPTED_IMAGE_TYPES,
	MAX_IMAGE_SIZE_MB,
} from "@/shared/constants/image.constants";

// Mock browser-image-compression
vi.mock("browser-image-compression", () => ({
	default: vi.fn(),
}));

// Mock compression-worker
vi.mock("./compression-worker", () => ({
	getCompressionWorkerUrl: vi.fn(),
}));

import imageCompression from "browser-image-compression";
import { getCompressionWorkerUrl } from "./compression-worker";
import {
	compressImage,
	ImageCompressionError,
	blobToFile,
	validateImageType,
	needsCompression,
} from "./image-compression.utils";

const mockImageCompression = imageCompression as unknown as ReturnType<
	typeof vi.fn
>;
const mockGetCompressionWorkerUrl =
	getCompressionWorkerUrl as unknown as ReturnType<typeof vi.fn>;

describe("blobToFile", () => {
	it("should create valid File objects", () => {
		const blob = new Blob(["test content"], { type: "image/jpeg" });
		const fileName = "test.jpg";

		const file = blobToFile(blob, fileName);

		expect(file).toBeInstanceOf(File);
		expect(file.name).toBe(fileName);
		expect(file.type).toBe("image/jpeg");
		expect(file.size).toBe(blob.size);
	});

	it("should preserve blob type", () => {
		const blob = new Blob(["test"], { type: "image/png" });
		const file = blobToFile(blob, "test.png");

		expect(file.type).toBe("image/png");
	});

	it("should set lastModified timestamp", () => {
		const blob = new Blob(["test"], { type: "image/jpeg" });
		const beforeTime = Date.now();
		const file = blobToFile(blob, "test.jpg");
		const afterTime = Date.now();

		expect(file.lastModified).toBeGreaterThanOrEqual(beforeTime);
		expect(file.lastModified).toBeLessThanOrEqual(afterTime);
	});
});

describe("validateImageType", () => {
	it("should pass for valid JPEG type", () => {
		const file = createMockFile({ type: "image/jpeg" });
		expect(() => validateImageType(file)).not.toThrow();
	});

	it("should pass for valid PNG type", () => {
		const file = createMockFile({ type: "image/png" });
		expect(() => validateImageType(file)).not.toThrow();
	});

	it("should pass for valid JPG type", () => {
		const file = createMockFile({ type: "image/jpg" });
		expect(() => validateImageType(file)).not.toThrow();
	});

	it("should throw for invalid PDF type", () => {
		const file = createInvalidTypeFile("application/pdf");

		expect(() => validateImageType(file)).toThrow(ImageCompressionError);
		expect(() => validateImageType(file)).toThrow("Invalid file type");
	});

	it("should throw with INVALID_TYPE code for wrong type", () => {
		const file = createInvalidTypeFile("text/plain");

		try {
			validateImageType(file);
			expect.fail("Should have thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(ImageCompressionError);
			expect((error as ImageCompressionError).code).toBe("INVALID_TYPE");
		}
	});

	it("should throw for file with no type", () => {
		const file = createMockFile({ type: "" });

		expect(() => validateImageType(file)).toThrow(ImageCompressionError);
		expect(() => validateImageType(file)).toThrow("no type information");
	});

	it("should throw with INVALID_FILE code for no type", () => {
		const file = createMockFile({ type: "" });

		try {
			validateImageType(file);
			expect.fail("Should have thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(ImageCompressionError);
			expect((error as ImageCompressionError).code).toBe("INVALID_FILE");
		}
	});

	it("should accept custom accepted types", () => {
		const file = createMockFile({ type: "image/png" });
		const customTypes = ["image/png"];

		expect(() => validateImageType(file, customTypes)).not.toThrow();
	});

	it("should reject when not in custom accepted types", () => {
		const file = createMockFile({ type: "image/jpeg" });
		const customTypes = ["image/png"];

		expect(() => validateImageType(file, customTypes)).toThrow(
			ImageCompressionError
		);
	});
});

describe("needsCompression", () => {
	it("should return true for oversized files", () => {
		const largeFile = createOversizedFile(2); // 2MB
		expect(needsCompression(largeFile, MAX_IMAGE_SIZE_MB)).toBe(true);
	});

	it("should return false for small files", () => {
		const smallFile = createSmallFile(500); // 500KB
		expect(needsCompression(smallFile, MAX_IMAGE_SIZE_MB)).toBe(false);
	});

	it("should return false for files at exact limit", () => {
		const file = createMockFile({ size: 1 * 1024 * 1024 }); // Exactly 1MB
		expect(needsCompression(file, 1)).toBe(false);
	});

	it("should return true for files just over limit", () => {
		const file = createMockFile({ size: 1 * 1024 * 1024 + 1 }); // 1MB + 1 byte
		expect(needsCompression(file, 1)).toBe(true);
	});

	it("should use custom maxSizeMB", () => {
		const file = createMockFile({ size: 0.5 * 1024 * 1024 }); // 0.5MB
		expect(needsCompression(file, 0.3)).toBe(true);
		expect(needsCompression(file, 1)).toBe(false);
	});

	it("should handle empty files", () => {
		const emptyFile = createEmptyFile();
		expect(needsCompression(emptyFile, MAX_IMAGE_SIZE_MB)).toBe(false);
	});
});

describe("compressImage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("validation", () => {
		it("should validate file type before compression", async () => {
			const invalidFile = createInvalidTypeFile("application/pdf");

			await expect(compressImage(invalidFile)).rejects.toThrow(
				ImageCompressionError
			);
			await expect(compressImage(invalidFile)).rejects.toThrow(
				"Invalid file type"
			);
		});

		it("should throw INVALID_TYPE for wrong file type", async () => {
			const invalidFile = createInvalidTypeFile("text/plain");

			try {
				await compressImage(invalidFile);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(ImageCompressionError);
				expect((error as ImageCompressionError).code).toBe("INVALID_TYPE");
			}
		});

		it("should throw INVALID_FILE for file with no type", async () => {
			const file = createMockFile({ type: "" });

			try {
				await compressImage(file);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(ImageCompressionError);
				expect((error as ImageCompressionError).code).toBe("INVALID_FILE");
			}
		});
	});

	describe("small files (no compression needed)", () => {
		it("should return original file when under size limit", async () => {
			const smallFile = createSmallFile(500); // 500KB

			const result = await compressImage(smallFile);

			expect(result.file).toBe(smallFile); // Same reference
			expect(result.metrics.compressionTime).toBe(0);
			expect(mockImageCompression).not.toHaveBeenCalled();
		});

		it("should not call compression library for small files", async () => {
			const smallFile = createSmallFile(100); // 100KB

			await compressImage(smallFile);

			expect(mockImageCompression).not.toHaveBeenCalled();
		});

		it("should return file at exact size limit", async () => {
			const file = createMockFile({ size: 1 * 1024 * 1024 }); // Exactly 1MB

			const result = await compressImage(file);

			expect(result.file).toBe(file);
			expect(result.metrics.compressionTime).toBe(0);
			expect(result.metrics.workerCreated).toBe(false);
			expect(mockImageCompression).not.toHaveBeenCalled();
		});
	});

	describe("large files (compression needed)", () => {
		it("should compress oversized files", async () => {
			const largeFile = createOversizedFile(5); // 5MB
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			const result = await compressImage(largeFile);

			expect(mockImageCompression).toHaveBeenCalledWith(
				largeFile,
				expect.objectContaining({
					maxSizeMB: MAX_IMAGE_SIZE_MB,
					useWebWorker: false,
					maxWidthOrHeight: 1920,
				})
			);
			expect(result.file).toBeInstanceOf(File);
			expect(result.file.name).toBe(largeFile.name);
		});

		it("should preserve original filename", async () => {
			const largeFile = createOversizedFile(2);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			const result = await compressImage(largeFile);

			expect(result.file.name).toBe(largeFile.name);
		});

		it("should return smaller file after compression", async () => {
			const largeFile = createOversizedFile(5); // 5MB
			const smallBlob = new Blob(["small"], { type: "image/jpeg" }); // Much smaller
			mockImageCompression.mockResolvedValue(smallBlob);

			const result = await compressImage(largeFile);

			expect(result.file.size).toBeLessThan(largeFile.size);
		});

		it("should throw COMPRESSION_FAILED when compression fails", async () => {
			const largeFile = createOversizedFile(2);
			mockImageCompression.mockRejectedValue(new Error("Compression error"));

			try {
				await compressImage(largeFile);
				expect.fail("Should have thrown");
			} catch (error) {
				expect(error).toBeInstanceOf(ImageCompressionError);
				expect((error as ImageCompressionError).code).toBe(
					"COMPRESSION_FAILED"
				);
				expect((error as ImageCompressionError).message).toContain(
					"Failed to compress"
				);
			}
		});
	});

	describe("custom options", () => {
		it("should use custom maxSizeMB", async () => {
			const file = createMockFile({ size: 0.6 * 1024 * 1024 }); // 0.6MB
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			await compressImage(file, { maxSizeMB: 0.5 });

			expect(mockImageCompression).toHaveBeenCalledWith(
				file,
				expect.objectContaining({
					maxSizeMB: 0.5,
				})
			);
		});

		it("should use custom maxDimension", async () => {
			const largeFile = createOversizedFile(2);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			await compressImage(largeFile, { maxDimension: 1280 });

			expect(mockImageCompression).toHaveBeenCalledWith(
				largeFile,
				expect.objectContaining({
					maxWidthOrHeight: 1280,
				})
			);
		});

		it("should use custom acceptedTypes", async () => {
			const pngFile = createMockFile({
				type: "image/png",
				size: 2 * 1024 * 1024,
			});
			const compressedBlob = new Blob(["compressed"], { type: "image/png" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			await compressImage(pngFile, { acceptedTypes: ["image/png"] });

			expect(mockImageCompression).toHaveBeenCalled();
		});

		it("should reject JPEG when only PNG accepted", async () => {
			const jpegFile = createMockFile({ type: "image/jpeg" });

			await expect(
				compressImage(jpegFile, { acceptedTypes: ["image/png"] })
			).rejects.toThrow(ImageCompressionError);
		});

		it("should always use useWebWorker: false", async () => {
			const largeFile = createOversizedFile(2);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			await compressImage(largeFile);

			expect(mockImageCompression).toHaveBeenCalledWith(
				largeFile,
				expect.objectContaining({
					useWebWorker: false,
				})
			);
		});
	});

	describe("edge cases", () => {
		it("should handle empty files", async () => {
			const emptyFile = createEmptyFile();

			const result = await compressImage(emptyFile);

			expect(result.file).toBe(emptyFile);
			expect(result.metrics.compressionTime).toBe(0);
			expect(mockImageCompression).not.toHaveBeenCalled();
		});

		it("should handle files with special characters in name", async () => {
			const file = createFileWithSpecialChars();
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			// Make it oversized so compression happens
			const largeFile = createMockFile({
				name: file.name,
				size: 2 * 1024 * 1024,
			});

			const result = await compressImage(largeFile);

			expect(result.file.name).toBe(largeFile.name);
		});

		it("should handle files with very long names", async () => {
			const file = createFileWithLongName();
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			// Make it oversized so compression happens
			const largeFile = createMockFile({
				name: file.name,
				size: 2 * 1024 * 1024,
			});

			const result = await compressImage(largeFile);

			expect(result.file.name).toBe(largeFile.name);
		});

		it("should handle extremely large files", async () => {
			const hugeFile = createOversizedFile(100); // 100MB
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			const result = await compressImage(hugeFile);

			expect(mockImageCompression).toHaveBeenCalled();
			expect(result.file).toBeInstanceOf(File);
			expect(result.metrics).toBeDefined();
		});
	});

	describe("all accepted types", () => {
		it.each(ACCEPTED_IMAGE_TYPES)("should accept %s type", async (type) => {
			const file = createMockFile({ type, size: 500_000 });

			const result = await compressImage(file);

			expect(result.file).toBe(file);
		});

		it.each(ACCEPTED_IMAGE_TYPES)(
			"should compress oversized %s files",
			async (type) => {
				const largeFile = createMockFile({ type, size: 2 * 1024 * 1024 });
				const compressedBlob = new Blob(["compressed"], { type });
				mockImageCompression.mockResolvedValue(compressedBlob);

				const result = await compressImage(largeFile);

				expect(mockImageCompression).toHaveBeenCalled();
				expect(result.file).toBeInstanceOf(File);
				expect(result.metrics).toBeDefined();
				expect(result.metrics.compressionTime).toBeGreaterThan(0);
			}
		);
	});
});

describe("worker URL integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default: worker URL creation succeeds
		mockGetCompressionWorkerUrl.mockReturnValue(
			"blob:http://localhost:3000/test-worker"
		);
	});

	it("should pass workerUrl to library when using Web Workers", async () => {
		const largeFile = createOversizedFile(2);
		const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
		mockImageCompression.mockResolvedValue(compressedBlob);

		await compressImage(largeFile, { useWebWorker: true });

		expect(mockGetCompressionWorkerUrl).toHaveBeenCalled();
		expect(mockImageCompression).toHaveBeenCalledWith(
			largeFile,
			expect.objectContaining({
				useWebWorker: true,
				libURL: "blob:http://localhost:3000/test-worker",
			})
		);
	});

	it("should not call getCompressionWorkerUrl when useWebWorker is false", async () => {
		const largeFile = createOversizedFile(2);
		const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
		mockImageCompression.mockResolvedValue(compressedBlob);

		await compressImage(largeFile, { useWebWorker: false });

		expect(mockGetCompressionWorkerUrl).not.toHaveBeenCalled();
		expect(mockImageCompression).toHaveBeenCalledWith(
			largeFile,
			expect.objectContaining({
				useWebWorker: false,
			})
		);
	});

	it("should fall back to main thread if worker URL creation fails", async () => {
		const largeFile = createOversizedFile(2);
		const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
		mockImageCompression.mockResolvedValue(compressedBlob);

		// Mock worker URL creation failure
		mockGetCompressionWorkerUrl.mockReturnValue(null);

		await compressImage(largeFile, { useWebWorker: true });

		expect(mockGetCompressionWorkerUrl).toHaveBeenCalled();
		expect(mockImageCompression).toHaveBeenCalledWith(
			largeFile,
			expect.objectContaining({
				useWebWorker: false, // Falls back to main thread
			})
		);
	});

	it("should not include libURL when worker URL creation fails", async () => {
		const largeFile = createOversizedFile(2);
		const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
		mockImageCompression.mockResolvedValue(compressedBlob);

		// Mock worker URL creation failure
		mockGetCompressionWorkerUrl.mockReturnValue(null);

		await compressImage(largeFile, { useWebWorker: true });

		expect(mockImageCompression).toHaveBeenCalledWith(
			largeFile,
			expect.not.objectContaining({
				libURL: expect.anything(),
			})
		);
	});

	it("should return metrics with workerCreated: true when worker URL succeeds", async () => {
		const largeFile = createOversizedFile(2);
		const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
		mockImageCompression.mockResolvedValue(compressedBlob);

		const result = await compressImage(largeFile, { useWebWorker: true });

		expect(result.metrics.workerCreated).toBe(true);
	});

	it("should return metrics with workerCreated: false when worker URL fails", async () => {
		const largeFile = createOversizedFile(2);
		const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
		mockImageCompression.mockResolvedValue(compressedBlob);

		// Mock worker URL creation failure
		mockGetCompressionWorkerUrl.mockReturnValue(null);

		const result = await compressImage(largeFile, { useWebWorker: true });

		expect(result.metrics.workerCreated).toBe(false);
	});

	it("should handle worker URL with special characters", async () => {
		const largeFile = createOversizedFile(2);
		const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
		mockImageCompression.mockResolvedValue(compressedBlob);

		const specialWorkerUrl =
			"blob:http://localhost:3000/abc-123-def-456-ghi-789";
		mockGetCompressionWorkerUrl.mockReturnValue(specialWorkerUrl);

		await compressImage(largeFile, { useWebWorker: true });

		expect(mockImageCompression).toHaveBeenCalledWith(
			largeFile,
			expect.objectContaining({
				libURL: specialWorkerUrl,
			})
		);
	});

	it("should not include libURL when useWebWorker is false", async () => {
		const largeFile = createOversizedFile(2);
		const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
		mockImageCompression.mockResolvedValue(compressedBlob);

		await compressImage(largeFile, { useWebWorker: false });

		const callArgs = mockImageCompression.mock.calls[0][1];
		expect(callArgs).not.toHaveProperty("libURL");
	});
});
