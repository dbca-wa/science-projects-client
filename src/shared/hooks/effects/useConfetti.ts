import confetti from "canvas-confetti";
import {
	CONFETTI_COLOR_SCHEMES,
	ACTIVE_CONFETTI_SCHEME,
} from "@/shared/constants/project-colors";

/**
 * Get confetti colors - uses the active color scheme from constants
 */
function getConfettiColors(): string[] {
	return [...CONFETTI_COLOR_SCHEMES[ACTIVE_CONFETTI_SCHEME]];
}

/**
 * Hook to trigger confetti programmatically
 *
 * Uses React Portal to render canvas at layout level for proper positioning.
 * Confetti appears in the #confetti-root container added to the layout.
 *
 * Features:
 * - Single burst of 100 particles (like original HomeConfetti)
 * - 360-degree spread from center
 * - Particles fall naturally over ~3-4 seconds
 * - No abrupt disappearance - particles fade naturally
 * - Uses active color scheme from project-colors.ts
 *
 * @example
 * const { fireConfetti } = useConfetti();
 *
 * // Trigger confetti
 * fireConfetti();
 */
export function useConfetti() {
	const fireConfetti = () => {
		// Find the portal container at layout level
		const portalRoot = document.getElementById("confetti-root");

		if (!portalRoot) {
			console.warn("useConfetti: #confetti-root container not found in layout");
			return;
		}

		// Create canvas element
		const canvas = document.createElement("canvas");
		canvas.className = "absolute inset-0 w-full h-full pointer-events-none";
		canvas.style.position = "absolute";
		canvas.style.top = "0";
		canvas.style.left = "0";
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		canvas.style.pointerEvents = "none";

		// Append to portal root (at layout level)
		portalRoot.appendChild(canvas);

		// Create confetti instance for this canvas
		const myConfetti = confetti.create(canvas, {
			resize: true,
			useWorker: false,
		});

		const colors = getConfettiColors();

		// Single burst like the original HomeConfetti
		myConfetti({
			particleCount: 100,
			spread: 360,
			origin: {
				x: 0.5,
				y: 0.4,
			},
			colors: colors,
			ticks: 300, // Moderate lifetime - particles fall naturally in ~3-4 seconds
			gravity: 1, // Normal gravity for natural fall speed
			scalar: 1.2,
			disableForReducedMotion: true,
		});

		// Wait for particles to fall naturally before cleanup
		// With ticks: 300 and gravity: 1, particles will take ~3-4 seconds to fall
		setTimeout(() => {
			canvas.remove();
		}, 4000);
	};

	return { fireConfetti };
}
