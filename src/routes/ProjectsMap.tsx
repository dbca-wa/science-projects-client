import { Button } from "@/components/ui/button";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MapLocationsSidebar from "@/components/Map/MapLocationsSidebar";
import MapTopRightControls from "@/components/Map/MapTopRightControls";

const ProjectsMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="relative h-screen w-full">
      <div
        ref={mapContainerRef}
        className="absolute bottom-0 left-96 right-0 top-0 z-40"
      />

      <MapTopRightControls mapRef={mapRef} mapContainerRef={mapContainerRef} />

      <div className="absolute left-0 top-0 z-50 h-full w-96 overflow-y-auto bg-white shadow-lg">
        <MapLocationsSidebar
          mapRef={mapRef}
          mapContainerRef={mapContainerRef}
        />
      </div>
    </div>
  );
};

export default ProjectsMap;
