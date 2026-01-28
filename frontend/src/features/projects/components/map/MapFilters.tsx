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
    handleClearSearch();
  };

  const handleUserChange = (userId: number | null) => {
    store.setFilterUser(userId);
  };

  const handleToggleSaveSearch = () => {
    store.toggleSaveSearch();
  };

  // Calculate filter count (search term + business areas + user)
  const filterCount = (store.state.searchTerm.length > 0 ? 1 : 0) + 
                     store.state.selectedBusinessAreas.length + 
                     (store.state.filterUser ? 1 : 0);

  // Different layouts for normal vs fullscreen mode
  const isFullscreen = store.state.mapFullscreen;

  return (
    <div className={`w-full select-none bg-background ${!isFullscreen ? 'border-b border-gray-300 dark:border-gray-500' : ''}`}>
      <div className="p-4 w-full space-y-3">
        {/* Search Input */}
        <div className="relative w-full">
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

        {/* User Filter */}
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

        {/* Business Area Multi-Select */}
        <div className="w-full">
          <BusinessAreaMultiSelect
            key={`ba-${store.state.selectedBusinessAreas.join(',')}`}
            selectedBusinessAreas={store.state.selectedBusinessAreas}
            onToggleBusinessArea={store.toggleBusinessArea}
            onSelectAll={store.checkAllBusinessAreas}
            onClearAll={store.uncheckAllBusinessAreas}
            showTags={true}
          />
        </div>

        {/* Project Stats and Controls */}
        <div className="space-y-3">
          {/* Project Statistics */}
          <div className="text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">{projectCount}</span> of{" "}
              <span className="font-medium text-foreground">{totalProjects}</span> projects shown
            </div>
            {projectsWithoutLocation > 0 && (
              <div className="text-xs mt-1">
                {projectsWithoutLocation} project{projectsWithoutLocation !== 1 ? "s" : ""} without location data
              </div>
            )}
          </div>

          {/* Search Controls */}
          <SearchControls
            saveSearch={store.state.saveSearch}
            onToggleSaveSearch={handleToggleSaveSearch}
            filterCount={filterCount}
            onClearFilters={handleClearFilters}
            className="flex justify-end items-center"
          />
        </div>
      </div>
    </div>
  );
});
