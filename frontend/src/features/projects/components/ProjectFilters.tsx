import { Input } from "@/shared/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { debounce } from "@/shared/utils/common.utils";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import type { ProjectSearchFilters } from "@/app/stores/derived/project-search.store";
import { SearchControls } from "@/shared/components/SearchControls";
import { UserCombobox } from "@/shared/components/user";

interface ProjectFiltersProps {
	searchTerm: string;
	filters: ProjectSearchFilters;
	filterCount: number;
	saveSearch: boolean;
	onSearchChange: (value: string) => void;
	onFiltersChange: (filters: Partial<ProjectSearchFilters>) => void;
	onClearFilters: () => void;
	onToggleSaveSearch: () => void;
}

/**
 * ProjectFilters component
 * Search input and filter dropdowns for the projects list page
 */
export const ProjectFilters = observer(
	({
		searchTerm,
		filters,
		filterCount,
		saveSearch,
		onSearchChange,
		onFiltersChange,
		onClearFilters,
		onToggleSaveSearch,
	}: ProjectFiltersProps) => {
		const { data: businessAreas, isLoading: isLoadingBusinessAreas } =
			useBusinessAreas();

		// Local state for immediate UI updates
		const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

		// Sync local value when prop changes
		useEffect(() => {
			setLocalSearchTerm(searchTerm);
		}, [searchTerm]);

		// Debounce the search callback (300ms)
		const debouncedOnSearchChange = useMemo(
			() => debounce(onSearchChange, 300),
			[onSearchChange]
		);

		const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setLocalSearchTerm(newValue);
			debouncedOnSearchChange(newValue);
		};

		const handleUserChange = (userId: number | null) => {
			onFiltersChange({ user: userId });
		};

		const handleActiveChange = () => {
			if (!filters.onlyActive) {
				onFiltersChange({ onlyActive: true, onlyInactive: false });
			} else {
				onFiltersChange({ onlyActive: false, onlyInactive: false });
			}
		};

		const handleInactiveChange = () => {
			if (!filters.onlyInactive) {
				onFiltersChange({ onlyActive: false, onlyInactive: true });
			} else {
				onFiltersChange({ onlyActive: false, onlyInactive: false });
			}
		};

		// Sort business areas by division
		const orderedDivisionSlugs = ["BCS", "CEM", "RFMS"];
		const sortedBusinessAreas = businessAreas?.slice().sort((a, b) => {
			const aDivSlug =
				typeof a.division === "object" && a.division?.slug
					? a.division.slug
					: "";
			const bDivSlug =
				typeof b.division === "object" && b.division?.slug
					? b.division.slug
					: "";

			const aIndex = orderedDivisionSlugs.indexOf(aDivSlug);
			const bIndex = orderedDivisionSlugs.indexOf(bDivSlug);

			if (aIndex !== bIndex) {
				return aIndex - bIndex;
			}

			return a.name.localeCompare(b.name);
		});

		// Generate year options (current year back to 2000)
		const currentYear = new Date().getFullYear();
		const years = Array.from(
			{ length: currentYear - 1999 },
			(_, i) => currentYear - i
		);

		return (
			<div className="border border-gray-300 dark:border-gray-500 w-full select-none">
				<div className="p-4 w-full space-y-3">
					{/* Row 1: User Filter and Search (side by side on lg+, stacked on mobile) */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
						{/* Search Input - FIRST on mobile, right on desktop - EMPHASIZED */}
						<div className="relative w-full order-1 lg:order-2">
							<Input
								type="text"
								placeholder="Search projects by name, keyword, or tag..."
								value={localSearchTerm}
								onChange={handleSearchChange}
								variant="search"
								className="pl-10 text-sm rounded-md"
							/>
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-600 dark:text-blue-400" />
						</div>

						{/* User Filter with icon - SECOND on mobile, left on desktop */}
						<div className="w-full order-2 lg:order-1">
							<UserCombobox
								value={filters.user || null}
								onValueChange={handleUserChange}
								placeholder="Filter by user"
								className="text-sm rounded-md"
								showIcon={true}
							/>
						</div>
					</div>

					{/* Row 2: Business Area, Year, Project Status, Project Kind */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
						{/* Business Area Dropdown */}
						<Select
							value={filters.businessArea || "All"}
							onValueChange={(value) =>
								onFiltersChange({
									businessArea: value === "All" ? "All" : value,
								})
							}
							disabled={isLoadingBusinessAreas}
						>
							<SelectTrigger className="w-full text-sm rounded-md">
								<SelectValue placeholder="All Business Areas" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="All">All Business Areas</SelectItem>
								{sortedBusinessAreas?.map((ba) => (
									<SelectItem key={ba.id} value={ba.id!.toString()}>
										{typeof ba.division === "object" && ba.division?.slug
											? `[${ba.division.slug}] `
											: ""}
										{ba.name}
										{!ba.is_active ? " (INACTIVE)" : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Year Dropdown */}
						<Select
							value={filters.year?.toString() || "0"}
							onValueChange={(value) =>
								onFiltersChange({
									year: value === "0" ? 0 : Number(value),
								})
							}
						>
							<SelectTrigger className="w-full text-sm rounded-md">
								<SelectValue placeholder="All Years" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="0">All Years</SelectItem>
								{years.map((year) => (
									<SelectItem key={year} value={year.toString()}>
										{year}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Project Status Dropdown */}
						<Select
							value={filters.projectStatus || "All"}
							onValueChange={(value) =>
								onFiltersChange({
									projectStatus: value === "All" ? "All" : value,
								})
							}
						>
							<SelectTrigger className="w-full text-sm rounded-md">
								<SelectValue placeholder="All Statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="All">All Statuses</SelectItem>
								<SelectItem value="new">New</SelectItem>
								<SelectItem value="pending">Pending Project Plan</SelectItem>
								<SelectItem value="active">Active (Approved)</SelectItem>
								<SelectItem value="updating">Update Requested</SelectItem>
								<SelectItem value="closure_requested">
									Closure Requested
								</SelectItem>
								<SelectItem value="completed">Completed and Closed</SelectItem>
								<SelectItem value="terminated">Terminated</SelectItem>
								<SelectItem value="suspended">Suspended</SelectItem>
							</SelectContent>
						</Select>

						{/* Project Kind Dropdown - next to Status on sm+ */}
						<Select
							value={filters.projectKind || "All"}
							onValueChange={(value) =>
								onFiltersChange({
									projectKind: value === "All" ? "All" : value,
								})
							}
						>
							<SelectTrigger className="w-full text-sm rounded-md">
								<SelectValue placeholder="All Kinds" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="All">All Kinds</SelectItem>
								<SelectItem value="core_function">Core Function</SelectItem>
								<SelectItem value="science">Science Project</SelectItem>
								<SelectItem value="student">Student Project</SelectItem>
								<SelectItem value="external">External Project</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Row 3: Active/Inactive Checkboxes and Search Controls */}
					<div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
						{/* Left side: Active/Inactive Checkboxes */}
						<div className="flex flex-row gap-4 items-center">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="active-filter"
									checked={filters.onlyActive || false}
									onCheckedChange={handleActiveChange}
									disabled={filters.onlyInactive || false}
									className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-500"
								/>
								<Label
									htmlFor="active-filter"
									className="text-sm font-normal cursor-pointer whitespace-nowrap"
								>
									Active
								</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="inactive-filter"
									checked={filters.onlyInactive || false}
									onCheckedChange={handleInactiveChange}
									disabled={filters.onlyActive || false}
								/>
								<Label
									htmlFor="inactive-filter"
									className="text-sm font-normal cursor-pointer whitespace-nowrap"
								>
									Inactive
								</Label>
							</div>
						</div>

						{/* Right side: Remember my search and Clear button - right-aligned on mobile */}
						<div className="flex justify-center">
							<SearchControls
								saveSearch={saveSearch}
								onToggleSaveSearch={onToggleSaveSearch}
								filterCount={filterCount}
								onClearFilters={onClearFilters}
								className="flex gap-3 items-center"
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
);
