import { MapSearchFilters } from "@/lib/hooks/helper/ProjectMapSearchContext";
import { useBusinessAreas } from "@/lib/hooks/tanstack/useBusinessAreas";
import { IBusinessArea, IProjectData, ISimpleLocationData } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import MapSidebarSection from "./MapSidebarSection";
import ProjectMapMarker from "./ProjectMapMarker";
import SearchProjectsByUser from "../Navigation/SearchProjectsByUser";
import { Button } from "../ui/button";

interface MapLocationsSidebarProps {
  filteredItems: IProjectData[];
  mapRef: React.RefObject<L.Map | null>;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setIsOnProjectsPage: (value: boolean) => void;
  setCurrentProjectResultsPage: (value: number) => void;
  setSearchFilters: (filters: MapSearchFilters) => void;
  onlyActive: boolean;
  onlyInactive: boolean;
  filterProjectKind: string;
  filterProjectStatus: string;
  filterBA: string;
  filterUser: number | null;
  filterYear: number;
  selectedLocations: number[];
  dbcaRegions: any;
  dbcaDistricts: any;
  nrm: any;
  ibra: any;
  imcra: any;
  areaDbcaRegions: ISimpleLocationData[];
  areaDbcaDistricts: ISimpleLocationData[];
  areaIbra: ISimpleLocationData[];
  areaImcra: ISimpleLocationData[];
  areaNrm: ISimpleLocationData[];
  areaLocationsLoading: boolean;
  toggleMapLoading: (loading: boolean) => void;
  selectedBas: IBusinessArea[];
}

const MapBackAndSearch = ({
  filteredItems,
  mapRef,
  mapContainerRef,
  searchTerm,
  setSearchTerm,
  setIsOnProjectsPage,
  setCurrentProjectResultsPage,
  setSearchFilters,
  onlyActive,
  onlyInactive,
  filterUser,
  filterProjectKind,
  filterProjectStatus,
  filterBA,
  filterYear,
  selectedLocations,
  dbcaRegions,
  dbcaDistricts,
  nrm,
  ibra,
  imcra,
  areaDbcaRegions,
  areaDbcaDistricts,
  areaIbra,
  areaImcra,
  areaNrm,
  toggleMapLoading,
  selectedBas,
}: MapLocationsSidebarProps) => {
  const { baLoading, baData } = useBusinessAreas();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setIsOnProjectsPage(true);
    return () => {
      setIsOnProjectsPage(false);
    };
  }, []);

  useEffect(() => {
    setCurrentProjectResultsPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleFilterUserChange = (userId: number | null) => {
    setSearchFilters({
      onlyActive,
      onlyInactive,
      filterBA,
      filterProjectKind,
      filterProjectStatus,
      filterYear,
      selectedLocations,
      filterUser: userId,
    });
  };

  // Get first project with areas
  const firstProjectWithArea = filteredItems?.find(
    (project) => project.areas?.length > 0,
  );

  // console.log("Filtered Items:", filteredItems);
  // console.log("First Project with Area:", firstProjectWithArea);

  const filteredItemsWithArea = filteredItems?.filter(
    (project) => project.areas?.length > 0,
  );

  return (
    <>
      <MapSidebarSection className="pb-0" title="Search">
        <div className="mt-2 flex h-full flex-col gap-4">
          <Input
            placeholder="Search for a project..."
            className="h-8 w-full"
            onChange={handleChange}
          />
          <SearchProjectsByUser
            handleFilterUserChange={handleFilterUserChange}
          />
        </div>

        {filteredItems && (
          <ProjectMapMarker
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
            toggleMapLoading={toggleMapLoading}
            selectedLocations={selectedLocations}
            selectedBas={selectedBas}
          />
        )}

        <p className="-mb-4 mt-4 w-full text-right text-xs text-gray-500">
          {filteredItemsWithArea.length}/{filteredItems.length} locations filled
        </p>
      </MapSidebarSection>
    </>
  );
};

export default MapBackAndSearch;
