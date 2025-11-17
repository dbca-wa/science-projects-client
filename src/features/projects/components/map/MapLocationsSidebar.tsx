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
import { useGetLocationsGeojson } from "@/shared/hooks/tanstack/useGetLocationsGeojson";
import type { IProjectData, ISimpleLocationData } from "@/shared/types/index.d";

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

interface MapLocationsSidebarProps {
  mapRef: React.RefObject<L.Map | null>;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  dbcaRegions: any;
  dbcaDistricts: any;
  nrm: any;
  ibra: any;
  imcra: any;
  locationsLoading: boolean;
  selectedLocations: number[];
  setFilterLocations?: (locations: number[]) => void;
  areaDbcaRegions: ISimpleLocationData[];
  areaDbcaDistricts: ISimpleLocationData[];
  areaIbra: ISimpleLocationData[];
  areaImcra: ISimpleLocationData[];
  areaNrm: ISimpleLocationData[];
  areaLocationsLoading: boolean;
  filteredItems: IProjectData[];
  toggleMapLoading: (loading: boolean) => void;
}

const MapLocationsSidebar = ({
  mapRef,
  mapContainerRef,
  dbcaRegions,
  dbcaDistricts,
  nrm,
  ibra,
  imcra,
  locationsLoading,
  selectedLocations,
  setFilterLocations,
  areaDbcaRegions,
  areaDbcaDistricts,
  areaIbra,
  areaImcra,
  areaNrm,
  areaLocationsLoading,
  filteredItems,
  toggleMapLoading,
}: MapLocationsSidebarProps) => {
  const [showLabels, setShowLabels] = useState(true);
  const [showColors, setShowColors] = useState(true);

  const layerRefs = useRef<{ [key: string]: L.GeoJSON | L.LayerGroup }>({});

  const getLayerStyle = (isVisible: boolean, isHovered: boolean = false) => {
    return {
      weight: isHovered ? 5 : 2,
      opacity: 1,
      color: isHovered ? "#666" : "white",
      dashArray: isHovered ? "" : "3",
      fillOpacity: isVisible
        ? isHovered
          ? showColors
            ? 0.9
            : 0.3 // Hover state
          : showColors
            ? 0.7
            : 0.1 // Normal state
        : 0, // Hidden state
    };
  };

  const toggleLabels = () => {
    setShowLabels((prev) => !prev);

    Object.keys(layerRefs.current).forEach((key) => {
      if (key.endsWith("-labels")) {
        const labelGroup = layerRefs.current[key] as L.LayerGroup;
        if (!showLabels) {
          labelGroup.addTo(mapRef.current!);
        } else {
          labelGroup.remove();
        }
      }
    });
  };

  const toggleColours = () => {
    const newShowColors = !showColors;
    setShowColors(newShowColors);

    Object.keys(layerData).forEach((layerId) => {
      if (layerRefs.current[layerId] instanceof L.GeoJSON) {
        const geoJsonLayer = layerRefs.current[layerId] as L.GeoJSON;
        const layerInfo = layerData[layerId];

        geoJsonLayer.setStyle((feature) => {
          const name = feature.properties[layerInfo.nameProperty];
          const subRegion = layerInfo.subRegions.find((sr) => sr.name === name);
          const isVisible = subRegion?.visible || layerInfo.mainVisible;

          return getLayerStyle(isVisible);
        });
      }
    });
  };

  const [selectedRegion, setSelectedRegion] = useState<RegionProperties | null>(
    null,
  );

  const [layerData, setLayerData] = useState<LayerData>({
    dbcaRegions: {
      mainVisible: true,
      subRegions: [],
      color: "#3388ff",
      nameProperty: "DRG_REGION_NAME",
    },
    dbcaDistricts: {
      mainVisible: false,
      subRegions: [],
      color: "#33ff88",
      nameProperty: "DDT_DISTRICT_NAME",
    },
    nrm: {
      mainVisible: false,
      subRegions: [],
      color: "#ff3388",
      nameProperty: "NRG_REGION_NAME",
    },
    ibra: {
      mainVisible: false,
      subRegions: [],
      color: "#88ff33",
      nameProperty: "IWA_REG_NAME_6",
    },
    imcra: {
      mainVisible: false,
      subRegions: [],
      color: "#ff8833",
      nameProperty: "MESO_NAME",
    },
  });

  interface GeoJSONFeature {
    type: string;
    properties: {
      [key: string]: any;
    };
    geometry: any;
  }

  interface GeoJSONData {
    type: string;
    features: GeoJSONFeature[];
  }

  const extractRegionNames = (
    geojsonData: GeoJSONData | null,
    propertyName: string,
  ): string[] => {
    if (!geojsonData?.features) return [];
    const names = geojsonData.features
      .map((feature) => feature.properties[propertyName])
      .filter(
        (name): name is string => typeof name === "string" && name.length > 0,
      );
    return Array.from(new Set(names)).sort();
  };

  useEffect(() => {
    if (locationsLoading) return;

    const dataMap = {
      dbcaRegions,
      dbcaDistricts,
      nrm,
      ibra,
      imcra,
    };

    setLayerData((prev) => {
      const newData = { ...prev };
      Object.entries(dataMap).forEach(([key, data]) => {
        if (data) {
          const names = extractRegionNames(data, prev[key].nameProperty);
          newData[key] = {
            ...prev[key],
            subRegions: names.map((name) => ({
              name,
              visible: prev[key].mainVisible,
            })),
          };
        }
      });
      return newData;
    });
  }, [dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading]);

  const cleanupMap = () => {
    if (mapRef.current) {
      Object.values(layerRefs.current).forEach((layer) => {
        layer.remove();
      });
      layerRefs.current = {};
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    cleanupMap();

    mapRef.current = L.map(mapContainerRef.current, {
      center: [-25.2744, 122.2402],
      zoom: 5,
      zoomControl: false,
      minZoom: 3,
      maxZoom: 18,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      cleanupMap();
    };
  }, []);

  const updateLayerVisibility = (layerId: string) => {
    if (!layerRefs.current[layerId] || !mapRef.current) return;

    const layer = layerData[layerId];
    const hasVisibleSubregions = layer.subRegions.some((sr) => sr.visible);
    const geoJsonLayer = layerRefs.current[layerId] as L.GeoJSON;
    const labelGroup = layerRefs.current[`${layerId}-labels`] as L.LayerGroup;

    if (hasVisibleSubregions || layer.mainVisible) {
      geoJsonLayer.addTo(mapRef.current);
    } else {
      geoJsonLayer.remove();
    }

    geoJsonLayer.setStyle((feature) => {
      const name = feature.properties[layer.nameProperty];
      const subRegion = layer.subRegions.find((sr) => sr.name === name);
      const isVisible = subRegion?.visible || layer.mainVisible;

      return {
        ...getLayerStyle(isVisible),
        fillColor: layer.color,
      };
    });

    if (labelGroup) {
      labelGroup.clearLayers();

      if (showLabels) {
        const regionCenters = new Map();
        const processedRegions = new Set();

        geoJsonLayer.eachLayer((featureLayer: L.Layer) => {
          if (featureLayer instanceof L.Path && "feature" in featureLayer) {
            const feature = featureLayer.feature;
            const name = feature.properties[layer.nameProperty];
            const subRegion = layer.subRegions.find((sr) => sr.name === name);

            if (
              (subRegion?.visible || (layer.mainVisible && name)) &&
              feature.geometry
            ) {
              const bounds = featureLayer.getBounds();
              if (bounds && bounds.isValid()) {
                if (!regionCenters.has(name)) {
                  regionCenters.set(name, bounds.getCenter());
                } else {
                  const existingCenter = regionCenters.get(name);
                  const newCenter = bounds.getCenter();
                  regionCenters.set(
                    name,
                    L.latLng(
                      (existingCenter.lat + newCenter.lat) / 2,
                      (existingCenter.lng + newCenter.lng) / 2,
                    ),
                  );
                }
              }
            }
          }
        });

        regionCenters.forEach((center, name) => {
          // Create a sanitized id for the label element
          const sanitizedName = name.replace(/[^\w-]/g, "_");
          const labelId = `${layerId}-${sanitizedName}`;

          // Create a wrapper div that's precisely sized to the content
          const labelContainer = document.createElement("div");
          labelContainer.id = `temp-${labelId}`;

          // Apply consistent styling for all labels
          labelContainer.className =
            "bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-gray-800 border border-gray-200/50 transition-all duration-200 cursor-pointer select-none";
          labelContainer.style.maxWidth = "200px";
          labelContainer.style.width = "max-content";
          labelContainer.style.whiteSpace = "normal";
          labelContainer.style.wordWrap = "break-word";
          labelContainer.textContent = name;

          // Add the div to the document temporarily to measure its size
          labelContainer.style.position = "absolute";
          labelContainer.style.visibility = "hidden";
          document.body.appendChild(labelContainer);

          // Get the exact dimensions
          const width = Math.min(labelContainer.offsetWidth, 200);
          const height = labelContainer.offsetHeight;

          // Remove from DOM
          document.body.removeChild(labelContainer);

          // Create a div icon with exact size - use the sanitized ID here
          const label = L.divIcon({
            html: `<div id="${labelId}" class="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-gray-800 text-balance text-center border border-gray-200/50 transition-all duration-200 cursor-pointer select-none" style="max-width: 175px; width: max-content; white-space: normal; word-wrap: break-word; position: relative;">${name}</div>`,
            className: "",
            iconSize: [width, height],
            iconAnchor: [width / 2, height / 2],
          });

          const marker = L.marker(center, {
            icon: label,
            zIndexOffset: 0,
          }).addTo(labelGroup);

          // Shared function to highlight both label and region
          const highlightRegion = (highlight = true) => {
            // Find and highlight/unhighlight all matching features
            geoJsonLayer.eachLayer((layer) => {
              if (layer instanceof L.Path && "feature" in layer) {
                const featureName =
                  layer.feature.properties[layerData[layerId].nameProperty];
                if (featureName === name) {
                  if (highlight) {
                    layer.setStyle({
                      ...getLayerStyle(true, true),
                      fillColor: layerData[layerId].color,
                    });
                    layer.bringToFront();
                  } else {
                    const subRegion = layerData[layerId].subRegions.find(
                      (sr) => sr.name === featureName,
                    );
                    const isVisible =
                      subRegion?.visible || layerData[layerId].mainVisible;
                    layer.setStyle({
                      ...getLayerStyle(isVisible),
                      fillColor: layerData[layerId].color,
                    });
                  }
                }
              }
            });

            // Update label styling
            const labelElement = document.getElementById(labelId);
            if (labelElement) {
              if (highlight) {
                labelElement.classList.add(
                  "bg-blue-200",
                  "border-blue-200",
                  "scale-110",
                  "shadow-xl",
                );
                labelElement.classList.remove("bg-white/90");
                labelElement.style.zIndex = "9999";
                marker.setZIndexOffset(1000);
              } else {
                labelElement.classList.remove(
                  "bg-blue-200",
                  "border-blue-200",
                  "scale-110",
                  "shadow-xl",
                );
                labelElement.classList.add("bg-white/90");
                labelElement.style.zIndex = "auto";
                marker.setZIndexOffset(0);
              }
            }
          };

          // Set up label hover events with proper element targeting
          marker.getElement().addEventListener("mouseover", (e) => {
            const target = e.target;
            if (
              target &&
              (target.id === labelId || target.closest(`#${labelId}`))
            ) {
              highlightRegion(true);
            }
          });

          marker.getElement().addEventListener("mouseout", (e) => {
            const relatedTarget = e.relatedTarget;
            if (
              !relatedTarget ||
              (relatedTarget.id !== labelId &&
                (!relatedTarget.closest ||
                  !relatedTarget.closest(`#${labelId}`)))
            ) {
              highlightRegion(false);
            }
          });

          marker.getElement().addEventListener("click", (e) => {
            const target = e.target;
            if (
              target &&
              (target.id === labelId ||
                (target.closest && target.closest(`#${labelId}`)))
            ) {
              const bounds = L.latLngBounds([]);
              let foundRegions = false;

              geoJsonLayer.eachLayer((layer) => {
                if (layer instanceof L.Path && "feature" in layer) {
                  const featureName =
                    layer.feature.properties[layerData[layerId].nameProperty];
                  if (featureName === name) {
                    bounds.extend(layer.getBounds());
                    foundRegions = true;
                  }
                }
              });

              if (foundRegions && bounds.isValid() && mapRef.current) {
                mapRef.current.flyToBounds(bounds, {
                  padding: [100, 100],
                  duration: 0.5,
                  easeLinearity: 0.25,
                  animate: true,
                  maxZoom: 12,
                });

                const firstMatchingFeature = (geoJsonLayer as any)
                  .getLayers()
                  .find(
                    (layer) =>
                      layer instanceof L.Path &&
                      "feature" in layer &&
                      layer.feature.properties[
                        layerData[layerId].nameProperty
                      ] === name,
                  );

                if (firstMatchingFeature) {
                  setSelectedRegion(firstMatchingFeature.feature.properties);
                }
              }
            }
          });

          // Store the name and highlight function with the marker for use in polygon interactions
          marker.regionName = name;
          marker.highlightRegion = highlightRegion;
        });

        // regionCenters.forEach((center, name) => {
        //   const labelId = `${layerId}-${name}`;

        //   // Create a wrapper div that's precisely sized to the content
        //   const labelContainer = document.createElement("div");
        //   labelContainer.id = `temp-${labelId}`;

        //   // Apply consistent styling for all labels, removing the conditional class based on length
        //   labelContainer.className =
        //     "bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-gray-800 border border-gray-200/50 transition-all duration-200 cursor-pointer select-none";
        //   labelContainer.style.maxWidth = "200px";
        //   labelContainer.style.width = "max-content"; // Use max-content to prevent unnecessary wrapping
        //   labelContainer.style.whiteSpace = "normal"; // Allow wrapping only when needed
        //   labelContainer.style.wordWrap = "break-word"; // Modern approach for word wrapping
        //   labelContainer.textContent = name;

        //   // Add the div to the document temporarily to measure its size
        //   labelContainer.style.position = "absolute";
        //   labelContainer.style.visibility = "hidden";
        //   document.body.appendChild(labelContainer);

        //   // Get the exact dimensions
        //   const width = Math.min(labelContainer.offsetWidth, 200); // Ensure max width is respected
        //   const height = labelContainer.offsetHeight;

        //   // Remove from DOM
        //   document.body.removeChild(labelContainer);

        //   // Create a div icon with exact size
        //   const label = L.divIcon({
        //     html: `<div id="${labelId}" class="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-gray-800 border border-gray-200/50 transition-all duration-200 cursor-pointer select-none" style="max-width: 200px; width: max-content; white-space: normal; word-wrap: break-word;">${name}</div>`,
        //     className: "", // Important: empty class to avoid leaflet's default styling
        //     iconSize: [width, height],
        //     iconAnchor: [width / 2, height / 2], // Center the icon on the point
        //   });

        //   const marker = L.marker(center, {
        //     icon: label,
        //     zIndexOffset: 0,
        //   }).addTo(labelGroup);

        //   // Set up event delegation by checking if the mouse is over the actual text div
        //   marker.getElement().addEventListener("mouseover", (e) => {
        //     // Only trigger if the mouseover is on the label div itself or its children
        //     if (e.target.id === labelId || e.target.closest(`#${labelId}`)) {
        //       // First reset all layers z-index
        //       geoJsonLayer.eachLayer((layer) => {
        //         if (layer instanceof L.Path) {
        //           layer.bringToBack();
        //         }
        //       });

        //       // Then highlight and bring forward the current region
        //       geoJsonLayer.eachLayer((layer) => {
        //         if (layer instanceof L.Path && "feature" in layer) {
        //           const featureName =
        //             layer.feature.properties[layerData[layerId].nameProperty];
        //           if (featureName === name) {
        //             layer.setStyle({
        //               ...getLayerStyle(true, true),
        //               fillColor: layerData[layerId].color,
        //             });
        //             layer.bringToFront();
        //           }
        //         }
        //       });

        //       // Apply styles to the label and increase its z-index
        //       const labelElement = document.getElementById(labelId);
        //       if (labelElement) {
        //         labelElement.classList.add(
        //           "bg-blue-200",
        //           "border-blue-200",
        //           "scale-110",
        //           "shadow-xl",
        //         );
        //         labelElement.classList.remove("bg-white/90");
        //         labelElement.style.zIndex = "9999";
        //       }

        //       // Increase marker z-index to ensure it stays on top
        //       marker.setZIndexOffset(1000);
        //     }
        //   });

        //   marker.getElement().addEventListener("mouseout", (e) => {
        //     // Make sure we're not still within the label element
        //     if (
        //       !e.relatedTarget ||
        //       (!e.relatedTarget.closest(`#${labelId}`) &&
        //         e.relatedTarget.id !== labelId)
        //     ) {
        //       geoJsonLayer.eachLayer((layer) => {
        //         if (layer instanceof L.Path && "feature" in layer) {
        //           const featureName =
        //             layer.feature.properties[layerData[layerId].nameProperty];
        //           if (featureName === name) {
        //             const subRegion = layerData[layerId].subRegions.find(
        //               (sr) => sr.name === featureName,
        //             );
        //             const isVisible =
        //               subRegion?.visible || layerData[layerId].mainVisible;
        //             layer.setStyle({
        //               ...getLayerStyle(isVisible),
        //               fillColor: layerData[layerId].color,
        //             });
        //           }
        //         }
        //       });

        //       const labelElement = document.getElementById(labelId);
        //       if (labelElement) {
        //         labelElement.classList.remove(
        //           "bg-blue-200",
        //           "border-blue-200",
        //           "scale-110",
        //           "shadow-xl",
        //         );
        //         labelElement.classList.add("bg-white/90");
        //         labelElement.style.zIndex = "auto";
        //       }

        //       // Reset marker z-index
        //       marker.setZIndexOffset(0);
        //     }
        //   });

        //   marker.getElement().addEventListener("click", (e) => {
        //     // Only trigger if the click is on the label div itself or its children
        //     if (e.target.id === labelId || e.target.closest(`#${labelId}`)) {
        //       const bounds = L.latLngBounds([]);
        //       let foundRegions = false;

        //       geoJsonLayer.eachLayer((layer) => {
        //         if (layer instanceof L.Path && "feature" in layer) {
        //           const featureName =
        //             layer.feature.properties[layerData[layerId].nameProperty];
        //           if (featureName === name) {
        //             bounds.extend(layer.getBounds());
        //             foundRegions = true;

        //             layer.setStyle({
        //               ...getLayerStyle(true, true),
        //               fillColor: layerData[layerId].color,
        //             });
        //             layer.bringToFront();
        //           }
        //         }
        //       });

        //       if (foundRegions && bounds.isValid() && mapRef.current) {
        //         mapRef.current.flyToBounds(bounds, {
        //           padding: [100, 100],
        //           duration: 0.5,
        //           easeLinearity: 0.25,
        //           animate: true,
        //           maxZoom: 12,
        //         });

        //         const firstMatchingFeature = (geoJsonLayer as any)
        //           .getLayers()
        //           .find(
        //             (layer) =>
        //               layer instanceof L.Path &&
        //               "feature" in layer &&
        //               layer.feature.properties[
        //                 layerData[layerId].nameProperty
        //               ] === name,
        //           );
        //         if (firstMatchingFeature) {
        //           setSelectedRegion(firstMatchingFeature.feature.properties);
        //         }
        //       }
        //     }
        //   });
        // });
      }
    }
  };

  useEffect(() => {
    if (!mapRef.current || locationsLoading) return;

    Object.values(layerRefs.current).forEach((layer) => {
      layer.remove();
    });
    layerRefs.current = {};

    const addGeoJSONLayer = (
      data: any,
      id: string,
      layerInfo: (typeof layerData)[keyof typeof layerData],
    ) => {
      if (!data || !mapRef.current) return;

      try {
        const labelGroup = L.layerGroup().addTo(mapRef.current);
        layerRefs.current[`${id}-labels`] = labelGroup;

        const layer = L.geoJSON(data, {
          style: (feature) => {
            const subRegion = layerInfo.subRegions.find(
              (sr) => sr.name === feature.properties[layerInfo.nameProperty],
            );
            const isVisible = subRegion?.visible || layerInfo.mainVisible;
            return {
              ...getLayerStyle(isVisible),
              fillColor: layerInfo.color,
            };
          },
          onEachFeature: (feature, layer) => {
            layer.on({
              mouseover: (e) => {
                const target = e.target;
                const regionName = feature.properties[layerInfo.nameProperty];

                // First reset z-index of all features
                // Use the proper reference to the layer group (the 'layer' variable we're creating in addGeoJSONLayer)
                const allLayers = layerRefs.current[id]; // This is the correct reference
                if (allLayers instanceof L.GeoJSON) {
                  allLayers.eachLayer((l) => {
                    if (l instanceof L.Path) {
                      l.bringToBack();
                    }
                  });
                }

                // Then highlight the current polygon
                target.setStyle({
                  ...getLayerStyle(true, true),
                  fillColor: layerInfo.color,
                });
                target.bringToFront();

                // Find and highlight the corresponding label
                const labels = labelGroup.getLayers();
                labels.forEach((label: any) => {
                  if (label.regionName === regionName) {
                    // Just update the label styling
                    const sanitizedName = regionName.replace(/[^\w-]/g, "_");
                    const labelId = `${id}-${sanitizedName}`;
                    const labelElement = document.getElementById(labelId);

                    if (labelElement) {
                      labelElement.classList.add(
                        "bg-blue-200",
                        "border-blue-200",
                        "scale-110",
                        "shadow-xl",
                      );
                      labelElement.classList.remove("bg-white/90");
                      labelElement.style.zIndex = "9999";
                    }

                    label.setZIndexOffset(1000);
                  }
                });
              },

              mouseout: (e) => {
                const regionName = feature.properties[layerInfo.nameProperty];
                const subRegion = layerInfo.subRegions.find(
                  (sr) => sr.name === regionName,
                );
                const isVisible = subRegion?.visible || layerInfo.mainVisible;

                // Reset polygon style
                e.target.setStyle({
                  ...getLayerStyle(isVisible),
                  fillColor: layerInfo.color,
                });

                // Reset the label styling
                const labels = labelGroup.getLayers();
                labels.forEach((label: any) => {
                  if (label.regionName === regionName) {
                    const sanitizedName = regionName.replace(/[^\w-]/g, "_");
                    const labelId = `${id}-${sanitizedName}`;
                    const labelElement = document.getElementById(labelId);

                    if (labelElement) {
                      labelElement.classList.remove(
                        "bg-blue-200",
                        "border-blue-200",
                        "scale-110",
                        "shadow-xl",
                      );
                      labelElement.classList.add("bg-white/90");
                      labelElement.style.zIndex = "auto";
                    }

                    label.setZIndexOffset(0);
                  }
                });
              },

              click: (e) => {
                if (mapRef.current) {
                  const bounds = e.target.getBounds();
                  mapRef.current.flyToBounds(bounds, {
                    padding: [100, 100],
                    duration: 0.5,
                    easeLinearity: 0.25,
                    animate: true,
                    maxZoom: 12,
                  });
                }
                setSelectedRegion(feature.properties);
              },
            });
          },
        });

        if (layerInfo.mainVisible) {
          layer.addTo(mapRef.current);
        }
        layerRefs.current[id] = layer;

        updateLayerVisibility(id);
      } catch (error) {
        console.error(`Error adding layer ${id}:`, error);
      }
    };

    const dataMap = {
      dbcaRegions,
      dbcaDistricts,
      nrm,
      ibra,
      imcra,
    };

    Object.entries(dataMap).forEach(([key, data]) => {
      if (data) {
        addGeoJSONLayer(data, key, layerData[key]);
      }
    });

    return () => {
      Object.values(layerRefs.current).forEach((layer) => {
        layer.remove();
      });
      layerRefs.current = {};
    };
  }, [
    dbcaRegions,
    dbcaDistricts,
    nrm,
    ibra,
    imcra,
    locationsLoading,
    layerData,
    showColors,
  ]);

  const toggleMainLayer = (layerId) => {
    if (toggleMapLoading) {
      toggleMapLoading(true);
    }
    setLayerData((prev) => {
      const newData = { ...prev };
      const layer = newData[layerId];
      const newVisible = !layer.mainVisible;

      layer.mainVisible = newVisible;
      layer.subRegions = layer.subRegions.map((sr) => ({
        ...sr,
        visible: newVisible,
      }));

      return newData;
    });
  };

  useEffect(() => {
    // Skip initial render
    if (Object.keys(layerData).length === 0) return;

    const timer = setTimeout(() => {
      if (toggleMapLoading) toggleMapLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [layerData, toggleMapLoading]);

  const toggleSubRegion = (layerId: string, subRegionName: string) => {
    setLayerData((prev) => {
      const newData = { ...prev };
      const layer = newData[layerId];

      layer.subRegions = layer.subRegions.map((sr) =>
        sr.name === subRegionName ? { ...sr, visible: !sr.visible } : sr,
      );

      updateLayerVisibility(layerId);
      return newData;
    });
  };

  const toggleAllLayers = (show: boolean) => {
    setLayerData((prev) => {
      const newData = { ...prev };
      Object.keys(newData).forEach((key) => {
        newData[key].mainVisible = show;
        newData[key].subRegions = newData[key].subRegions.map((sr) => ({
          ...sr,
          visible: show,
        }));

        if (layerRefs.current[key] && mapRef.current) {
          const layer = layerRefs.current[key] as L.GeoJSON;
          if (show) {
            layer.addTo(mapRef.current);
          } else {
            layer.remove();
          }
          updateLayerVisibility(key);
        }
      });
      return newData;
    });
  };

  return (
    <MapSidebarSection title="Locations">
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Button
          onClick={() => toggleAllLayers(true)}
          className="w-full rounded text-white hover:bg-green-600"
        >
          Show All
        </Button>
        <Button
          onClick={() => toggleAllLayers(false)}
          className="w-full rounded text-white hover:bg-red-600"
        >
          Hide All
        </Button>
        <Button
          onClick={() => toggleColours()}
          className="w-full rounded text-white hover:bg-gray-700"
        >
          Toggle Colours
        </Button>
        <Button
          onClick={() => toggleLabels()}
          className="w-full rounded text-white hover:bg-gray-700"
        >
          Toggle Labels
        </Button>
      </div>

      <Accordion type="multiple" className="">
        {Object.entries(layerData).map(([key, data]) => {
          const words = key
            .replace(/([A-Z])/g, " $1")
            .trim()
            .split(" ");
          const formattedLabel = [
            words[0].toUpperCase(),
            ...words.slice(1),
          ].join(" ");

          return (
            <AccordionItem key={key} value={key} className="border-b">
              <div className="flex min-h-[40px] w-full items-stretch">
                <div
                  onClick={() => toggleMainLayer(key)}
                  className="flex shrink-0 cursor-pointer items-center space-x-2 px-1 pr-4 select-none"
                >
                  <Checkbox id={key} checked={data.mainVisible} />
                  <span className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {formattedLabel}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <AccordionTrigger className="w-full justify-end pr-2" />
                </div>
              </div>

              <AccordionContent>
                <div className="ml-6 space-y-2 pt-2">
                  {data.subRegions
                    .filter(
                      (subRegion) =>
                        subRegion.name && subRegion.name.trim() !== "",
                    )
                    .map((subRegion) => (
                      <div
                        key={`${key}-${subRegion.name}`}
                        className="flex items-start space-x-2"
                      >
                        <Checkbox
                          id={`${key}-${subRegion.name}`}
                          checked={subRegion.visible}
                          onCheckedChange={() =>
                            toggleSubRegion(key, subRegion.name)
                          }
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={`${key}-${subRegion.name}`}
                          className="text-sm leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {subRegion.name}
                        </Label>
                      </div>
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </MapSidebarSection>
  );
};

export default MapLocationsSidebar;
