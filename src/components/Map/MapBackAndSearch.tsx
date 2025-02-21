import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import MapSidebarSection from "./MapSidebarSection";
import { ArrowLeft } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "../ui/input";
import { useBusinessAreas } from "@/lib/hooks/tanstack/useBusinessAreas";
import { useState } from "react";

interface MapLocationsSidebarProps {
  mapRef: React.RefObject<L.Map | null>;
  mapContainerRef: React.RefObject<HTMLDivElement>;
}

const MapBackAndSearch = ({
  mapRef,
  mapContainerRef,
}: MapLocationsSidebarProps) => {
  const navigate = useNavigate();

  const { baLoading, baData } = useBusinessAreas();
  // Business Areas state
  const [businessAreas, setBusinessAreas] = useState<{
    [key: string]: boolean;
  }>({});

  return (
    <MapSidebarSection className="pb-0" title="Search">
      <div className="mt-2">
        <Input placeholder="Search for a project..." className="w-full" />
      </div>
    </MapSidebarSection>
  );
};

export default MapBackAndSearch;

{
  /* <Button
        className="w-full text-lg font-semibold"
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            window.open(`/`, "_blank");
          } else {
            navigate("/");
          }
        }}
      >
        <ArrowLeft />
        Back to SPMS
      </Button> */
}
