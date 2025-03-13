import { useState, useEffect } from "react";

export const useGetLocationsGeojson = () => {
  const [dbcaRegions, setDbcaRegions] = useState(null);
  const [dbcaDistricts, setDbcaDistricts] = useState(null);
  const [nrm, setNrm] = useState(null);
  const [ibra, setIbra] = useState(null);
  const [imcra, setImcra] = useState(null);
  const [locationsLoading, setLocationsLoading] = useState(true);

  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        // Load all GeoJSON files in parallel
        const [regionsData, districtsData, nrmData, ibraData, imcraData] =
          await Promise.all([
            fetch("/data/optimized/optimized_DBCA_REGION_DATA.geojson").then(
              (res) => res.json(),
            ),
            fetch("/data/optimized/optimized_DBCA_DISTRICT_DATA.geojson").then(
              (res) => res.json(),
            ),
            fetch("/data/optimized/optimized_NRM_DATA.geojson").then((res) =>
              res.json(),
            ),
            fetch("/data/optimized/optimized_IBRA_DATA.geojson").then((res) =>
              res.json(),
            ),
            fetch("/data/optimized/optimized_IMCRA_DATA.geojson").then((res) =>
              res.json(),
            ),
          ]);

        setDbcaRegions(regionsData);
        setDbcaDistricts(districtsData);
        setNrm(nrmData);
        setIbra(ibraData);
        setImcra(imcraData);
      } catch (error) {
        console.error("Error loading GeoJSON data:", error);
      } finally {
        setLocationsLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  return {
    dbcaRegions,
    dbcaDistricts,
    nrm,
    ibra,
    imcra,
    locationsLoading,
  };
};
