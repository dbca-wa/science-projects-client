import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ProjectKind } from "@/shared/types/project.types";

interface WizardStepperProps {
	currentStep: number;
	totalSteps: number;
	completedSteps: Set<number>;
	projectKind: ProjectKind;
	onStepClick?: (stepIndex: number) => void;
}

interface StepConfig {
	id: string;
	label: string;
	description: string;
	isConditional?: boolean;
}

/**
 * WizardStepper - Visual progress indicator for the wizard
 *
 * Features:
 * - Horizontal stepper on desktop (≥768px)
 * - Vertical stepper on mobile (<768px)
 * - Pulsing animation on active step
 * - Checkmark icon for completed steps
 * - Step descriptions
 * - ARIA labels and screen reader support
 * - Conditional steps based on project kind
 */
export const WizardStepper = ({
	currentStep,
	totalSteps,
	completedSteps,
	projectKind,
	onStepClick,
}: WizardStepperProps) => {
	// Define step configurations with descriptions
	const baseSteps: StepConfig[] = [
		{
			id: "base-info",
			label: "Base Information",
			description: "Title, description, keywords",
		},
		{
			id: "project-details",
			label: "Project Details",
			description: "Timeline, team, business area",
		},
		{
			id: "location",
			label: "Location",
			description: "Project areas",
		},
	];

	// Add conditional step based on project kind
	const steps: StepConfig[] = [...baseSteps];
	if (projectKind === "external") {
		steps.push({
			id: "external-details",
			label: "External Details",
			description: "Partnerships, budget",
			isConditional: true,
		});
	} else if (projectKind === "student") {
		steps.push({
			id: "student-details",
			label: "Student Details",
			description: "Organisation, level",
			isConditional: true,
		});
	}

	// Determine if a step is clickable
	const isStepClickable = (index: number): boolean => {
		// Current step is not clickable (already on it)
		if (index === currentStep) return false;
		// Completed steps are always clickable
		if (completedSteps.has(index)) return true;
		// Previous steps are clickable (navigate back)
		if (index < currentStep) return true;
		// Next step is clickable if the previous step is completed
		if (index === currentStep + 1 && completedSteps.has(currentStep))
			return true;
		// Any step is clickable if all steps before it are completed
		if (index > currentStep) {
			for (let i = 0; i < index; i++) {
				if (!completedSteps.has(i)) return false;
			}
			return true;
		}
		return false;
	};

	// Determine if a step is "in progress" (visited/accessible but not completed)
	// A step is in progress if:
	// - It's not the current step
	// - It's not completed
	// - It's clickable (user has been there or can go there because previous step is done)
	const isStepInProgress = (index: number): boolean => {
		if (completedSteps.has(index)) return false;
		if (index === currentStep) return false;
		// If the step is before the current step, user has been there
		if (index < currentStep) return true;
		// If the step is after current but the previous step is completed,
		// the user has likely visited it (or it's the natural next step)
		if (index > currentStep && completedSteps.has(index - 1)) return true;
		return false;
	};

	// Handle step click
	const handleStepClick = (index: number) => {
		if (isStepClickable(index) && onStepClick) {
			onStepClick(index);
		}
	};

	return (
		<div className="w-full">
			{/* Desktop: Horizontal stepper — CSS Grid for mathematically equal spacing */}
			<div
				className="hidden md:grid w-full items-start"
				style={{
					gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
				}}
			>
				{steps.map((step, index) => {
					const isCompleted = completedSteps.has(index);
					const isActive = index === currentStep;
					const isFuture =
						index > currentStep &&
						!completedSteps.has(index) &&
						!isStepInProgress(index);
					const isInProgress = isStepInProgress(index);
					const isClickable = isStepClickable(index);
					const isLastStep = index === steps.length - 1;
					const isPending = isFuture && !isClickable;

					return (
						<div key={step.id} className="relative flex flex-col items-center">
							{/* Connector line — spans from right edge of this circle to left edge of next circle */}
							{!isLastStep && (
								<div
									className={cn(
										"absolute h-0.5 transition-colors duration-300",
										isCompleted ? "bg-emerald-500" : "bg-gray-300"
									)}
									style={{
										top: "20px",
										left: "calc(50% + 20px)",
										right: "calc(-50% + 20px)",
									}}
									aria-hidden="true"
								/>
							)}

							{/* Circle with number/checkmark */}
							<button
								type="button"
								onClick={() => handleStepClick(index)}
								disabled={!isClickable}
								className={cn(
									"relative z-10 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full",
									isClickable && "cursor-pointer",
									isPending && "cursor-not-allowed",
									!isClickable && !isPending && "cursor-default"
								)}
								aria-label={`${isClickable ? "Go to" : ""} Step ${index + 1}: ${step.label}`}
							>
								{/* White background circle — masks the connector line behind the circle */}
								<div className="absolute inset-0 w-12 h-12 bg-white dark:bg-gray-900 rounded-full z-0 -m-1" />

								<div
									className={cn(
										"relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-4 font-semibold shadow-lg",
										!isActive &&
											"transition-[border-color,background-color,color,box-shadow] duration-300",
										isActive &&
											"border-blue-500 bg-blue-500 text-white step-pulse",
										isCompleted &&
											!isActive &&
											"border-emerald-500 bg-emerald-500 text-white",
										isInProgress && "border-amber-400 bg-amber-400 text-white",
										isFuture &&
											!isInProgress &&
											"border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500",
										isClickable &&
											!isActive &&
											"hover:scale-110 hover:shadow-xl"
									)}
									aria-current={isActive ? "step" : undefined}
								>
									{isCompleted && !isActive ? (
										<Check className="h-6 w-6 animate-in zoom-in-50 duration-300" />
									) : (
										<span className="text-sm font-bold">{index + 1}</span>
									)}
								</div>
							</button>

							{/* Label and description */}
							<div className="mt-2 text-center">
								<div
									className={cn(
										"text-sm font-semibold transition-colors duration-300 whitespace-nowrap",
										isActive && "text-blue-600 dark:text-blue-400",
										isCompleted &&
											!isActive &&
											"text-emerald-600 dark:text-emerald-400",
										isInProgress && "text-amber-600 dark:text-amber-400",
										isFuture &&
											!isInProgress &&
											"text-gray-400 dark:text-gray-500"
									)}
								>
									{step.label}
								</div>
								<div className="text-xs text-muted-foreground mt-1 hidden lg:block whitespace-nowrap">
									{step.description}
								</div>
								{/* Status indicator */}
								<div className="text-xs text-gray-500 mt-0.5">
									{isCompleted && !isActive
										? "✓ Done"
										: isActive
											? "Active"
											: isInProgress
												? "In Progress"
												: "Pending"}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Mobile: Vertical stepper */}
			<div className="md:hidden">
				<div className="flex flex-col gap-4">
					{steps.map((step, index) => {
						const isCompleted = completedSteps.has(index);
						const isActive = index === currentStep;
						const isFuture =
							index > currentStep &&
							!completedSteps.has(index) &&
							!isStepInProgress(index);
						const isInProgress = isStepInProgress(index);
						const isClickable = isStepClickable(index);
						const isPending = isFuture && !isClickable;

						return (
							<div key={step.id} className="flex items-start">
								{/* Step indicator */}
								<div className="flex flex-col items-center mr-4">
									{/* Circle with number/checkmark */}
									<button
										type="button"
										onClick={() => handleStepClick(index)}
										disabled={!isClickable}
										className={cn(
											"relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full",
											isClickable && "cursor-pointer",
											isPending && "cursor-not-allowed",
											!isClickable && !isPending && "cursor-default"
										)}
										aria-label={`${isClickable ? "Go to" : ""} Step ${index + 1}: ${step.label}`}
									>
										{/* White background circle */}
										<div className="absolute inset-0 w-10 h-10 bg-white dark:bg-gray-900 rounded-full z-0 -m-1" />

										<div
											className={cn(
												"relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 font-semibold shadow-lg",
												!isActive &&
													"transition-[border-color,background-color,color,box-shadow] duration-300",
												isActive &&
													"border-blue-500 bg-blue-500 text-white step-pulse",
												isCompleted &&
													!isActive &&
													"border-emerald-500 bg-emerald-500 text-white",
												isInProgress &&
													"border-amber-400 bg-amber-400 text-white",
												isFuture &&
													!isInProgress &&
													"border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500",
												isClickable &&
													!isActive &&
													"hover:scale-110 hover:shadow-xl"
											)}
											aria-current={isActive ? "step" : undefined}
										>
											{isCompleted && !isActive ? (
												<Check className="h-4 w-4 animate-in zoom-in-50 duration-300" />
											) : (
												<span className="text-xs font-bold">{index + 1}</span>
											)}
										</div>
									</button>

									{/* Connector line */}
									{index < steps.length - 1 && (
										<div
											className={cn(
												"w-0.5 h-8 mt-2 transition-colors duration-300",
												isCompleted ? "bg-emerald-500" : "bg-gray-300"
											)}
											aria-hidden="true"
										/>
									)}
								</div>

								{/* Step content */}
								<div className="flex-1 pt-1">
									<div
										className={cn(
											"text-sm font-semibold transition-colors duration-300",
											isActive && "text-blue-600 dark:text-blue-400",
											isCompleted &&
												!isActive &&
												"text-emerald-600 dark:text-emerald-400",
											isInProgress && "text-amber-600 dark:text-amber-400",
											isFuture &&
												!isInProgress &&
												"text-gray-400 dark:text-gray-500"
										)}
									>
										{step.label}
									</div>
									<div className="text-xs text-muted-foreground mt-1">
										{step.description}
									</div>
									{/* Status indicator */}
									<div className="text-xs text-gray-500 mt-0.5">
										{isCompleted && !isActive
											? "✓ Done"
											: isActive
												? "Active"
												: isInProgress
													? "In Progress"
													: "Pending"}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Screen reader announcement for step changes */}
			<div
				className="sr-only"
				role="status"
				aria-live="polite"
				aria-atomic="true"
			>
				Step {currentStep + 1} of {totalSteps}: {steps[currentStep]?.label}
			</div>
		</div>
	);
};
