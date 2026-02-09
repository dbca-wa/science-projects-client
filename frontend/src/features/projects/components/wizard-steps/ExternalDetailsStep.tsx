import { observer } from "mobx-react-lite";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Building2, DollarSign, Target, FileText, AlertCircle } from "lucide-react";
import { AffiliationCombobox } from "@/shared/components/AffiliationCombobox";
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
 * ExternalDetailsStep - Step 4 of project creation wizard (conditional)
 * 
 * Only shown when project kind is "external"
 * 
 * Collects:
 * - Collaboration with (required, affiliation multi-select)
 * - Budget (optional, text)
 * - External description (optional, rich text)
 * - Aims (optional, rich text)
 */
const ExternalDetailsStep = observer(() => {
	const wizardStore = useProjectWizardStore();
	const formData = wizardStore.state.formData.externalDetails;
	const validation = wizardStore.state.validation[3]; // Step 3 is External Details
	const [selectedAffiliations, setSelectedAffiliations] = useState<IAffiliation[]>([]);

	// If external details is null, initialize it
	if (!formData) {
		wizardStore.setExternalDetails({
			collaboration_with: "",
			budget: "",
			external_description: "",
			aims: "",
		});
		return null;
	}

	// Parse collaboration_with string into affiliations array on mount
	useEffect(() => {
		const collaborationWith = formData?.collaboration_with || "";
		if (collaborationWith && selectedAffiliations.length === 0) {
			const names = collaborationWith.split("; ").filter(n => n.trim());
			// For now, just store as objects with names
			// In a real implementation, we'd fetch the full affiliation objects
			const affiliations = names.map((name, index) => ({
				id: -index - 1, // Temporary negative IDs
				name: name.trim(),
			})) as IAffiliation[];
			setSelectedAffiliations(affiliations);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleAffiliationsChange = (affiliations: IAffiliation[]) => {
		setSelectedAffiliations(affiliations);
		
		// Update store with semicolon-separated string
		const collaborationString = affiliations.map(a => a.name).join("; ");
		wizardStore.setExternalDetails({ collaboration_with: collaborationString });
	};

	const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		wizardStore.setExternalDetails({ budget: e.target.value });
	};

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		wizardStore.setExternalDetails({ external_description: e.target.value });
	};

	const handleAimsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		wizardStore.setExternalDetails({ aims: e.target.value });
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h3 className="text-lg font-semibold">External Partnership Details</h3>
				<p className="text-sm text-muted-foreground">
					Provide information about the external organizations and partnership details for this project.
				</p>
			</div>

			{/* Collaboration With */}
			<div className="space-y-2">
				<AffiliationCombobox
					multiple
					values={selectedAffiliations}
					onChangeMultiple={handleAffiliationsChange}
					label="Collaboration With"
					placeholder="Search for or add a collaboration partner"
					helperText="The entity/s this project is in collaboration with"
					isRequired={true}
					showIcon={true}
				/>
				<FieldError error={validation?.errors.collaboration_with} />
			</div>

			{/* Budget */}
			<div className="space-y-2">
				<Label htmlFor="budget">Budget (Optional)</Label>
				<div className="relative">
					<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						id="budget"
						value={formData.budget}
						onChange={handleBudgetChange}
						placeholder="The estimated operating budget in dollars..."
						className="pl-9 text-base"
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					The estimated budget for the project in dollars
				</p>
			</div>

			{/* External Description */}
			<div className="space-y-2">
				<Label htmlFor="external_description">
					Description (Optional)
				</Label>
				<div className="relative">
					<FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Textarea
						id="external_description"
						value={formData.external_description}
						onChange={handleDescriptionChange}
						placeholder="Description specific to this external project..."
						rows={6}
						className="pl-9 text-base resize-none"
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					Description specific to this external project
				</p>
			</div>

			{/* Aims */}
			<div className="space-y-2">
				<Label htmlFor="aims">
					Aims (Optional)
				</Label>
				<div className="relative">
					<Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Textarea
						id="aims"
						value={formData.aims}
						onChange={handleAimsChange}
						placeholder="List out the aims of your project..."
						rows={6}
						className="pl-9 text-base resize-none"
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					List out the aims of your project
				</p>
			</div>

			{/* Info Box */}
			<div className="rounded-lg border bg-muted/50 p-4">
				<div className="flex gap-3">
					<div className="flex-shrink-0">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
							<Building2 className="h-4 w-4 text-primary" />
						</div>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium">External Partnership Project</p>
						<p className="text-xs text-muted-foreground">
							This information will be used to establish the partnership relationship and document the collaboration details throughout the project lifecycle.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
});

export { ExternalDetailsStep };
