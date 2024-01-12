// Tab data for Project Location on the creation page. WIP need to update to take in pre-set locations for use in update project.

import {
  Box,
  Button,
  Flex,
  Grid,
  Image,
  Text,
  ModalBody,
  ModalFooter,
  Skeleton,
  useColorMode,
  Center,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "../../../styles/modalscrollbar.css";
import { useGetLocations } from "../../../lib/hooks/useGetLocations";
import { IoIosCreate } from "react-icons/io";
import { AreaCheckAndMaps } from "./AreaCheckAndMaps";

interface IProjectLocationProps {
  locationFilled: boolean;
  setLocationFilled: (val: boolean) => void;
  locationData: number[];
  setLocationData: React.Dispatch<React.SetStateAction<any>>;
  createClick: () => void;
  onClose: () => void;
  backClick: () => void;
  nextClick?: (data: any) => void;
  projectType: string;
  currentYear: number;
  colorMode: string;
}

export const ProjectLocationSection = ({
  backClick,
  nextClick,
  createClick,
  locationFilled,
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

  const [fixed, setFixed] = useState(false);

  const handleScroll = () => {
    const offset = window.scrollY;
    setFixed(offset < 200);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // useEffect(() => {
  //     if (locationData.length > 0) {
  //         console.log(locationData)
  //         setLocationFilled(true)
  //     }
  //     else if (locationData.length === 0) {
  //         setLocationFilled(false);
  //     }
  // }, [locationData])

  return (
    <>
      {!locationsLoading && (
        <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridColumnGap={4} px={36}>
          {dbcaDistricts && dbcaDistricts.length > 0 && (
            <Center
              display={"flex"}
              justifyContent={"center"}
              alignContent={"center"}
              alignItems={"center"}
              w={"100%"}
            >
              <AreaCheckAndMaps
                title="DBCA Districts"
                areas={dbcaDistricts}
                required={false}
                selectedAreas={selectedDistricts}
                setSelectedAreas={setSelectedDistricts}
              />
            </Center>
          )}
          {/* <Flex flexDir={"column"}> */}
          {/* <Flex flexDir={"column"}> */}

          {imcra && imcra.length > 0 && (
            <Center
              display={"flex"}
              justifyContent={"center"}
              alignContent={"center"}
              alignItems={"center"}
              w={"100%"}
            >
              <AreaCheckAndMaps
                title="IMCRAs"
                areas={imcra}
                required={false}
                selectedAreas={selectedImcras}
                setSelectedAreas={setSelectedImcras}
              />
            </Center>
          )}
          {dbcaRegions && dbcaRegions.length > 0 && (
            <Center
              display={"flex"}
              justifyContent={"center"}
              alignContent={"center"}
              alignItems={"center"}
              w={"100%"}
            >
              <AreaCheckAndMaps
                title="DBCA Regions"
                areas={dbcaRegions}
                required={false}
                selectedAreas={selectedRegions}
                setSelectedAreas={setSelectedRegions}
              />
            </Center>
          )}
          {nrm && nrm.length > 0 && (
            <Flex
              flexDir={"column"}
              display={"flex"}
              justifyContent={"center"}
              alignContent={"center"}
              alignItems={"center"}
              w={"100%"}
            >
              <AreaCheckAndMaps
                title="Natural Resource Management Regions"
                areas={nrm}
                required={false}
                selectedAreas={selectedNrms}
                setSelectedAreas={setSelectedNrms}
              />
            </Flex>
          )}
          {ibra && ibra.length > 0 && (
            <Center
              display={"flex"}
              justifyContent={"center"}
              alignContent={"center"}
              alignItems={"center"}
              w={"100%"}
            >
              <AreaCheckAndMaps
                title="IBRAs"
                areas={ibra}
                required={false}
                selectedAreas={selectedIbras}
                setSelectedAreas={setSelectedIbras}
              />
            </Center>
          )}
          <Flex
            w={"100%"}
            justifyContent={"flex-end"}
            pb={4}
            pt={10}
            // pr={"200px"}
            // bg={"red"}
          >
            <Grid mr={4}>
              <></>
              <Box>
                <Button onClick={backClick}>Back</Button>
                <Button
                  ml={3}
                  type="submit"
                  // colorScheme="blue"
                  backgroundColor={
                    colorMode === "light" ? "blue.500" : "blue.600"
                  }
                  color={"white"}
                  _hover={{
                    backgroundColor:
                      colorMode === "light" ? "blue.600" : "blue.700",
                  }}
                  // isDisabled={!locationFilled}
                  onClick={() => {
                    console.log("Here is the location data");
                    console.log(locationData);
                    if (
                      projectType.includes("External") ||
                      projectType.includes("Student")
                    ) {
                      // if (locationFilled) {
                      console.log("going next");
                      console.log(locationData);
                      setLocationFilled(true);
                      nextClick(
                        locationData
                        // "locations": [...locationData]
                      );
                      // } else return;
                    } else {
                      createClick();
                    }
                  }}
                  rightIcon={
                    projectType.includes("External") ||
                    projectType.includes("Student") ? undefined : (
                      <IoIosCreate />
                    )
                  }
                >
                  {projectType.includes("External") ||
                  projectType.includes("Student")
                    ? `Next`
                    : `Create`}
                </Button>
              </Box>
            </Grid>
          </Flex>

          {/* {dbcaRegions && (
                            <AreaCheckAndMaps
                                title="DBCA Regions"
                                areas={dbcaRegions}
                                required
                                selectedAreas={selectedRegions}
                                setSelectedAreas={setSelectedRegions}
                            />

                        )}
                        {dbcaDistricts && (
                            <AreaCheckAndMaps
                                title="DBCA Districts"
                                areas={dbcaDistricts}
                                required
                                selectedAreas={selectedDistricts}
                                setSelectedAreas={setSelectedDistricts}
                            />

                        )}
                        {ibra && (
                            <AreaCheckAndMaps
                                title="IBRAs"
                                areas={ibra}
                                required
                                selectedAreas={selectedIbras}
                                setSelectedAreas={setSelectedIbras}
                            />

                        )}
                        {imcra && (
                            <AreaCheckAndMaps
                                title="IMCRAs"
                                areas={imcra}
                                required
                                selectedAreas={selectedImcras}
                                setSelectedAreas={setSelectedImcras}
                            />

                        )}
                        {nrm && (
                            <AreaCheckAndMaps
                                title="Natural Resource Management Regions"
                                areas={nrm}
                                required
                                selectedAreas={selectedNrms}
                                setSelectedAreas={setSelectedNrms}
                            />

                        )} */}
          {/* </Flex> */}
        </Grid>
      )}
    </>
  );
};
