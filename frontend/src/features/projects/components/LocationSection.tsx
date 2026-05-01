import type { ISimpleLocationData } from "@/shared/types/org.types";

interface LocationSectionProps {
	title: string;
	/** Filtered locations to display (may be a subset when searching) */
	locations: ISimpleLocationData[];
	/** Currently selected area IDs across ALL area types */
	selectedAreas: number[];
	/** ALL locations in this section (unfiltered) — used for "All" toggle logic */
	allLocationsInSection: ISimpleLocationData[];
	/** Callback to set the full areas array atomically */
	onAreasChange: (areas: number[]) => void;
}

/**
 * LocationSection — Reusable location checkbox list for a single area type.
 *
 * Supports "All DBCA Districts" / "All DBCA Regions" entries from the database:
 * - When "All" is selected, individual entries are disabled and removed from selection
 * - When an individual entry is selected, "All" is deselected
 * - Selections from other area types are preserved
 *
 * Used by both the wizard LocationStep and the edit project form.
 */
export const LocationSection = ({
	title,
	locations,
	selectedAreas,
	allLocationsInSection,
	onAreasChange,
}: LocationSectionProps) => {
	// Find the "All" entry for this area type (e.g. "All DBCA Regions")
	const allEntry = allLocationsInSection.find((loc) =>
		loc.name.toLowerCase().startsWith("all ")
	);
	const currentAreaIds = new Set(allLocationsInSection.map((loc) => loc.id));
	const isAllSelected = allEntry ? selectedAreas.includes(allEntry.id) : false;

	const handleLocationClick = (location: ISimpleLocationData) => {
		const isAllCheckbox = location.name.toLowerCase().startsWith("all ");

		// Selections from OTHER area types (not this one)
		const otherAreaSelections = selectedAreas.filter(
			(id) => !currentAreaIds.has(id)
		);

		if (isAllCheckbox) {
			if (selectedAreas.includes(location.id)) {
				// Deselect "All" — remove it, keep other area types
				onAreasChange(otherAreaSelections);
			} else {
				// Select "All" — clear all individual entries, add only "All"
				onAreasChange([...otherAreaSelections, location.id]);
			}
		} else {
			if (selectedAreas.includes(location.id)) {
				// Deselect a regular entry
				onAreasChange(selectedAreas.filter((id) => id !== location.id));
			} else {
				// Select a regular entry — if "All" was selected, remove it first
				if (isAllSelected && allEntry) {
					onAreasChange([...otherAreaSelections, location.id]);
				} else {
					onAreasChange([...selectedAreas, location.id]);
				}
			}
		}
	};

	return (
		<div>
			<div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm px-4 py-2 border-b">
				<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					{title}
				</span>
			</div>
			<div className="divide-y">
				{locations.map((location) => {
					const isSelected = selectedAreas.includes(location.id);
					const isAllCheckbox = location.name.toLowerCase().startsWith("all ");
					const isDisabled = isAllSelected && !isAllCheckbox;

					return (
						<button
							key={location.id}
							type="button"
							onClick={() => !isDisabled && handleLocationClick(location)}
							disabled={isDisabled}
							className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
								isSelected ? "bg-primary/5" : ""
							} ${isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-muted/50"}`}
						>
							<div
								className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
									isSelected
										? "bg-primary border-primary"
										: "border-muted-foreground/30"
								}`}
							>
								{isSelected && (
									<svg
										className="w-3 h-3 text-primary-foreground"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path d="M5 13l4 4L19 7" />
									</svg>
								)}
							</div>
							<div
								className={`text-sm truncate ${isAllCheckbox ? "font-semibold" : "font-medium"}`}
							>
								{location.name}
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
};
