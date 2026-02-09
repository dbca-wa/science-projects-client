import { observer } from "mobx-react-lite";
import { useProjectWizardStore } from "@/app/stores/store-context";
import { useLocations } from "@/shared/hooks/queries/useLocations";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { X, MapPin, Search, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/shared/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import type { ISimpleLocationData } from "@/shared/types/org.types";

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
 * LocationStep - Step 3 of project creation wizard
 * 
 * Collects:
 * - Location areas (required, multi-select)
 * 
 * Shows selected locations as removable chips
 * Provides search/filter functionality
 */
const LocationStep = observer(() => {
	const wizardStore = useProjectWizardStore();
	const formData = wizardStore.state.formData.location;
	const validation = wizardStore.state.validation[2]; // Step 2 is Location
	const {
		locationsLoading,
		dbcaRegions,
		dbcaDistricts,
		ibra,
		imcra,
		nrm,
	} = useLocations();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedAreaType, setSelectedAreaType] = useState<string>("all");

	// Combine all locations with their area type for display
	const allLocations = useMemo(() => {
		const locations: Array<ISimpleLocationData & { displayType: string }> = [];
		
		dbcaRegions.forEach((loc) => locations.push({ ...loc, displayType: "DBCA Region" }));
		dbcaDistricts.forEach((loc) => locations.push({ ...loc, displayType: "DBCA District" }));
		ibra.forEach((loc) => locations.push({ ...loc, displayType: "IBRA" }));
		imcra.forEach((loc) => locations.push({ ...loc, displayType: "IMCRA" }));
		nrm.forEach((loc) => locations.push({ ...loc, displayType: "NRM" }));
		
		return locations;
	}, [dbcaRegions, dbcaDistricts, ibra, imcra, nrm]);

	// Filter locations based on search query and area type
	const filteredLocations = useMemo(() => {
		let filtered = allLocations;

		// Filter by area type
		if (selectedAreaType !== "all") {
			filtered = filtered.filter((loc) => loc.area_type === selectedAreaType);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter((loc) =>
				loc.name.toLowerCase().includes(query)
			);
		}

		return filtered;
	}, [allLocations, selectedAreaType, searchQuery]);

	// Get selected location objects for display
	const selectedLocations = useMemo(() => {
		return allLocations.filter((loc) => formData.areas.includes(loc.id));
	}, [allLocations, formData.areas]);

	const handleLocationToggle = (locationId: number) => {
		const isSelected = formData.areas.includes(locationId);
		
		if (isSelected) {
			// Remove location
			wizardStore.setLocation({
				areas: formData.areas.filter((id) => id !== locationId),
			});
		} else {
			// Add location
			wizardStore.setLocation({
				areas: [...formData.areas, locationId],
			});
		}
	};

	const handleLocationRemove = (locationId: number) => {
		wizardStore.setLocation({
			areas: formData.areas.filter((id) => id !== locationId),
		});
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleAreaTypeChange = (value: string) => {
		setSelectedAreaType(value);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<Label className="text-base">
					Project Locations <span className="text-destructive">*</span>
				</Label>
				<FieldError error={validation?.errors.areas} />
				<p className="text-sm text-muted-foreground">
					Select the geographic areas where this project's work occurs. You can select multiple locations across different area types.
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

			{/* Search and Filter */}
			<div className="space-y-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{/* Search Input */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search locations..."
							value={searchQuery}
							onChange={handleSearchChange}
							className="pl-9 text-base"
						/>
					</div>

					{/* Area Type Filter */}
					<Select
						value={selectedAreaType}
						onValueChange={handleAreaTypeChange}
					>
						<SelectTrigger className="text-base">
							<SelectValue placeholder="All Area Types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Area Types</SelectItem>
							<SelectItem value="dbcaregion">DBCA Regions</SelectItem>
							<SelectItem value="dbcadistrict">DBCA Districts</SelectItem>
							<SelectItem value="ibra">IBRA</SelectItem>
							<SelectItem value="imcra">IMCRA</SelectItem>
							<SelectItem value="nrm">NRM</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Location List */}
			<div className="space-y-2">
				<Label className="text-sm font-medium">
					Available Locations
				</Label>
				
				{locationsLoading ? (
					<div className="p-8 text-center text-muted-foreground">
						Loading locations...
					</div>
				) : filteredLocations.length === 0 ? (
					<div className="p-8 text-center text-muted-foreground">
						No locations found matching your search.
					</div>
				) : (
					<div className="border rounded-md max-h-96 overflow-y-auto">
						<div className="divide-y">
							{filteredLocations.map((location) => {
								const isSelected = formData.areas.includes(location.id);
								
								return (
									<button
										key={location.id}
										type="button"
										onClick={() => handleLocationToggle(location.id)}
										className={`
											w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors
											flex items-center justify-between gap-3
											${isSelected ? "bg-primary/5" : ""}
										`}
									>
										<div className="flex items-center gap-3 flex-1 min-w-0">
											<div
												className={`
													flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
													${isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"}
												`}
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
											<div className="flex-1 min-w-0">
												<div className="font-medium text-sm truncate">
													{location.name}
												</div>
												<div className="text-xs text-muted-foreground">
													{location.displayType}
												</div>
											</div>
										</div>
									</button>
								);
							})}
						</div>
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
