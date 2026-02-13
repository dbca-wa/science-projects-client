/**
 * Centralised animation durations for shadcn/ui components with MobX observers
 *
 * These durations are used with a delayed unmount pattern to prevent
 * animation flicker when MobX state changes trigger re-renders.
 *
 */

/**
 * Delay before triggering open animation (ms)
 * Browser needs to see initial state before CSS transition triggers
 */
export const ANIMATION_OPEN_DELAY = 10;

/**
 * Close animation durations (ms)
 * Component stays mounted for this duration before unmounting
 */
export const ANIMATION_DURATIONS = {
	/** Sheet component - slide in/out animation */
	SHEET: 300,

	/** Dialog component - fade + scale animation */
	DIALOG: 200,

	/** Dropdown menu - fade + scale + translateY animation */
	DROPDOWN: 150,

	/** Popover component - fade + scale + translateY animation */
	POPOVER: 150,

	/** Alert dialog - no animations (instant) */
	ALERT_DIALOG: 0,
} as const;

/**
 * Type representing valid animation duration values
 */
export type AnimationDuration =
	(typeof ANIMATION_DURATIONS)[keyof typeof ANIMATION_DURATIONS];
