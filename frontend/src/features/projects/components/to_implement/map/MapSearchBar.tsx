import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Search, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useMapStore } from "@/app/stores/store-context";

/**
 * MapSearchBar component
 * 
 * Search input with debouncing and project count display.
 * Updates the MapStore search term after 500ms of inactivity.
 */
export const MapSearchBar = observer(() => {
  const store = useMapStore();
  const [localValue, setLocalValue] = useState(store.searchTerm);
  const debouncedValue = useDebouncedValue(localValue, 500);

  // Update store when debounced value changes
  useEffect(() => {
    store.setSearchTerm(debouncedValue);
  }, [debouncedValue, store]);

  // Sync local value when store changes externally
  useEffect(() => {
    setLocalValue(store.searchTerm);
  }, [store.searchTerm]);

  const handleClear = () => {
    setLocalValue("");
    store.setSearchTerm("");
  };

  return (
    <div className="space-y-2">
      <label htmlFor="map-search" className="text-sm font-medium">
        Search Projects
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="map-search"
          type="text"
          placeholder="Search by title or description..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="pl-9 pr-9"
        />
        {localValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
});

MapSearchBar.displayName = "MapSearchBar";
