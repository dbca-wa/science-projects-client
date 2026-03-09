import { useRef, useEffect, useMemo } from "react";
import { MapContainer as LeafletMap, TileLayer, GeoJSON } from "react-leaflet";
import type { Map as LeafletMapType } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGeoJSON } from "@/features/projects/hooks/useGeoJSON";
import { useProjectAreas } from "@/shared/hooks/queries/useProjectAreas";
import { MAP_CONFIG } from "@/features/projects/components/map/map-utils";
import { Spinner } from "@/shared/components/ui/spinner";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface MapAreaSelectorProps {
	selectedAreas: number[];
	onAreasChange: (areas: number[]) => void;
}

/**
 * MapAreaSelector component
 *
 * Interactive map for selecting project areas visually.
 * Features:
 * - Displays all project areas as GeoJSON overlays
 * - Click to select/deselect areas
 * - Visual distinction for selected areas (green) vs unselected (blue)
 * - Hover tooltips showing area names
 * - Fallback to list view on error
 */
export const MapAreaSelector = ({
	selectedAreas,
	onAreasChange,
}: MapAreaSelectorProps) => {
	const mapRef = useRef<LeafletMapType | null>(null);

	// Fetch GeoJSON data and project areas
	const {
		data: geoJsonData,
		loading: geoJsonLoading,
		error: geoJsonError,
	} = useGeoJSON();
	const {
		data: projectAreas,
		isLoading: areasLoading,
		error: areasError,
	} = useProjectAreas();

	// Create a map of area names to IDs for lookup
	const areaNameToId = useMemo(() => {
		if (!projectAreas) return new Map<string, number>();

		const map = new Map<string, number>();
		for (const area of projectAreas) {
			map.set(area.area_name.toLowerCase(), area.id);
		}
		return map;
	}, [projectAreas]);

	// Handle area selection toggle
	const toggleArea = (areaId: number) => {
		if (selectedAreas.includes(areaId)) {
			// Deselect
			onAreasChange(selectedAreas.filter((id) => id !== areaId));
		} else {
			// Select
			onAreasChange([...selectedAreas, areaId]);
		}
	};

	// Style function for GeoJSON features
	const getFeatureStyle = (areaId: number | null) => {
		const isSelected = areaId !== null && selectedAreas.includes(areaId);

		return {
			fillColor: isSelected ? "#10b981" : "#3b82f6", // green if selected, blue if not
			fillOpacity: isSelected ? 0.6 : 0.3,
			color: isSelected ? "#059669" : "#2563eb", // border color
			weight: isSelected ? 3 : 2,
			opacity: 1,
		};
	};

	// Handle feature click
	const onEachFeature = (
		feature: GeoJSON.Feature,
		layer: L.Layer,
		propertyName: string
	) => {
		// Get area name from feature properties
		const areaName = feature.properties?.[propertyName];
		if (!areaName) return;

		// Look up area ID
		const areaId = areaNameToId.get(areaName.toLowerCase());
		if (!areaId) {
			console.warn(`No area ID found for: ${areaName}`);
			return;
		}

		// Add tooltip
		layer.bindTooltip(areaName, {
			sticky: true,
			direction: "top",
		});

		// Add click handler
		layer.on("click", () => {
			toggleArea(areaId);
		});

		// Add hover effect
		layer.on("mouseover", () => {
			if (layer instanceof L.Path) {
				layer.setStyle({
					weight: 4,
					opacity: 1,
				});
			}
		});

		layer.on("mouseout", () => {
			if (layer instanceof L.Path) {
				const isSelected = selectedAreas.includes(areaId);
				layer.setStyle({
					weight: isSelected ? 3 : 2,
					opacity: 1,
				});
			}
		});
	};

	// Handle window resize
	useEffect(() => {
		const handleResize = () => {
			if (mapRef.current) {
				setTimeout(() => {
					mapRef.current?.invalidateSize();
				}, 100);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (mapRef.current) {
				mapRef.current.off();
				mapRef.current.eachLayer((layer) => {
					mapRef.current?.removeLayer(layer);
				});
				mapRef.current = null;
			}
		};
	}, []);

	// Loading state
	if (geoJsonLoading || areasLoading) {
		return (
			<div className="w-full h-[400px] flex items-center justify-center bg-muted rounded-md">
				<div className="text-center space-y-4">
					<Spinner className="size-8 mx-auto text-blue-600" />
					<div className="text-sm font-medium">Loading map...</div>
				</div>
			</div>
		);
	}

	// Error state
	if (geoJsonError || areasError) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Unable to load map. Please use the list below to select areas.
					{(geoJsonError || areasError) && (
						<div className="text-xs mt-1">
							{geoJsonError || areasError?.message}
						</div>
					)}
				</AlertDescription>
			</Alert>
		);
	}

	// No GeoJSON data available
	if (!geoJsonData || !projectAreas) {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					Map data not available. Please use the list below to select areas.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="w-full h-[400px] rounded-md overflow-hidden border border-border">
			<LeafletMap
				center={MAP_CONFIG.center}
				zoom={MAP_CONFIG.zoom}
				minZoom={MAP_CONFIG.minZoom}
				maxZoom={MAP_CONFIG.maxZoom}
				style={{ height: "100%", width: "100%" }}
				ref={(map) => {
					if (map && !mapRef.current) {
						mapRef.current = map;
					}
				}}
				zoomControl={true}
				attributionControl={false}
			>
				<TileLayer
					attribution=""
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* Render all GeoJSON layers */}
				{geoJsonData.dbcaRegions && (
					<GeoJSON
						key={`dbca-regions-${selectedAreas.join(",")}`}
						data={geoJsonData.dbcaRegions}
						style={(feature) => {
							if (!feature) return {};
							const areaName = feature.properties?.DRG_REGION_NAME;
							const areaId = areaName
								? (areaNameToId.get(areaName.toLowerCase()) ?? null)
								: null;
							return getFeatureStyle(areaId);
						}}
						onEachFeature={(feature, layer) =>
							onEachFeature(feature, layer, "DRG_REGION_NAME")
						}
					/>
				)}

				{geoJsonData.dbcaDistricts && (
					<GeoJSON
						key={`dbca-districts-${selectedAreas.join(",")}`}
						data={geoJsonData.dbcaDistricts}
						style={(feature) => {
							if (!feature) return {};
							const areaName = feature.properties?.DDT_DISTRICT_NAME;
							const areaId = areaName
								? (areaNameToId.get(areaName.toLowerCase()) ?? null)
								: null;
							return getFeatureStyle(areaId);
						}}
						onEachFeature={(feature, layer) =>
							onEachFeature(feature, layer, "DDT_DISTRICT_NAME")
						}
					/>
				)}

				{geoJsonData.nrm && (
					<GeoJSON
						key={`nrm-${selectedAreas.join(",")}`}
						data={geoJsonData.nrm}
						style={(feature) => {
							if (!feature) return {};
							const areaName = feature.properties?.NRG_REGION_NAME;
							const areaId = areaName
								? (areaNameToId.get(areaName.toLowerCase()) ?? null)
								: null;
							return getFeatureStyle(areaId);
						}}
						onEachFeature={(feature, layer) =>
							onEachFeature(feature, layer, "NRG_REGION_NAME")
						}
					/>
				)}

				{geoJsonData.ibra && (
					<GeoJSON
						key={`ibra-${selectedAreas.join(",")}`}
						data={geoJsonData.ibra}
						style={(feature) => {
							if (!feature) return {};
							const areaName = feature.properties?.IWA_SUB_NAME_7;
							const areaId = areaName
								? (areaNameToId.get(areaName.toLowerCase()) ?? null)
								: null;
							return getFeatureStyle(areaId);
						}}
						onEachFeature={(feature, layer) =>
							onEachFeature(feature, layer, "IWA_SUB_NAME_7")
						}
					/>
				)}

				{geoJsonData.imcra && (
					<GeoJSON
						key={`imcra-${selectedAreas.join(",")}`}
						data={geoJsonData.imcra}
						style={(feature) => {
							if (!feature) return {};
							const areaName = feature.properties?.MESO_NAME;
							const areaId = areaName
								? (areaNameToId.get(areaName.toLowerCase()) ?? null)
								: null;
							return getFeatureStyle(areaId);
						}}
						onEachFeature={(feature, layer) =>
							onEachFeature(feature, layer, "MESO_NAME")
						}
					/>
				)}
			</LeafletMap>
		</div>
	);
};
