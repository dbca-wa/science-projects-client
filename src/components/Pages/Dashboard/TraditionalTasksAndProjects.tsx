// Used to display the tasks and projects of a user in the traditional layout

import { AccordionPanel, Box, AccordionButton, Accordion, AccordionIcon, AccordionItem, Flex, Text, Center, Button, Grid, useColorMode, Spinner } from "@chakra-ui/react"
import { FcHighPriority, FcOk } from "react-icons/fc"
import { AiFillProject } from "react-icons/ai"
import { useGetMyTasks } from "../../../lib/hooks/useGetMyTasks"
import { useGetMyProjects } from "../../../lib/hooks/useGetMyProjects"
import { IProjectData, ITaskDisplayCard } from "../../../types"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProjectSearchContext } from "../../../lib/hooks/ProjectSearchContext"
import { TraditionalTaskDisplay } from "./TraditionalTaskDisplay"
import { AddIcon } from "@chakra-ui/icons"
import { GoProjectRoadmap } from "react-icons/go"


interface ITaskFromAPI {
    todo: ITaskDisplayCard[];
    inprogress: ITaskDisplayCard[];
    done: ITaskDisplayCard[];
}

interface Props {
    onAddTaskOpen: () => void;
}

export const TraditionalTasksAndProjects = ({ onAddTaskOpen }: Props) => {
    const { taskData, tasksLoading } = useGetMyTasks()
    const [taskDataState, setTaskDataState] = useState<ITaskFromAPI | null>(null); // Replace 'null' with initial data or a loading state if required
    const [inprogress, setInprogress] = useState<ITaskDisplayCard[]>([]);
    const [todo, setTodo] = useState<ITaskDisplayCard[]>([]);
    const [done, setDone] = useState<ITaskDisplayCard[]>([]);
    const [combinedData, setCombinedData] = useState<ITaskDisplayCard[]>([]);

    useEffect(() => {
        if (!tasksLoading)
            setTaskDataState({
                inprogress: taskData.inprogress,
                todo: taskData.todo,
                done: taskData.done,
            })
    }, [tasksLoading, taskData])


    const { projectData, projectsLoading } = useGetMyProjects()

    const { colorMode } = useColorMode();

    // Once the component receives new data, update the state accordingly
    useEffect(() => {
        if (taskDataState && !tasksLoading) {
            // Filter and sort "assigned" tasks
            const sortedAssignedInprogress = taskDataState.inprogress.filter(item => item.task_type === "assigned").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
            const sortedAssignedTodo = taskDataState.todo.filter(item => item.task_type === "assigned").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
            const sortedAssignedDone = taskDataState.done.filter(item => item.task_type === "assigned").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());

            // Filter and sort "personal" tasks
            const sortedPersonalInprogress = taskDataState.inprogress.filter(item => item.task_type === "personal").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
            const sortedPersonalTodo = taskDataState.todo.filter(item => item.task_type === "personal").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());
            const sortedPersonalDone = taskDataState.done.filter(item => item.task_type === "personal").sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());

            // Combine the sorted arrays, with "assigned" tasks coming first
            const combinedData = [
                ...sortedAssignedInprogress,
                ...sortedAssignedTodo,
                // ...sortedAssignedDone,
                ...sortedPersonalInprogress,
                ...sortedPersonalTodo,
                // ...sortedPersonalDone,
            ];

            setInprogress(combinedData.filter(item => item.task_type === "assigned" && item.status === "inprogress"));
            setTodo(combinedData.filter(item => item.task_type === "assigned" && item.status === "todo"));
            setDone(combinedData.filter(item => item.task_type === "assigned" && item.status === "done"));
            setCombinedData(combinedData);
        }
    }, [taskDataState, tasksLoading]);

    const defaultIndex = [
        (taskData?.inprogress.length + taskData?.todo.length) <= 5 && (taskData?.inprogress?.length + taskData?.todo?.length) >= 1 ? 0 : null,
        projectData?.length <= 5 && projectData?.length >= 1 ? 1 : null,
    ].map((index) => (index !== null ? index : -1));


    const { isOnProjectsPage } = useProjectSearchContext();
    const navigate = useNavigate();

    const goToProject = (pk: number | undefined) => {
        if (pk === undefined) {
            console.log("The Pk is undefined. Potentially use 'id' instead.")
        }
        else if (isOnProjectsPage) {
            navigate(`${pk}`)
        }
        else {
            navigate(`projects/${pk}`)

        }
    }

    const handleAddTaskClick = () => {
        console.log("Clicked add button");
        onAddTaskOpen();
    }

    return (
        <>
            <Box
                mt={6}
            >
                {
                    !tasksLoading && !projectsLoading ? (
                        <Accordion
                            defaultIndex={defaultIndex}
                            allowMultiple
                        >
                            <AccordionItem
                                borderColor={colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.600"}
                                borderBottom={"none"}
                                borderTop={"none"}
                            >
                                <AccordionButton
                                    bg={colorMode === "light" ? "gray.200" : "gray.700"}
                                    color={colorMode === "light" ? "black" : "white"}
                                    _hover={colorMode === "light" ? { bg: 'gray.300', color: "black" } : { bg: 'gray.500', color: 'white' }}
                                    userSelect={"none"}
                                >
                                    <Box as="span" flex='1' textAlign='left'>
                                        My Tasks
                                    </Box>
                                    {
                                        combinedData?.length >= 1 ?
                                            <Box
                                                display={"inline-flex"}
                                                justifyContent={"center"}
                                                alignItems={"center"}
                                            >
                                                <Box mr={2}>
                                                    {combinedData?.length}
                                                </Box>
                                                <FcHighPriority />
                                            </Box>
                                            :
                                            <FcOk />
                                    }
                                    <AccordionIcon />
                                </AccordionButton>


                                <AccordionPanel pb={4}
                                    userSelect={"none"}
                                    px={0}
                                    pt={0}
                                >

                                    {combinedData.length >= 1 ? (
                                        <Grid
                                            gridTemplateColumns={"repeat(1, 1fr)"}
                                        >
                                            {combinedData.map((task: ITaskDisplayCard, index: number) => {
                                                return (
                                                    <TraditionalTaskDisplay
                                                        key={index}
                                                        task={task}
                                                    />
                                                )
                                            })}
                                        </Grid>
                                    )
                                        : <Center>
                                            <Flex>
                                                <Center
                                                    pt={10}
                                                >
                                                    <FcOk />
                                                    &nbsp;
                                                    <Text>All done!</Text>
                                                </Center>
                                            </Flex>
                                        </Center>
                                    }
                                    <Box
                                        display="flex"
                                        justifyContent={"flex-end"}
                                        alignItems="center"
                                        minWidth="100%" py={4}
                                    >
                                        <Button
                                            bg={colorMode === "dark" ? "green.500" : "green.400"}
                                            _hover={
                                                {
                                                    bg: colorMode === "dark" ? "green.400" : "green.300",
                                                }
                                            }
                                            variant="solid"
                                            px={3} // Adjust the padding to your preference
                                            mr={0}
                                            display="flex"
                                            alignItems="center"
                                            onClick={handleAddTaskClick}
                                            color="white"
                                            size={"sm"}
                                        >
                                            Add Task
                                            {/* <AddIcon ml={2} color="white" /> */}
                                        </Button>
                                    </Box>
                                </AccordionPanel>
                            </AccordionItem>
                            <AccordionItem
                                borderColor={colorMode === "light" ? "blackAlpha.500" : "whiteAlpha.600"}
                                borderBottom={"none"}
                            >
                                <AccordionButton
                                    bg={colorMode === "light" ? "gray.200" : "gray.700"}
                                    color={colorMode === "light" ? "black" : "white"}
                                    _hover={colorMode === "light" ? { bg: 'gray.300', color: "black" } : { bg: 'gray.500', color: 'white' }}
                                    userSelect={"none"}
                                >
                                    <Box as="span" flex='1' textAlign='left'>
                                        My Projects
                                    </Box>
                                    {projectData?.length >= 1 ?
                                        <Box
                                            display={"inline-flex"}
                                            justifyContent={"center"}
                                            alignItems={"center"}
                                        >
                                            <Box mr={2}>
                                                {projectData?.length}
                                            </Box>
                                            <AiFillProject />
                                        </Box>
                                        : null
                                    }
                                    <AccordionIcon />
                                </AccordionButton>

                                <AccordionPanel
                                    pb={4}
                                    userSelect={"none"}
                                    // w={"100%"}
                                    // bg={"red"}
                                    px={0}
                                    pt={0}
                                >
                                    {

                                        projectData?.length >= 1 ?
                                            (
                                                <Grid
                                                    // bg={"orange"}
                                                    justifyItems={"start"}
                                                    w={"100%"}
                                                >
                                                    {projectData?.map((project: IProjectData, index: number) => (
                                                        <Flex
                                                            key={index}
                                                            alignItems={"center"}
                                                            border={"1px solid"}
                                                            borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                                            w={"100%"}
                                                            p={2}
                                                            onClick={() => goToProject(project?.pk ? project.pk : project.id)}
                                                            _hover={{
                                                                color: colorMode === "dark" ? "blue.100" : "blue.300",
                                                                textDecoration: "underline",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            <Center
                                                                color={colorMode === "light" ? "blue.600" : "gray.200"}
                                                                mr={3}
                                                                alignItems={"center"}
                                                                alignContent={"center"}
                                                                boxSize={3}
                                                            >
                                                                <GoProjectRoadmap />
                                                            </Center>
                                                            <Text
                                                                color={colorMode === "dark" ? "blue.200" : "blue.400"}
                                                                fontWeight={"bold"}
                                                                cursor={"pointer"}
                                                                _hover={{
                                                                    color: colorMode === "dark" ? "blue.100" : "blue.300",
                                                                    textDecoration: "underline",
                                                                }}
                                                            >

                                                                {`${project.title}`}
                                                            </Text>

                                                        </Flex>
                                                    ))}
                                                </Grid>
                                            ) :
                                            <Text
                                                mt={4}
                                                mx={2}
                                            >
                                                You are currently not associated with any projects.

                                            </Text>
                                    }
                                </AccordionPanel>

                            </AccordionItem>

                        </Accordion>

                    )
                        : <Center>
                            <Spinner />
                        </Center>
                }

            </Box>
        </>
    )
}