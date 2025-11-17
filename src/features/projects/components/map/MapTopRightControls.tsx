import { Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapLocationsSidebarProps {
  mapRef: React.RefObject<L.Map | null>;
  mapContainerRef: React.RefObject<HTMLDivElement>;
}

const MapTopRightControls = ({
  mapRef,
  mapContainerRef,
}: MapLocationsSidebarProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleZoom = (action: "in" | "out") => {
    if (!mapRef.current) return;
    if (action === "in") {
      mapRef.current.zoomIn();
    } else {
      mapRef.current.zoomOut();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="absolute right-4 top-4 z-50 flex flex-col gap-2">
      <Button onClick={toggleFullscreen} variant="secondary">
        {isFullscreen ? (
          <Minimize2 className="size-4" />
        ) : (
          <Maximize2 className="size-4" />
        )}
      </Button>
      <Button onClick={() => handleZoom("in")} variant="secondary">
        <Plus className="size-4" />
      </Button>
      <Button onClick={() => handleZoom("out")} variant="secondary">
        <Minus className="size-4" />
      </Button>
    </div>
  );
};

export default MapTopRightControls;
