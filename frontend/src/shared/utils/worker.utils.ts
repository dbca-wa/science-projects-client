/**
 * Web Worker Utilities
 *
 * Provides utilities for detecting Web Worker support,
 * managing worker configuration, and logging performance metrics.
 */

/**
 * Worker configuration options
 */
export interface WorkerConfig {
	/** Whether to use Web Workers for operations */
	useWebWorker: boolean;
	/** Whether to fall back to main thread if worker creation fails */
	fallbackToMainThread: boolean;
	/** Whether to log performance metrics */
	logPerformance: boolean;
}

/**
 * Performance metrics for Web Worker operations
 */
export interface WorkerMetrics {
	/** Whether a Web Worker was successfully created */
	workerCreated: boolean;
	/** Time taken for the operation in milliseconds */
	compressionTime: number;
	/** Original file size in bytes */
	originalSize: number;
	/** Compressed file size in bytes */
	compressedSize: number;
	/** Compression ratio (compressedSize / originalSize) */
	compressionRatio: number;
}

/**
 * Check if Web Workers are supported and allowed by CSP
 *
 * Attempts to create a test worker to verify:
 * 1. Browser supports Worker API
 * 2. CSP allows worker creation
 *
 * @returns True if Web Workers can be used
 */
export function canUseWebWorkers(): boolean {
	// Check if Worker API exists
	if (typeof Worker === "undefined") {
		return false;
	}

	// Check if CSP allows workers by attempting to create a test worker
	try {
		const testWorker = new Worker(
			URL.createObjectURL(new Blob([""], { type: "application/javascript" }))
		);
		testWorker.terminate();
		return true;
	} catch (error) {
		console.warn("Web Workers blocked by CSP or not supported:", error);
		return false;
	}
}

/**
 * Get worker configuration based on environment and CSP
 *
 * Automatically detects if Web Workers are available and
 * returns appropriate configuration.
 *
 * @returns Worker configuration object
 */
export function getWorkerConfig(): WorkerConfig {
	const canUse = canUseWebWorkers();

	return {
		useWebWorker: canUse,
		fallbackToMainThread: true,
		logPerformance: import.meta.env.DEV,
	};
}

/**
 * Log worker performance metrics
 *
 * Logs compression metrics to console in development mode.
 * Includes worker usage, timing, file sizes, and compression ratio.
 *
 * @param metrics - Performance metrics to log
 */
export function logWorkerMetrics(metrics: WorkerMetrics): void {
	// Only log in development
	if (!import.meta.env.DEV) return;

	console.group("🔧 Image Compression Metrics");
	console.log("Worker Used:", metrics.workerCreated);
	console.log("Time:", `${metrics.compressionTime.toFixed(0)}ms`);
	console.log(
		"Original:",
		`${(metrics.originalSize / 1024 / 1024).toFixed(2)}MB`
	);
	console.log(
		"Compressed:",
		`${(metrics.compressedSize / 1024 / 1024).toFixed(2)}MB`
	);
	console.log("Ratio:", `${(metrics.compressionRatio * 100).toFixed(1)}%`);
	console.groupEnd();
}
