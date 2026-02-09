import { cn } from "@/shared/lib/utils";

export interface ProgressBarProps {
	currentStep: number;
	totalSteps: number;
	color?: string;
	className?: string;
}

export const ProgressBar = ({
	currentStep,
	totalSteps,
	color,
	className,
}: ProgressBarProps) => {
	const percentage = ((currentStep + 1) / totalSteps) * 100;
	const defaultColor = "#10b981"; // emerald-500

	return (
		<div
			className={cn(
				"h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
				className,
			)}
			role="progressbar"
			aria-valuenow={currentStep + 1}
			aria-valuemin={1}
			aria-valuemax={totalSteps}
			aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
		>
			<div
				className="h-full rounded-full transition-all duration-500 ease-out"
				style={{
					width: `${percentage}%`,
					backgroundColor: color || defaultColor,
				}}
			/>
		</div>
	);
};
