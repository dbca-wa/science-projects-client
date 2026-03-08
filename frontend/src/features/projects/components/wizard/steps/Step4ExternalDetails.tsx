import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useCreateProjectWizardStore } from "@/app/stores/store-context";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
import { FormRichTextEditor } from "@/shared/components/editor/FormRichTextEditor";
import { validateStep4External } from "../validation/step4-external.validation";
import type { IAffiliation } from "@/shared/types/org.types";

/**
 * Step4ExternalDetails - External partnership project details
 *
 * Features:
 * - Collaboration partners (required, multiple)
 * - Budget (optional)
 * - External description (optional)
 * - Aims (optional)
 * - Field-level validation
 * - Inline error messages
 * - Debounced preview updates
 */
export const Step4ExternalDetails = observer(() => {
	const store = useCreateProjectWizardStore();
	const { formData, validation } = store.state;
	const stepValidation = validation[3]; // Step 4 is index 3

	// Track if user has manually changed collaboration partners
	const hasManuallyChangedRef = useRef(false);

	// Validate on mount and when data changes
	useEffect(() => {
		const { isValid, errors } = validateStep4External(formData);
		store.setStepValidation(3, isValid, errors);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		formData.collaboration_with,
		formData.budget,
		formData.external_description,
		formData.aims,
		store,
	]);

	const handleCollaborationChange = (affiliations: IAffiliation[]) => {
		hasManuallyChangedRef.current = true;
		// Convert affiliations to comma-separated string of names
		const collaborationString = affiliations.map((a) => a.name).join(", ");
		store.setExternalDetails({ collaboration_with: collaborationString });
	};

	const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		store.setExternalDetails({ budget: e.target.value });
	};

	const handleExternalDescriptionChange = (value: string) => {
		store.setExternalDetails({ external_description: value });
	};

	const handleAimsChange = (value: string) => {
		store.setExternalDetails({ aims: value });
	};

	// Parse collaboration_with string back to affiliations for display
	const selectedAffiliations: IAffiliation[] = formData.collaboration_with
		? formData.collaboration_with.split(", ").map((name, index) => ({
				id: index, // Temporary ID for display
				name,
				organisation_type: "external",
			}))
		: [];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">
					External Partnership Details
				</h2>
				<p className="text-muted-foreground">
					Provide information about external partnerships and collaborations.
				</p>
			</div>

			{/* Collaboration Partners */}
			<div className="space-y-2">
				<AffiliationCombobox
					multiple
					values={selectedAffiliations}
					onChangeMultiple={handleCollaborationChange}
					label="Collaboration Partners"
					placeholder="Search for organisations..."
					helperText="Select one or more external organisations"
					isRequired
				/>
				{stepValidation?.errors.collaboration_with && (
					<p className="text-sm text-destructive">
						{stepValidation.errors.collaboration_with}
					</p>
				)}
			</div>

			{/* Budget */}
			<div className="space-y-2">
				<Label htmlFor="budget">Budget</Label>
				<Input
					id="budget"
					type="text"
					value={formData.budget || ""}
					onChange={handleBudgetChange}
					placeholder="e.g., $50,000 AUD"
				/>
				<p className="text-sm text-muted-foreground">
					Optional: Enter the project budget
				</p>
			</div>

			{/* External Description */}
			<div className="space-y-2">
				<Label htmlFor="external-description">External Description</Label>
				<FormRichTextEditor
					value={formData.external_description || ""}
					onChange={handleExternalDescriptionChange}
					placeholder="Describe the external partnership..."
					toolbar="projectDescription"
					minHeight="150px"
				/>
				<p className="text-sm text-muted-foreground">
					Optional: Provide additional details about the external partnership
				</p>
			</div>

			{/* Aims */}
			<div className="space-y-2">
				<Label htmlFor="aims">Aims</Label>
				<FormRichTextEditor
					value={formData.aims || ""}
					onChange={handleAimsChange}
					placeholder="Describe the project aims..."
					toolbar="projectDescription"
					minHeight="150px"
				/>
				<p className="text-sm text-muted-foreground">
					Optional: Describe the aims and objectives of the project
				</p>
			</div>
		</div>
	);
});

Step4ExternalDetails.displayName = "Step4ExternalDetails";
