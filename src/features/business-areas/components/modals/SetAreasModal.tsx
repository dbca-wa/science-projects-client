import { useGetLocations } from "@/shared/hooks/tanstack/useGetLocations";
import {
  Box,
  Button,
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  type ToastId,
  useColorMode,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { IoIosCreate } from "react-icons/io";
import { type ISetProjectAreas, setProjectAreas } from "@/shared/lib/api";
import { AreaCheckAndMaps } from "../Pages/CreateProject/AreaCheckAndMaps";

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
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const setAreasMutation = useMutation({
    mutationFn: setProjectAreas,
    onMutate: () => {
      addToast({
        status: "loading",
        title: `Updating Areas`,
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `Areas updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        onDeleteSuccess?.();
      }

      setTimeout(async () => {
        queryClient.invalidateQueries({
          queryKey: ["projects", "areas", projectPk],
        });
        await refetchData();
        onClose();
        setToLastTab();
      }, 350);
    },
    onError: (error) => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
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
    <Modal isOpen={isOpen} onClose={onClose} size={"6xl"}>
      <ModalOverlay />
      <Flex
        as={"form"}
        // onSubmit={handleSubmit(setAreas)}
      >
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
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
                  <Box display={"flex"} w={"100%"}>
                    {" "}
                    {dbcaDistricts && (
                      <AreaCheckAndMaps
                        title="DBCA Districts"
                        areas={dbcaDistricts}
                        area_type="dbcadistrict"
                        // required
                        selectedAreas={selectedDistricts}
                        setSelectedAreas={setSelectedDistricts}
                      />
                    )}
                  </Box>
                  <Box display={"flex"} w={"100%"}>
                    {" "}
                    {imcra && (
                      <AreaCheckAndMaps
                        title="IMCRAs"
                        areas={imcra}
                        area_type="imcra"
                        // required
                        selectedAreas={selectedImcras}
                        setSelectedAreas={setSelectedImcras}
                      />
                    )}
                  </Box>
                  <Box display={"flex"} w={"100%"} mt={2}>
                    {" "}
                    {dbcaRegions && (
                      <AreaCheckAndMaps
                        title="DBCA Regions"
                        areas={dbcaRegions}
                        area_type="dbcaregion"
                        // required
                        selectedAreas={selectedRegions}
                        setSelectedAreas={setSelectedRegions}
                      />
                    )}
                  </Box>

                  <Box display={"flex"} flexDir={"column"} mt={2} w={"100%"}>
                    {nrm && (
                      <AreaCheckAndMaps
                        title="Natural Resource Management Regions"
                        areas={nrm}
                        area_type="nrm"
                        // required
                        selectedAreas={selectedNrms}
                        setSelectedAreas={setSelectedNrms}
                      />
                    )}
                  </Box>
                  <Box display={"flex"} w={"100%"}>
                    {ibra && (
                      <AreaCheckAndMaps
                        title="IBRAs"
                        areas={ibra}
                        area_type="ibra"
                        // required
                        selectedAreas={selectedIbras}
                        setSelectedAreas={setSelectedIbras}
                      />
                    )}
                  </Box>
                  <Flex w={"100%"} justifyContent={"flex-end"} mt={4}>
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
                </Grid>
              )}
            </>
          </ModalBody>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
