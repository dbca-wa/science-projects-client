import { cn } from "@/shared/lib/utils";
import { Check } from "lucide-react";

export interface StepIndicatorProps {
	stepNumber: number;
	label: string;
	shortLabel?: string;
	isActive: boolean;
	isCompleted: boolean;
	isOptional?: boolean;
	onClick?: () => void;
	orientation?: "horizontal" | "vertical";
}

export const StepIndicator = ({
	stepNumber,
	label,
	shortLabel,
	isActive,
	isCompleted,
	isOptional,
	onClick,
	orientation = "horizontal",
}: StepIndicatorProps) => {
	const isClickable = onClick !== undefined;
	const isHorizontal = orientation === "horizontal";
	const isAccessible = isActive || isCompleted || isClickable;

	return (
		<div
			className={cn(
				"flex items-center gap-2 transition-all duration-300",
				isHorizontal ? "flex-row" : "flex-col sm:flex-row",
				isClickable && "cursor-pointer hover:-translate-y-0.5",
				!isClickable && !isAccessible && "cursor-not-allowed opacity-60",
			)}
		>
			{/* Circle with number/checkmark */}
			<div className="relative">
				{/* White background circle */}
				<div className="absolute inset-0 w-12 h-12 bg-white dark:bg-gray-900 rounded-full z-0 -m-1" />
				
				<button
					type="button"
					onClick={onClick}
					disabled={!isClickable}
					className={cn(
						"relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-4 font-semibold shadow-lg",
						// Only transition properties that are NOT being animated by keyframes
						!isActive && "transition-[border-color,background-color,color,box-shadow,transform] duration-300",
						"focus:outline-none focus:ring-4 focus:ring-offset-2",
						// Active step - blue with custom slow pulse (NO transition on this element)
						isActive && "border-blue-500 bg-blue-500 text-white focus:ring-blue-300 step-pulse",
						// Completed step - emerald/green
						isCompleted &&
							!isActive &&
							"border-emerald-500 bg-emerald-500 text-white",
						// Inaccessible/future step - gray
						!isAccessible &&
							"border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500",
						// Clickable completed steps
						isClickable && isCompleted &&
							"hover:border-emerald-400 hover:bg-emerald-400",
					)}
					aria-current={isActive ? "step" : undefined}
					aria-label={`Step ${stepNumber}: ${label}${isOptional ? " (optional)" : ""}`}
					aria-disabled={!isAccessible}
				>
					{isCompleted && !isActive ? (
						<Check className="h-6 w-6 animate-in zoom-in-50 duration-300" />
					) : (
						<span className="text-sm font-bold">{stepNumber}</span>
					)}
				</button>
			</div>

			{/* Label */}
			<div
				className={cn(
					"flex flex-col",
					isHorizontal ? "hidden sm:flex" : "flex",
				)}
			>
				<span
					className={cn(
						"text-sm font-semibold transition-colors duration-300",
						isActive && "text-blue-600 dark:text-blue-400",
						isCompleted && !isActive && "text-emerald-600 dark:text-emerald-400",
						!isAccessible && "text-gray-400 dark:text-gray-500",
					)}
				>
					<span className="hidden md:inline">{label}</span>
					<span className="md:hidden">{shortLabel || label}</span>
				</span>
				{isOptional && (
					<span className="text-xs text-muted-foreground">(Optional)</span>
				)}
				{/* Status indicator */}
				<span className="text-xs text-gray-500 mt-0.5">
					{isCompleted && !isActive ? "✓ Done" : isActive ? "Active" : "Pending"}
				</span>
			</div>
		</div>
	);
};
