import { Input } from "@/shared/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Search, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { debounce } from "@/shared/utils/common.utils";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { UserSearchDropdown } from "@/features/users/components/UserSearchDropdown";
import type { ProjectSearchFilters } from "@/app/stores/derived/project-search.store";

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
export const ProjectFilters = observer(({
	searchTerm,
	filters,
	filterCount,
	saveSearch,
	onSearchChange,
	onFiltersChange,
	onClearFilters,
	onToggleSaveSearch,
}: ProjectFiltersProps) => {
	const { data: businessAreas, isLoading: isLoadingBusinessAreas } = useBusinessAreas();

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
	const sortedBusinessAreas = businessAreas
		?.slice()
		.sort((a, b) => {
			const aDivSlug = typeof a.division === "object" && a.division?.slug ? a.division.slug : "";
			const bDivSlug = typeof b.division === "object" && b.division?.slug ? b.division.slug : "";

			const aIndex = orderedDivisionSlugs.indexOf(aDivSlug);
			const bIndex = orderedDivisionSlugs.indexOf(bDivSlug);

			if (aIndex !== bIndex) {
				return aIndex - bIndex;
			}

			return a.name.localeCompare(b.name);
		});

	// Generate year options (current year back to 2000)
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

	return (
		<div className="grid grid-cols-1 items-center border border-gray-300 dark:border-gray-500 w-full select-none mb-0">
			<div className="col-span-full pb-4">
				<div className="p-4 border-b border-gray-300 dark:border-gray-500 w-full space-y-3">
					{/* Layout: Filters on left, Search/User/Year/Checkboxes on right */}
					<div className="flex flex-col md:flex-row gap-4">
						{/* Filter Dropdowns - shows first on mobile, left on desktop */}
						<div className="w-full md:w-auto md:min-w-[280px] order-1">
							<div className="flex flex-col gap-3 w-full">
								{/* User Filter Dropdown */}
								<UserSearchDropdown
									key={filters.user || "no-user"} // Force remount when user changes
									isRequired={false}
									setUserFunction={handleUserChange}
									label=""
									placeholder="Filter by user"
									helperText=""
									hideCannotFind={true}
									className="text-sm rounded-md"
									preselectedUserPk={filters.user || undefined}
								/>

								{/* Project Kind Dropdown */}
								<Select
									value={filters.projectKind || "All"}
									onValueChange={(value) =>
										onFiltersChange({ projectKind: value === "All" ? "All" : value })
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

								{/* Project Status Dropdown */}
								<Select
									value={filters.projectStatus || "All"}
									onValueChange={(value) =>
										onFiltersChange({ projectStatus: value === "All" ? "All" : value })
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
										<SelectItem value="closure_requested">Closure Requested</SelectItem>
										<SelectItem value="completed">Completed and Closed</SelectItem>
										<SelectItem value="terminated">Terminated</SelectItem>
										<SelectItem value="suspended">Suspended</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Search, Business Area, Year, and Checkboxes - shows second on mobile, right on desktop */}
						<div className="flex-1 order-2">
							<div className="flex flex-col gap-3">
								{/* Search Input */}
								<div className="relative w-full">
									<Input
										type="text"
										placeholder="Search projects by name, keyword, or tag..."
										value={localSearchTerm}
										onChange={handleSearchChange}
										className="pl-10 bg-transparent text-sm rounded-md"
									/>
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
								</div>

								{/* Business Area Dropdown */}
								<Select
									value={filters.businessArea || "All"}
									onValueChange={(value) =>
										onFiltersChange({ businessArea: value === "All" ? "All" : value })
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

								{/* Year Dropdown and Checkboxes Row */}
								<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
									{/* Year Dropdown */}
									<Select
										value={filters.year?.toString() || "0"}
										onValueChange={(value) =>
											onFiltersChange({ year: value === "0" ? 0 : Number(value) })
										}
									>
										<SelectTrigger className="w-full sm:w-[180px] text-sm rounded-md">
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

									{/* Active/Inactive Checkboxes */}
									<div className="flex gap-4 items-center">
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
												className="text-sm font-normal cursor-pointer"
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
												className="text-sm font-normal cursor-pointer"
											>
												Inactive
											</Label>
										</div>
									</div>
								</div>

								{/* Remember my search and Clear button - hidden on mobile, shown on desktop */}
								<div className="hidden md:flex gap-2 justify-end">
									<div className="flex items-center space-x-2 px-4 py-2 rounded-md bg-muted/50">
										<Checkbox
											id="save-search"
											checked={saveSearch}
											onCheckedChange={onToggleSaveSearch}
										/>
										<Label
											htmlFor="save-search"
											className="text-sm font-normal cursor-pointer"
										>
											Remember my search
										</Label>
									</div>

									{filterCount > 0 && (
										<Button
											variant="outline"
											size="sm"
											onClick={onClearFilters}
											className="gap-1.5 py-4!"
										>
											<X className="size-4" />
											Clear Filters
											<Badge variant="secondary" className="ml-1">
												{filterCount}
											</Badge>
										</Button>
									)}
								</div>
							</div>
						</div>

						{/* Remember my search and Clear button - shown on mobile at bottom, hidden on desktop */}
						<div className="flex md:hidden order-3 gap-2 justify-end">
							<div className="flex items-center space-x-2 px-4 py-2 rounded-md bg-muted/50">
								<Checkbox
									id="save-search-mobile"
									checked={saveSearch}
									onCheckedChange={onToggleSaveSearch}
								/>
								<Label
									htmlFor="save-search-mobile"
									className="text-sm font-normal cursor-pointer"
								>
									Remember my search
								</Label>
							</div>

							{filterCount > 0 && (
								<Button
									variant="outline"
									size="sm"
									onClick={onClearFilters}
									className="gap-1.5"
								>
									<X className="size-4" />
									Clear
									<Badge variant="secondary" className="ml-1">
										{filterCount}
									</Badge>
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});
