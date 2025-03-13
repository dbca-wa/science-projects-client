import { Head } from "@/components/Base/Head";
// import MapHeatmapToggle from "@/components/Map/HeatMapToggle";
import MapBackAndSearch from "@/components/Map/MapBackAndSearch";
import MapBusinessAreasSidebar from "@/components/Map/MapBusinessAreasSidebar";
// import MapHeatLayer from "@/components/Map/MapHeatLayer"; // Import new component
import MapLocationsSidebar from "@/components/Map/MapLocationsSidebar";
import MapTopRightControls from "@/components/Map/MapTopRightControls";
import { useProjectMapSearchContext } from "@/lib/hooks/helper/ProjectMapSearchContext";
import { useBusinessAreas } from "@/lib/hooks/tanstack/useBusinessAreas";
import { useGetLocations } from "@/lib/hooks/tanstack/useGetLocations";
import { useGetLocationsGeojson } from "@/lib/hooks/tanstack/useGetLocationsGeojson";
import { IBusinessArea } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { use, useEffect, useRef, useState } from "react";

const ProjectsMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);

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
        className="absolute bottom-0 left-96 right-0 top-0 z-40"
      />

      {isMapLoading && (
        <div className="absolute bottom-0 left-96 right-0 top-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
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
      <div className="absolute left-0 top-0 z-50 h-full w-96 overflow-y-auto bg-white shadow-lg">
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
