import type { ProjectKind } from "@/shared/types/project.types";
import { BaseInformationStep } from "./steps/BaseInformationStep";
import { ProjectDetailsStep } from "./steps/ProjectDetailsStep";
import { LocationStep } from "./steps/LocationStep";
import { ExternalDetailsStep } from "./steps/ExternalDetailsStep";
import { StudentDetailsStep } from "./steps/StudentDetailsStep";

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
				return <BaseInformationStep />;
			case 1:
				return <ProjectDetailsStep />;
			case 2:
				return <LocationStep />;
			case 3:
				if (projectKind === "external") {
					return <ExternalDetailsStep />;
				}
				if (projectKind === "student") {
					return <StudentDetailsStep />;
				}
				return null;
			default:
				return null;
		}
	};

	return <div className="space-y-6">{renderStep()}</div>;
}
