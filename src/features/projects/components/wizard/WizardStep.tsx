import { type ReactNode } from "react";

interface WizardStepProps {
	title: string;
	description?: string;
	children: ReactNode;
	isActive: boolean;
	direction?: "forward" | "backward";
}

/**
 * WizardStep - Container for step content with animations
 *
 * Features:
 * - Fade in/out animations
 * - Slide animations based on direction
 * - Forward: slides up from bottom
 * - Backward: slides down from top
 * - Smooth transitions with Tailwind classes
 */
export function WizardStep({
	title,
	description,
	children,
	isActive,
	direction = "forward",
}: WizardStepProps) {
	if (!isActive) {
		return null;
	}

	// Animation classes based on direction
	const animationClasses =
		direction === "forward"
			? "animate-in fade-in slide-in-from-bottom-4 duration-400"
			: "animate-in fade-in slide-in-from-top-4 duration-400";

	return (
		<div className={animationClasses}>
			<div className="mb-4 sm:mb-6">
				<h2 className="text-xl sm:text-2xl font-bold mb-2">{title}</h2>
				{description && (
					<p className="text-sm sm:text-base text-muted-foreground">
						{description}
					</p>
				)}
			</div>
			<div>{children}</div>
		</div>
	);
}
