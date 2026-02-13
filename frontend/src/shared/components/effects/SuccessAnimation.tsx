import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2 } from "lucide-react";
import { ConfettiPortal } from "@/shared/components/effects/ConfettiPortal";
import {
	CONFETTI_COLOR_SCHEMES,
	ACTIVE_CONFETTI_SCHEME,
} from "@/shared/constants/project-colors";

interface SuccessAnimationProps {
	/**
	 * Whether to trigger the confetti animation
	 */
	trigger?: boolean;
	/**
	 * Duration of the confetti animation in milliseconds
	 * @default 3000
	 */
	duration?: number;
	/**
	 * Optional message to display
	 */
	message?: string;
}

/**
 * Get confetti colors - uses the active color scheme from constants
 */
function getConfettiColors(): string[] {
	return [...CONFETTI_COLOR_SCHEMES[ACTIVE_CONFETTI_SCHEME]];
}

/**
 * SuccessAnimation component
 *
 * Displays a success checkmark with confetti animation.
 *
 * Features:
 * - Single burst of 100 particles (like original HomeConfetti)
 * - 360-degree spread from center
 * - Success checkmark icon with bounce animation
 * - Optional success message
 * - Particles fall naturally over ~3-4 seconds
 * - No abrupt disappearance
 * - Properly positioned using React Portal at layout level
 * - Uses active color scheme from project-colors.ts
 * - Accessible and performant
 */
export function SuccessAnimation({
	trigger = true,
	duration = 3000,
	message = "Success!",
}: SuccessAnimationProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		if (!trigger || !canvasRef.current) return;

		// Create confetti instance for this specific canvas
		const myConfetti = confetti.create(canvasRef.current, {
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

		// Cleanup function - DON'T reset confetti
		return () => {
			// Don't call myConfetti.reset() - let particles fall naturally
		};
	}, [trigger, duration]);

	if (!trigger) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
			{/* Canvas for confetti - rendered via portal at layout level */}
			<ConfettiPortal isActive={true}>
				<canvas
					ref={canvasRef}
					className="absolute inset-0 w-full h-full pointer-events-none"
				/>
			</ConfettiPortal>

			<div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500 relative z-10">
				<div className="relative">
					{/* Success Icon with bounce animation */}
					<CheckCircle2
						className="h-24 w-24 text-green-500 animate-bounce"
						strokeWidth={2}
					/>
					{/* Glow effect */}
					<div className="absolute inset-0 h-24 w-24 bg-green-500/20 rounded-full blur-xl animate-pulse" />
				</div>

				{message && (
					<p className="text-2xl font-bold text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700">
						{message}
					</p>
				)}
			</div>
		</div>
	);
}
