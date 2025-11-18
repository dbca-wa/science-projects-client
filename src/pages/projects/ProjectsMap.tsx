import { Head } from "@/shared/components/Base/Head";
// import MapHeatmapToggle from "@/shared/components/Map/HeatMapToggle";
import MapBackAndSearch from "@/shared/components/Map/MapBackAndSearch";
import MapBusinessAreasSidebar from "@/shared/components/Map/MapBusinessAreasSidebar";
// import MapHeatLayer from "@/shared/components/Map/MapHeatLayer"; // Import new component
import MapLocationsSidebar from "@/shared/components/Map/MapLocationsSidebar";
import MapTopRightControls from "@/shared/components/Map/MapTopRightControls";
import { useProjectMapSearchContext } from "@/features/projects/hooks/ProjectMapSearchContext";
import { useBusinessAreas } from "@/shared/hooks/tanstack/useBusinessAreas";
import { useGetLocations } from "@/shared/hooks/tanstack/useGetLocations";
import { useGetLocationsGeojson } from "@/shared/hooks/tanstack/useGetLocationsGeojson";
import type { IBusinessArea } from "@/shared/types/index.d";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

const ProjectsMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const loadingControlRef = useRef<L.Control | null>(null);

  // Add a function to control the map loading state
  const toggleMapLoading = (loading: boolean) => {
    setIsMapLoading(loading);

    // Create or remove a loading control on the map
    if (loading && mapRef.current) {
      if (!loadingControlRef.current) {
        const LoadingControl = L.Control.extend({
          onAdd: function () {
            const container = L.DomUtil.create("div", "map-loading-control");
            container.innerHTML = `
              <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/90 p-4 shadow-lg">
                <div class="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p class="mt-3 text-sm font-medium text-gray-700">Updating map...</p>
              </div>
            `;
            return container;
          },
        });

        loadingControlRef.current = new LoadingControl({
          position: "topright",
        }).addTo(mapRef.current);
      }
    } else if (!loading && loadingControlRef.current) {
      loadingControlRef.current.remove();
      loadingControlRef.current = null;
    }
  };

  // Project Search context
  const {
    setSearchTerm,
    setIsOnProjectsPage,
    searchTerm,
    setCurrentProjectResultsPage,
    setSearchFilters,
    onlyActive,
    onlyInactive,
    filterProjectKind,
    filterProjectStatus,
    filterBA,
    filterYear,
    selectedLocations,
    filteredItems,
    filterUser,
    setSelectedLocations,
  } = useProjectMapSearchContext();

  // Locations State and Selections ================================
  const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } =
    useGetLocationsGeojson();

  const {
    locationsLoading: areaLocationsLoading,
    dbcaRegions: areaDbcaRegions,
    dbcaDistricts: areaDbcaDistricts,
    ibra: areaIbra,
    imcra: areaImcra,
    nrm: areaNrm,
  } = useGetLocations();

  // Business Area State and Selections ================================
  const { baData, baLoading } = useBusinessAreas();
  const [selectedBas, setSelectedBas] = useState<IBusinessArea[]>([]);

  // Update the context with the selected business area ids
  const updateSelectedBas = () => {
    const selectedBasIds = selectedBas.map((ba) => ba.pk);

    // Get all the current filter values from your context (they're already available in your scope)
    setSearchFilters({
      onlyActive,
      onlyInactive,
      filterUser,
      filterBA: selectedBasIds.join(","),
      filterProjectKind,
      filterProjectStatus,
      filterYear,
      selectedLocations,
    });
  };

  useEffect(() => {
    updateSelectedBas();
  }, [selectedBas]);

  return (
    <div className="relative h-screen w-full">
      <Head title="Projects Map" />

      {/* ====== MAP ====== */}
      <div
        ref={mapContainerRef}
        className="absolute top-0 right-0 bottom-0 left-96 z-40"
      />

      {/* Global loading overlay */}
      {isMapLoading && (
        <div className="absolute top-0 right-0 bottom-0 left-96 z-50 flex items-center justify-center bg-white/30 backdrop-blur-xs">
          <div className="flex flex-col items-center rounded-lg bg-white/90 p-4 shadow-lg">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-3 text-sm font-medium text-gray-700">
              Updating map...
            </p>
          </div>
        </div>
      )}

      {/* ====== MAP CONTROLS ====== */}
      <MapTopRightControls mapRef={mapRef} mapContainerRef={mapContainerRef} />

      {/* ====== HEATMAP TOGGLE ====== */}
      {/* <MapHeatmapToggle
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
      /> */}

      {/* ====== SIDEBAR ====== */}
      <div className="absolute top-0 left-0 z-50 h-full w-96 overflow-y-auto bg-white shadow-lg">
        {/* BACK & SEARCH */}
        <MapBackAndSearch
          filteredItems={filteredItems}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setIsOnProjectsPage={setIsOnProjectsPage}
          setCurrentProjectResultsPage={setCurrentProjectResultsPage}
          setSearchFilters={setSearchFilters}
          onlyActive={onlyActive}
          onlyInactive={onlyInactive}
          filterProjectKind={filterProjectKind}
          filterProjectStatus={filterProjectStatus}
          filterBA={filterBA}
          filterYear={filterYear}
          filterUser={filterUser}
          selectedLocations={selectedLocations}
          mapRef={mapRef}
          mapContainerRef={mapContainerRef}
          dbcaRegions={dbcaRegions}
          dbcaDistricts={dbcaDistricts}
          nrm={nrm}
          ibra={ibra}
          imcra={imcra}
          areaDbcaRegions={areaDbcaRegions}
          areaDbcaDistricts={areaDbcaDistricts}
          areaIbra={areaIbra}
          areaImcra={areaImcra}
          areaNrm={areaNrm}
          areaLocationsLoading={areaLocationsLoading}
          toggleMapLoading={toggleMapLoading}
          selectedBas={selectedBas}
        />

        {/* LOCATIONS */}
        <MapLocationsSidebar
          mapRef={mapRef}
          mapContainerRef={mapContainerRef}
          dbcaRegions={dbcaRegions}
          dbcaDistricts={dbcaDistricts}
          nrm={nrm}
          ibra={ibra}
          imcra={imcra}
          locationsLoading={locationsLoading}
          selectedLocations={selectedLocations}
          setFilterLocations={setSelectedLocations}
          // Area data with pks to check project's names and area type against
          areaDbcaRegions={areaDbcaRegions}
          areaDbcaDistricts={areaDbcaDistricts}
          areaIbra={areaIbra}
          areaImcra={areaImcra}
          areaNrm={areaNrm}
          areaLocationsLoading={areaLocationsLoading}
          filteredItems={filteredItems}
          toggleMapLoading={toggleMapLoading}
        />

        {/* BUSINESS AREAS */}
        <MapBusinessAreasSidebar
          mapRef={mapRef}
          mapContainerRef={mapContainerRef}
          filterBA={filterBA}
          baData={baData}
          baLoading={baLoading}
          selectedBas={selectedBas}
          setSelectedBas={setSelectedBas}
          toggleMapLoading={toggleMapLoading}
          setIsMapLoading={setIsMapLoading}
        />
      </div>

      {/* ====== HEATMAP LAYER ====== */}
      {/* {filteredItems && (
        <MapHeatLayer
          projects={filteredItems}
          mapRef={mapRef}
          dbcaRegions={dbcaRegions}
          dbcaDistricts={dbcaDistricts}
          nrm={nrm}
          ibra={ibra}
          imcra={imcra}
          areaDbcaRegions={areaDbcaRegions}
          areaDbcaDistricts={areaDbcaDistricts}
          areaIbra={areaIbra}
          areaImcra={areaImcra}
          areaNrm={areaNrm}
          showHeatmap={showHeatmap}
        />
      )} */}
    </div>
  );
};

export default ProjectsMap;
