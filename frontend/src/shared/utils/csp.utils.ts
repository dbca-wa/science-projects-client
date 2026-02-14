/**
 * CSP (Content Security Policy) Utilities
 *
 * Provides utilities for working with Content Security Policy,
 * including nonce generation and validation.
 */

/**
 * Generate a cryptographic nonce for CSP
 *
 * Generates a 16-byte random nonce using the Web Crypto API
 * and encodes it as base64.
 *
 * @returns Base64-encoded random nonce (22 characters + ==)
 * @throws Error if crypto API is unavailable (falls back to timestamp-based nonce)
 */
export function generateNonce(): string {
	try {
		// Generate 16 random bytes
		const array = new Uint8Array(16);
		crypto.getRandomValues(array);

		// Convert to base64
		return btoa(String.fromCharCode(...array));
	} catch (error) {
		// Fallback for environments without crypto API
		console.warn("Crypto API unavailable, using fallback nonce generation");

		// Timestamp-based fallback (less secure but functional)
		const fallbackData = `${Date.now()}-${Math.random()}`;
		return btoa(fallbackData);
	}
}

/**
 * Get the current page nonce from meta tag
 *
 * Retrieves the CSP nonce from the meta tag in the document head.
 * The nonce should be stored in a meta tag with property="csp-nonce".
 *
 * @returns Nonce string or null if not found
 */
export function getCurrentNonce(): string | null {
	const meta = document.querySelector('meta[property="csp-nonce"]');
	return meta?.getAttribute("content") || null;
}

/**
 * Validate nonce format
 *
 * Checks if a nonce string matches the expected format:
 * - 22 base64 characters
 * - Followed by ==
 *
 * @param nonce - Nonce to validate
 * @returns True if valid nonce format
 */
export function isValidNonce(nonce: string): boolean {
	// Valid nonce format: 22 base64 characters + ==
	return /^[A-Za-z0-9+/]{22}==$/.test(nonce);
}
