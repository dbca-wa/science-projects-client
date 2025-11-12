import { type FC, type ReactNode } from "react";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";

interface MapHeatmapToggleProps {
  showHeatmap: boolean;
  setShowHeatmap: (value: boolean) => void;
}

const MapHeatmapToggle = ({
  showHeatmap,
  setShowHeatmap,
}: MapHeatmapToggleProps) => {
  return (
    <div className="absolute top-4 right-4 z-50 flex items-center space-x-3 rounded-md bg-white p-3 shadow-md">
      <Switch
        id="heatmap-toggle"
        checked={showHeatmap}
        onCheckedChange={setShowHeatmap}
      />
      <Label
        htmlFor="heatmap-toggle"
        className="cursor-pointer text-sm font-medium"
      >
        Show Density Heatmap
      </Label>
    </div>
  );
};

export default MapHeatmapToggle;
