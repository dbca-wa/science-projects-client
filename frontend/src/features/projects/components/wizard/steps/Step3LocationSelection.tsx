import { observer } from "mobx-react-lite";
import { useCreateProjectWizardStore } from "@/app/stores/store-context";
import { MapAreaSelector } from "../map/MapAreaSelector";
import { AreaListFallback } from "../map/AreaListFallback";
import { Label } from "@/shared/components/ui/label";

/**
 * Step3LocationSelection component
 *
 * Step 3 of the project creation wizard - Location selection.
 * Features:
 * - Interactive map for visual area selection
 * - List-based fallback for accessibility and as secondary interface
 * - Validation for at least 1 area selected
 * - Syncs selection between map and list
 */
export const Step3LocationSelection = observer(() => {
	const store = useCreateProjectWizardStore();

	// Handle area selection change
	const handleAreasChange = (areas: number[]) => {
		store.setLocation({ project_areas: areas });

		// Validate: at least 1 area required
		const isValid = areas.length > 0;
		const errors: Record<string, string> = isValid
			? {}
			: { project_areas: "At least one project area is required" };

		store.setStepValidation(2, isValid, errors); // Step 3 is index 2
	};

	const selectedAreas = store.state.formData.project_areas;
	const validationError = store.state.validation[2]?.errors?.project_areas;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h2 className="text-2xl font-semibold">Location Selection</h2>
				<p className="text-muted-foreground">
					Select the geographic areas where this project will take place. You
					can click areas on the map or use the list below.
				</p>
			</div>

			{/* Map selector */}
			<div className="space-y-2">
				<Label htmlFor="map-selector">
					Project Areas <span className="text-red-500">*</span>
				</Label>
				<div id="map-selector">
					<MapAreaSelector
						selectedAreas={selectedAreas}
						onAreasChange={handleAreasChange}
					/>
				</div>
				{validationError && (
					<p className="text-sm text-red-500">{validationError}</p>
				)}
			</div>

			{/* List fallback */}
			<div className="space-y-2">
				<Label>Area List</Label>
				<p className="text-sm text-muted-foreground">
					You can also select areas from the list below. Selected areas will be
					highlighted on the map.
				</p>
				<AreaListFallback
					selectedAreas={selectedAreas}
					onAreasChange={handleAreasChange}
				/>
			</div>
		</div>
	);
});

Step3LocationSelection.displayName = "Step3LocationSelection";
