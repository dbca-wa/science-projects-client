import { describe, it, expect, vi } from "vitest";
import { getCompressionWorkerUrl, revokeWorkerUrl } from "./compression-worker";

describe("compression-worker", () => {
	describe("getCompressionWorkerUrl", () => {
		it("should create a valid blob URL", () => {
			const url = getCompressionWorkerUrl();

			expect(url).toBeTruthy();
			expect(url).toMatch(/^blob:/);
		});

		it("should return cached URL on subsequent calls", () => {
			const url1 = getCompressionWorkerUrl();
			const url2 = getCompressionWorkerUrl();

			expect(url1).toBe(url2);
		});

		it("should handle creation failure gracefully", () => {
			// Mock URL.createObjectURL to throw
			const originalCreateObjectURL = URL.createObjectURL;
			URL.createObjectURL = vi.fn(() => {
				throw new Error("Mock error");
			});

			// Clear any cached URL by calling revoke first
			const existingUrl = getCompressionWorkerUrl();
			if (existingUrl) {
				revokeWorkerUrl(existingUrl);
			}

			const url = getCompressionWorkerUrl();
			expect(url).toBeNull();

			// Restore original function
			URL.createObjectURL = originalCreateObjectURL;
		});
	});

	describe("revokeWorkerUrl", () => {
		it("should revoke blob URL successfully", () => {
			const url = getCompressionWorkerUrl();
			expect(url).toBeTruthy();

			// Mock URL.revokeObjectURL to verify it's called
			const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

			if (url) {
				revokeWorkerUrl(url);
				expect(revokeObjectURLSpy).toHaveBeenCalledWith(url);
			}

			revokeObjectURLSpy.mockRestore();
		});

		it("should handle revocation errors gracefully", () => {
			// Mock URL.revokeObjectURL to throw
			const originalRevokeObjectURL = URL.revokeObjectURL;
			URL.revokeObjectURL = vi.fn(() => {
				throw new Error("Mock revocation error");
			});

			// Should not throw
			expect(() => revokeWorkerUrl("blob:test")).not.toThrow();

			// Restore original function
			URL.revokeObjectURL = originalRevokeObjectURL;
		});

		it("should clear cached URL when revoking the cached URL", () => {
			const url1 = getCompressionWorkerUrl();
			expect(url1).toBeTruthy();

			if (url1) {
				revokeWorkerUrl(url1);
			}

			// Next call should create a new URL
			const url2 = getCompressionWorkerUrl();
			expect(url2).toBeTruthy();
			expect(url2).not.toBe(url1);
		});
	});
});
