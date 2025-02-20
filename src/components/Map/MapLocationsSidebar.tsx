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
}

const MapLocationsSidebar = ({
  mapRef,
  mapContainerRef,
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

  const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } =
    useGetLocationsGeojson();

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
          const charactersToAdjustWidth = 20;
          const labelId = `${layerId}-${name}`;

          const label = L.divIcon({
            className: "",
            html: `<div id="${labelId}" class="${name.length > charactersToAdjustWidth ? "map-label-full" : "map-label-fit"} bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-gray-800 border border-gray-200/50 break-words transition-all duration-200 w-fit cursor-pointer select-none">${name}</div>`,
            iconSize: [200, null],
            iconAnchor: [100, null],
          });

          const marker = L.marker(center, { icon: label }).addTo(labelGroup);

          marker.on({
            mouseover: () => {
              geoJsonLayer.eachLayer((layer: L.Layer) => {
                if (layer instanceof L.Path && "feature" in layer) {
                  const featureName =
                    layer.feature.properties[layerData[layerId].nameProperty];
                  if (featureName === name) {
                    layer.setStyle({
                      ...getLayerStyle(true, true),
                      fillColor: layerData[layerId].color,
                    });
                    layer.bringToFront();
                  }
                }
              });

              const labelElement = document.getElementById(labelId);
              if (labelElement) {
                labelElement.classList.add(
                  "bg-blue-200",
                  "border-blue-200",
                  "scale-110",
                  "shadow-xl",
                  "z-[9999]",
                );
                labelElement.classList.remove("bg-white/90", "z-[1]");
              }
            },
            mouseout: () => {
              geoJsonLayer.eachLayer((layer: L.Layer) => {
                if (layer instanceof L.Path && "feature" in layer) {
                  const featureName =
                    layer.feature.properties[layerData[layerId].nameProperty];
                  if (featureName === name) {
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
              });

              const labelElement = document.getElementById(labelId);
              if (labelElement) {
                labelElement.classList.remove(
                  "bg-blue-200",
                  "border-blue-200",
                  "scale-110",
                  "shadow-xl",
                );
                labelElement.classList.add("bg-white/90");
              }
            },
            click: () => {
              const bounds = L.latLngBounds([]);
              let foundRegions = false;

              geoJsonLayer.eachLayer((layer: L.Layer) => {
                if (layer instanceof L.Path && "feature" in layer) {
                  const featureName =
                    layer.feature.properties[layerData[layerId].nameProperty];
                  if (featureName === name) {
                    bounds.extend(layer.getBounds());
                    foundRegions = true;

                    layer.setStyle({
                      ...getLayerStyle(true, true),
                      fillColor: layerData[layerId].color,
                    });
                    layer.bringToFront();
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
                    (layer: L.Layer) =>
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
            },
          });
        });
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
                target.setStyle({
                  ...getLayerStyle(true, true),
                  fillColor: layerInfo.color,
                });
                target.bringToFront();

                const regionName = feature.properties[layerInfo.nameProperty];
                const labels = labelGroup.getLayers();
                labels.forEach((label) => {
                  const labelDiv = label.getElement();
                  if (labelDiv && labelDiv.innerHTML.includes(regionName)) {
                    labelDiv.firstChild.classList.add(
                      "bg-blue-200",
                      "border-blue-200",
                      "scale-110",
                      "shadow-xl",
                      "z-[9999]",
                    );
                    labelDiv.firstChild.classList.remove(
                      "bg-white/90",
                      "z-[1]",
                    );
                    label.setZIndexOffset(1000);
                  } else {
                    label.setZIndexOffset(0);
                  }
                });
              },
              mouseout: (e) => {
                const target = e.target;
                const subRegion = layerInfo.subRegions.find(
                  (sr) =>
                    sr.name === feature.properties[layerInfo.nameProperty],
                );
                const isVisible = subRegion?.visible || layerInfo.mainVisible;
                target.setStyle({
                  ...getLayerStyle(isVisible),
                  fillColor: layerInfo.color,
                });

                const regionName = feature.properties[layerInfo.nameProperty];
                const labels = labelGroup.getLayers();
                labels.forEach((label) => {
                  const labelDiv = label.getElement();
                  if (labelDiv && labelDiv.innerHTML.includes(regionName)) {
                    labelDiv.firstChild.classList.remove(
                      "bg-blue-200",
                      "border-blue-200",
                      "scale-110",
                      "shadow-xl",
                    );
                    labelDiv.firstChild.classList.add("bg-white/90");
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

      <Accordion type="multiple" className="space-y-4">
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
            <AccordionItem key={key} value={key} className="border-b pb-4">
              <div className="flex min-h-[40px] w-full items-stretch">
                <div
                  onClick={() => toggleMainLayer(key)}
                  className="flex flex-shrink-0 cursor-pointer select-none items-center space-x-2 px-1 pr-4"
                >
                  <Checkbox id={key} checked={data.mainVisible} />
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
