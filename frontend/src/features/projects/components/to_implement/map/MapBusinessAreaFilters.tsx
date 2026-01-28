import { observer } from "mobx-react-lite";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useBusinessAreas } from "@/shared/hooks/queries/useBusinessAreas";
import { useMapStore } from "@/app/stores/store-context";

/**
 * MapBusinessAreaFilters component
 * 
 * Business area checkbox list with bulk actions.
 * Fetches business areas with TanStack Query and manages selection via MapStore.
 */
export const MapBusinessAreaFilters = observer(() => {
  const store = useMapStore();
  const { data: businessAreas, isLoading, isError } = useBusinessAreas();

  const handleCheckAll = () => {
    if (businessAreas) {
      const allIds = businessAreas.map((ba) => ba.id);
      store.selectAllBusinessAreas(allIds);
    }
  };

  const handleUncheckAll = () => {
    store.clearBusinessAreas();
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Business Areas</div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Business Areas</div>
        <div className="text-sm text-destructive">
          Failed to load business areas
        </div>
      </div>
    );
  }

  if (!businessAreas || businessAreas.length === 0) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Business Areas</div>
        <div className="text-sm text-muted-foreground">
          No business areas available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Business Areas</div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCheckAll}
            className="h-7 text-xs"
          >
            Check All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUncheckAll}
            className="h-7 text-xs"
          >
            Uncheck All
          </Button>
        </div>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {businessAreas.map((ba) => {
          const isChecked = store.selectedBusinessAreas.has(ba.id);
          return (
            <div key={ba.id} className="flex items-center space-x-2">
              <Checkbox
                id={`ba-${ba.id}`}
                checked={isChecked}
                onCheckedChange={() => store.toggleBusinessArea(ba.id)}
              />
              <label
                htmlFor={`ba-${ba.id}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {ba.name}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
});

MapBusinessAreaFilters.displayName = "MapBusinessAreaFilters";
