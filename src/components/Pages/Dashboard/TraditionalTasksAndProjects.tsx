// Used to display the tasks and projects of a user in the traditional layout

import { AccordionPanel, Box, AccordionButton, Accordion, AccordionIcon, AccordionItem, Flex, Text, Center, Button, Grid, useColorMode, Spinner, Divider } from "@chakra-ui/react"
import { FcHighPriority, FcOk } from "react-icons/fc"
import { AiFillProject } from "react-icons/ai"
import { useGetMyTasks } from "../../../lib/hooks/useGetMyTasks"
import { useGetMyProjects } from "../../../lib/hooks/useGetMyProjects"
import { IProjectData, IMainDoc, ITaskDisplayCard } from "../../../types"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProjectSearchContext } from "../../../lib/hooks/ProjectSearchContext"
import { TraditionalTaskDisplay } from "./TraditionalTaskDisplay"
import { AddIcon } from "@chakra-ui/icons"
import { GoProjectRoadmap } from "react-icons/go"
import { SimpleDisplaySRTE } from "../../RichTextEditor/Editors/Sections/SimpleDisplayRTE"
import { useGetDocumentsPendingApproval } from "../../../lib/hooks/useGetDocumentsPendingApproval"
import { HiDocumentCheck } from "react-icons/hi2";
import { ExtractedHTMLTitle } from "../../ExtractedHTMLTitle"
import { FaArrowRight, FaUserFriends } from "react-icons/fa"
import { MdScience } from "react-icons/md"
import { GiMaterialsScience } from "react-icons/gi"
import { RiBook3Fill } from "react-icons/ri"
import { useGetDocumentsPendingMyAction } from "../../../lib/hooks/useGetDocumentsPendingMyAction"


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


    const { projectData, projectsLoading } = useGetMyProjects();

    const { pendingProjectDocumentData, projectDocumentDataLoading } = useGetDocumentsPendingMyAction();

    const { colorMode } = useColorMode();

    const formattedKind = (kind: string) => {
        // "conceptplan" | "projectplan" | "progressreport" | "studentreport" | "projectclosure"
        if (kind === "concept" || kind === "conceptplan") {
            return "Concept Plan"
        } else if (kind === "projectplan") {
            return "Project Plan"
        } else if (kind === "progressreport") {
            return "Progress Report"
        } else if (kind === "projectclosure") {
            return "Project Closure"
        } else if (kind === "studentreport") {
            return "Student Report"
        }
        else {
            // catchall 

            return kind
        }
    }

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


    // useEffect(() => {
    //     setCombinedData((prev) => ...prev + )

    // }, [pendingProjectDocumentData, projectDocumentDataLoading])

    const defaultIndex = [
        (taskData?.inprogress.length + taskData?.todo.length) <= 5
            && (taskData?.inprogress?.length + taskData?.todo?.length) >= 1 ? 0 : null,
        1
        // projectData?.length <= 5 && projectData?.length >= 1 ? 1 : null,
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

    const goToProjectDocument = (pk: number | undefined, document: IMainDoc) => {

        let urlkind = '';
        if (document?.kind === "progressreport") {
            urlkind = 'progress'
        } else if (document?.kind === "projectclosure") {
            urlkind = 'closure'
        } else if (document?.kind === "studentreport") {
            urlkind = 'student'
        } else if (document?.kind === "concept") {
            urlkind = 'concept'
        } else if (document?.kind === "projectplan") {
            urlkind = 'project'
        }

        if (pk === undefined) {
            console.log("The Pk is undefined. Potentially use 'id' instead.")
        }
        else if (isOnProjectsPage) {
            navigate(`${pk}/${urlkind}`)
        }
        else {
            navigate(`projects/${pk}/${urlkind}`)

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
                                        (combinedData?.length >= 1 || pendingProjectDocumentData?.length > 1) ?
                                            <Box
                                                display={"inline-flex"}
                                                justifyContent={"center"}
                                                alignItems={"center"}
                                            >
                                                <Box mr={2}>
                                                    {combinedData?.length + pendingProjectDocumentData?.length}
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

                                            {

                                                !(projectDocumentDataLoading && pendingProjectDocumentData?.length >= 1) ?
                                                    (
                                                        pendingProjectDocumentData?.map((document: IMainDoc, index: number) => (
                                                            <Flex
                                                                key={index}
                                                                alignItems={"center"}
                                                                border={"1px solid"}
                                                                borderTopWidth={0}
                                                                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                                                w={"100%"}
                                                                p={2}
                                                                _hover={{
                                                                    color: colorMode === "dark" ? "blue.100" : "blue.300",
                                                                    textDecoration: "underline",
                                                                    cursor: "pointer"
                                                                }}
                                                            >
                                                                <Center
                                                                    color={colorMode === "light" ? "red.600" : "red.200"}
                                                                    mr={3}
                                                                    alignItems={"center"}
                                                                    alignContent={"center"}
                                                                    boxSize={5}
                                                                    w={"20px"}

                                                                >
                                                                    <HiDocumentCheck />
                                                                </Center>

                                                                <Box
                                                                    mx={0}
                                                                    maxW={"125px"}
                                                                    w={"100%"}
                                                                >
                                                                    <Text>{formattedKind(document?.kind)}</Text>
                                                                </Box>
                                                                <Divider
                                                                    orientation='vertical'
                                                                    // ml={-1}
                                                                    mr={5}
                                                                />
                                                                {/* <SimpleDisplaySRTE

                                                                    data={document?.project.title}
                                                                    displayData={document?.project.title}
                                                                    displayArea="traditionalProjectTitle"
                                                                /> */}
                                                                <ExtractedHTMLTitle
                                                                    htmlContent={`${document?.project.title}`}
                                                                    onClick={() => goToProjectDocument(document?.project?.pk ? document?.project?.pk : document?.project?.id, document)}

                                                                    color={
                                                                        colorMode === "dark" ? "blue.200" : "blue.400"
                                                                    }
                                                                    fontWeight={"bold"}
                                                                    cursor={"pointer"}
                                                                    _hover={
                                                                        {
                                                                            color: colorMode === "dark" ? "blue.100" : "blue.300",
                                                                            textDecoration: "underline",
                                                                        }
                                                                    }
                                                                />
                                                                <Flex
                                                                    alignItems="center"
                                                                    justifyContent={'flex-end'}
                                                                    right={0}
                                                                    flex={1}
                                                                    pl={4}

                                                                >
                                                                    <Button
                                                                        size={"xs"}
                                                                        bg={"blue.500"}
                                                                        color={"white"}
                                                                        _hover={{
                                                                            bg: "blue.400"
                                                                        }}
                                                                        rightIcon={<FaArrowRight />}
                                                                        onClick={() => goToProjectDocument(document?.project?.pk ? document?.project?.pk : document?.project?.id, document)}

                                                                    >
                                                                        Visit
                                                                    </Button>

                                                                </Flex>

                                                            </Flex>
                                                        ))


                                                    ) : null
                                            }


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
                                                    {projectData
                                                        ?.sort((a, b) => {
                                                            const order = ['science', 'student', 'core_function', 'external'];

                                                            const indexA = order.indexOf(a.kind);
                                                            const indexB = order.indexOf(b.kind);

                                                            // If both kinds are in the order array, compare their positions
                                                            if (indexA !== -1 && indexB !== -1) {
                                                                return indexA - indexB;
                                                            }

                                                            // If only one kind is in the order array, prioritize it
                                                            if (indexA !== -1) {
                                                                return -1;
                                                            }

                                                            if (indexB !== -1) {
                                                                return 1;
                                                            }

                                                            // If neither kind is in the order array, maintain the original order
                                                            return 0;
                                                        })
                                                        .map((project: IProjectData, index: number) => (
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
                                                                    // color={colorMode === "light" ? "blue.600" : "gray.200"}
                                                                    color={
                                                                        project?.kind === "core_function" ? "red.600" :
                                                                            project?.kind === "science" ? "green.600" :
                                                                                project?.kind === "student" ? "blue.600" :
                                                                                    "gray.600"
                                                                    }
                                                                    mr={3}
                                                                    alignItems={"center"}
                                                                    alignContent={"center"}
                                                                    boxSize={5}
                                                                >
                                                                    {project?.kind === "core_function" ? <GiMaterialsScience /> :
                                                                        project?.kind === "science" ? <MdScience /> :
                                                                            project?.kind === "student" ? <RiBook3Fill /> :
                                                                                <FaUserFriends />}
                                                                    {/* <GoProjectRoadmap /> */}
                                                                </Center>
                                                                {/* <Text
                                                                color={colorMode === "dark" ? "blue.200" : "blue.400"}
                                                                fontWeight={"bold"}
                                                                cursor={"pointer"}
                                                                _hover={{
                                                                    color: colorMode === "dark" ? "blue.100" : "blue.300",
                                                                    textDecoration: "underline",
                                                                }}
                                                            >

                                                                {`${project.title}`}
                                                            </Text> */}

                                                                {/* <SimpleDisplaySRTE

                                                                data={project.title}
                                                                displayData={project.title}
                                                                displayArea="traditionalProjectTitle"
                                                            /> */}

                                                                <ExtractedHTMLTitle
                                                                    htmlContent={`${project.title}`}
                                                                    color={
                                                                        colorMode === "dark" ? "blue.200" : "blue.400"
                                                                    }
                                                                    fontWeight={"bold"}
                                                                    cursor={"pointer"}
                                                                    _hover={
                                                                        {
                                                                            color: colorMode === "dark" ? "blue.100" : "blue.300",
                                                                            textDecoration: "underline",
                                                                        }
                                                                    }
                                                                />


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

                            {/* 

                            {!projectDocumentDataLoading &&
                                (
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
                                                Project Documents Pending Approval
                                            </Box>
                                            {pendingProjectDocumentData?.length >= 1 ?
                                                <Box
                                                    display={"inline-flex"}
                                                    justifyContent={"center"}
                                                    alignItems={"center"}
                                                >
                                                    <Box mr={2}>
                                                        {pendingProjectDocumentData?.length}
                                                    </Box>
                                                    <HiDocumentCheck />

                                                </Box>
                                                : null
                                            }
                                            <AccordionIcon />
                                        </AccordionButton>

                                        <AccordionPanel
                                            pb={4}
                                            userSelect={"none"}
                                            px={0}
                                            pt={0}
                                        >
                                            {

                                                pendingProjectDocumentData?.length >= 1 ?
                                                    (
                                                        <Grid
                                                            justifyItems={"start"}
                                                            w={"100%"}
                                                        >
                                                            {pendingProjectDocumentData?.map((document: IMainDoc, index: number) => (
                                                                <Flex
                                                                    key={index}
                                                                    alignItems={"center"}
                                                                    border={"1px solid"}
                                                                    borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                                                    w={"100%"}
                                                                    p={2}
                                                                    onClick={() => goToProjectDocument(document?.project?.pk ? document?.project?.pk : document?.project?.id, document)}
                                                                    _hover={{
                                                                        color: colorMode === "dark" ? "blue.100" : "blue.300",
                                                                        textDecoration: "underline",
                                                                        cursor: "pointer"
                                                                    }}
                                                                >
                                                                    <Center
                                                                        color={colorMode === "light" ? "red.600" : "red.200"}
                                                                        mr={3}
                                                                        alignItems={"center"}
                                                                        alignContent={"center"}
                                                                        boxSize={5}
                                                                    >
                                                                        <HiDocumentCheck />
                                                                    </Center>
                                                                    <Box
                                                                        mx={0}
                                                                        w={"100px"}
                                                                    >

                                                                        <Text>{formattedKind(document?.kind)}</Text>

                                                                    </Box>
                                                                    <Divider
                                                                        orientation='vertical'
                                                                        // ml={-6}
                                                                        mr={5}
                                                                    />
                                                                    <SimpleDisplaySRTE

                                                                        data={document?.project.title}
                                                                        displayData={document?.project.title}
                                                                        displayArea="traditionalProjectTitle"
                                                                    />


                                                                </Flex>
                                                            ))}
                                                        </Grid>
                                                    ) :
                                                    <Text
                                                        mt={4}
                                                        mx={2}
                                                    >
                                                        There are no project documents pending approval

                                                    </Text>
                                            }
                                        </AccordionPanel>

                                    </AccordionItem>
                                )

                            } */}


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