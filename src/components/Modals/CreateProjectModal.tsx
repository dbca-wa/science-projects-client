// Modal for creating new projects



// useEffect(() => {
//     console.log({
//         "baseInformationData": baseInformationData,
//         "detailsData": detailsData,
//         "locationData": locationData,
//     })
// }, [baseInformationData, detailsData, locationData])


import { Text, Modal, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Tab, TabList, TabPanel, TabPanels, Tabs, Box, useColorMode, useToast, ToastId } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { useCurrentYear } from "../../lib/hooks/useCurrentYear"
import { IconType } from "react-icons"
import { ProjectDetailsSection } from "../Pages/CreateProject/ProjectDetailsSection"
import { ProjectLocationSection } from "../Pages/CreateProject/ProjectLocationSection"
import { ProjectBaseInformation } from "../Pages/CreateProject/ProjectBaseInformation"
import "../../styles/modalscrollbar.css";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ICreateProjectBaseInfo, ICreateProjectDetails, IProjectCreationVariables, MutationError, MutationSuccess, ProjectCreationMutationSuccess, createProject, spawnDocument } from "../../lib/api"
import { useNavigate } from "react-router-dom"

interface INewProjectModalProps {
    projectType: string;
    isOpen: boolean;
    onClose: () => void;
    icon: IconType;
}

export const CreateProjectModal = ({ projectType, isOpen, onClose, icon }: INewProjectModalProps) => {

    const ButtonIcon = icon;

    const currentYear = useCurrentYear();

    const { colorMode } = useColorMode();

    const [baseInformationFilled, setBaseInformationFilled] = useState<boolean>(false);
    const [projectDetailsFilled, setProjectDetailsFilled] = useState<boolean>(false);
    const [locationFilled, setLocationFilled] = useState<boolean>(false);
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);


    const [baseInformationData, setBaseInformationData] = useState<ICreateProjectBaseInfo>({} as ICreateProjectBaseInfo);
    const [detailsData, setDetailsData] = useState<ICreateProjectDetails>({} as ICreateProjectDetails);
    const [locationData, setLocationData] = useState([]);

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


    const kickOffMutation = () => {

        mutation.mutate({ baseInformationData, detailsData, locationData });
    }


    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const navigate = useNavigate();

    const mutation = useMutation<
        ProjectCreationMutationSuccess, MutationError, IProjectCreationVariables
    >(
        createProject,
        {
            // Start of mutation handling
            onMutate: () => {
                addToast({
                    title: 'Creating project...',
                    description: "One moment!",
                    status: 'loading',
                    position: "top-right",
                    // duration: 3000
                })
            },
            // Success handling based on API-file-declared interface
            onSuccess: async (data) => {
                console.log(data)
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Project Created`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                // Close the modal
                if (onClose) {
                    onClose();
                    if (projectType !== "student" && projectType !== "external")
                        await spawnDocument({ project_pk: data.pk, kind: data.kind });

                    queryClient.refetchQueries([`projects`])
                    navigate(`/projects/${data.pk}`);
                }
            },
            // Error handling based on API-file-declared interface
            onError: (error) => {
                let errorMessage = "";
                if (error.response?.data) {
                    const errorKeys = Object.keys(error.response.data);
                    if (errorKeys.length > 0) {
                        errorMessage = error.response.data[errorKeys[0]][0];
                    } else {
                        errorMessage = 'Unknown error occurred.';
                    }
                } else {
                    errorMessage = 'Unknown error occurred.';
                }

                const capitalizedErrorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);


                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could not create project',
                        description: capitalizedErrorMessage,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        }
    )



    return (
        <Modal isOpen={isOpen} onClose={controlledClose} scrollBehavior="inside">
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
                    <Text>New {projectType} - {currentYear}</Text>
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
                            Location</Tab>

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
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </ModalContent>
        </Modal >
    )
}