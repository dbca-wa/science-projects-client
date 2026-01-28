import { GeoJSON } from "react-leaflet";
import type { PathOptions } from "leaflet";

interface RegionLayerProps {
  layerType: string;
  geoJsonData: GeoJSON.FeatureCollection;
  showColors: boolean;
}

/**
 * Layer colors for each region type
 */
const LAYER_COLORS: Record<string, string> = {
  dbcaregion: "#3b82f6",      // blue-500
  dbcadistrict: "#8b5cf6",    // purple-500
  nrm: "#10b981",             // green-500
  ibra: "#f59e0b",            // orange-500
  imcra: "#ef4444",           // red-500
};

/**
 * RegionLayer component
 * 
 * Renders GeoJSON boundaries for a region layer.
 * - Semi-transparent fill if showColors is true
 * - Solid border always visible
 * - Different color per layer type
 */
export const RegionLayer = ({
  layerType,
  geoJsonData,
  showColors,
}: RegionLayerProps) => {
  const color = LAYER_COLORS[layerType];

  const style: PathOptions = {
    fillColor: color,
    fillOpacity: showColors ? 0.2 : 0,
    color: color,
    weight: 2,
    opacity: 1,
  };

  return <GeoJSON key={layerType} data={geoJsonData} style={style} />;
};
