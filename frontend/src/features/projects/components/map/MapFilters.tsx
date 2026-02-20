import { observer } from "mobx-react-lite";
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
import { Search, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { debounce } from "@/shared/utils/common.utils";
import { useProjectMapStore } from "@/app/stores/store-context";
import { SearchControls } from "@/shared/components/SearchControls";
import { BusinessAreaMultiSelect } from "@/shared/components/BusinessAreaMultiSelect";
import { UserCombobox } from "@/shared/components/user";
import { ResponsiveLayout } from "@/shared/components/ResponsiveLayout";

interface MapFiltersProps {
	projectCount: number;
	totalProjects: number;
	projectsWithoutLocation: number;
}

/**
 * MapFilters - Filter controls for the map
 *
 * Layout adapts based on context:
 * - Normal mode: Horizontal filter bar above the map
 * - Fullscreen mode: Vertical sidebar layout
 */
export const MapFilters = observer(
	({
		projectCount,
		totalProjects,
		projectsWithoutLocation,
	}: MapFiltersProps) => {
		const store = useProjectMapStore();

		// Local state for immediate UI updates
		const [localSearchTerm, setLocalSearchTerm] = useState(
			store.state.searchTerm
		);

		// Sync local value when store changes
		useEffect(() => {
			setLocalSearchTerm(store.state.searchTerm);
		}, [store.state.searchTerm]);

		// Debounce the search (300ms)
		const debouncedSetSearchTerm = useMemo(
			() => debounce((value: string) => store.setSearchTerm(value), 300),
			[store]
		);

		const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setLocalSearchTerm(newValue);
			debouncedSetSearchTerm(newValue);
		};

		const handleClearSearch = () => {
			setLocalSearchTerm("");
			store.setSearchTerm("");
		};

		const handleClearFilters = () => {
			// Use store's resetFilters method which handles localStorage (matches ProjectFilters pattern)
			store.resetFilters();
			// Also clear local search term state
			setLocalSearchTerm("");
		};

		const handleUserChange = (userId: number | null) => {
			store.setFilters({ user: userId });
		};

		const handleActiveChange = () => {
			if (!store.state.filters.onlyActive) {
				store.setFilters({ onlyActive: true, onlyInactive: false });
			} else {
				store.setFilters({ onlyActive: false });
			}
		};

		const handleInactiveChange = () => {
			if (!store.state.filters.onlyInactive) {
				store.setFilters({ onlyActive: false, onlyInactive: true });
			} else {
				store.setFilters({ onlyInactive: false });
			}
		};

		// Calculate filter count using store's computed property
		const filterCount = store.filterCount;

		// Generate year options (current year back to 2000)
		const currentYear = new Date().getFullYear();
		const years = Array.from(
			{ length: currentYear - 1999 },
			(_, i) => currentYear - i
		);

		// Different layouts for normal vs fullscreen mode
		const isFullscreen = store.state.mapFullscreen;

		return (
			<div className="w-full select-none bg-background">
				<div className="p-4 w-full space-y-3">
					<ResponsiveLayout
						breakpoint={isFullscreen ? "xl" : "lg"}
						mobileContent={
							<div className="space-y-3">
								{/* Row 1 Mobile: Search Input (top) */}
								<div className="relative w-full">
									<Input
										type="text"
										placeholder="Search projects by name, keyword, or tag..."
										value={localSearchTerm}
										onChange={handleSearchChange}
										variant="search"
										className="pl-10 pr-8 text-sm rounded-md"
									/>
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-600 dark:text-blue-400" />
									{localSearchTerm && (
										<button
											onClick={handleClearSearch}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
										>
											<X className="size-4" />
										</button>
									)}
								</div>

								{/* Row 2 Mobile: User Filter */}
								<div className="w-full">
									<UserCombobox
										value={store.state.filters.user || null}
										onValueChange={handleUserChange}
										placeholder="Filter by user"
										ariaLabel="Filter projects by user"
										className="text-sm rounded-md"
										showIcon={true}
									/>
								</div>
							</div>
						}
						desktopContent={
							<div
								className={`grid ${!isFullscreen ? "grid-cols-2" : "grid-cols-1"} gap-3`}
							>
								{/* Row 1 Desktop: User Filter (left) */}
								<div className="w-full">
									<UserCombobox
										value={store.state.filters.user || null}
										onValueChange={handleUserChange}
										placeholder="Filter by user"
										ariaLabel="Filter projects by user"
										className="text-sm rounded-md"
										showIcon={true}
									/>
								</div>

								{/* Row 1 Desktop: Search Input (right) */}
								<div className="relative w-full">
									<Input
										type="text"
										placeholder="Search projects by name, keyword, or tag..."
										value={localSearchTerm}
										onChange={handleSearchChange}
										variant="search"
										className="pl-10 pr-8 text-sm rounded-md"
									/>
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-600 dark:text-blue-400" />
									{localSearchTerm && (
										<button
											onClick={handleClearSearch}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
										>
											<X className="size-4" />
										</button>
									)}
								</div>
							</div>
						}
					/>

					{/* Row 2: Year, Project Status, Project Kind, Business Area (4-column grid) */}
					<div
						className={`grid grid-cols-1 ${!isFullscreen ? "sm:grid-cols-2 lg:grid-cols-4" : ""} gap-3`}
					>
						{/* Year Dropdown */}
						<Select
							value={store.state.filters.year?.toString() || "0"}
							onValueChange={(value) =>
								store.setFilters({ year: value === "0" ? 0 : Number(value) })
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
							value={store.state.filters.status || "All"}
							onValueChange={(value) =>
								store.setFilters({ status: value === "All" ? "" : value })
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

						{/* Project Kind Dropdown */}
						<Select
							value={store.state.filters.kind || "All"}
							onValueChange={(value) =>
								store.setFilters({ kind: value === "All" ? "" : value })
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

						{/* Business Area Multi-Select */}
						<div className="w-full">
							<BusinessAreaMultiSelect
								selectedBusinessAreas={
									store.state.filters.selectedBusinessAreas
								}
								onToggleBusinessArea={(baId) => {
									const current = store.state.filters.selectedBusinessAreas;
									const index = current.indexOf(baId);
									if (index > -1) {
										store.setFilters({
											selectedBusinessAreas: current.filter(
												(id) => id !== baId
											),
										});
									} else {
										store.setFilters({
											selectedBusinessAreas: [...current, baId],
										});
									}
								}}
								onSelectAll={(businessAreaIds) =>
									store.setFilters({ selectedBusinessAreas: businessAreaIds })
								}
								onClearAll={() =>
									store.setFilters({ selectedBusinessAreas: [] })
								}
								showTags={false}
							/>
						</div>
					</div>

					{/* Row 3: Active/Inactive Checkboxes (left) + Search Controls (right) */}
					<div
						className={`flex flex-col ${!isFullscreen ? "sm:flex-row" : ""} gap-3 ${!isFullscreen ? "sm:items-center sm:justify-between" : ""}`}
					>
						{/* Left side: Active/Inactive Checkboxes */}
						<div className="flex flex-row gap-4 items-center">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="map-active-filter"
									checked={store.state.filters.onlyActive || false}
									onCheckedChange={handleActiveChange}
									disabled={store.state.filters.onlyInactive || false}
									className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-500"
								/>
								<Label
									htmlFor="map-active-filter"
									className="text-sm font-normal cursor-pointer whitespace-nowrap"
								>
									Active
								</Label>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="map-inactive-filter"
									checked={store.state.filters.onlyInactive || false}
									onCheckedChange={handleInactiveChange}
									disabled={store.state.filters.onlyActive || false}
								/>
								<Label
									htmlFor="map-inactive-filter"
									className="text-sm font-normal cursor-pointer whitespace-nowrap"
								>
									Inactive
								</Label>
							</div>
						</div>

						{/* Right side: Search Controls */}
						<SearchControls
							saveSearch={store.state.saveSearch}
							onToggleSaveSearch={() => store.toggleSaveSearch()}
							filterCount={filterCount}
							onClearFilters={handleClearFilters}
							className="flex gap-3 items-center"
						/>
					</div>

					{/* Project Statistics - only show in fullscreen mode */}
					{isFullscreen && (
						<div className="text-sm text-muted-foreground">
							<div>
								<span className="font-medium text-foreground">
									{projectCount}
								</span>{" "}
								of{" "}
								<span className="font-medium text-foreground">
									{totalProjects}
								</span>{" "}
								projects shown
							</div>
							{projectsWithoutLocation > 0 && (
								<div className="text-xs mt-1">
									{projectsWithoutLocation} project
									{projectsWithoutLocation !== 1 ? "s" : ""} lack location data
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		);
	}
);
