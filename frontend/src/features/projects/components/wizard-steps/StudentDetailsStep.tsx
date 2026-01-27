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
import { GraduationCap, AlertCircle } from "lucide-react";
import type { IAffiliation } from "@/shared/types/org.types";
import { useState, useEffect } from "react";

/**
 * FieldError - Display validation error for a field
 */
const FieldError = ({ error }: { error?: string }) => {
	if (!error) return null;
	return (
		<div className="flex items-center gap-1 text-xs text-destructive mt-1">
			<AlertCircle className="h-3 w-3" />
			<span>{error}</span>
		</div>
	);
};

/**
 * StudentDetailsStep - Step 4 of project creation wizard (conditional)
 * 
 * Only shown when project kind is "student"
 * 
 * Collects:
 * - Organisation (required, affiliation single-select)
 * - Level (required, dropdown)
 */
const StudentDetailsStep = observer(() => {
	const wizardStore = useProjectWizardStore();
	const formData = wizardStore.state.formData.studentDetails;
	const validation = wizardStore.state.validation[3]; // Step 3 is Student Details
	const [selectedAffiliation, setSelectedAffiliation] = useState<IAffiliation | null>(null);

	// If student details is null, initialize it
	if (!formData) {
		wizardStore.setStudentDetails({
			organisation: "",
			level: "",
		});
		return null;
	}

	// Parse organisation string into affiliation on mount
	useEffect(() => {
		const organisation = formData?.organisation || "";
		if (organisation && !selectedAffiliation) {
			// For now, just store as object with name
			// In a real implementation, we'd fetch the full affiliation object
			const affiliation = {
				id: -1, // Temporary negative ID
				name: organisation.trim(),
			} as IAffiliation;
			setSelectedAffiliation(affiliation);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAffiliationChange = (affiliationId?: number) => {
		if (!affiliationId) {
			setSelectedAffiliation(null);
			wizardStore.setStudentDetails({ organisation: "" });
		}
		// The affiliation will be set when the component loads it
	};

	const handleLevelChange = (value: string) => {
		wizardStore.setStudentDetails({ level: value });
	};

	// Level options from the original implementation
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
					Provide information about the student and their academic institution for this project.
				</p>
			</div>

			{/* Organisation */}
			<div className="space-y-2">
				<AffiliationCombobox
					value={selectedAffiliation?.id}
					onChange={handleAffiliationChange}
					label="Organisation"
					placeholder="Enter the academic organisation..."
					helperText="The academic organisation of the student"
					isRequired={true}
					showIcon={true}
				/>
				<FieldError error={validation?.errors.organisation} />
			</div>

			{/* Level */}
			<div className="space-y-2">
				<Label htmlFor="level">
					Level <span className="text-destructive">*</span>
				</Label>
				<div className="relative">
					<GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
					<Select
						value={formData.level}
						onValueChange={handleLevelChange}
					>
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
				<FieldError error={validation?.errors.level} />
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
							This information will be used to document the academic context and institutional affiliation for this student project.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
});

export { StudentDetailsStep };
