import { useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import type { Map as LeafletMapType } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapStore } from "@/app/stores/store-context";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useGeoJSON } from "@/features/projects/hooks/useGeoJSON";
import { calculateProjectCoordinates } from "@/features/projects/utils/coordinate-calculation";
import { clusterProjects } from "@/features/projects/utils/clustering";
import { applyCombinedFilters } from "@/features/projects/utils/map-filters";
import { ProjectMarker } from "./ProjectMarker";
import { RegionLayer } from "./RegionLayer";
import { RegionLabel } from "./RegionLabel";
import { MapControls } from "./MapControls";
import { GEOJSON_PROPERTY_NAMES } from "@/features/projects/types/map.types";
import type { LayerType } from "@/app/stores/derived/map.store";

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
 * Mapping from LayerType to GeoJSON data keys
 */
const LAYER_TO_GEOJSON_KEY: Record<LayerType, keyof typeof GEOJSON_PROPERTY_NAMES> = {
  dbca_regions: "dbcaRegions",
  dbca_districts: "dbcaDistricts",
  nrm_regions: "nrm",
  ibra_regions: "ibra",
  imcra_regions: "imcra",
};

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
export const FullMapContainer = observer(() => {
  const store = useMapStore();
  const mapRef = useRef<LeafletMapType | null>(null);

  // Fetch data
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: geoJsonData, loading: geoJsonLoading } = useGeoJSON();

  const projects = useMemo(() => projectsData?.projects || [], [projectsData]);

  // Apply filters
  const { projectsWithFilterFlag } = useMemo(() => {
    return applyCombinedFilters(
      projects,
      store.searchTerm,
      store.selectedBusinessAreas
    );
  }, [projects, store.searchTerm, store.selectedBusinessAreas]);

  // Calculate coordinates for all projects using the original function
  const projectsWithCoords = useMemo(() => {
    if (!geoJsonData) return [];
    
    return calculateProjectCoordinates(
      projectsWithFilterFlag.map((p) => p.project),
      [], // locationMetadata not needed with new implementation
      geoJsonData
    );
  }, [projectsWithFilterFlag, geoJsonData]);

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

  if (projectsLoading || geoJsonLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="text-lg font-medium">Loading map...</div>
          <div className="text-sm text-muted-foreground mt-2">
            Fetching projects and region data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <LeafletMap
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render region layers */}
        {geoJsonData && store.visibleLayersList.map((layerType) => {
          const geoJsonKey = LAYER_TO_GEOJSON_KEY[layerType];
          const layerData = geoJsonData[geoJsonKey];

          if (!layerData) return null;

          return (
            <RegionLayer
              key={layerType}
              layerType={layerType}
              geoJsonData={layerData}
              showColors={store.showColors}
            />
          );
        })}

        {/* Render region labels */}
        {geoJsonData && store.showLabels &&
          store.visibleLayersList.map((layerType) => {
            const geoJsonKey = LAYER_TO_GEOJSON_KEY[layerType];
            const layerData = geoJsonData[geoJsonKey];
            const propertyName = GEOJSON_PROPERTY_NAMES[geoJsonKey];

            if (!layerData) return null;

            return layerData.features.map((feature, index) => (
              <RegionLabel
                key={`${layerType}-label-${index}`}
                feature={feature}
                layerType={layerType}
                propertyName={propertyName}
                onLabelClick={handleLabelClick}
              />
            ));
          })}

        {/* Render project markers */}
        {Array.from(clusters.values()).map((cluster, index) => {
          // Check if any project in this cluster is filtered
          const isFiltered = cluster.projects.some((project) => {
            const item = projectsWithFilterFlag.find((p) => p.project.id === project.id);
            return item?.isFiltered || false;
          });

          return (
            <ProjectMarker
              key={`cluster-${cluster.coords[0]}-${cluster.coords[1]}-${index}`}
              projects={cluster.projects}
              position={cluster.coords}
              isFiltered={isFiltered}
            />
          );
        })}
      </LeafletMap>
      
      {/* Floating controls button */}
      <MapControls />
    </div>
  );
});

FullMapContainer.displayName = "FullMapContainer";
