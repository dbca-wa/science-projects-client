import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useCreateProjectWizardStore } from "@/app/stores/store-context";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
import { validateStep4Student } from "../validation/step4-student.validation";
import type { IAffiliation } from "@/shared/types/org.types";

// Student level options
const STUDENT_LEVELS = [
	{ value: "phd", label: "PhD" },
	{ value: "msc", label: "MSc" },
	{ value: "bsc_honours", label: "BSc Honours" },
	{ value: "fourth_year", label: "Fourth Year" },
	{ value: "third_year", label: "Third Year" },
	{ value: "undergraduate", label: "Undergraduate" },
] as const;

/**
 * Step4StudentDetails - Student project details
 *
 * Features:
 * - Organisation (required, multiple)
 * - Level (required)
 * - Field-level validation
 * - Inline error messages
 * - Debounced preview updates
 */
export const Step4StudentDetails = observer(() => {
	const store = useCreateProjectWizardStore();
	const { formData, validation } = store.state;
	const stepValidation = validation[3]; // Step 4 is index 3

	// Track if user has manually changed organisation
	const hasManuallyChangedRef = useRef(false);

	// Validate on mount and when data changes
	useEffect(() => {
		const { isValid, errors } = validateStep4Student(formData);
		store.setStepValidation(3, isValid, errors);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [formData.organisation, formData.level, store]);

	const handleOrganisationChange = (affiliations: IAffiliation[]) => {
		hasManuallyChangedRef.current = true;
		// Convert affiliations to comma-separated string of names
		const organisationString = affiliations.map((a) => a.name).join(", ");
		store.setStudentDetails({ organisation: organisationString });
	};

	const handleLevelChange = (value: string) => {
		store.setStudentDetails({ level: value });
	};

	// Parse organisation string back to affiliations for display
	const selectedAffiliations: IAffiliation[] = formData.organisation
		? formData.organisation.split(", ").map((name, index) => ({
				id: index, // Temporary ID for display
				name,
				organisation_type: "external",
			}))
		: [];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-semibold mb-2">Student Project Details</h2>
				<p className="text-muted-foreground">
					Provide information about the student and their organisation.
				</p>
			</div>

			{/* Organisation */}
			<div className="space-y-2">
				<AffiliationCombobox
					multiple
					values={selectedAffiliations}
					onChangeMultiple={handleOrganisationChange}
					label="Organisation"
					placeholder="Search for organisations..."
					helperText="Select one or more organisations"
					isRequired
				/>
				{stepValidation?.errors.organisation && (
					<p className="text-sm text-destructive">
						{stepValidation.errors.organisation}
					</p>
				)}
			</div>

			{/* Level */}
			<div className="space-y-2">
				<Label htmlFor="level">
					Level <span className="text-destructive">*</span>
				</Label>
				<Select value={formData.level || ""} onValueChange={handleLevelChange}>
					<SelectTrigger id="level">
						<SelectValue placeholder="Select student level..." />
					</SelectTrigger>
					<SelectContent>
						{STUDENT_LEVELS.map((level) => (
							<SelectItem key={level.value} value={level.value}>
								{level.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{stepValidation?.errors.level && (
					<p className="text-sm text-destructive">
						{stepValidation.errors.level}
					</p>
				)}
			</div>
		</div>
	);
});

Step4StudentDetails.displayName = "Step4StudentDetails";
