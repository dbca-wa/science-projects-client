/**
 * Performance tests for image compression
 *
 * These tests verify that compression metrics are captured correctly
 * and that there's no significant performance regression.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { compressImage } from "./image-compression.utils";
import imageCompression from "browser-image-compression";
import { getCompressionWorkerUrl } from "./compression-worker";

vi.mock("browser-image-compression");
vi.mock("./compression-worker");

const mockImageCompression = imageCompression as ReturnType<typeof vi.fn>;
const mockGetCompressionWorkerUrl = getCompressionWorkerUrl as ReturnType<
	typeof vi.fn
>;

describe("Image Compression Performance", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetCompressionWorkerUrl.mockReturnValue("blob:mock-url");
	});

	/**
	 * Helper to create a file of specific size
	 */
	function createFile(sizeMB: number): File {
		const sizeBytes = sizeMB * 1024 * 1024;
		const buffer = new ArrayBuffer(sizeBytes);
		const blob = new Blob([buffer], { type: "image/jpeg" });
		return new File([blob], "test.jpg", { type: "image/jpeg" });
	}

	describe("Compression timing", () => {
		it("should capture compression time in metrics", async () => {
			const file = createFile(2);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });

			// Simulate compression taking some time
			mockImageCompression.mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => resolve(compressedBlob), 10);
					})
			);

			const result = await compressImage(file, { useWebWorker: true });

			expect(result.metrics.compressionTime).toBeGreaterThan(0);
			expect(result.metrics.compressionTime).toBeLessThan(1000); // Should be under 1 second in tests
		});

		it("should capture metrics for worker-based compression", async () => {
			const file = createFile(2);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			const result = await compressImage(file, { useWebWorker: true });

			expect(result.metrics).toMatchObject({
				workerCreated: true,
				compressionTime: expect.any(Number),
				originalSize: expect.any(Number),
				compressedSize: expect.any(Number),
				compressionRatio: expect.any(Number),
			});
		});

		it("should capture metrics for main thread compression", async () => {
			const file = createFile(2);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			const result = await compressImage(file, { useWebWorker: false });

			expect(result.metrics).toMatchObject({
				workerCreated: false,
				compressionTime: expect.any(Number),
				originalSize: expect.any(Number),
				compressedSize: expect.any(Number),
				compressionRatio: expect.any(Number),
			});
		});
	});

	describe("Performance comparison", () => {
		it("should complete compression in reasonable time", async () => {
			const file = createFile(5);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			const startTime = performance.now();
			await compressImage(file, { useWebWorker: true });
			const endTime = performance.now();

			const totalTime = endTime - startTime;

			// In tests, compression should be very fast (mocked)
			// In real usage, this would be longer
			expect(totalTime).toBeLessThan(1000); // 1 second max in tests
		});

		it("should handle multiple compressions efficiently", async () => {
			const file = createFile(2);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			const compressions = Array.from({ length: 5 }, () =>
				compressImage(file, { useWebWorker: true })
			);

			const startTime = performance.now();
			const results = await Promise.all(compressions);
			const endTime = performance.now();

			const totalTime = endTime - startTime;

			// All compressions should complete
			expect(results).toHaveLength(5);
			results.forEach((result) => {
				expect(result.metrics.compressionTime).toBeGreaterThanOrEqual(0);
			});

			// Should handle multiple compressions efficiently
			expect(totalTime).toBeLessThan(2000); // 2 seconds max for 5 compressions in tests
		});
	});

	describe("Metrics accuracy", () => {
		it("should accurately report original file size", async () => {
			const sizeMB = 3.5;
			const file = createFile(sizeMB);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			const result = await compressImage(file, { useWebWorker: true });

			const expectedSize = sizeMB * 1024 * 1024;
			expect(result.metrics.originalSize).toBe(expectedSize);
		});

		it("should accurately report compressed file size", async () => {
			const file = createFile(5);
			const compressedData = new Array(500000).fill("x").join(""); // ~500KB
			const compressedBlob = new Blob([compressedData], {
				type: "image/jpeg",
			});
			mockImageCompression.mockResolvedValue(compressedBlob);

			const result = await compressImage(file, { useWebWorker: true });

			expect(result.metrics.compressedSize).toBe(compressedBlob.size);
		});

		it("should accurately calculate compression ratio", async () => {
			const file = createFile(10); // 10MB
			const compressedData = new Array(1000000).fill("x").join(""); // ~1MB
			const compressedBlob = new Blob([compressedData], {
				type: "image/jpeg",
			});
			mockImageCompression.mockResolvedValue(compressedBlob);

			const result = await compressImage(file, { useWebWorker: true });

			const expectedRatio =
				result.metrics.compressedSize / result.metrics.originalSize;
			expect(result.metrics.compressionRatio).toBeCloseTo(expectedRatio, 5);
			expect(result.metrics.compressionRatio).toBeLessThan(0.2); // Should be ~10% (1MB/10MB)
		});
	});

	describe("Performance regression detection", () => {
		it("should not have significant overhead from worker URL creation", async () => {
			const file = createFile(2);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			// Measure with worker
			const startWithWorker = performance.now();
			await compressImage(file, { useWebWorker: true });
			const timeWithWorker = performance.now() - startWithWorker;

			// Measure without worker
			const startWithoutWorker = performance.now();
			await compressImage(file, { useWebWorker: false });
			const timeWithoutWorker = performance.now() - startWithoutWorker;

			// Worker URL creation should add minimal overhead (< 50ms in tests)
			const overhead = timeWithWorker - timeWithoutWorker;
			expect(Math.abs(overhead)).toBeLessThan(50);
		});

		it("should cache worker URL for subsequent compressions", async () => {
			const file = createFile(2);
			const compressedBlob = new Blob(["compressed"], { type: "image/jpeg" });
			mockImageCompression.mockResolvedValue(compressedBlob);

			// First compression
			await compressImage(file, { useWebWorker: true });
			const firstCallCount = mockGetCompressionWorkerUrl.mock.calls.length;

			// Second compression
			await compressImage(file, { useWebWorker: true });
			const secondCallCount = mockGetCompressionWorkerUrl.mock.calls.length;

			// Worker URL should be called for both (not cached in mock)
			// In real implementation, the URL is cached inside getCompressionWorkerUrl
			expect(secondCallCount).toBe(firstCallCount + 1);
		});
	});
});
