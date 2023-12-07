import { Text, Center, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, ToastId, useToast, useColorMode, UnorderedList, ListItem, FormControl, InputGroup, Input, ModalFooter, Grid, Button, Box } from "@chakra-ui/react";
import { IDeleteDocument, ISetProjectAreas, ISimplePkProp, deleteDocumentCall, deleteProjectCall, setProjectAreas } from "../../lib/api";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IUserMe } from "../../types";
import { useForm } from "react-hook-form";
import { useGetStudentReportAvailableReportYears } from "../../lib/hooks/useGetStudentReportAvailableReportYears";
import { useGetProgressReportAvailableReportYears } from "../../lib/hooks/useGetProgressReportAvailableReportYears";
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

export const SetAreasModal = ({ projectPk, refetchData, isOpen, onClose, onDeleteSuccess, setToLastTab }: Props) => {


    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const setAreasMutation = useMutation(setProjectAreas,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: `Updating Areas`,
                    position: "top-right"
                })
            },
            onSuccess: async (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Areas updated`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                    onDeleteSuccess && onDeleteSuccess();

                }
                // onClose();

                setTimeout(async () => {
                    // if (setIsAnimating) {
                    //     setIsAnimating(false)
                    // }
                    queryClient.invalidateQueries(["projects", "areas", projectPk]);
                    await refetchData();
                    onClose();
                    // console.log('deleting')
                    setToLastTab();

                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: `Could not set areas`,
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })


    const setAreas = (formData: ISetProjectAreas) => {
        console.log('from func', formData)
        setAreasMutation.mutate(formData);
    }

    const { colorMode } = useColorMode();
    const { register, handleSubmit, reset, watch, formState: { isSubmitting, isDirty, isValid } } = useForm<ISetProjectAreas>();

    const projPk = watch('projectPk');
    useEffect(() => console.log(projPk, projectPk), [projectPk, projPk])


    const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } = useGetLocations();

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
    }, [selectedRegions, selectedIbras, selectedDistricts, selectedImcras, selectedNrms, setLocationData]);
    useEffect(() => {
        console.log(locationData)
    }, [locationData])

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


    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={"full"}
        >
            <ModalOverlay />
            <Flex as={"form"}
            // onSubmit={handleSubmit(setAreas)}
            >
                <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ModalHeader>Set Project Areas</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <>
                            {/* <FormControl>
                                <Input type="hidden" {...register('projectPk')} value={projectPk} />
                            </FormControl>
                            <FormControl>
                                <Input type="hidden" {...register('areas')}
                                    value={locationData}
                                />
                            </FormControl> */}
                            {!locationsLoading && (

                                <Grid
                                    gridTemplateColumns={"repeat(2, 1fr)"}
                                    gridColumnGap={4}
                                    px={4}
                                >
                                    <Flex
                                        flexDir={"column"}
                                    >
                                        {dbcaRegions && (
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

                                        )}

                                    </Flex>

                                    <Box
                                        position="sticky"
                                        top={"120px"} // Adjust the top value if needed
                                        overflow={'hidden'}
                                        h={'700px'} // Set the height of the image container
                                        // bg={"red"}
                                        rounded={"2xl"}
                                    >
                                        <Text
                                            // color={"white"}
                                            // zIndex={999}
                                            fontWeight={'bold'}
                                            my={2}
                                            // ml={2}
                                            textAlign={'center'}
                                        >
                                            Map in development
                                        </Text>
                                        {/* <Skeleton
                            // position="sticky"
                            // top={"125px"} // Adjust the top value if needed
                            // overflow={'hidden'}
                            // h={'500px'} // Set the height of the image container
                            // bg={"red"}
                            rounded={"2xl"}
                        > */}
                                        <Box
                                            position="sticky"
                                            // top={"105px"} // Adjust the top value if needed
                                            overflow={'hidden'}
                                            // h={'500px'} // Set the height of the image container
                                            bg={"gray.200"}
                                            w={"100%"}
                                            h={"500px"}
                                            // h={"100%"}
                                            rounded={"2xl"}
                                        >
                                            {/* <Image
                                src="/soon.jpg"
                                objectFit={'cover'}
                                w={"100%"}
                                h={"100%"}
                            /> */}
                                        </Box>
                                        {/* </Skeleton> */}
                                        <Flex
                                            w={"100%"}
                                            justifyContent={"flex-end"}
                                            pb={4}
                                            pt={4}
                                        >
                                            <Button onClick={onClose}>Cancel</Button>
                                            <Button
                                                ml={3}
                                                // type="submit"
                                                colorScheme="blue"
                                                // onClick={() => {
                                                //     console.log('Here is the location data'
                                                //     )
                                                //     console.log(locationData)                                
                                                // }}
                                                rightIcon={<IoIosCreate />}
                                                isDisabled={!projectPk || locationData.length < 1}
                                                onClick={() => setAreas({
                                                    projectPk: Number(projectPk),
                                                    areas: locationData,
                                                })}
                                            >
                                                Set Areas
                                            </Button>
                                        </Flex>
                                    </Box>
                                </Grid>
                            )}
                        </>


                    </ModalBody>
                    {/* <ModalFooter>
                        <Grid
                            gridTemplateColumns={"repeat(2, 1fr)"}
                            gridGap={4}
                        >
                            <Button
                                colorScheme="gray"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="green"
                                isLoading={setAreasMutation.isLoading}
                                type="submit"
                                ml={3}
                            >
                                Set Areas
                            </Button>
                        </Grid>
                    </ModalFooter> */}
                </ModalContent>
            </Flex>

        </Modal>

    )
}