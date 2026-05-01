import { observer } from "mobx-react-lite";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { useLocations } from "@/shared/hooks/queries/useLocations";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { X, MapPin, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import type { ISimpleLocationData } from "@/shared/types/org.types";
import { FieldError } from "../FieldError";
import { shouldShowError } from "../validation-helpers";
import { LocationSection } from "../../LocationSection";

/**
 * LocationStep - Step 3 of project creation wizard
 *
 * Collects location areas (required, multi-select).
 * Displays available locations split into "DBCA Districts" and "DBCA Regions"
 * sections with a shared search bar that filters both simultaneously.
 */
const LocationStep = observer(() => {
	const wizardStore = useProjectWizardStore();
	const formData = wizardStore.state.formData.location;
	const validation = wizardStore.state.validation[2]; // Step 2 is Location
	const stepIndex = 2;
	const { locationsLoading, dbcaRegions, dbcaDistricts } = useLocations();

	// Validate on every form data change
	useEffect(() => {
		const errors: Record<string, string> = {};

		if (!formData.areas || formData.areas.length === 0) {
			errors.areas = "At least one location area is required";
		}

		const isValid = Object.keys(errors).length === 0;
		wizardStore.setStepValidation(2, isValid, errors);
	}, [formData.areas, wizardStore]);

	const [searchQuery, setSearchQuery] = useState("");

	// Add display type to locations for the selected chips
	const allLocations = useMemo(() => {
		const locations: Array<ISimpleLocationData & { displayType: string }> = [];

		dbcaRegions.forEach((loc) =>
			locations.push({ ...loc, displayType: "DBCA Region" })
		);
		dbcaDistricts.forEach((loc) =>
			locations.push({ ...loc, displayType: "DBCA District" })
		);

		return locations;
	}, [dbcaRegions, dbcaDistricts]);

	// Filter districts by search query
	const filteredDistricts = useMemo(() => {
		if (!searchQuery.trim()) return dbcaDistricts;
		const query = searchQuery.toLowerCase();
		return dbcaDistricts.filter((loc) =>
			loc.name.toLowerCase().includes(query)
		);
	}, [dbcaDistricts, searchQuery]);

	// Filter regions by search query
	const filteredRegions = useMemo(() => {
		if (!searchQuery.trim()) return dbcaRegions;
		const query = searchQuery.toLowerCase();
		return dbcaRegions.filter((loc) => loc.name.toLowerCase().includes(query));
	}, [dbcaRegions, searchQuery]);

	// Get selected location objects for display
	const selectedLocations = useMemo(() => {
		return allLocations.filter((loc) => formData.areas.includes(loc.id));
	}, [allLocations, formData.areas]);

	const handleLocationRemove = (locationId: number) => {
		wizardStore.setLocation({
			areas: formData.areas.filter((id) => id !== locationId),
		});
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const hasFilteredResults =
		filteredDistricts.length > 0 || filteredRegions.length > 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<Label className="text-base">
					Project Locations <span className="text-destructive">*</span>
				</Label>
				<FieldError
					error={
						shouldShowError(wizardStore, "areas", stepIndex)
							? validation?.errors.areas
							: undefined
					}
				/>
				<p className="text-sm text-muted-foreground">
					Select the geographic areas where this project's work occurs. You can
					select multiple locations across different area types.
				</p>
			</div>

			{/* Selected Locations */}
			{selectedLocations.length > 0 && (
				<div className="space-y-2">
					<Label className="text-sm font-medium">
						Selected Locations ({selectedLocations.length})
					</Label>
					<div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md border">
						{selectedLocations.map((location) => (
							<Badge
								key={location.id}
								variant="secondary"
								className="gap-1 pr-1 text-sm"
							>
								<MapPin className="h-3 w-3" />
								{location.name}
								<span className="text-xs text-muted-foreground ml-1">
									({location.displayType})
								</span>
								<button
									type="button"
									onClick={() => handleLocationRemove(location.id)}
									className="ml-1 rounded-full hover:bg-muted p-0.5"
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				</div>
			)}

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search locations..."
					value={searchQuery}
					onChange={handleSearchChange}
					className="pl-9 text-base"
				/>
			</div>

			{/* Location Lists — separate bordered containers for Districts and Regions */}
			<div className="space-y-4">
				<Label className="text-sm font-medium">Available Locations</Label>

				{locationsLoading ? (
					<div className="p-8 text-center text-muted-foreground">
						Loading locations...
					</div>
				) : !hasFilteredResults ? (
					<div className="p-8 text-center text-muted-foreground">
						No locations found matching your search.
					</div>
				) : (
					<div className="space-y-4">
						{/* DBCA Districts */}
						{filteredDistricts.length > 0 && (
							<div className="border rounded-md max-h-[512px] overflow-y-auto">
								<LocationSection
									title="DBCA Districts"
									locations={filteredDistricts}
									selectedAreas={formData.areas}
									allLocationsInSection={dbcaDistricts}
									onAreasChange={(areas) => wizardStore.setLocation({ areas })}
								/>
							</div>
						)}

						{/* DBCA Regions */}
						{filteredRegions.length > 0 && (
							<div className="border rounded-md max-h-[512px] overflow-y-auto">
								<LocationSection
									title="DBCA Regions"
									locations={filteredRegions}
									selectedAreas={formData.areas}
									allLocationsInSection={dbcaRegions}
									onAreasChange={(areas) => wizardStore.setLocation({ areas })}
								/>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Validation Message */}
			{formData.areas.length === 0 && (
				<p className="text-sm text-muted-foreground flex items-center gap-2">
					<MapPin className="h-4 w-4" />
					Please select at least one location to continue
				</p>
			)}
		</div>
	);
});

export { LocationStep };
