// Modal Component for editing the Project Details



import { Text, Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Box, useColorMode, useToast, ToastId } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { useCurrentYear } from "../../lib/hooks/useCurrentYear"
import { IconType } from "react-icons"
import { ProjectDetailsSection } from "../Pages/CreateProject/ProjectDetailsSection"
import { ProjectLocationSection } from "../Pages/CreateProject/ProjectLocationSection"
import { ProjectBaseInformation } from "../Pages/CreateProject/ProjectBaseInformation"
import "../../styles/modalscrollbar.css";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ICreateProjectBaseInfo, ICreateProjectDetails, ICreateProjectExternalDetails, ICreateProjectStudentDetails, IProjectCreationVariables, IUpdateProjectDetails, MutationError, MutationSuccess, ProjectCreationMutationSuccess, createProject, spawnDocument, updateProjectDetails } from "../../lib/api"
import { useNavigate } from "react-router-dom"
import { ProjectExternalSection } from "../Pages/CreateProject/ProjectExternalSection"
import { ProjectStudentSection } from "../Pages/CreateProject/ProjectStudentSection"
import { IFullProjectDetails, IProjectData } from "../../types"


interface IEditProjectDetailsProps {
    projectType: string;
    isOpen: boolean;
    onClose: () => void;
    icon: IconType;
    baseInformation: IProjectData;
    details: IFullProjectDetails | null | undefined;
}


export const ProjectDetailEditModal = ({ projectType, isOpen, onClose, icon, baseInformation, details }: IEditProjectDetailsProps) => {


    const ButtonIcon = icon;

    const currentYear = useCurrentYear();

    const { colorMode } = useColorMode();

    const [baseInformationFilled, setBaseInformationFilled] = useState<boolean>(false);
    const [projectDetailsFilled, setProjectDetailsFilled] = useState<boolean>(false);
    const [locationFilled, setLocationFilled] = useState<boolean>(false);
    const [externalFilled, setExternalFilled] = useState<boolean>(false);
    const [studentFilled, setStudentFilled] = useState<boolean>(false);
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);


    const [baseInformationData, setBaseInformationData] = useState<ICreateProjectBaseInfo>({} as ICreateProjectBaseInfo);
    const [detailsData, setDetailsData] = useState<ICreateProjectDetails>({} as ICreateProjectDetails);
    const [locationData, setLocationData] = useState([]);
    const [externalData, setExternalData] = useState<ICreateProjectExternalDetails>({} as ICreateProjectExternalDetails);
    const [studentData, setStudentData] = useState<ICreateProjectStudentDetails>({} as ICreateProjectStudentDetails);

    const goBack = () => {
        setActiveTabIndex(activeTabIndex !== 0 ? activeTabIndex - 1 : 0)
    }

    const controlledClose = () => {
        setActiveTabIndex(0)
        onClose();
    }

    const goToDetailsTab = (data: any) => {
        setBaseInformationData(data);
        setActiveTabIndex(1);
    };

    const goToLocationTab = (data: any) => {
        setDetailsData(data);
        setActiveTabIndex(2);
    };

    const goToFinalTab = (data: any) => {
        setLocationData(data);
        setLocationFilled(true);
        setActiveTabIndex(3);
    };



    const kickOffMutation = () => {
        console.log("Mutation here")
        // mutation.mutate({ baseInformationData, detailsData, locationData, externalData, studentData });
    }


    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const navigate = useNavigate();

    // const mutation = useMutation<
    //     MutationSuccess, MutationError, IUpdateProjectDetails
    // >(
    //     updateProjectDetails,
    //     {
    //         // Start of mutation handling
    //         onMutate: () => {
    //             addToast({
    //                 title: 'Creating project...',
    //                 description: "One moment!",
    //                 status: 'loading',
    //                 position: "top-right",
    //                 // duration: 3000
    //             })
    //         },
    //         // Success handling based on API-file-declared interface
    //         onSuccess: async (data) => {
    //             console.log(data)
    //             if (toastIdRef.current) {
    //                 toast.update(toastIdRef.current, {
    //                     title: 'Success',
    //                     description: `Project Created`,
    //                     status: 'success',
    //                     position: "top-right",
    //                     duration: 3000,
    //                     isClosable: true,
    //                 })
    //             }
    //             // Close the modal
    //             if (onClose) {
    //                 onClose();
    //                 if (!projectType.includes("Student") && !projectType.includes("External"))
    //                     await spawnDocument({ project_pk: data.pk, kind: data.kind });
    //                 else {
    //                     if (projectType.includes("Student")) {
    //                         console.log("Spawn document for Student here")
    //                     }
    //                     else {
    //                         console.log("Spawn document for External here")
    //                     }
    //                 }

    //                 queryClient.refetchQueries([`projects`])
    //                 navigate(`/projects/${data.pk}`);
    //             }
    //         },
    //         // Error handling based on API-file-declared interface
    //         onError: (error) => {
    //             let errorMessage = "";
    //             console.log(error)
    //             if (error.response?.data) {
    //                 const errorKeys = Object.keys(error.response.data);
    //                 if (errorKeys.length > 0) {
    //                     errorMessage = error.response.data[errorKeys[0]][0];
    //                 } else {
    //                     errorMessage = 'Unknown error occurred.';
    //                 }
    //             } else {
    //                 errorMessage = 'Unknown error occurred.';
    //             }

    //             const capitalizedErrorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);


    //             if (toastIdRef.current) {
    //                 toast.update(toastIdRef.current, {
    //                     title: 'Could not create project',
    //                     description: capitalizedErrorMessage,
    //                     status: 'error',
    //                     position: "top-right",
    //                     duration: 3000,
    //                     isClosable: true,
    //                 })
    //             }
    //         }
    //     }
    // )


    useEffect(() => {
        console.log(projectType)
    }, [projectType])

    return (
        baseInformation && details ?
            <Modal isOpen={isOpen} onClose={controlledClose}
                size={"3xl"}
                scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent
                    bg={colorMode === "light" ? "white" : "gray.800"}
                >
                    <ModalHeader
                        display={"inline-flex"}
                        // justifyContent={"center"}
                        alignItems={"center"}
                    // pb={6}
                    >
                        <Box
                            color={
                                projectType === "Core Function" ? "red.500" :
                                    projectType === "Science Project" ? "green.500" :
                                        projectType === "Student Project" ? "blue.500" :
                                            projectType === "External Project" ? "gray.500" :
                                                "gray.500"
                            }
                            mr={3}
                        >
                            <ButtonIcon />
                        </Box>
                        <Text>{baseInformation.title}</Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <Tabs isFitted variant='enclosed'
                        index={activeTabIndex}
                    >
                        <TabList mb='1em'>
                            <Tab>
                                Base Information
                            </Tab>
                            <Tab
                                isDisabled={
                                    !baseInformationFilled
                                }
                            >
                                Details
                            </Tab>
                            <Tab
                                isDisabled={!baseInformationFilled || !projectDetailsFilled}
                            >
                                Location
                            </Tab>
                            {projectType.includes("External") && (
                                <Tab
                                    isDisabled={!locationFilled}
                                >
                                    External Details
                                </Tab>
                            )}

                            {projectType === "Student Project" && (
                                <Tab
                                    isDisabled={!locationFilled}
                                >
                                    Student Details
                                </Tab>
                            )}
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <ProjectBaseInformation
                                    projectKind={projectType === "Core Function" ? 'core_function' :
                                        projectType === "Student Project" ? 'student' :
                                            projectType === "Science Project" ? 'science' :
                                                'external'}
                                    nextClick={goToDetailsTab}

                                    currentYear={currentYear}
                                    onClose={onClose}
                                    colorMode={colorMode}
                                    baseInformationFilled={baseInformationFilled}
                                    setBaseInformationFilled={setBaseInformationFilled}

                                />
                            </TabPanel>
                            <TabPanel>
                                <ProjectDetailsSection
                                    backClick={goBack}
                                    nextClick={goToLocationTab}

                                    onClose={onClose}
                                    projectType={projectType}
                                    colorMode={colorMode}
                                    projectDetailsFilled={projectDetailsFilled}
                                    setProjectDetailsFilled={setProjectDetailsFilled}
                                />
                            </TabPanel>
                            <TabPanel>
                                {
                                    projectType.includes("External") || projectType.includes("Student") ?
                                        <ProjectLocationSection
                                            locationFilled={locationFilled}
                                            locationData={locationData}
                                            setLocationData={setLocationData}
                                            setLocationFilled={setLocationFilled}
                                            onClose={onClose}
                                            projectType={projectType}
                                            currentYear={currentYear}
                                            colorMode={colorMode}
                                            backClick={goBack}
                                            nextClick={goToFinalTab}
                                            createClick={kickOffMutation}
                                        />
                                        :

                                        <ProjectLocationSection
                                            locationFilled={locationFilled}
                                            locationData={locationData}
                                            setLocationData={setLocationData}
                                            setLocationFilled={setLocationFilled}
                                            onClose={onClose}
                                            projectType={projectType}
                                            currentYear={currentYear}
                                            colorMode={colorMode}
                                            backClick={goBack}
                                            createClick={kickOffMutation}
                                        />

                                }
                            </TabPanel>
                            {projectType.includes("External") && (
                                <TabPanel>
                                    <ProjectExternalSection
                                        externalFilled={externalFilled}
                                        externalData={externalData}
                                        setExternalData={setExternalData}
                                        setExternalFilled={setExternalFilled}
                                        onClose={onClose}
                                        backClick={goBack}
                                        createClick={kickOffMutation}
                                    // projectPk={}
                                    />
                                </TabPanel>
                            )}

                            {projectType.includes("Student") && (
                                <TabPanel>

                                    <ProjectStudentSection
                                        studentFilled={studentFilled}
                                        studentData={studentData}
                                        setStudentData={setStudentData}
                                        setStudentFilled={setStudentFilled}
                                        onClose={onClose}
                                        backClick={goBack}
                                        createClick={kickOffMutation}
                                    // projectPk={}
                                    />
                                </TabPanel>

                            )}
                        </TabPanels>
                    </Tabs>
                </ModalContent>
            </Modal >

            : null
    );
}
