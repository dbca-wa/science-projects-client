import { observer } from "mobx-react-lite";
import { Layers } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { useProjectMapStore } from "@/app/stores/store-context";

/**
 * MapControls - Floating button with popover for map display options
 * 
 * Positioned in the top-right corner of the map.
 * Contains:
 * - Layer toggles (DBCA Regions, Districts, NRM, IBRA, IMCRA)
 * - Display options (Show Labels, Show Colors)
 */
export const MapControls = observer(() => {
  const store = useProjectMapStore();

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="shadow-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            <Layers className="h-5 w-5 mr-2" />
            Map Layers
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            {/* Layer Toggles */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Map Layers</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ctrl-layer-dbca-regions"
                    checked={store.state.visibleLayerTypes.includes("dbcaregion")}
                    onCheckedChange={() => store.toggleLayerType("dbcaregion")}
                  />
                  <Label
                    htmlFor="ctrl-layer-dbca-regions"
                    className="text-sm font-normal cursor-pointer"
                  >
                    DBCA Regions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ctrl-layer-dbca-districts"
                    checked={store.state.visibleLayerTypes.includes("dbcadistrict")}
                    onCheckedChange={() => store.toggleLayerType("dbcadistrict")}
                  />
                  <Label
                    htmlFor="ctrl-layer-dbca-districts"
                    className="text-sm font-normal cursor-pointer"
                  >
                    DBCA Districts
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ctrl-layer-nrm"
                    checked={store.state.visibleLayerTypes.includes("nrm")}
                    onCheckedChange={() => store.toggleLayerType("nrm")}
                  />
                  <Label
                    htmlFor="ctrl-layer-nrm"
                    className="text-sm font-normal cursor-pointer"
                  >
                    NRM Regions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ctrl-layer-ibra"
                    checked={store.state.visibleLayerTypes.includes("ibra")}
                    onCheckedChange={() => store.toggleLayerType("ibra")}
                  />
                  <Label
                    htmlFor="ctrl-layer-ibra"
                    className="text-sm font-normal cursor-pointer"
                  >
                    IBRA Regions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ctrl-layer-imcra"
                    checked={store.state.visibleLayerTypes.includes("imcra")}
                    onCheckedChange={() => store.toggleLayerType("imcra")}
                  />
                  <Label
                    htmlFor="ctrl-layer-imcra"
                    className="text-sm font-normal cursor-pointer"
                  >
                    IMCRA Regions
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Display Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Display Options</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ctrl-show-labels"
                    checked={store.state.showLabels}
                    onCheckedChange={() => store.toggleLabels()}
                  />
                  <Label
                    htmlFor="ctrl-show-labels"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Show Region Labels
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ctrl-show-colors"
                    checked={store.state.showColors}
                    onCheckedChange={() => store.toggleColors()}
                  />
                  <Label
                    htmlFor="ctrl-show-colors"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Show Region Colors
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
