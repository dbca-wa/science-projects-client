import MapBackAndSearch from "@/components/Map/MapBackAndSearch";
import MapLocationsSidebar from "@/components/Map/MapLocationsSidebar";
import MapTopRightControls from "@/components/Map/MapTopRightControls";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";

const ProjectsMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="relative h-screen w-full">
      {/* ====== MAP ====== */}
      <div
        ref={mapContainerRef}
        className="absolute bottom-0 left-96 right-0 top-0 z-40"
      />

      {/* ====== MAP CONTROLS ====== */}
      <MapTopRightControls mapRef={mapRef} mapContainerRef={mapContainerRef} />

      {/* ====== SIDEBAR ====== */}
      <div className="absolute left-0 top-0 z-50 h-full w-96 overflow-y-auto bg-white shadow-lg">
        {/* BACK & SEARCH */}
        <MapBackAndSearch mapRef={mapRef} mapContainerRef={mapContainerRef} />
        {/* LOCATIONS */}
        <MapLocationsSidebar
          mapRef={mapRef}
          mapContainerRef={mapContainerRef}
        />
        {/* BUSINESS AREAS */}
      </div>
    </div>
  );
};

export default ProjectsMap;
