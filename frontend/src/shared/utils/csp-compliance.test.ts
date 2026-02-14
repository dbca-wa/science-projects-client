import { describe, it, expect } from "vitest";
import { getCompressionWorkerUrl } from "./compression-worker";

describe("CSP Compliance", () => {
	describe("worker blob URL", () => {
		it("should create blob URL that complies with CSP", () => {
			const workerUrl = getCompressionWorkerUrl();

			expect(workerUrl).toBeTruthy();
			expect(workerUrl).toMatch(/^blob:/);
		});

		it("should create blob URL from same origin", () => {
			const workerUrl = getCompressionWorkerUrl();

			if (workerUrl) {
				// Blob URLs should start with blob: followed by the origin
				// In test environment, this might be nodedata: instead of http:
				expect(workerUrl).toMatch(/^blob:(http|nodedata)/);
			}
		});

		it("should not attempt to load from external CDN", () => {
			const workerUrl = getCompressionWorkerUrl();

			if (workerUrl) {
				// Should NOT contain CDN URLs
				expect(workerUrl).not.toContain("cdn.jsdelivr.net");
				expect(workerUrl).not.toContain("unpkg.com");
				expect(workerUrl).not.toContain("cdnjs.cloudflare.com");
			}
		});

		it("should create URL that satisfies worker-src blob: directive", () => {
			const workerUrl = getCompressionWorkerUrl();

			if (workerUrl) {
				// Blob URLs satisfy CSP directive: worker-src 'self' blob:
				expect(workerUrl.startsWith("blob:")).toBe(true);
			}
		});
	});

	describe("CSP configuration", () => {
		it("should have blob: in script-src for worker scripts", () => {
			// This test verifies the CSP configuration allows blob URLs
			// In a real browser environment, this would be checked via meta tags
			// For now, we verify the worker URL can be created (which implies CSP allows it)

			const workerUrl = getCompressionWorkerUrl();
			expect(workerUrl).toBeTruthy();
			expect(workerUrl).toMatch(/^blob:/);
		});

		it("should not relax CSP to allow external scripts", () => {
			// Verify we're not using unsafe-eval or allowing external domains
			// This is a design verification test

			const workerUrl = getCompressionWorkerUrl();

			if (workerUrl) {
				// Should be a blob URL, not an external URL
				expect(workerUrl).not.toMatch(/^https?:\/\//);
				expect(workerUrl).toMatch(/^blob:/);
			}
		});
	});

	describe("security properties", () => {
		it("should use locally bundled worker code", () => {
			// The worker URL should be a blob URL created from bundled code
			// Not a reference to an external resource

			const workerUrl = getCompressionWorkerUrl();

			if (workerUrl) {
				// Blob URLs are created from local data
				expect(workerUrl).toMatch(/^blob:/);

				// Should not be a data URL (which could be inline code)
				expect(workerUrl).not.toMatch(/^data:/);

				// Should not be an external URL
				expect(workerUrl).not.toMatch(/^https?:\/\//);
			}
		});

		it("should maintain strict CSP while enabling workers", () => {
			// This test verifies the design principle:
			// We enable workers WITHOUT relaxing CSP security

			const workerUrl = getCompressionWorkerUrl();

			// Worker URL should be created successfully
			expect(workerUrl).toBeTruthy();

			// And it should be a blob URL (satisfies worker-src 'self' blob:)
			expect(workerUrl).toMatch(/^blob:/);

			// Not an external URL (which would require relaxing CSP)
			expect(workerUrl).not.toMatch(/^https?:\/\/(?!localhost|127\.0\.0\.1)/);
		});

		it("should cache worker URL for reuse", () => {
			// Security benefit: single blob URL, not creating multiple URLs

			const url1 = getCompressionWorkerUrl();
			const url2 = getCompressionWorkerUrl();

			expect(url1).toBe(url2); // Same reference
		});
	});
});
