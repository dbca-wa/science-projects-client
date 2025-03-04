import { IProjectData, ISimpleLocationData } from "@/types";
import L from "leaflet";
import "leaflet.heat";
import { useEffect, useRef } from "react";

interface MapHeatLayerProps {
  projects: IProjectData[];
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
  showHeatmap: boolean;
}

const MapHeatLayer = ({
  projects,
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
  showHeatmap,
}: MapHeatLayerProps) => {
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  // Normalize strings for comparison
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "") // Remove special chars
      .replace(/\s+/g, " "); // Normalize whitespace
  };

  // Fuzzy matcher
  const fuzzyMatch = (str1: string, str2: string): boolean => {
    const norm1 = normalizeString(str1);
    const norm2 = normalizeString(str2);

    // Exact match after normalization
    if (norm1 === norm2) return true;

    // Check if one contains the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;

    // Check for high similarity
    let similarity = 0;
    const words1 = norm1.split(" ");
    const words2 = norm2.split(" ");

    for (const word1 of words1) {
      if (word1.length < 3) continue; // Skip very short words
      if (
        words2.some((word2) => word2.includes(word1) || word1.includes(word2))
      ) {
        similarity++;
      }
    }

    return similarity >= Math.min(words1.length, words2.length) * 0.7; // 70% of words match
  };

  // Function to find the first valid coordinate for a project
  const findFirstProjectCoordinate = (project: IProjectData) => {
    if (!project.areas?.length) {
      return null;
    }

    // Helper function to process each layer type with improved matching
    const findInLayer = (
      geojsonData: any,
      areaData: ISimpleLocationData[],
      nameProperty: string,
    ) => {
      if (!geojsonData?.features || !areaData) {
        return null;
      }

      for (const areaPk of project.areas) {
        const areaMatch = areaData.find((area) => area.pk === Number(areaPk));
        if (!areaMatch) continue;

        // Try exact match first
        let feature = geojsonData.features.find(
          (f) => f.properties[nameProperty] === areaMatch.name,
        );

        // If no exact match, try fuzzy matching
        if (!feature) {
          feature = geojsonData.features.find(
            (f) =>
              f.properties[nameProperty] &&
              fuzzyMatch(f.properties[nameProperty], areaMatch.name),
          );
        }

        if (feature?.geometry) {
          const layer = L.geoJSON(feature);
          const center = layer.getBounds().getCenter();
          return [center.lat, center.lng] as [number, number];
        }
      }
      return null;
    };

    // Try each layer type in order
    return (
      findInLayer(dbcaRegions, areaDbcaRegions, "DRG_REGION_NAME") ||
      findInLayer(dbcaDistricts, areaDbcaDistricts, "DDT_DISTRICT_NAME") ||
      findInLayer(nrm, areaNrm, "NRG_REGION_NAME") ||
      findInLayer(ibra, areaIbra, "IWA_REG_NAME_6") ||
      findInLayer(imcra, areaImcra, "MESO_NAME")
    );
  };

  // Generate heatmap data points
  const generateHeatmapData = () => {
    const heatPoints = [];

    for (const project of projects) {
      if (project.areas?.length) {
        const coords = findFirstProjectCoordinate(project);
        if (coords) {
          // Add intensity based on project importance or just count (1)
          // Format is [lat, lng, intensity]
          heatPoints.push([coords[0], coords[1], 1]);
        }
      }
    }

    return heatPoints;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Skip if heatmap is disabled
    if (!showHeatmap) {
      if (heatLayerRef.current) {
        mapRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // Generate heatmap data
    const heatData = generateHeatmapData();

    // Remove existing heatmap if present
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
    }

    // Create new heatmap
    if (heatData.length > 0) {
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 25, // Size of each point on the heatmap
        blur: 15, // Amount of blur
        maxZoom: 10, // After this zoom level, points appear as circles
        max: 10, // Maximum point intensity
        gradient: {
          0.0: "green", // Low density - green
          0.25: "lime",
          0.5: "yellow", // Medium density - yellow
          0.75: "orange",
          1.0: "red", // High density - red
        },
      }).addTo(mapRef.current);
    }

    return () => {
      if (heatLayerRef.current && mapRef.current) {
        mapRef.current.removeLayer(heatLayerRef.current);
      }
    };
  }, [projects, mapRef.current, showHeatmap]);

  return null;
};

export default MapHeatLayer;
