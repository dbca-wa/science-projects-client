// Handles displaying the tabs for the modern dashboard

import {
    Box,
    Button,
    Center,
    Flex,
    Spinner,
    Tab, TabList, TabPanel, TabPanels, Tabs,
    ToastId,
    useColorMode,
    useDisclosure
} from "@chakra-ui/react"
import { Quote } from "../../Quote";
import theme from "../../../theme";
import { useCallback, useEffect, useRef, useState } from "react";
import { MyTasksSection } from "./MyTasksSection";
import { useUser } from "../../../lib/hooks/useUser";

import { useGetMyTasks } from "../../../lib/hooks/useGetMyTasks";
import { useGetMyProjects } from "../../../lib/hooks/useGetMyProjects";
import { MyProjectsSection } from "./MyProjectsSection";
import { Admin } from "./Admin";
import { IDashProps, IQuickTask } from "../../../types";
import { useLocation, useNavigate } from "react-router-dom";
import { AddIcon } from "@chakra-ui/icons";
import { useForm } from "react-hook-form";
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPersonalTask } from "../../../lib/api";
import { AddPersonalTaskModal } from "../../Modals/AddPersonalTaskModal";
import { useGetDocumentsPendingMyAction } from "@/lib/hooks/useGetDocumentsPendingMyAction";
import { useGetEndorsementsPendingMyAction } from "@/lib/hooks/useGetEndorsementsPendingMyAction";


export const ModernDashboard = ({ activeTab }: IDashProps) => {
    const handleAddTaskClick = () => {
        console.log("Clicked add button");
        onAddTaskOpen();
    }

    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const activeTabFromQueryParam = parseInt(queryParams.get('activeTab') || `${activeTab || 0}`, 10);

    const [activeTabPanel, setActiveTabPanel] = useState<number>(activeTabFromQueryParam);

    useEffect(() => {
        // Set the activeTabPanel state based on the location state
        if (location.state && typeof location.state.activeTab === 'number') {
            setActiveTabPanel(location.state.activeTab);
        }
    }, [location.state]);

    const { taskData, tasksLoading } = useGetMyTasks()
    const { pendingProjectDocumentData, pendingProjectDocumentDataLoading } = useGetDocumentsPendingMyAction();
    const { pendingEndorsementsData, pendingEndorsementsDataLoading } = useGetEndorsementsPendingMyAction();

    useEffect(() => {
        console.log(pendingProjectDocumentData)
    }, [pendingProjectDocumentData])

    useEffect(() => {
        console.log(pendingEndorsementsData)
    }, [pendingEndorsementsData])


    const { projectData, projectsLoading } = useGetMyProjects()

    const [shouldConcat, setShouldConcat] = useState(false);

    const handleResize = useCallback(() => {
        // 1150 = the breakpoint at which issues occur with text overlaying
        if (window.innerWidth < 1150) {
            setShouldConcat(true);
        } else {
            setShouldConcat(false);
        }
    }, [theme.breakpoints.lg]);


    const { colorMode } = useColorMode();

    const tabBaseStyling = {
        fontSize: "lg",
        fontWeight: "semibold",
        color: colorMode === "light" ? "gray.400" : "gray.500"
    };

    const tabActiveStyling = {
        fontSize: "lg",
        fontWeight: "bold",
        color: colorMode === "light" ? "gray.600" : "gray.300",
        bg: "transparent", // Remove background color for active tab
    };

    const countCircleStyling = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "24px",
        height: "24px",
        rounded: "full",
        backgroundColor: colorMode === "light" ? "blue.500" : "blue.600",
        color: "white",
        fontSize: "sm",
    };

    const user = useUser();
    const { register, handleSubmit, reset } = useForm<IQuickTask>();
    const { isOpen: isAddTaskOpen, onOpen: onAddTaskOpen, onClose: onAddTaskClose } = useDisclosure();


    const queryClient = useQueryClient();

    // const rerenderTasks = () => {
    //     setTaskComponentKey((prevKey) => prevKey + 1);
    // }

    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    const [isAnimating, setIsAnimating] = useState(false);

    const taskCreationMutation = useMutation(createPersonalTask,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: "Creating Task",
                    position: "top-right"
                })
            },
            onSuccess: (data) => {
                setIsAnimating(true)


                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Task Created`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                reset()
                onAddTaskClose()

                setTimeout(() => {

                    setIsAnimating(false)
                    queryClient.invalidateQueries(["mytasks"]);

                    // queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Create Task',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })

    const onSubmitTaskCreation = (formData: IQuickTask) => {
        taskCreationMutation.mutate(formData);
    }


    return (
        <>
            {/* <Modal
                isOpen={isAddTaskOpen}
                onClose={onAddTaskClose}

            >
                <ModalOverlay />
                <ModalContent
                    color={colorMode === "light" ? "black" : "white"}
                    bg={colorMode === "light" ? "white" : "gray.800"}
                >
                    <ModalHeader
                    >
                        Create Personal Task
                    </ModalHeader>
                    <ModalBody
                        as="form" id="taskcreation-form"
                        onSubmit={handleSubmit(onSubmitTaskCreation)}
                    >
                        {user.userLoading === false
                            &&
                            (
                                <Input
                                    {...register("user", { required: true })}
                                    type="hidden"
                                    defaultValue={user.userData.pk}
                                />
                            )}

                        <FormControl
                            pb={6}
                        >
                            <FormLabel>Title</FormLabel>
                            <InputGroup>
                                <InputLeftAddon children={<MdOutlineTitle />} />
                                <Input
                                    placeholder="Enter the title of the task..."
                                    {...register("name", { required: true })}
                                    type="text"
                                />
                            </InputGroup>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <InputGroup>
                                <Textarea
                                    mt={2}
                                    placeholder="Enter description text for the task..."
                                    {...register("description", { required: true })}
                                />
                            </InputGroup>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onAddTaskClose}>
                            Cancel
                        </Button>
                        <Button
                            form="taskcreation-form"
                            type="submit"
                            isLoading={taskCreationMutation.isLoading}
                            bg={colorMode === "dark" ? "green.500" : "green.400"}
                            color={"white"}
                            _hover={
                                {
                                    bg: colorMode === "dark" ? "green.400" : "green.300",
                                }
                            }
                        >
                            Create
                        </Button>
                    </ModalFooter>
                </ModalContent>

            </Modal> */}
            <AddPersonalTaskModal
                user={user}
                isAnimating={isAnimating}
                setIsAnimating={setIsAnimating}
                isAddTaskOpen={isAddTaskOpen}
                onAddTaskClose={onAddTaskClose}
            />
            <Tabs
                variant="soft-rounded" bg="transparent"
                isLazy
                index={activeTabPanel}
            >
                <TabList>
                    <Tab sx={tabBaseStyling} _selected={tabActiveStyling}
                        onClick={() => {
                            setActiveTabPanel(0)
                            navigate('/', { replace: true, state: { activeTab: 0 } });
                        }}>
                        Dash
                        {(
                            <Center ml={2}>
                                <Box sx={countCircleStyling}>

                                    {
                                        tasksLoading === false ? (
                                            (
                                                pendingEndorsementsDataLoading === false ? (
                                                    pendingEndorsementsData.aec.length +
                                                    pendingEndorsementsData.bm.length +
                                                    pendingEndorsementsData.hc.length
                                                ) : 0
                                            ) +
                                            (
                                                pendingProjectDocumentDataLoading === false ? (
                                                    pendingProjectDocumentData.all.length
                                                ) : 0
                                            ) +
                                            (taskData.inprogress.length +
                                                taskData.todo.length)
                                        )
                                            : 0
                                    }
                                </Box>
                            </Center>
                        )}
                    </Tab>

                    <Tab sx={tabBaseStyling} _selected={tabActiveStyling}
                        onClick={() => {
                            setActiveTabPanel(1)
                            navigate('/', { replace: true, state: { activeTab: 1 } });
                        }}>
                        My Projects
                        {projectData && (
                            <Center ml={2}>
                                <Box sx={countCircleStyling}>{projectData.length}</Box>
                            </Center>
                        )}

                    </Tab>
                    {
                        user.userData.is_superuser &&
                        (
                            <Tab
                                sx={tabBaseStyling}
                                _selected={tabActiveStyling}
                                onClick={() => {
                                    setActiveTabPanel(2)
                                    navigate('/crud', { replace: true, state: { activeTab: 2 } });
                                }}
                            >
                                Admin Panel
                            </Tab>
                        )
                    }
                    <Box ml="auto" display="flex" alignItems="center" mr={4}>
                        <Button
                            bg={colorMode === "dark" ? "green.500" : "green.400"}
                            _hover={
                                {
                                    bg: colorMode === "dark" ? "green.400" : "green.300",
                                }
                            }
                            variant="solid"
                            px={3}
                            display="flex"
                            alignItems="center"
                            onClick={handleAddTaskClick}
                        >
                            <AddIcon color="white" />
                        </Button>
                    </Box>
                </TabList>
                <TabPanels>
                    <TabPanel>

                        <Quote />
                        <Box
                            mt={1}
                        >{
                                tasksLoading === false &&
                                    pendingEndorsementsDataLoading === false &&
                                    pendingProjectDocumentDataLoading === false ?
                                    (
                                        <MyTasksSection
                                            personalTaskData={taskData}
                                            personalTaskDataLoading={tasksLoading}
                                            endorsementTaskData={pendingEndorsementsData}
                                            endorsementTaskDataLoading={pendingEndorsementsDataLoading}
                                            documentTaskData={pendingProjectDocumentData}
                                            documentTaskDataLoading={pendingProjectDocumentDataLoading}
                                        />
                                    )
                                    :
                                    (
                                        <>
                                            <Flex
                                                w={"100%"}
                                                h={"100%"}
                                            >
                                                <Center
                                                    w={"100%"}
                                                    h={"100%"}
                                                    py={20}
                                                >
                                                    <Spinner
                                                        size={"xl"}
                                                    />
                                                </Center>
                                            </Flex>
                                        </>
                                    )
                            }

                        </Box>

                    </TabPanel>
                    <TabPanel>
                        <MyProjectsSection data={projectData} loading={projectsLoading} />
                    </TabPanel>

                    {user.userData.is_superuser &&
                        (
                            <TabPanel>
                                <Admin />
                            </TabPanel>
                        )}
                </TabPanels>

            </Tabs>
        </>

    );
};
