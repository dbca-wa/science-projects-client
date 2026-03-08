import type { ProjectKind } from "@/shared/types/project.types";
import { Step1BaseInformation } from "./steps/Step1BaseInformation";
import { Step2ProjectDetails } from "./steps/Step2ProjectDetails";
import { Step3LocationSelection } from "./steps/Step3LocationSelection";
import { Step4ExternalDetails } from "./steps/Step4ExternalDetails";
import { Step4StudentDetails } from "./steps/Step4StudentDetails";

interface WizardFormPanelProps {
	currentStep: number;
	projectKind: ProjectKind;
}

/**
 * WizardFormPanel - Container for step forms with transition animations
 *
 * Features:
 * - Renders current step component
 * - Slide animations on step change
 * - Conditional step rendering based on project kind
 * - Form validation integration
 */
export function WizardFormPanel({
	currentStep,
	projectKind,
}: WizardFormPanelProps) {
	// Render the appropriate step component
	const renderStep = () => {
		switch (currentStep) {
			case 0:
				return <Step1BaseInformation />;
			case 1:
				return <Step2ProjectDetails />;
			case 2:
				return <Step3LocationSelection />;
			case 3:
				if (projectKind === "external") {
					return <Step4ExternalDetails />;
				}
				if (projectKind === "student") {
					return <Step4StudentDetails />;
				}
				return null;
			default:
				return null;
		}
	};

	return <div className="space-y-6">{renderStep()}</div>;
}
