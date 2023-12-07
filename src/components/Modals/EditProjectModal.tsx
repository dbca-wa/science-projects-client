import { Text, Image, Center, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, ToastId, useToast, useColorMode, UnorderedList, ListItem, FormControl, InputGroup, Input, ModalFooter, Grid, Button, FormLabel, VisuallyHiddenInput, FormHelperText, Box, Icon, Select } from "@chakra-ui/react";
import { IEditProject, ISimplePkProp, deleteProjectCall, updateProjectDetails } from "../../lib/api";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IBusinessArea, IDepartmentalService, IResearchFunction, ISimpleLocationData, ISmallResearchFunction, ISmallService, ISmallUser, IUserMe, ProjectImage } from "../../types";
import { useForm } from "react-hook-form";
import { StateRichTextEditor } from "../RichTextEditor/Editors/StateRichTextEditor";
import { useProject } from "../../lib/hooks/useProject";
import TagInput from "../Pages/CreateProject/TagInput";
import { ImagePreview } from "../Pages/CreateProject/ImagePreview";
import useApiEndpoint from "../../lib/hooks/useApiEndpoint";
import { BsFillCalendarEventFill } from "react-icons/bs";
import { CalendarWithCSS } from "../Pages/CreateProject/CalendarWithCSS";
import { useResearchFunctions } from "../../lib/hooks/useResearchFunctions";
import { useDepartmentalServices } from "../../lib/hooks/useDepartmentalServices";
import { useBusinessAreas } from "../../lib/hooks/useBusinessAreas";
import { useGetLocations } from "../../lib/hooks/useGetLocations";
import { AreaCheckAndMaps } from "../Pages/CreateProject/AreaCheckAndMaps";
import { UserSearchDropdown } from "../Navigation/UserSearchDropdown";
import { useNoImage } from "../../lib/hooks/useNoImage";
import { NewImagePreview } from "../Pages/CreateProject/NewImagePreview";

interface Props {
    // thisUser: IUserMe;
    // leaderPk: number;
    projectPk: string | number;
    currentTitle: string;
    currentKeywords: string[];
    currentDates: Date[];
    currentBa: IBusinessArea;
    currentResearchFunction: ISmallResearchFunction;
    currentService: ISmallService;
    currentDataCustodian: number;


    isOpen: boolean;
    onClose: () => void;
    refetchData: () => void;

    currentAreas: ISimpleLocationData[];
    currentImage: ProjectImage;
}

export const EditProjectModal = ({
    projectPk,
    currentTitle, currentKeywords, currentDates, currentBa, currentService, currentResearchFunction,
    currentAreas,
    currentImage, currentDataCustodian,
    isOpen,
    onClose,
    refetchData,
}: Props) => {

    const { dbcaRegions, dbcaDistricts, nrm, ibra, imcra, locationsLoading } = useGetLocations();
    const [locationData, setLocationData] = useState<number[]>(currentAreas.map(area => area.pk));

    useEffect(() => {
        if (locationData.length === 0) {
            setLocationData(currentAreas.map(area => area.pk))
            console.log(locationData);
        }
        else {
            console.log('not zero')
            console.log(locationData)
        }
        // console.log(currentAreas)
        // console.log(selectedRegions);
        // console.log(selectedDistricts);
        // console.log(selectedIbras);
        // console.log(selectedImcras);
        // console.log(selectedNrms);
    }, [])

    const [businessAreaList, setBusinessAreaList] = useState<IBusinessArea[]>([]);
    const { baData: businessAreaDataFromAPI, baLoading } = useBusinessAreas();
    const [baSet, setBaSet] = useState(false);

    useEffect(() => {
        if (!baLoading && baSet === false) {
            console.log(businessAreaDataFromAPI)
            const alphabetisedBA = [...businessAreaDataFromAPI]
            alphabetisedBA.sort((a, b) => a.name.localeCompare(b.name));
            setBusinessAreaList(alphabetisedBA)
            setBaSet(true)

        }
    }, [baLoading, businessAreaDataFromAPI, baSet])





    const [servicesList, setServicesList] = useState<IDepartmentalService[]>([]);
    const { dsData: servicesDataFromAPI, dsLoading } = useDepartmentalServices();
    const [dsSet, setDsSet] = useState(false);
    useEffect(() => {
        if (!dsLoading && dsSet === false) {
            console.log(servicesDataFromAPI)
            const alphabetisedDS = [...servicesDataFromAPI]
            alphabetisedDS.sort((a, b) => a.name.localeCompare(b.name));
            setServicesList(alphabetisedDS)
            setDsSet(true)

        }
    }, [dsLoading, servicesDataFromAPI, dsSet])


    const [researchFunctionsList, setResearchFunctionsList] = useState<IResearchFunction[]>([]);
    const { rfData: researchFunctionsFromAPI, rfLoading } = useResearchFunctions();
    const [rfSet, setRfSet] = useState(false);
    useEffect(() => {
        if (!rfLoading && rfSet === false) {
            console.log(researchFunctionsFromAPI)
            const alphabetisedRF = [...researchFunctionsFromAPI]
            alphabetisedRF.sort((a, b) => a.name.localeCompare(b.name));
            setResearchFunctionsList(alphabetisedRF)
            setRfSet(true)
        }
    }, [rfLoading, researchFunctionsFromAPI, rfSet])


    // id/pk
    const [projectTitle, setProjectTitle] = useState(currentTitle);
    const [keywords, setKeywords] = useState(currentKeywords);
    const [dates, setDates] = useState(currentDates);
    const [businessArea, setBusinessArea] = useState(currentBa);
    const [service, setService] = useState<ISmallService | IDepartmentalService>(currentService);
    const [researchFunction, setResearchFunction] = useState<IResearchFunction | ISmallResearchFunction>(currentResearchFunction);
    const [dataCustodian, setDataCustodian] = useState(currentDataCustodian)

    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const noImageLink = useNoImage();
    // const imageUrl = useServerImageUrl(noImageLink);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>();

    const baseAPI = useApiEndpoint();

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
        }
    };

    // const [status, setStatus] = useState(projectData?.project?.status);
    const [canUpdate, setCanUpdate] = useState(false);

    const getPlainTextFromHTML = (htmlString) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = htmlString;

        // Find the first 'p' or 'span' tag and get its text content
        const tag = wrapper.querySelector('p, span');
        return tag ? tag.textContent : '';
    };


    useEffect(() => {
        console.log({
            projectTitle,
            keywords,
            dates,
            businessArea,
            service,
            researchFunction,
            dataCustodian
        })
        const plainTitle = getPlainTextFromHTML(projectTitle)
        if (
            (plainTitle === '' || plainTitle.length === 0) ||
            (dates === null || dates.length < 2) ||
            // (service === null || service === undefined) ||
            // (researchFunction === null || researchFunction === undefined) ||
            (businessArea === null || businessArea === undefined) ||
            (dataCustodian === null || dataCustodian === 0 || dataCustodian === undefined) ||
            (locationData.length < 1) ||
            (keywords.length === 0)
        ) {
            setCanUpdate(false)
        } else {
            setCanUpdate(true)
        }
        console.log(selectedFile);
        console.log(currentImage);
    }, [
        projectTitle, keywords, dates, businessArea, service, researchFunction, dataCustodian,
        locationData,
        selectedFile, currentImage,
    ])








    const { register, handleSubmit, reset, watch } = useForm<IEditProject>();
    const queryClient = useQueryClient();
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }
    const { colorMode } = useColorMode();

    const updateProject = async (formData: IEditProject) => {
        console.log('updating project')
        console.log(formData)
        await updateProjectMutation.mutate(formData);
    }

    const updateProjectMutation = useMutation(updateProjectDetails,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: `Updating Project`,
                    position: "top-right"
                })
            },
            onSuccess: async (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Project Updated`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }

                setTimeout(() => {
                    queryClient.invalidateQueries(["projects", projectPk]);
                    refetchData();
                    onClose();

                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: `Could Not udpate project`,
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })


    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size={"full"}
            >
                <ModalOverlay />
                <Flex
                // as={"form"}
                //     onSubmit={handleSubmit(updateProject)}
                >
                    <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                        <ModalHeader>Edit Project?</ModalHeader>
                        <ModalCloseButton />

                        <ModalBody>
                            <VisuallyHiddenInput
                                type="text"
                                placeholder="pk"
                                value={projectPk}
                                readOnly
                            />
                            <FormControl>

                                <FormLabel>Project Title</FormLabel>
                                <StateRichTextEditor
                                    section={"title"}
                                    editorType={"ProjectDetail"}
                                    isUpdate={true}
                                    value={projectTitle}
                                    setValueFunction={setProjectTitle}
                                />
                            </FormControl>
                            {/* <FormControl>
                                    <FormLabel>Project Description</FormLabel>
                                    <StateRichTextEditor
                                        section={"description"}
                                        editorType={"ProjectDetail"}
                                        isUpdate={true}
                                        value={projectDescription}
                                        setValueFunction={setProjectDescription}
                                    />
                                </FormControl> */}
                            <TagInput setTagFunction={setKeywords} preExistingTags={keywords} />

                            <Box w={"100%"} h={"100%"} display="flex" alignItems="center" justifyContent="center">
                                <FormControl isRequired>

                                    <FormLabel>
                                        <Box
                                            display={"inline-flex"}
                                            justifyContent={"center"}
                                            alignItems={"center"}
                                        >
                                            <Icon as={BsFillCalendarEventFill} mr={2} />
                                            Start and End Dates
                                        </Box>

                                    </FormLabel>

                                    <CalendarWithCSS onChange={setDates} preselectedDates={dates} />

                                    <FormHelperText>
                                        Select a start and end date by clicking on the calendar. The first clicked date is the start date, the second is the end date.
                                    </FormHelperText>
                                </FormControl>
                            </Box>

                            <Grid
                                gridTemplateColumns={"repeat(1, 1fr)"}
                                gridGap={4}
                                // flexDir={"column"}
                                mt={4}
                            >
                                <UserSearchDropdown
                                    {...register("dataCustodian", { required: true })}

                                    onlyInternal={false}
                                    isRequired={true}
                                    setUserFunction={setDataCustodian}
                                    isEditable
                                    preselectedUserPk={currentDataCustodian}
                                    label="Data Custodian"
                                    placeholder="Search for a user"
                                    helperText={
                                        <>
                                            The user you would like to handle data.
                                        </>
                                    }
                                />

                                {!baLoading && baSet && (
                                    <>


                                        <FormControl isRequired>
                                            <FormLabel>Business Area</FormLabel>

                                            <InputGroup>
                                                <Select
                                                    variant='filled'
                                                    placeholder='Select a Business Area'
                                                    onChange={(event) => {
                                                        const pkVal = event.target.value;
                                                        const relatedBa = businessAreaList.find((ba) => Number(ba.pk) === Number(pkVal));

                                                        console.log(event.target.value)
                                                        console.log(relatedBa);
                                                        if (relatedBa !== undefined) {
                                                            setBusinessArea(relatedBa)
                                                        }
                                                    }
                                                    }
                                                    value={businessArea?.pk}
                                                >
                                                    {businessAreaList.map((ba, index) => {
                                                        return (
                                                            <option key={index} value={ba.pk}>
                                                                {ba.name}
                                                            </option>
                                                        )
                                                    })}
                                                </Select>
                                            </InputGroup>
                                            <FormHelperText>The Business Area / Program that this project belongs to.</FormHelperText>
                                        </FormControl>


                                        <FormControl
                                            // isRequired 
                                            mb={4}>
                                            <FormLabel>Research Function</FormLabel>
                                            <InputGroup>
                                                <Select
                                                    variant='filled' placeholder='Select a Research Function'
                                                    onChange={(event) => {
                                                        const pkVal = event.target.value;
                                                        const relatedRF = researchFunctionsList.find((rf) => Number(rf.pk) === Number(pkVal));

                                                        console.log(event.target.value)
                                                        console.log(relatedRF);
                                                        if (relatedRF !== undefined) {
                                                            setResearchFunction(relatedRF)
                                                        }
                                                    }
                                                    }
                                                    value={researchFunction?.pk}
                                                >
                                                    {researchFunctionsList?.map((rf, index) => {
                                                        return (
                                                            <option
                                                                key={index}
                                                                value={rf.pk}
                                                            >
                                                                {rf.name}
                                                            </option>
                                                        )
                                                    })}
                                                </Select>
                                            </InputGroup>
                                            <FormHelperText>The Research Function this project mainly contributes to.</FormHelperText>
                                        </FormControl>

                                        <FormControl
                                            // isRequired 
                                            mb={4}>
                                            <FormLabel>Departmental Service</FormLabel>
                                            <InputGroup>
                                                <Select
                                                    variant='filled' placeholder='Select a Deparmental Service'
                                                    onChange={(event) => {
                                                        const pkVal = event.target.value;
                                                        const depService = servicesList.find((serv) => Number(serv.pk) === Number(pkVal));

                                                        console.log(event.target.value)
                                                        console.log(depService);
                                                        if (depService !== undefined) {
                                                            setService(depService)
                                                        }
                                                    }
                                                    }
                                                    value={service?.pk}                                            >
                                                    {servicesList.map((service, index) => {
                                                        return (
                                                            <option key={index} value={service.pk}>
                                                                {service.name}
                                                            </option>
                                                        )
                                                    })}
                                                </Select>
                                            </InputGroup>
                                            <FormHelperText>The DBCA service that this project delivers outputs to.</FormHelperText>
                                        </FormControl>

                                    </>
                                )}

                                {!locationsLoading && (
                                    <>

                                        <Grid
                                            gridTemplateColumns={"repeat(2, 1fr)"}
                                            gridColumnGap={4}
                                            px={4}
                                        >
                                            <Flex
                                                flexDir={"column"}
                                            >
                                                {dbcaRegions && dbcaRegions.length > 0 && (
                                                    <AreaCheckAndMaps
                                                        title="DBCA Regions"
                                                        areas={dbcaRegions}
                                                        required={false}
                                                        selectedAreas={locationData}
                                                        setSelectedAreas={setLocationData}
                                                    />

                                                )}
                                                {dbcaDistricts && dbcaDistricts.length > 0 && (
                                                    <AreaCheckAndMaps
                                                        title="DBCA Districts"
                                                        areas={dbcaDistricts}
                                                        required={false}
                                                        selectedAreas={locationData}
                                                        setSelectedAreas={setLocationData}
                                                    />

                                                )}
                                                {ibra && ibra.length > 0 && (
                                                    <AreaCheckAndMaps
                                                        title="IBRAs"
                                                        areas={ibra}
                                                        required={false}
                                                        selectedAreas={locationData}
                                                        setSelectedAreas={setLocationData}
                                                    />

                                                )}
                                                {imcra && imcra.length > 0 && (
                                                    <AreaCheckAndMaps
                                                        title="IMCRAs"
                                                        areas={imcra}
                                                        required={false}
                                                        selectedAreas={locationData}
                                                        setSelectedAreas={setLocationData}
                                                    />

                                                )}
                                                {nrm && nrm.length > 0 && (
                                                    <AreaCheckAndMaps
                                                        title="Natural Resource Management Regions"
                                                        areas={nrm}
                                                        required={false}
                                                        selectedAreas={locationData}
                                                        setSelectedAreas={setLocationData}
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
                                            </Box>
                                        </Grid>

                                    </>
                                )}

                            </Grid>




                            <FormControl my={4}>

                                <FormLabel>Image</FormLabel>
                                <Grid
                                    gridTemplateColumns={"repeat(2, 1fr)"}
                                    gridGap={4}
                                >

                                    <NewImagePreview
                                        selectedFile={selectedFile}
                                        currentString={currentImage?.file ? `${baseAPI}${currentImage?.file}` : undefined}
                                    />

                                    <Box>
                                        <InputGroup>
                                            <Button
                                                as="label"
                                                htmlFor="fileInput"
                                                pt={1}
                                                display="inline-flex"
                                                justifyContent="center"
                                                alignItems="center"
                                                bg={colorMode === "light" ? "gray.200" : "gray.700"}
                                                color={colorMode === "light" ? "black" : "white"}
                                                cursor={"pointer"}
                                            >
                                                Choose File
                                            </Button>
                                            <Input
                                                id="fileInput"
                                                type="file"
                                                onChange={handleFileInputChange}
                                                opacity={0}
                                                position="absolute"
                                                width="0.1px"
                                                height="0.1px"
                                                zIndex="-1"
                                            />
                                        </InputGroup>
                                        <FormHelperText>
                                            Upload an image that represents the project.
                                        </FormHelperText>

                                    </Box>
                                </Grid>
                            </FormControl>



                        </ModalBody>
                        <ModalFooter>
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
                                    // isDisabled={!changesMade}
                                    isLoading={updateProjectMutation.isLoading}
                                    type="submit"
                                    ml={3}
                                    isDisabled={!canUpdate}
                                    onClick={(async () => {
                                        updateProject({
                                            projectPk: projectPk,
                                            title: projectTitle,
                                            // description: ,
                                            image: selectedFile,
                                            // status: ,
                                            dataCustodian: dataCustodian,
                                            keywords: keywords,
                                            dates: dates,
                                            departmentalService: service?.pk,
                                            researchFunction: researchFunction?.pk,
                                            businessArea: businessArea?.pk,
                                            locations: locationData,
                                        })
                                    })}
                                >
                                    Update
                                </Button>
                            </Grid>
                        </ModalFooter>
                    </ModalContent>
                </Flex>

            </Modal>

        </>
    )
}
