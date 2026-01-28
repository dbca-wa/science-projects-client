import { observer } from "mobx-react-lite";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Search, ChevronDown, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { debounce } from "@/shared/utils/common.utils";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useMapStore } from "@/app/stores/store-context";
import { SearchControls } from "@/shared/components/SearchControls";

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
  const store = useMapStore();
  const { data: businessAreas, isLoading: isLoadingBusinessAreas } = useBusinessAreas();

  // Local state for immediate UI updates
  const [localSearchTerm, setLocalSearchTerm] = useState(store.searchTerm);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Sync local value when store changes
  useEffect(() => {
    setLocalSearchTerm(store.searchTerm);
  }, [store.searchTerm]);

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
    store.clearBusinessAreas();
    handleClearSearch();
  };

  // Sort business areas alphabetically
  const sortedBusinessAreas = useMemo(() => {
    if (!businessAreas) return [];
    return [...businessAreas].sort((a, b) => a.name.localeCompare(b.name));
  }, [businessAreas]);

  // Calculate filter count (search term + business areas)
  const filterCount = (store.searchTerm.length > 0 ? 1 : 0) + store.selectedBusinessAreas.size;

  // Get selected business area names for display
  const selectedNames = useMemo(() => {
    if (store.selectedBusinessAreas.size === 0) return "Business Areas";
    if (businessAreas && store.selectedBusinessAreas.size === businessAreas.length) return "All Selected";
    return "Business Areas";
  }, [store.selectedBusinessAreas, businessAreas]);

  // Get selected business areas for tag display
  const selectedBusinessAreasList = useMemo(() => {
    if (!businessAreas) return [];
    return businessAreas.filter(ba => ba.id && store.selectedBusinessAreas.has(ba.id));
  }, [businessAreas, store.selectedBusinessAreas]);

  // Show tags only when some (but not all) are selected
  const showTags = useMemo(() => {
    return store.selectedBusinessAreas.size > 0 && 
           businessAreas && 
           store.selectedBusinessAreas.size < businessAreas.length;
  }, [store.selectedBusinessAreas, businessAreas]);

  return (
    <div className="border-b border-gray-300 dark:border-gray-500 w-full select-none bg-background">
      <div className="p-4 w-full space-y-3">
        {/* Row 1: Business Area Dropdown (left on desktop) and Search (right on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Business Area Multi-Select - LEFT on desktop, SECOND on mobile */}
          <div className="w-full order-2 lg:order-1">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-sm font-normal h-11"
                  disabled={isLoadingBusinessAreas}
                >
                  <span className="truncate">{selectedNames}</span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Business Areas</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (businessAreas) {
                            const allIds = businessAreas.map(ba => ba.id).filter((id): id is number => id !== undefined);
                            store.selectAllBusinessAreas(allIds);
                          }
                        }}
                        className="h-7 text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => store.clearBusinessAreas()}
                        className="h-7 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-3">
                  <div className="space-y-2">
                    {isLoadingBusinessAreas && (
                      <div className="text-sm text-muted-foreground">Loading...</div>
                    )}
                    {sortedBusinessAreas.map((ba) => {
                      if (ba.id === undefined) return null;
                      return (
                        <div key={ba.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ba-${ba.id}`}
                            checked={store.selectedBusinessAreas.has(ba.id)}
                            onCheckedChange={() => store.toggleBusinessArea(ba.id!)}
                          />
                          <Label
                            htmlFor={`ba-${ba.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {ba.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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

        {/* Row 2: Selected Business Area Tags (only shown when some but not all selected) */}
        {showTags && (
          <div className="flex flex-wrap gap-2">
            {selectedBusinessAreasList.map((ba) => (
              <div
                key={ba.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-md text-sm"
              >
                <span>{ba.name}</span>
                <button
                  onClick={() => ba.id && store.toggleBusinessArea(ba.id)}
                  className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-sm p-0.5 transition-colors"
                  aria-label={`Remove ${ba.name}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

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
