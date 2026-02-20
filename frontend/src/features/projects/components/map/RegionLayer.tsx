import { GeoJSON } from "react-leaflet";
import { useMap } from "react-leaflet";
import type { PathOptions } from "leaflet";
import L from "leaflet";

interface RegionLayerProps {
	layerType: string;
	geoJsonData: GeoJSON.FeatureCollection;
	showColors: boolean;
}

/**
 * Layer colors for each region type
 */
const LAYER_COLORS: Record<string, string> = {
	dbcaregion: "#3b82f6", // blue-500
	dbcadistrict: "#8b5cf6", // purple-500
	nrm: "#10b981", // green-500
	ibra: "#f59e0b", // orange-500
	imcra: "#ef4444", // red-500
};

/**
 * RegionLayer component
 *
 * Renders GeoJSON boundaries for a region layer with enhanced interactivity.
 * Features:
 * - Semi-transparent fill if showColors is true
 * - Solid border always visible
 * - Different color per layer type
 * - Hover effects for region highlighting
 * - Click-to-zoom functionality
 * - Smooth transitions
 */
export const RegionLayer = ({
	layerType,
	geoJsonData,
	showColors,
}: RegionLayerProps) => {
	const map = useMap();
	const color = LAYER_COLORS[layerType];

	const style: PathOptions = {
		fillColor: color,
		fillOpacity: showColors ? 0.2 : 0,
		color: color,
		weight: 2,
		opacity: 1,
	};

	// Enhanced event handlers for interactivity
	const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
		if (layer instanceof L.Path) {
			// Store original style
			const originalStyle = { ...style };

			// CRITICAL: Immediately make non-focusable when layer is created
			const element = (layer as any)._path;
			if (element) {
				element.setAttribute("tabindex", "-1");
				element.setAttribute("aria-hidden", "true");
				element.setAttribute("focusable", "false");
				element.style.outline = "none";
				element.style.pointerEvents = "auto"; // Keep mouse events
			}

			// Hover effects only (no keyboard interaction)
			layer.on({
				mouseover: (e) => {
					const target = e.target;
					target.setStyle({
						weight: 3,
						fillOpacity: showColors ? 0.4 : 0.1,
						opacity: 1,
					});
					target.bringToFront();
				},
				mouseout: (e) => {
					const target = e.target;
					target.setStyle(originalStyle);
				},
				click: (e) => {
					// Click-to-zoom functionality
					const target = e.target;
					const bounds = target.getBounds();
					if (bounds && bounds.isValid()) {
						map.fitBounds(bounds, {
							padding: [20, 20],
							maxZoom: 10, // Prevent zooming too far in
						});
					}
				},
				add: () => {
					// Double-check attributes after add event
					const el = (layer as any)._path;
					if (el) {
						el.setAttribute("tabindex", "-1");
						el.setAttribute("aria-hidden", "true");
						el.setAttribute("focusable", "false");
						el.style.outline = "none";
					}
				},
			});

			// Add tooltip with region name if available (hover only, not on focus)
			const regionName =
				feature.properties?.name ||
				feature.properties?.NAME ||
				feature.properties?.DRG_REGION_NAME ||
				feature.properties?.DDT_DISTRICT_NAME ||
				feature.properties?.NRG_REGION_NAME ||
				feature.properties?.IWA_REG_NAME_6 ||
				feature.properties?.MESO_NAME ||
				"Unknown Region";

			if (regionName && regionName !== "Unknown Region") {
				// CRITICAL: Bind tooltip but make it non-interactive
				const tooltip = layer.bindTooltip(regionName, {
					permanent: false,
					direction: "center",
					className: "region-tooltip",
					interactive: false, // Prevent tooltip from being interactive
				});

				// Make tooltip element non-focusable
				layer.on("tooltipopen", () => {
					const tooltipElement = (tooltip as any)._tooltip?._container;
					if (tooltipElement) {
						tooltipElement.setAttribute("tabindex", "-1");
						tooltipElement.setAttribute("aria-hidden", "true");
						tooltipElement.style.pointerEvents = "none";
					}
				});
			}
		}
	};

	return (
		<GeoJSON
			key={`${layerType}-${showColors}`} // Re-render when showColors changes
			data={geoJsonData}
			style={style}
			onEachFeature={onEachFeature}
		/>
	);
};
