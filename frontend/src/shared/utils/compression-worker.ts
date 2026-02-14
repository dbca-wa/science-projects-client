/**
 * Compression Worker Utilities
 *
 * This module creates a local blob URL for the browser-image-compression worker
 * to prevent CSP violations from CDN loading.
 *
 * Background:
 * The browser-image-compression library attempts to load its worker script from
 * a CDN (https://cdn.jsdelivr.net/npm/browser-image-compression/...) by default.
 * This violates our CSP policy which only allows scripts from 'self'.
 *
 * Solution:
 * We import the worker code as a raw string using Vite's ?raw syntax, create a
 * blob URL from it, and pass that to the library via the libURL option. This
 * satisfies our CSP directive: worker-src 'self' blob:
 */

// Import the worker code as a raw string
// Vite will bundle this into the application at build time
import WorkerCode from "browser-image-compression/dist/browser-image-compression.js?raw";

/**
 * Cached blob URL for the compression worker
 * Created once and reused for all compression operations
 */
let workerBlobUrl: string | null = null;

/**
 * Get the blob URL for the compression worker.
 *
 * This creates a blob URL from the locally bundled worker code,
 * preventing the library from attempting to load from a CDN
 * (which would violate our CSP policy).
 *
 * The blob URL satisfies CSP directive: worker-src 'self' blob:
 *
 * The URL is cached after first creation to avoid creating multiple
 * blob URLs for the same worker code.
 *
 * @returns Blob URL for the worker, or null if creation fails
 *
 * @example
 * ```typescript
 * const workerUrl = getCompressionWorkerUrl();
 * if (workerUrl) {
 *   await imageCompression(file, {
 *     useWebWorker: true,
 *     libURL: workerUrl,
 *   });
 * }
 * ```
 */
export function getCompressionWorkerUrl(): string | null {
	// Return cached URL if already created
	if (workerBlobUrl) {
		return workerBlobUrl;
	}

	try {
		// Create a blob from the worker code
		const blob = new Blob([WorkerCode], {
			type: "application/javascript",
		});

		// Create and cache the blob URL
		workerBlobUrl = URL.createObjectURL(blob);

		console.log("Created compression worker blob URL:", workerBlobUrl);

		return workerBlobUrl;
	} catch (error) {
		console.error("Failed to create compression worker blob URL:", error);
		return null;
	}
}

/**
 * Revoke a worker blob URL to free up memory.
 *
 * This should be called when the worker is no longer needed,
 * typically during application cleanup or component unmount.
 *
 * Note: In practice, this is rarely needed as the blob URL is
 * cached for the lifetime of the application and automatically
 * cleaned up when the page unloads.
 *
 * @param url - Blob URL to revoke
 *
 * @example
 * ```typescript
 * const workerUrl = getCompressionWorkerUrl();
 * // ... use worker ...
 * revokeWorkerUrl(workerUrl);
 * ```
 */
export function revokeWorkerUrl(url: string): void {
	try {
		URL.revokeObjectURL(url);

		// Clear cached URL if it matches
		if (workerBlobUrl === url) {
			workerBlobUrl = null;
			console.log("Revoked compression worker blob URL");
		}
	} catch (error) {
		console.error("Failed to revoke worker blob URL:", error);
	}
}
