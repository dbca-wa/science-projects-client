/**
 * Shared animation configurations for consistent animations across the application
 * Uses Framer Motion for all animations
 */

import type { Variants } from "framer-motion";

/**
 * Spring animation configuration for bouncy, physics-based animations
 * Used for reactions, buttons, and interactive elements
 */
export const springConfig = {
	type: "spring" as const,
	stiffness: 300,
	damping: 20,
};

/**
 * Smooth easing configuration for gentle transitions
 * Used for hover effects and subtle animations
 */
export const easeOutConfig = {
	duration: 0.15,
	ease: [0, 0, 0.2, 1] as const, // Cubic bezier
};

/**
 * Fade-in animation variants for new content
 * Used for comments, modals, and dynamic content
 */
export const fadeInVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 10,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: [0, 0, 0.2, 1],
		},
	},
};

/**
 * Scale bounce animation variants for reactions and counts
 * Used when reaction counts change or reactions are added
 */
export const scaleBounceVariants: Variants = {
	initial: {
		scale: 1,
	},
	bounce: {
		scale: [1, 1.3, 1],
		transition: springConfig,
	},
};

/**
 * Hover scale animation variants for interactive elements
 * Used for buttons, reaction types, and clickable items
 */
export const hoverScaleVariants: Variants = {
	rest: {
		scale: 1,
	},
	hover: {
		scale: 1.1,
		transition: easeOutConfig,
	},
	tap: {
		scale: 0.9,
	},
};
