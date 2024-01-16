import {
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ToastId,
  useToast,
  useColorMode,
  Grid,
  Button,
} from "@chakra-ui/react";
import { ISetProjectAreas, setProjectAreas } from "../../lib/api";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetLocations } from "@/lib/hooks/useGetLocations";
import { AreaCheckAndMaps } from "../Pages/CreateProject/AreaCheckAndMaps";
import { IoIosCreate } from "react-icons/io";

interface Props {
  projectPk: string | number;
  refetchData: () => void;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
}

export const SetAreasModal = ({
  projectPk,
  refetchData,
  isOpen,
  onClose,
  onDeleteSuccess,
  setToLastTab,
}: Props) => {
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const setAreasMutation = useMutation(setProjectAreas, {
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Updating Areas`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Areas updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        onDeleteSuccess && onDeleteSuccess();
      }

      setTimeout(async () => {
        queryClient.invalidateQueries(["projects", "areas", projectPk]);
        await refetchData();
        onClose();
        setToLastTab();
      }, 350);
    },
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: `Could not set areas`,
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const setAreas = (formData: ISetProjectAreas) => {
    setAreasMutation.mutate(formData);
  };

  const { colorMode } = useColorMode();

  const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } =
    useGetLocations();

  const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<number[]>([]);
  const [selectedIbras, setSelectedIbras] = useState<number[]>([]);
  const [selectedImcras, setSelectedImcras] = useState<number[]>([]);
  const [selectedNrms, setSelectedNrms] = useState<number[]>([]);

  const [locationData, setLocationData] = useState<number[]>([]);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"full"}>
      <ModalOverlay />
      <Flex
        as={"form"}
        // onSubmit={handleSubmit(setAreas)}
      >
        <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
          <ModalHeader>Set Project Areas</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <>
              {!locationsLoading && (
                <Grid
                  gridTemplateColumns={"repeat(2, 1fr)"}
                  gridColumnGap={4}
                  px={4}
                >
                  <Center
                    display={"flex"}
                    justifyContent={"center"}
                    alignContent={"center"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    {" "}
                    {dbcaDistricts && (
                      <AreaCheckAndMaps
                        title="DBCA Districts"
                        areas={dbcaDistricts}
                        // required
                        selectedAreas={selectedDistricts}
                        setSelectedAreas={setSelectedDistricts}
                      />
                    )}
                  </Center>
                  <Center
                    display={"flex"}
                    justifyContent={"center"}
                    alignContent={"center"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    {" "}
                    {imcra && (
                      <AreaCheckAndMaps
                        title="IMCRAs"
                        areas={imcra}
                        // required
                        selectedAreas={selectedImcras}
                        setSelectedAreas={setSelectedImcras}
                      />
                    )}
                  </Center>
                  <Center
                    display={"flex"}
                    justifyContent={"center"}
                    alignContent={"center"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    {" "}
                    {dbcaRegions && (
                      <AreaCheckAndMaps
                        title="DBCA Regions"
                        areas={dbcaRegions}
                        // required
                        selectedAreas={selectedRegions}
                        setSelectedAreas={setSelectedRegions}
                      />
                    )}
                  </Center>
                  <Center
                    display={"flex"}
                    flexDir={"column"}
                    justifyContent={"center"}
                    alignContent={"center"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    {nrm && (
                      <AreaCheckAndMaps
                        title="Natural Resource Management Regions"
                        areas={nrm}
                        // required
                        selectedAreas={selectedNrms}
                        setSelectedAreas={setSelectedNrms}
                      />
                    )}
                    <Flex w={"100%"} justifyContent={"flex-end"}>
                      <Button onClick={onClose}>Cancel</Button>
                      <Button
                        ml={3}
                        // type="submit"
                        color={"white"}
                        background={
                          colorMode === "light" ? "blue.500" : "blue.600"
                        }
                        _hover={{
                          background:
                            colorMode === "light" ? "blue.400" : "blue.500",
                        }}
                        rightIcon={<IoIosCreate />}
                        isDisabled={!projectPk || locationData.length < 1}
                        onClick={() =>
                          setAreas({
                            projectPk: Number(projectPk),
                            areas: locationData,
                          })
                        }
                      >
                        Set Areas
                      </Button>
                    </Flex>
                  </Center>
                  <Center
                    display={"flex"}
                    justifyContent={"center"}
                    alignContent={"center"}
                    alignItems={"center"}
                    w={"100%"}
                  >
                    {ibra && (
                      <AreaCheckAndMaps
                        title="IBRAs"
                        areas={ibra}
                        // required
                        selectedAreas={selectedIbras}
                        setSelectedAreas={setSelectedIbras}
                      />
                    )}
                  </Center>
                </Grid>
              )}
            </>
          </ModalBody>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
