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
export function WizardStepper({
	currentStep,
	totalSteps,
	completedSteps,
	projectKind,
	onStepClick,
}: WizardStepperProps) {
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
		// Current step is not clickable
		if (index === currentStep) return false;
		// Completed steps are clickable
		if (completedSteps.has(index)) return true;
		// Previous steps are clickable
		if (index < currentStep) return true;
		// Future steps are not clickable
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
			{/* Desktop: Horizontal stepper */}
			<div className="hidden md:flex w-full items-center justify-between">
				{steps.map((step, index) => {
					const isCompleted = completedSteps.has(index);
					const isActive = index === currentStep;
					const isFuture = index > currentStep;
					const isClickable = isStepClickable(index);

					return (
						<>
							{/* Step indicator */}
							<div
								key={step.id}
								className="flex flex-col items-center flex-shrink-0"
							>
								{/* Circle with number/checkmark */}
								<button
									type="button"
									onClick={() => handleStepClick(index)}
									disabled={!isClickable}
									className={cn(
										"relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full",
										isClickable && "cursor-pointer",
										!isClickable && "cursor-default"
									)}
									aria-label={`${isClickable ? "Go to" : ""} Step ${index + 1}: ${step.label}`}
								>
									{/* White background circle */}
									<div className="absolute inset-0 w-12 h-12 bg-white dark:bg-gray-900 rounded-full z-0 -m-1" />

									<div
										className={cn(
											"relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-4 font-semibold shadow-lg",
											// Only transition properties that are NOT being animated by keyframes
											!isActive &&
												"transition-[border-color,background-color,color,box-shadow] duration-300",
											// Active step - blue with custom slow pulse
											isActive &&
												"border-blue-500 bg-blue-500 text-white step-pulse",
											// Completed step - emerald/green
											isCompleted &&
												!isActive &&
												"border-emerald-500 bg-emerald-500 text-white",
											// Future step - gray
											isFuture &&
												"border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500",
											// Hover effect for clickable steps
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
											isFuture && "text-gray-400 dark:text-gray-500"
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
												: "Pending"}
									</div>
								</div>
							</div>

							{/* Connector line */}
							{index < steps.length - 1 && (
								<div
									key={`connector-${index}`}
									className={cn(
										"h-0.5 flex-1 min-w-[40px] transition-colors duration-300",
										isCompleted ? "bg-emerald-500" : "bg-gray-300"
									)}
									aria-hidden="true"
								/>
							)}
						</>
					);
				})}
			</div>

			{/* Mobile: Vertical stepper */}
			<div className="md:hidden">
				<div className="space-y-4">
					{steps.map((step, index) => {
						const isCompleted = completedSteps.has(index);
						const isActive = index === currentStep;
						const isFuture = index > currentStep;
						const isClickable = isStepClickable(index);

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
											!isClickable && "cursor-default"
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
												isFuture &&
													"border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500",
												// Hover effect for clickable steps
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
											isFuture && "text-gray-400 dark:text-gray-500"
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
}
