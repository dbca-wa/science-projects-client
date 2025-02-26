import { IProjectData, ISimpleLocationData } from "@/types";
import L from "leaflet";
import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

interface ProjectMapMarkerProps {
  project: IProjectData;
  mapRef: React.RefObject<L.Map | null>;
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
}

const ProjectMapMarker = ({
  project,
  mapRef,
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
}: ProjectMapMarkerProps) => {
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  // Function to strip HTML tags and sanitize content
  const stripHtml = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = DOMPurify.sanitize(html);
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Function to find the first valid coordinate for a project
  const findFirstProjectCoordinate = () => {
    console.log("Project:", project);
    console.log("Areas:", project.areas);

    if (!project.areas?.length) {
      console.log("No areas found for project");
      return null;
    }

    // Helper function to process each layer type
    const findInLayer = (
      geojsonData: any,
      areaData: ISimpleLocationData[],
      nameProperty: string,
      layerType: string,
    ) => {
      console.log(`Checking ${layerType}:`, {
        geojsonData,
        areaData,
        nameProperty,
      });

      if (!geojsonData?.features || !areaData) {
        console.log(`Missing data for ${layerType}`);
        return null;
      }

      for (const areaPk of project.areas) {
        const areaMatch = areaData.find((area) => area.pk === Number(areaPk));
        if (!areaMatch) continue;

        const feature = geojsonData.features.find(
          (f) => f.properties[nameProperty] === areaMatch.name,
        );

        if (feature?.geometry) {
          const layer = L.geoJSON(feature);
          const center = layer.getBounds().getCenter();
          return [center.lat, center.lng] as [number, number];
        }
      }
      return null;
    };

    // Try each layer type in order
    const coords =
      findInLayer(
        dbcaRegions,
        areaDbcaRegions,
        "DRG_REGION_NAME",
        "DBCA Regions",
      ) ||
      findInLayer(
        dbcaDistricts,
        areaDbcaDistricts,
        "DDT_DISTRICT_NAME",
        "DBCA Districts",
      ) ||
      findInLayer(nrm, areaNrm, "NRG_REGION_NAME", "NRM") ||
      findInLayer(ibra, areaIbra, "IWA_REG_NAME_6", "IBRA") ||
      findInLayer(imcra, areaImcra, "MESO_NAME", "IMCRA");

    console.log("Found coordinates:", coords);
    return coords;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing marker layer
    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();
    } else {
      markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const coords = findFirstProjectCoordinate();
    if (!coords) return;

    // Create marker with custom styling
    const marker = L.marker(coords, {
      title: stripHtml(project.title),
      icon: L.divIcon({
        className: "bg-transparent border-none",
        html: `
          <div class="
            w-6 h-6 
            rounded-full 
            bg-blue-500 
            border-2 border-white 
            shadow-lg 
            transition-transform duration-200 ease-in-out 
            hover:scale-125 
            cursor-pointer
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    });

    // Create popup content
    const popupContent = `
      <div class="p-3 max-w-md">
        <h3 class="font-bold text-lg mb-2">${stripHtml(project.title)}</h3>
        ${project.tagline ? `<p class="text-sm text-gray-600 mb-2">${stripHtml(project.tagline)}</p>` : ""}
        <div class="flex flex-col gap-2 text-sm">
          <div>
            <span class="font-medium">Status:</span> ${project.status}
          </div>
          <div>
            <span class="font-medium">Type:</span> ${project.kind}
          </div>
          ${
            project.business_area
              ? `<div>
              <span class="font-medium">Business Area:</span> ${project.business_area.name}
            </div>`
              : ""
          }
          <div>
            <span class="font-medium">Year:</span> ${project.year}
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: "rounded-lg shadow-lg",
    });

    marker.addTo(markerLayerRef.current);

    // Center map on marker with some padding
    mapRef.current.setView(coords, 6);

    return () => {
      if (markerLayerRef.current) {
        markerLayerRef.current.clearLayers();
      }
    };
  }, [project, mapRef.current]);

  return null;
};

export default ProjectMapMarker;
