import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import type { FeatureCollection } from "geojson";

interface GeoJSONLayerProps {
	data: FeatureCollection;
	visible: boolean;
	showLabels: boolean;
	showColors: boolean;
	color?: string;
	layerName: string;
}

/**
 * GeoJSONLayer component
 * 
 * Renders a GeoJSON layer on the map with interactive features.
 * 
 * Features:
 * - Semi-transparent fill with white dashed borders
 * - Hover effects (increased opacity and border weight)
 * - Click to zoom to region with 100px padding
 * - Optional labels showing region names
 * - Optional colors for different regions
 * - Visibility toggle
 */
export function GeoJSONLayer({
	data,
	visible,
	showLabels,
	showColors,
	color = "#3b82f6",
	layerName,
}: GeoJSONLayerProps) {
	const map = useMap();
	const layerRef = useRef<L.GeoJSON | null>(null);
	const labelsRef = useRef<L.LayerGroup | null>(null);

	useEffect(() => {
		if (!map || !visible) {
			// Remove layer if not visible
			if (layerRef.current) {
				map.removeLayer(layerRef.current);
				layerRef.current = null;
			}
			if (labelsRef.current) {
				map.removeLayer(labelsRef.current);
				labelsRef.current = null;
			}
			return;
		}

		// Create GeoJSON layer
		const geoJsonLayer = L.geoJSON(data, {
			style: (feature) => {
				// Use feature color if showColors is enabled, otherwise use default
				const fillColor = showColors && feature?.properties?.color
					? feature.properties.color
					: color;

				return {
					fillColor,
					fillOpacity: 0.2,
					color: "#ffffff",
					weight: 2,
					dashArray: "5, 5",
				};
			},
			onEachFeature: (feature, layer) => {
				// Add hover effects
				layer.on({
					mouseover: (e) => {
						const target = e.target;
						target.setStyle({
							fillOpacity: 0.4,
							weight: 3,
						});
					},
					mouseout: (e) => {
						const target = e.target;
						target.setStyle({
							fillOpacity: 0.2,
							weight: 2,
						});
					},
					click: () => {
						// Zoom to region with 100px padding
						if (layer instanceof L.Layer && "getBounds" in layer) {
							const bounds = (layer as L.Polygon).getBounds();
							map.fitBounds(bounds, { padding: [100, 100] });
						}
					},
				});

				// Add tooltip with region name
				if (feature.properties?.name) {
					layer.bindTooltip(feature.properties.name, {
						permanent: false,
						direction: "center",
						className: "region-tooltip",
					});
				}
			},
		});

		// Add layer to map
		geoJsonLayer.addTo(map);
		layerRef.current = geoJsonLayer;

		// Create labels layer if showLabels is enabled
		if (showLabels) {
			const labelsLayer = L.layerGroup();

			data.features.forEach((feature) => {
				if (feature.properties?.name && feature.geometry.type === "Polygon") {
					// Calculate center of polygon
					const coords = feature.geometry.coordinates[0] as [number, number][];
					const latlngs = coords.map(([lng, lat]) => L.latLng(lat, lng));
					const bounds = L.latLngBounds(latlngs);
					const center = bounds.getCenter();

					// Create label marker
					const label = L.marker(center, {
						icon: L.divIcon({
							className: "region-label",
							html: `<div class="region-label-text">${feature.properties.name}</div>`,
							iconSize: [100, 20],
						}),
						interactive: false,
					});

					label.addTo(labelsLayer);
				}
			});

			labelsLayer.addTo(map);
			labelsRef.current = labelsLayer;
		}

		// Cleanup function
		return () => {
			if (layerRef.current) {
				map.removeLayer(layerRef.current);
				layerRef.current = null;
			}
			if (labelsRef.current) {
				map.removeLayer(labelsRef.current);
				labelsRef.current = null;
			}
		};
	}, [map, data, visible, showLabels, showColors, color, layerName]);

	return null;
}
