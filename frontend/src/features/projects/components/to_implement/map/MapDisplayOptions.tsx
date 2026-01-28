import { observer } from "mobx-react-lite";
import { Tag, Palette } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useMapStore } from "@/app/stores/store-context";
import { cn } from "@/shared/lib/utils";

/**
 * MapDisplayOptions component
 * 
 * Toggle buttons for labels and colors display options.
 * Visual indication of active/inactive state.
 */
export const MapDisplayOptions = observer(() => {
  const store = useMapStore();

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Display Options</div>
      <div className="flex gap-2">
        <Button
          variant={store.showLabels ? "default" : "outline"}
          size="sm"
          onClick={store.toggleLabels}
          className={cn(
            "flex-1",
            !store.showLabels && "text-muted-foreground"
          )}
        >
          <Tag className="h-4 w-4 mr-2" />
          Labels
        </Button>
        <Button
          variant={store.showColors ? "default" : "outline"}
          size="sm"
          onClick={store.toggleColors}
          className={cn(
            "flex-1",
            !store.showColors && "text-muted-foreground"
          )}
        >
          <Palette className="h-4 w-4 mr-2" />
          Colors
        </Button>
      </div>
    </div>
  );
});

MapDisplayOptions.displayName = "MapDisplayOptions";
