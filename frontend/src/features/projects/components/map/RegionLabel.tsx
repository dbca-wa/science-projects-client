import { Marker } from "react-leaflet";
import L from "leaflet";

interface RegionLabelProps {
	feature: GeoJSON.Feature;
	layerType: string;
	propertyName: string;
	onLabelClick?: (bounds: L.LatLngBounds) => void;
}

/**
 * Calculate the centroid of a GeoJSON feature
 */
function calculateCentroid(feature: GeoJSON.Feature): [number, number] | null {
	try {
		const layer = L.geoJSON(feature);
		const bounds = layer.getBounds();

		if (!bounds || !bounds.isValid()) {
			return null;
		}

		const center = bounds.getCenter();
		return [center.lat, center.lng];
	} catch (error) {
		console.error(
			"Error calculating centroid:",
			error instanceof Error ? error.message : String(error)
		);
		return null;
	}
}

/**
 * RegionLabel component
 *
 * Renders clickable text labels for regions.
 * - Positioned at the centroid of the region polygon
 * - Click handler zooms to region bounds
 * - Styled based on layer type
 */
export const RegionLabel = ({
	feature,
	propertyName,
	onLabelClick,
}: Omit<RegionLabelProps, "layerType">) => {
	const centroid = calculateCentroid(feature);

	if (!centroid) {
		return null;
	}

	const name = feature.properties?.[propertyName] || "Unknown";

	// Ensure name is a string (handle cases where property might be an object)
	const nameStr = typeof name === "string" ? name : String(name);

	// Create custom DivIcon for the label
	const icon = L.divIcon({
		className: "region-label-icon",
		html: `
      <div class="region-label" style="
        background: rgba(255, 255, 255, 0.9);
        padding: 4px 8px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        user-select: none;
      ">
        ${nameStr}
      </div>
    `,
		iconSize: undefined,
		iconAnchor: undefined,
	});

	const handleClick = () => {
		if (onLabelClick) {
			try {
				const layer = L.geoJSON(feature);
				const bounds = layer.getBounds();
				if (bounds && bounds.isValid()) {
					onLabelClick(bounds);
				}
			} catch (error) {
				console.error(
					"Error getting bounds for label click:",
					error instanceof Error ? error.message : String(error)
				);
			}
		}
	};

	return (
		<Marker
			position={centroid}
			icon={icon}
			eventHandlers={{
				click: handleClick,
			}}
		/>
	);
};
