// Tab data for Project Location on the creation page. WIP need to update to take in pre-set locations for use in update project.

import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { useEffect, useState } from "react";
import { IoIosCreate } from "react-icons/io";
import { useGetLocations } from "@/features/admin/hooks/useGetLocations";
import "@/styles/modalscrollbar.css";
import { AreaCheckAndMaps } from "./AreaCheckAndMaps";

interface IProjectLocationProps {
  locationFilled: boolean;
  setLocationFilled: (val: boolean) => void;
  locationData: number[];
  setLocationData: React.Dispatch<React.SetStateAction<number[]>>;
  createClick: () => void;
  onClose: () => void;
  backClick: () => void;
  nextClick?: (data) => void;
  projectType: string;
  currentYear: number;
  colorMode: string;
}

export const ProjectLocationSection = ({
  backClick,
  nextClick,
  createClick,
  // locationFilled,
  setLocationFilled,
  locationData,
  setLocationData,
  projectType,
}: IProjectLocationProps) => {
  const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } =
    useGetLocations();

  const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [selectedIbras, setSelectedIbras] = useState<number[]>([]);
  const [selectedImcras, setSelectedImcras] = useState<number[]>([]);
  const [selectedNrms, setSelectedNrms] = useState<number[]>([]);
  const { colorMode } = useColorMode();
  useEffect(() => {
    setLocationData([
      ...selectedRegions,
      ...selectedDistricts,
      ...selectedIbras,
      ...selectedImcras,
      ...selectedNrms,
    ]);
  }, [
    selectedRegions,
    selectedIbras,
    selectedDistricts,
    selectedImcras,
    selectedNrms,
    setLocationData,
  ]);

  // const [fixed, setFixed] = useState(false);

  // const handleScroll = () => {
  //   const offset = window.scrollY;
  //   setFixed(offset < 200);
  // };

  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  return (
    <>
      {!locationsLoading && (
        <div className="grid grid-cols-2 gap-4 px-36">
          {dbcaDistricts && dbcaDistricts.length > 0 && (
            <div className="flex justify-center items-center w-full">
              <AreaCheckAndMaps
                title="DBCA Districts"
                areas={dbcaDistricts}
                area_type="dbcadistrict"
                selectedAreas={selectedDistricts}
                setSelectedAreas={setSelectedDistricts}
              />
            </div>
          )}

          {imcra && imcra.length > 0 && (
            <div className="flex justify-center items-center w-full">
              <AreaCheckAndMaps
                title="IMCRAs"
                areas={imcra}
                area_type="imcra"
                selectedAreas={selectedImcras}
                setSelectedAreas={setSelectedImcras}
              />
            </div>
          )}
          {dbcaRegions && dbcaRegions.length > 0 && (
            <div className="flex justify-center items-center w-full">
              <AreaCheckAndMaps
                title="DBCA Regions"
                areas={dbcaRegions}
                area_type="dbcaregion"
                selectedAreas={selectedRegions}
                setSelectedAreas={setSelectedRegions}
              />
            </div>
          )}
          {nrm && nrm.length > 0 && (
            <div className="flex flex-col justify-center items-center w-full">
              <AreaCheckAndMaps
                title="Natural Resource Management Regions"
                areas={nrm}
                area_type="nrm"
                selectedAreas={selectedNrms}
                setSelectedAreas={setSelectedNrms}
              />
            </div>
          )}
          {ibra && ibra.length > 0 && (
            <div className="flex justify-center items-center w-full">
              <AreaCheckAndMaps
                title="IBRAs"
                areas={ibra}
                area_type="ibra"
                selectedAreas={selectedIbras}
                setSelectedAreas={setSelectedIbras}
              />
            </div>
          )}
          <div className="w-full flex justify-end pb-4 pt-10">
            <div className="mr-4">
              <div>
                <Button onClick={backClick}>Back</Button>
                <Button
                  className={`ml-3 text-white ${
                    colorMode === "light" 
                      ? "bg-blue-500 hover:bg-blue-600" 
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={() => {
                    if (
                      projectType.includes("External") ||
                      projectType.includes("Student")
                    ) {
                      setLocationFilled(true);
                      nextClick(locationData);
                    } else {
                      createClick();
                    }
                  }}
                >
                  {projectType.includes("External") ||
                  projectType.includes("Student")
                    ? `Next`
                    : `Create`}
                  {!(projectType.includes("External") ||
                    projectType.includes("Student")) && (
                    <IoIosCreate className="ml-2" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
