import { observer } from "mobx-react-lite";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
import { GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import type { IAffiliation } from "@/shared/types/org.types";
import { FieldError } from "../FieldError";
import { shouldShowError } from "../validation-helpers";

/**
 * StudentDetailsStep - Step 4 of project creation wizard (conditional)
 *
 * Only shown when project kind is "student"
 *
 * Collects:
 * - Organisation (required, affiliation multi-select — matches edit form)
 * - Level (required, dropdown)
 */
const StudentDetailsStep = observer(() => {
	const wizardStore = useProjectWizardStore();
	const formData = wizardStore.state.editingFormData.studentDetails;
	const validation = wizardStore.state.validation[3]; // Step 3 is Student Details
	const stepIndex = 3;
	const [selectedAffiliations, setSelectedAffiliations] = useState<
		IAffiliation[]
	>([]);

	// If student details is null, initialise it
	if (!formData) {
		wizardStore.setStudentDetails({
			organisation: "",
			level: "",
		});
		return null;
	}

	// Parse organisation string into affiliations array on mount
	useEffect(() => {
		const organisationStr = formData?.organisation || "";
		if (organisationStr && selectedAffiliations.length === 0) {
			const names = organisationStr.split("; ").filter((n) => n.trim());
			const affiliations = names.map((name, index) => ({
				id: -index - 1,
				name: name.trim(),
			})) as IAffiliation[];
			setSelectedAffiliations(affiliations);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAffiliationsChange = (affiliations: IAffiliation[]) => {
		setSelectedAffiliations(affiliations);
		const organisationString = affiliations.map((a) => a.name).join("; ");
		wizardStore.setStudentDetails({ organisation: organisationString });
	};

	// Validate on every form data change
	useEffect(() => {
		if (!formData) return;

		const errors: Record<string, string> = {};

		if (!formData.organisation || formData.organisation.trim() === "") {
			errors.organisation = "Organisation is required";
		}
		if (!formData.level || formData.level.trim() === "") {
			errors.level = "Student level is required";
		}

		const isValid = Object.keys(errors).length === 0;
		wizardStore.setStepValidation(3, isValid, errors);
	}, [formData?.organisation, formData?.level, wizardStore, formData]);

	const handleLevelChange = (value: string) => {
		wizardStore.setStudentDetails({ level: value });
	};

	// Level options matching the edit form
	const levelOptions = [
		{ value: "phd", label: "PhD" },
		{ value: "msc", label: "MSc" },
		{ value: "honours", label: "BSc Honours" },
		{ value: "fourth_year", label: "Fourth Year" },
		{ value: "third_year", label: "Third Year" },
		{ value: "undergrad", label: "Undergraduate" },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">Student Project Details</h3>
				<p className="text-sm text-muted-foreground">
					Provide information about the student and their academic institution
					for this project.
				</p>
			</div>

			{/* Organisation — multi-select matching edit form */}
			<div className="space-y-2">
				<AffiliationCombobox
					multiple
					values={selectedAffiliations}
					onChangeMultiple={handleAffiliationsChange}
					label="Organisation"
					placeholder="Search for or add an organisation"
					helperText="The academic organisation of the student"
					isRequired={true}
					showIcon={true}
				/>
				<FieldError
					error={
						shouldShowError(wizardStore, "organisation", stepIndex)
							? validation?.errors.organisation
							: undefined
					}
				/>
			</div>

			{/* Level */}
			<div className="space-y-2">
				<Label htmlFor="level">
					Level <span className="text-destructive">*</span>
				</Label>
				<div className="relative">
					<GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
					<Select value={formData.level} onValueChange={handleLevelChange}>
						<SelectTrigger id="level" className="pl-10 text-base">
							<SelectValue placeholder="Select a level" />
						</SelectTrigger>
						<SelectContent>
							{levelOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<FieldError
					error={
						shouldShowError(wizardStore, "level", stepIndex)
							? validation?.errors.level
							: undefined
					}
				/>
				<p className="text-xs text-muted-foreground">
					The level of the student and the project
				</p>
			</div>

			{/* Info Box */}
			<div className="rounded-lg border bg-muted/50 p-4">
				<div className="flex gap-3">
					<div className="flex-shrink-0">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
							<GraduationCap className="h-4 w-4 text-primary" />
						</div>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium">Student Project</p>
						<p className="text-xs text-muted-foreground">
							This information will be used to document the academic context and
							institutional affiliation for this student project.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
});

export { StudentDetailsStep };
