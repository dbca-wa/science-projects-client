/**
 * Feature flags and configuration constants
 *
 * These constants control optional features and behaviours across the application.
 */

/**
 * Enable automatic polling for new comments
 *
 * When enabled, the comment section will automatically check for new comments
 * every 30 seconds. When disabled, users must manually refresh to see new comments.
 *
 * @default false - Polling disabled by default
 */
export const ENABLE_COMMENT_POLLING = false;
