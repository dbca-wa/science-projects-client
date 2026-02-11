import { cn } from "@/shared/lib/utils";
import { StepIndicator } from "./StepIndicator";
import { StepConnector } from "./StepConnector";

export interface StepConfig {
	label: string;
	shortLabel?: string;
	description?: string;
	isOptional?: boolean;
}

export interface StepperProps {
	steps: StepConfig[];
	currentStep: number;
	completedSteps: Set<number>;
	onStepClick?: (stepIndex: number) => void;
	orientation?: "horizontal" | "vertical";
	className?: string;
}

export const Stepper = ({
	steps,
	currentStep,
	completedSteps,
	onStepClick,
	orientation = "horizontal",
	className,
}: StepperProps) => {
	const isHorizontal = orientation === "horizontal";

	return (
		<div
			className={cn(
				"flex w-full",
				isHorizontal ? "flex-row items-center" : "flex-col items-start",
				className
			)}
			role="group"
			aria-label="Progress steps"
		>
			{steps.map((step, index) => {
				const isActive = index === currentStep;
				const isCompleted = completedSteps.has(index);
				const isClickable = isCompleted && onStepClick !== undefined;

				return (
					<div
						key={index}
						className={cn(
							"flex items-center",
							isHorizontal ? "flex-1" : "w-full"
						)}
					>
						{/* Step Indicator */}
						<StepIndicator
							stepNumber={index + 1}
							label={step.label}
							shortLabel={step.shortLabel}
							isActive={isActive}
							isCompleted={isCompleted}
							isOptional={step.isOptional}
							onClick={isClickable ? () => onStepClick(index) : undefined}
							orientation={orientation}
						/>

						{/* Connector (not shown after last step) */}
						{index < steps.length - 1 && (
							<StepConnector
								isCompleted={isCompleted}
								orientation={orientation}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
};
