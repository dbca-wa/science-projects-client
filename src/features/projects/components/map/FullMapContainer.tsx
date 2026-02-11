import { useMemo, useRef, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
	MapContainer as LeafletMap,
	TileLayer,
	useMapEvents,
} from "react-leaflet";
import type { Map as LeafletMapType } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useProjectMapStore } from "@/app/stores/store-context";
import { useProjectsForMap } from "@/features/projects/hooks/useProjectsForMap";
import { useGeoJSON } from "@/features/projects/hooks/useGeoJSON";
import { calculateProjectCoordinates } from "@/features/projects/utils/coordinate-calculation";
import { clusterProjects } from "@/features/projects/utils/clustering";
import { ProjectMarker } from "./ProjectMarker";
import { HeatmapLayer } from "./HeatmapLayer";
import { RegionLayer } from "./RegionLayer";
import { RegionLabel } from "./RegionLabel";
import { MapControls } from "./MapControls";
import { MapStats } from "./MapStats";
import { Spinner } from "@/shared/components/ui/spinner";
import { GEOJSON_PROPERTY_NAMES } from "@/features/projects/types/map.types";

/**
 * Map configuration
 */
const MAP_CONFIG = {
	center: [-25.2744, 122.2402] as [number, number],
	zoom: 6,
	minZoom: 5,
	maxZoom: 18,
};

/**
 * MapClickHandler component
 *
 * Handles map click events to clear marker selection and custom double-click zoom
 */
const MapClickHandler = () => {
	const store = useProjectMapStore();

	const map = useMapEvents({
		click: () => {
			store.clearMarkerSelection();
		},
		dblclick: (e) => {
			// Check if the double-click originated from a button or control element
			const target = e.originalEvent.target as HTMLElement;

			// Check if click is on a button, control, or their children
			const isOnControl =
				target.closest("button") ||
				target.closest(".leaflet-control") ||
				target.closest('[role="dialog"]') || // Popovers
				target.closest("[data-radix-popper-content-wrapper]"); // Radix popovers

			// Only zoom if NOT on a control
			if (!isOnControl) {
				map.zoomIn();
			}
		},
	});

	return null;
};

/**
 * Mapping from layer type strings to GeoJSON data keys
 */
const LAYER_TO_GEOJSON_KEY: Record<
	string,
	keyof typeof GEOJSON_PROPERTY_NAMES
> = {
	dbcaregion: "dbcaRegions",
	dbcadistrict: "dbcaDistricts",
	nrm: "nrm",
	ibra: "ibra",
	imcra: "imcra",
};

interface FullMapContainerProps {
	fullscreen?: boolean;
	projectCount?: number;
	totalProjects?: number;
	projectsWithoutLocation?: number;
}

/**
 * FullMapContainer component
 *
 * Main map component that:
 * - Initializes Leaflet map centered on WA
 * - Fetches projects and GeoJSON data
 * - Computes filtered projects based on store state
 * - Computes clustered markers
 * - Renders markers, layers, and labels
 * - Uses observer for reactive updates
 * - Ensures map instance persists across filter changes
 * - Includes floating MapControls button
 */
export const FullMapContainer = observer(
	({
		fullscreen = false,
		projectCount = 0,
		totalProjects = 0,
		projectsWithoutLocation = 0,
	}: FullMapContainerProps) => {
		const store = useProjectMapStore();
		const mapRef = useRef<LeafletMapType | null>(null);

		// Fetch data with reactive filters
		const {
			data: mapData,
			isLoading: projectsLoading,
			error: projectsError,
		} = useProjectsForMap(store.apiParams);
		const { data: geoJsonData, loading: geoJsonLoading } = useGeoJSON();

		const projects = mapData?.projects || [];

		// Calculate coordinates for all projects using the original function
		const projectsWithCoords = useMemo(() => {
			if (!geoJsonData) return [];

			return calculateProjectCoordinates(
				projects,
				[], // locationMetadata not needed with new implementation
				geoJsonData
			);
		}, [projects, geoJsonData]);

		// Cluster projects
		const clusters = useMemo(() => {
			return clusterProjects(projectsWithCoords);
		}, [projectsWithCoords]);

		// Handle label click to zoom to region
		const handleLabelClick = (bounds: L.LatLngBounds) => {
			if (mapRef.current) {
				mapRef.current.fitBounds(bounds, { padding: [50, 50] });
			}
		};

		// Handle window resize events
		useEffect(() => {
			const handleResize = () => {
				if (mapRef.current) {
					// Invalidate map size after a short delay to ensure container has resized
					setTimeout(() => {
						mapRef.current?.invalidateSize();
					}, 100);
				}
			};

			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}, []);

		// Cleanup on unmount - prevent memory leaks
		useEffect(() => {
			return () => {
				if (mapRef.current) {
					// Clear all event listeners
					mapRef.current.off();

					// Remove all layers
					mapRef.current.eachLayer((layer) => {
						mapRef.current?.removeLayer(layer);
					});

					// Remove the map instance
					mapRef.current.remove();
					mapRef.current = null;
				}
			};
		}, []);

		if (projectsLoading || geoJsonLoading) {
			return (
				<div
					className={`${fullscreen ? "w-full h-full" : "flex-1"} flex items-center justify-center bg-muted`}
				>
					<div className="text-center space-y-4">
						<Spinner className="size-8 mx-auto text-blue-600" />
						<div className="text-lg font-medium">Loading map...</div>
						<div className="text-sm text-muted-foreground">
							{projectsLoading && geoJsonLoading
								? "Fetching projects and region data"
								: projectsLoading
									? "Loading project data"
									: "Loading map layers"}
						</div>
					</div>
				</div>
			);
		}

		if (projectsError) {
			return (
				<div
					className={`${fullscreen ? "w-full h-full" : "flex-1"} flex items-center justify-center bg-muted`}
				>
					<div className="text-center space-y-4 max-w-md">
						<div className="text-4xl">⚠️</div>
						<div className="text-lg font-medium text-red-600">
							Error loading projects
						</div>
						<div className="text-sm text-muted-foreground">
							Unable to load project data for the map. Please try refreshing the
							page.
						</div>
					</div>
				</div>
			);
		}

		return (
			<div
				className={`${fullscreen ? "w-full h-full" : "flex-1 min-h-[375px] sm:min-h-[400px]"} relative z-10 rounded-md overflow-hidden`}
			>
				<LeafletMap
					center={MAP_CONFIG.center}
					zoom={MAP_CONFIG.zoom}
					minZoom={MAP_CONFIG.minZoom}
					maxZoom={MAP_CONFIG.maxZoom}
					style={{ height: "100%", width: "100%" }}
					ref={mapRef}
					zoomControl={false} // Disable default zoom controls since we have custom ones
					attributionControl={false} // Disable attribution control
					doubleClickZoom={false} // Disable double-click zoom to prevent button clicks from zooming
				>
					<MapClickHandler />
					<TileLayer
						attribution=""
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

					{/* Render region layers */}
					{geoJsonData &&
						store.state.visibleLayerTypes.map((layerType) => {
							const geoJsonKey = LAYER_TO_GEOJSON_KEY[layerType];
							const layerData = geoJsonData[geoJsonKey];

							if (!layerData) return null;

							return (
								<RegionLayer
									key={layerType}
									layerType={layerType}
									geoJsonData={layerData}
									showColors={store.state.showColors}
								/>
							);
						})}

					{/* Render region labels */}
					{geoJsonData &&
						store.state.showLabels &&
						store.state.visibleLayerTypes.map((layerType) => {
							const geoJsonKey = LAYER_TO_GEOJSON_KEY[layerType];
							const layerData = geoJsonData[geoJsonKey];
							const propertyName = GEOJSON_PROPERTY_NAMES[geoJsonKey];

							if (!layerData) return null;

							return layerData.features.map((feature, index) => (
								<RegionLabel
									key={`${layerType}-label-${index}`}
									feature={feature}
									propertyName={propertyName}
									onLabelClick={handleLabelClick}
								/>
							));
						})}

					{/* Conditional rendering based on visualization mode */}
					{store.isMarkerMode &&
						/* Render project markers */
						Array.from(clusters.values()).map((cluster, index) => (
							<ProjectMarker
								key={`cluster-${cluster.coords[0]}-${cluster.coords[1]}-${index}`}
								projects={cluster.projects}
								position={cluster.coords}
							/>
						))}

					{store.isHeatmapMode && geoJsonData && (
						/* Render heatmap layer */
						<HeatmapLayer
							projects={projects}
							geoJsonData={geoJsonData}
							isVisible={true}
						/>
					)}

					{/* Map controls inside the map container */}
					<MapControls />
				</LeafletMap>

				{/* Map statistics overlay - only show in normal (non-fullscreen) mode */}
				{!fullscreen && (
					<MapStats
						projectCount={projectCount}
						totalProjects={totalProjects}
						projectsWithoutLocation={projectsWithoutLocation}
					/>
				)}
			</div>
		);
	}
);

FullMapContainer.displayName = "FullMapContainer";
