import { useMemo, useRef, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import type { Map as LeafletMapType } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map-accessibility.css"; // Custom CSS for map accessibility
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
import { ZoomLevel } from "./ZoomLevel";
import { MapClickHandler } from "./MapClickHandler";
import { MAP_CONFIG, LAYER_TO_GEOJSON_KEY } from "./map-utils";
import { Spinner } from "@/shared/components/ui/spinner";
import { GEOJSON_PROPERTY_NAMES } from "@/features/projects/types/map.types";

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
		const [currentZoom, setCurrentZoom] = useState<number>(MAP_CONFIG.zoom);
		const [mapReady, setMapReady] = useState(false);

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

		// Expose map instance to window for MapControls (when rendered outside map)
		useEffect(() => {
			if (mapRef.current) {
				(window as Window & { __leafletMap?: LeafletMapType }).__leafletMap =
					mapRef.current;
				setMapReady(true);
			}
			return () => {
				const w = window as Window & { __leafletMap?: LeafletMapType };
				delete w.__leafletMap;
				setMapReady(false);
			};
		}, [mapReady]);

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

					// Don't call remove() - let React Leaflet handle it
					mapRef.current = null;
				}
			};
		}, []);

		// CRITICAL: Make ALL Leaflet elements non-focusable except project markers
		useEffect(() => {
			if (!mapRef.current) return;

			const makeNonFocusable = () => {
				const mapContainer = mapRef.current?.getContainer();
				if (!mapContainer) return;

				// Find ALL elements in the map
				const allElements = mapContainer.querySelectorAll("*");

				allElements.forEach((element) => {
					if (element instanceof HTMLElement || element instanceof SVGElement) {
						// Skip project markers - they should be focusable
						if (element.classList.contains("project-marker")) {
							return;
						}

						// Make everything else non-focusable
						element.setAttribute("tabindex", "-1");
						element.setAttribute("aria-hidden", "true");

						// For images (tiles)
						if (element instanceof HTMLImageElement) {
							element.setAttribute("tabindex", "-1");
							element.style.pointerEvents = "none";
						}

						// For SVG elements
						if (element instanceof SVGElement) {
							element.setAttribute("focusable", "false");
						}
					}
				});
			};

			// Run immediately
			makeNonFocusable();

			// Run again after a delay to catch dynamically added elements
			const timer = setTimeout(makeNonFocusable, 500);

			// Set up MutationObserver to catch dynamically added tiles
			const mapContainer = mapRef.current.getContainer();
			const observer = new MutationObserver(() => {
				makeNonFocusable();
			});

			observer.observe(mapContainer, {
				childList: true,
				subtree: true,
			});

			// Run on map events that might add new elements
			const map = mapRef.current;
			map.on("layeradd", makeNonFocusable);
			map.on("zoomend", makeNonFocusable);
			map.on("moveend", makeNonFocusable);
			map.on("load", makeNonFocusable);

			// Add global focus listener to log what's getting focus (for debugging)
			const handleFocus = (e: FocusEvent) => {
				const target = e.target as HTMLElement;
				if (
					mapContainer.contains(target) &&
					!target.classList.contains("project-marker")
				) {
					// Uncomment for debugging:
					// console.warn('⚠️ Non-marker element got focus:', {
					// 	element: target,
					// 	tagName: target.tagName,
					// 	className: target.className,
					// 	id: target.id,
					// });
				}
			};

			document.addEventListener("focus", handleFocus, true);

			return () => {
				clearTimeout(timer);
				observer.disconnect();
				map.off("layeradd", makeNonFocusable);
				map.off("zoomend", makeNonFocusable);
				map.off("moveend", makeNonFocusable);
				map.off("load", makeNonFocusable);
				document.removeEventListener("focus", handleFocus, true);
			};
		}, [mapRef.current, clusters]);

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
				{/* Map controls - positioned absolutely OUTSIDE the map container but in correct DOM order */}
				<div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
					<MapControls />
				</div>

				<LeafletMap
					center={MAP_CONFIG.center}
					zoom={MAP_CONFIG.zoom}
					minZoom={MAP_CONFIG.minZoom}
					maxZoom={MAP_CONFIG.maxZoom}
					style={{ height: "100%", width: "100%" }}
					ref={(map) => {
						if (map && !mapRef.current) {
							mapRef.current = map;
							setMapReady(true);
						}
					}}
					zoomControl={false} // Disable default zoom controls since we have custom ones
					attributionControl={false} // Disable attribution control
					doubleClickZoom={false} // Disable double-click zoom to prevent button clicks from zooming
					keyboard={false} // Disable keyboard navigation on map container itself
					tabIndex={-1} // Prevent map container from being focusable
				>
					<MapClickHandler onZoomChange={setCurrentZoom} />
					<TileLayer
						attribution=""
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

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
				</LeafletMap>

				{/* Map statistics - top-left corner, only show in normal (non-fullscreen) mode */}
				{!fullscreen && (
					<div className="absolute top-4 left-4 z-30">
						<MapStats
							projectCount={projectCount}
							totalProjects={totalProjects}
							projectsWithoutLocation={projectsWithoutLocation}
						/>
					</div>
				)}

				{/* Zoom level display - bottom-right corner, show in both modes */}
				<div className="absolute bottom-4 right-4 z-30">
					<ZoomLevel zoomLevel={currentZoom} />
				</div>
			</div>
		);
	}
);

FullMapContainer.displayName = "FullMapContainer";
