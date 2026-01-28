import { observer } from "mobx-react-lite";
import { Input } from "@/shared/components/ui/input";
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
 * MapFilters - Filter bar above the map
 * 
 * Layout:
 * - Desktop: Business Area dropdown (left) | Search (right)
 * - Mobile: Search (top) | Business Area dropdown (bottom)
 * - Bottom row: Project stats (left) | Remember/Clear (right)
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
    handleClearSearch();
  };

  const handleUserChange = (userId: number | null) => {
    store.setFilterUser(userId);
  };

  // Calculate filter count (search term + business areas + user)
  const filterCount = (store.state.searchTerm.length > 0 ? 1 : 0) + 
                     store.state.selectedBusinessAreas.length + 
                     (store.state.filterUser ? 1 : 0);

  return (
    <div className="border-b border-gray-300 dark:border-gray-500 w-full select-none bg-background">
      <div className="p-4 w-full space-y-3">
        {/* Row 1: Business Area Dropdown (left on desktop) and Search (right on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Business Area Multi-Select - LEFT on desktop, SECOND on mobile */}
          <div className="w-full order-2 lg:order-1">
            <BusinessAreaMultiSelect
              selectedBusinessAreas={store.state.selectedBusinessAreas}
              onToggleBusinessArea={store.toggleBusinessArea}
              onSelectAll={store.checkAllBusinessAreas}
              onClearAll={store.uncheckAllBusinessAreas}
              showTags={true}
            />
          </div>

          {/* Search Input - RIGHT on desktop, FIRST on mobile */}
          <div className="relative w-full order-1 lg:order-2">
            <Input
              type="text"
              placeholder="Search projects..."
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

        {/* Row 2: User Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* User Filter - LEFT on desktop */}
          <div className="w-full">
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
          {/* Empty space on right */}
          <div className="w-full"></div>
        </div>

        {/* Row 3: Project Stats (left) and Remember/Clear (right) */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Left side: Project Statistics */}
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{projectCount}</span> of{" "}
              <span className="font-medium text-foreground">{totalProjects}</span> projects shown
            </div>
            {projectsWithoutLocation > 0 && (
              <div className="text-xs">
                {projectsWithoutLocation} project{projectsWithoutLocation !== 1 ? "s" : ""} without location data
              </div>
            )}
          </div>

          {/* Right side: Remember my search and Clear button */}
          <SearchControls
            saveSearch={false}
            onToggleSaveSearch={() => {}}
            filterCount={filterCount}
            onClearFilters={handleClearFilters}
            className="flex flex-wrap gap-2 items-center"
          />
        </div>
      </div>
    </div>
  );
});
