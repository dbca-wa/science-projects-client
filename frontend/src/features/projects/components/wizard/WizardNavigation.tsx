import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface WizardNavigationProps {
	onBack: () => void;
	onNext: () => void;
	onCancel: () => void;
	canGoBack: boolean;
	canGoNext: boolean;
	isLastStep: boolean;
	isSubmitting?: boolean;
	primaryColor?: string;
}

/**
 * WizardNavigation - Navigation buttons for wizard
 * 
 * Features:
 * - Back, Cancel, and Continue/Create buttons
 * - Disabled states based on validation
 * - Loading state for submission
 * - Mobile responsive layout
 * - Custom color support
 */
export function WizardNavigation({
	onBack,
	onNext,
	onCancel,
	canGoBack,
	canGoNext,
	isLastStep,
	isSubmitting = false,
	primaryColor,
}: WizardNavigationProps) {
	return (
		<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
			<Button
				variant="ghost"
				onClick={onCancel}
				size="lg"
				className="w-full sm:w-auto order-2 sm:order-1"
				disabled={isSubmitting}
			>
				Cancel
			</Button>

			<div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
				<Button
					variant="outline"
					onClick={onBack}
					disabled={!canGoBack || isSubmitting}
					size="lg"
					className="flex-1 sm:flex-initial"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					<span className="hidden sm:inline">Back</span>
				</Button>
				<Button
					onClick={onNext}
					disabled={!canGoNext || isSubmitting}
					size="lg"
					style={primaryColor ? { backgroundColor: primaryColor } : undefined}
					className="text-white hover:opacity-90 flex-1 sm:flex-initial"
				>
					{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					<span className="hidden sm:inline">
						{isLastStep ? "Create Project" : "Continue"}
					</span>
					<span className="sm:hidden">
						{isLastStep ? "Create" : "Next"}
					</span>
					{!isLastStep && !isSubmitting && <span className="ml-2">→</span>}
				</Button>
			</div>
		</div>
	);
}
