import { observer } from "mobx-react-lite";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Search, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { debounce } from "@/shared/utils/common.utils";
import { useProjectMapStore } from "@/app/stores/store-context";
import { SearchControls } from "@/shared/components/SearchControls";
import { BusinessAreaMultiSelect } from "@/shared/components/BusinessAreaMultiSelect";
import { UserSearchDropdown } from "@/features/users";

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
export const MapFilters = observer(({ 
  projectCount, 
  totalProjects,
  projectsWithoutLocation 
}: MapFiltersProps) => {
  const store = useProjectMapStore();

  // Local state for immediate UI updates
  const [localSearchTerm, setLocalSearchTerm] = useState(store.state.searchTerm);

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
    store.uncheckAllBusinessAreas();
    store.setFilterUser(null);
    store.setFilterStatus("");
    store.setFilterKind("");
    store.setFilterYear(0);
    store.setOnlyActive(false);
    store.setOnlyInactive(false);
    handleClearSearch();
  };

  const handleUserChange = (userId: number | null) => {
    store.setFilterUser(userId);
  };

  const handleToggleSaveSearch = () => {
    store.toggleSaveSearch();
  };

  const handleActiveChange = () => {
    if (!store.state.onlyActive) {
      store.setOnlyActive(true);
    } else {
      store.setOnlyActive(false);
    }
  };

  const handleInactiveChange = () => {
    if (!store.state.onlyInactive) {
      store.setOnlyInactive(true);
    } else {
      store.setOnlyInactive(false);
    }
  };

  // Calculate filter count (search term + business areas + user + status + kind + year + active/inactive)
  const filterCount = (store.state.searchTerm.length > 0 ? 1 : 0) + 
                     store.state.selectedBusinessAreas.length + 
                     (store.state.filterUser ? 1 : 0) +
                     (store.state.filterStatus && store.state.filterStatus !== "" ? 1 : 0) +
                     (store.state.filterKind && store.state.filterKind !== "" ? 1 : 0) +
                     (store.state.filterYear && store.state.filterYear !== 0 ? 1 : 0) +
                     (store.state.onlyActive ? 1 : 0) +
                     (store.state.onlyInactive ? 1 : 0);

  // Generate year options (current year back to 2000)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1999 },
    (_, i) => currentYear - i,
  );

  // Different layouts for normal vs fullscreen mode
  const isFullscreen = store.state.mapFullscreen;

  return (
    <div className="w-full select-none bg-background">
      <div className="p-4 w-full space-y-3">
        {/* Row 1: Search and User Filter (side by side on lg+, stacked on mobile) */}
        <div className={`grid grid-cols-1 ${!isFullscreen ? 'lg:grid-cols-2' : ''} gap-3`}>
          {/* Search Input - FIRST on mobile, right on desktop - EMPHASIZED */}
          <div className={`relative w-full order-1 ${!isFullscreen ? 'lg:order-2' : ''}`}>
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

          {/* User Filter with icon - SECOND on mobile, left on desktop */}
          <div className={`w-full order-2 ${!isFullscreen ? 'lg:order-1' : ''}`}>
            <UserSearchDropdown
              key={store.state.filterUser || "no-user"}
              isRequired={false}
              setUserFunction={handleUserChange}
              label=""
              placeholder="Filter by user"
              helperText=""
              hideCannotFind={true}
              className="text-sm rounded-md"
              preselectedUserPk={store.state.filterUser || undefined}
              showIcon={true}
            />
          </div>
        </div>

        {/* Row 2: Year, Project Status, Project Kind, Business Area (4-column grid) */}
        <div className={`grid grid-cols-1 ${!isFullscreen ? 'sm:grid-cols-2 lg:grid-cols-4' : ''} gap-3`}>
          {/* Year Dropdown */}
          <Select
            value={store.state.filterYear?.toString() || "0"}
            onValueChange={(value) => store.setFilterYear(value === "0" ? 0 : Number(value))}
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
            value={store.state.filterStatus || "All"}
            onValueChange={(value) => store.setFilterStatus(value === "All" ? "" : value)}
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

          {/* Project Kind Dropdown */}
          <Select
            value={store.state.filterKind || "All"}
            onValueChange={(value) => store.setFilterKind(value === "All" ? "" : value)}
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
              key={`ba-${store.state.selectedBusinessAreas.join(',')}`}
              selectedBusinessAreas={store.state.selectedBusinessAreas}
              onToggleBusinessArea={store.toggleBusinessArea}
              onSelectAll={store.checkAllBusinessAreas}
              onClearAll={store.uncheckAllBusinessAreas}
              showTags={false}
            />
          </div>
        </div>

        {/* Row 3: Active/Inactive Checkboxes (left) + Search Controls (right) */}
        <div className={`flex flex-col ${!isFullscreen ? 'sm:flex-row' : ''} gap-3 ${!isFullscreen ? 'sm:items-center sm:justify-between' : ''}`}>
          {/* Left side: Active/Inactive Checkboxes */}
          <div className="flex flex-row gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="map-active-filter"
                checked={store.state.onlyActive || false}
                onCheckedChange={handleActiveChange}
                disabled={store.state.onlyInactive || false}
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
                checked={store.state.onlyInactive || false}
                onCheckedChange={handleInactiveChange}
                disabled={store.state.onlyActive || false}
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
            onToggleSaveSearch={handleToggleSaveSearch}
            filterCount={filterCount}
            onClearFilters={handleClearFilters}
            className="flex gap-3 items-center"
          />
        </div>

        {/* Project Statistics - only show in fullscreen mode */}
        {isFullscreen && (
          <div className="text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{projectCount}</span> of{" "}
              <span className="font-medium text-foreground">{totalProjects}</span> projects shown
            </div>
            {projectsWithoutLocation > 0 && (
              <div className="text-xs mt-1">
                {projectsWithoutLocation} project{projectsWithoutLocation !== 1 ? "s" : ""} lack location data
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
