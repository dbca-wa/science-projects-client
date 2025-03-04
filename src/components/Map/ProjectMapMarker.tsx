import { IProjectData, ISimpleLocationData } from "@/types";
import L from "leaflet";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import DOMPurify from "dompurify";

interface ProjectMapMarkerProps {
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
}

const ProjectMapMarker = ({
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
}: ProjectMapMarkerProps) => {
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const [matchStats, setMatchStats] = useState({
    total: 0,
    matched: 0,
    byLayer: {
      regions: 0,
      districts: 0,
      nrm: 0,
      ibra: 0,
      imcra: 0,
    },
  });

  // Function to strip HTML tags and sanitize content
  const stripHtml = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = DOMPurify.sanitize(html);
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Normalize strings for comparison
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "") // Remove special chars
      .replace(/\s+/g, " "); // Normalize whitespace
  };

  // Improved fuzzy matcher
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
  const findFirstProjectCoordinate = (project: IProjectData, stats: any) => {
    if (!project.areas?.length) {
      return null;
    }

    // Helper function to process each layer type with improved matching
    const findInLayer = (
      geojsonData: any,
      areaData: ISimpleLocationData[],
      nameProperty: string,
      layerName: string,
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
          stats.byLayer[layerName]++;
          return [center.lat, center.lng] as [number, number];
        }
      }
      return null;
    };

    // Try each layer type in order
    return (
      findInLayer(dbcaRegions, areaDbcaRegions, "DRG_REGION_NAME", "regions") ||
      findInLayer(
        dbcaDistricts,
        areaDbcaDistricts,
        "DDT_DISTRICT_NAME",
        "districts",
      ) ||
      findInLayer(nrm, areaNrm, "NRG_REGION_NAME", "nrm") ||
      findInLayer(ibra, areaIbra, "IWA_REG_NAME_6", "ibra") ||
      findInLayer(imcra, areaImcra, "MESO_NAME", "imcra")
    );
  };

  // Function to group projects by location
  const groupProjectsByLocation = () => {
    const locationMap = new Map();
    const stats = {
      total: 0,
      matched: 0,
      byLayer: {
        regions: 0,
        districts: 0,
        nrm: 0,
        ibra: 0,
        imcra: 0,
      },
    };

    // Count projects with areas
    const projectsWithAreas = projects.filter((p) => p.areas?.length > 0);
    stats.total = projectsWithAreas.length;

    projectsWithAreas.forEach((project) => {
      const coords = findFirstProjectCoordinate(project, stats);
      if (!coords) return;

      stats.matched++;

      // Create a string key from coordinates (with limited precision to group nearby points)
      const key = `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`;

      if (!locationMap.has(key)) {
        locationMap.set(key, {
          coords,
          projects: [],
        });
      }

      locationMap.get(key).projects.push(project);
    });

    setMatchStats(stats);
    console.log("Map matching stats:", stats);
    return locationMap;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing layers
    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();
    } else {
      markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    // Group projects by location
    const locationGroups = groupProjectsByLocation();
    const bounds = L.latLngBounds([]);

    locationGroups.forEach(({ coords, projects }, key) => {
      bounds.extend(coords);

      if (projects.length === 1) {
        // Single marker
        createSingleMarker(projects[0], coords);
      } else {
        // Multiple projects at same location
        createMultiMarker(projects, coords);
      }
    });

    // Fit bounds if we have markers
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (markerLayerRef.current) {
        markerLayerRef.current.clearLayers();
      }
    };
  }, [projects, mapRef.current, dbcaRegions, dbcaDistricts, nrm, ibra, imcra]);

  // Create a single project marker
  const createSingleMarker = (
    project: IProjectData,
    coords: [number, number],
  ) => {
    if (!markerLayerRef.current) return;

    const marker = L.marker(coords, {
      title: stripHtml(project.title),
      icon: L.divIcon({
        className: "bg-transparent border-none",
        html: `
          <div class="relative">
            <!-- Pin with drop shadow effect -->
            <div class="
              relative
              w-10 h-10
              transform translate-y-0
              transition-transform duration-200 ease-in-out
              hover:translate-y-1
              cursor-pointer
            ">
                              <!-- Pin shape - top rounded part -->
              <div class="
                absolute
                w-8 h-8
                rounded-full
                bg-green-500
                left-0
                shadow-md
                z-10
              "></div>
              
              <!-- Pin shape - bottom pointy part -->
              <div class="
                absolute
                w-4 h-4
                bg-green-500
                transform rotate-45
                top-6
                left-2
                shadow-lg
                z-0
              "></div>
              
              <!-- Inner white circle for contrast -->
                    <div class="
                absolute
                w-6 h-6
                rounded-full
                bg-white
                top-1
                left-1
                flex items-center justify-center
                text-xs font-bold text-green-600
                z-20
              ">1</div>
            </div>
            
            <!-- Subtle drop shadow for depth -->
            <div class="
              absolute
              w-4 h-1
              rounded-full
              bg-black
              opacity-20
              bottom-0
              left-2
              blur-sm
            "></div>
          </div>
        `,
        iconSize: [40, 46],
        iconAnchor: [20, 46],
        popupAnchor: [0, -36],
      }),
    });

    bindProjectPopup(marker, project);
    marker.addTo(markerLayerRef.current);
  };

  // Create a marker for multiple projects at same location
  const createMultiMarker = (
    projects: IProjectData[],
    coords: [number, number],
  ) => {
    if (!markerLayerRef.current) return;

    const marker = L.marker(coords, {
      title: `${projects.length} projects at this location`,
      icon: L.divIcon({
        className: "bg-transparent border-none",
        html: `
          <div class="relative">
            <!-- Pin with drop shadow effect -->
            <div class="
              relative
              w-8 h-8
              transform translate-y-0
              transition-transform duration-200 ease-in-out
              hover:translate-y-1
              cursor-pointer
            ">
                              <!-- Pin shape - top rounded part -->
              <div class="
                absolute
                w-8 h-8
                rounded-full
                bg-green-500
                left-0
                shadow-md
                z-10
              "></div>
              
              <!-- Pin shape - bottom pointy part -->
              <div class="
                absolute
                w-4 h-4
                bg-green-500
                transform rotate-45
                top-6
                left-2
                shadow-lg
                z-0
              "></div>
              
              <!-- White number circle for count -->
              <div class="
                absolute
                w-6 h-6
                rounded-full
                bg-white
                top-1
                left-1
                flex items-center justify-center
                text-xs font-bold text-green-600
                z-20
              ">${projects.length}</div>
            </div>
            
            <!-- Subtle drop shadow for depth -->
            <div class="
              absolute
              w-4 h-1
              rounded-full
              bg-black
              opacity-20
              bottom-0
              left-2
              blur-sm
            "></div>
          </div>
        `,
        iconSize: [40, 46],
        iconAnchor: [20, 46],
        popupAnchor: [0, -36],
      }),
    });

    // Create combined popup for all projects at this location
    const popupContent = `
      <div class="p-3 max-w-md">
        <h3 class="font-bold text-lg mb-3">${projects.length} Projects at this Location</h3>
        <div class="max-h-64 overflow-y-auto">
          ${projects
            .map(
              (project, index) => `
            <div class="mb-4 pb-3 ${index < projects.length - 1 ? "border-b border-gray-200" : ""}">
              <h4 class="font-bold text-base">${stripHtml(project.title)}</h4>
              ${project.tagline ? `<p class="text-sm text-gray-600 mb-2">${stripHtml(project.tagline)}</p>` : ""}
              <div class="flex flex-col gap-1 text-sm">
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
          `,
            )
            .join("")}
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, {
      maxWidth: 300,
      maxHeight: 300,
      className: "rounded-lg shadow-lg",
    });

    marker.addTo(markerLayerRef.current);
  };

  // Bind a popup to a marker for a single project
  const bindProjectPopup = (marker: L.Marker, project: IProjectData) => {
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
  };

  useEffect(() => {
    // Create or update the status display when match stats change
    if (mapRef.current && matchStats.total > 0) {
      // Remove existing status control if present
      const existingControl = document.getElementById("map-status-control");
      if (existingControl) {
        existingControl.remove();
      }

      // Create new status control
      const statusControl = L.control({ position: "topleft" });

      statusControl.onAdd = function () {
        const div = L.DomUtil.create("div", "map-status-control");
        div.id = "map-status-control";
        div.innerHTML = `
          <div class="bg-white px-3 py-2 rounded-md shadow-md border border-gray-200 text-sm font-medium">
            Matched: ${matchStats.matched} / ${matchStats.total}
          </div>
        `;
        return div;
      };

      statusControl.addTo(mapRef.current);
    }
  }, [matchStats, mapRef.current]);
  return null;
  // return (
  //   <div className="mt-2 text-xs text-gray-500">
  //     Mapped {matchStats.matched} of {matchStats.total} projects with areas
  //   </div>
  // );
};

export default ProjectMapMarker;
