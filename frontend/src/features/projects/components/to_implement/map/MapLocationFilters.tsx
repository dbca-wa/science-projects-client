import { observer } from "mobx-react-lite";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useMapStore } from "@/app/stores/store-context";
import type { LayerType } from "@/app/stores/derived/map.store";

/**
 * Layer configuration with display names
 */
const LAYERS: Array<{ type: LayerType; label: string }> = [
  { type: "dbca_regions", label: "DBCA Regions" },
  { type: "dbca_districts", label: "DBCA Districts" },
  { type: "nrm_regions", label: "NRM Regions" },
  { type: "ibra_regions", label: "IBRA Regions" },
  { type: "imcra_regions", label: "IMCRA Regions" },
];

/**
 * MapLocationFilters component
 * 
 * Region layer visibility toggles.
 * Each checkbox controls the visibility of a specific GeoJSON layer.
 */
export const MapLocationFilters = observer(() => {
  const store = useMapStore();

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Region Layers</div>
      <div className="space-y-2">
        {LAYERS.map(({ type, label }) => {
          const isChecked = store.visibleLayers.has(type);
          return (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`layer-${type}`}
                checked={isChecked}
                onCheckedChange={() => store.toggleLayer(type)}
              />
              <label
                htmlFor={`layer-${type}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
});

MapLocationFilters.displayName = "MapLocationFilters";
