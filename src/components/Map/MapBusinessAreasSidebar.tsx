import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import MapSidebarSection from "./MapSidebarSection";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGetLocationsGeojson } from "@/lib/hooks/tanstack/useGetLocationsGeojson";
import { useBusinessAreas } from "@/lib/hooks/tanstack/useBusinessAreas";
import { IBusinessArea } from "@/types";

interface LayerVisibility {
  dbcaRegions: boolean;
  dbcaDistricts: boolean;
  nrm: boolean;
  ibra: boolean;
  imcra: boolean;
}

interface RegionProperties {
  name: string;
  description?: string;
  [key: string]: any;
}

interface SubRegion {
  name: string;
  visible: boolean;
}

interface LayerData {
  [key: string]: {
    mainVisible: boolean;
    subRegions: SubRegion[];
    color: string;
    nameProperty: string;
  };
}

interface MapBusinessAreasSidebarProps {
  mapRef: React.RefObject<L.Map | null>;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  filterBA: string;
  baData: IBusinessArea[];
  baLoading: boolean;
  selectedBas: IBusinessArea[];
  setSelectedBas: React.Dispatch<React.SetStateAction<IBusinessArea[]>>;
}

const MapBusinessAreasSidebar = ({
  mapRef,
  mapContainerRef,
  filterBA,
  baData,
  baLoading,
  selectedBas,
  setSelectedBas,
}: MapBusinessAreasSidebarProps) => {
  const toggleBaSelection = (ba: IBusinessArea) => {
    if (selectedBas.includes(ba)) {
      setSelectedBas(selectedBas.filter((selected) => selected !== ba));
    } else {
      setSelectedBas([...selectedBas, ba]);
    }
  };

  const checkAllBas = () => {
    setSelectedBas(baData);
  };

  const uncheckAllBas = () => {
    setSelectedBas([]);
  };

  return (
    <MapSidebarSection title="Business Areas" className="-mt-4">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button
          className="w-full rounded text-white hover:bg-green-600"
          onClick={checkAllBas}
        >
          Check All
        </Button>
        <Button
          className="w-full rounded text-white hover:bg-red-600"
          onClick={uncheckAllBas}
        >
          Uncheck All
        </Button>
      </div>

      {baData?.map((ba, key) => {
        return (
          <div
            key={`${key}-${ba.name}`}
            className="mb-1 flex items-start space-x-2"
          >
            <Checkbox
              id={`${key}-${ba.name}`}
              checked={selectedBas.includes(ba)}
              onCheckedChange={() => toggleBaSelection(ba)}
              className="mt-0.5"
            />
            <Label
              htmlFor={`${key}-${ba.name}`}
              className="text-sm leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {ba.name}
              {!ba.is_active && " (Inactive)"}
            </Label>
          </div>
        );
      })}
    </MapSidebarSection>
  );
};

export default MapBusinessAreasSidebar;
