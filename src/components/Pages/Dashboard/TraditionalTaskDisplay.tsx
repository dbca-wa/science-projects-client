import { Box, Button, Center, Divider, Flex, Grid, Tag, Text, ToastId, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import { ITaskDisplayCard } from "../../../types";
import { useNavigate } from "react-router-dom";
import { useProjectSearchContext } from "../../../lib/hooks/ProjectSearchContext";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloseIcon, CheckIcon } from "@chakra-ui/icons";
import { MutationError, MutationSuccess, completeTask, deletePersonalTask } from "../../../lib/api";
import { BsFlagFill } from 'react-icons/bs'
import { TaskDetailsModal } from "../../Modals/TaskDetailsModal";
import { HiDocumentCheck } from "react-icons/hi2";
import { FaUser } from "react-icons/fa";
import { MdPriorityHigh } from "react-icons/md";
interface Props {
    task: ITaskDisplayCard;
}


export const TraditionalTaskDisplay = ({ task }: Props) => {

    const [isHovered, setIsHovered] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);


    const { isOnProjectsPage } = useProjectSearchContext();
    const navigate = useNavigate();


    const goToProject = (pk: number) => {
        if (isOnProjectsPage) {
            navigate(`${pk}`)
        }
        else {
            navigate(`projects/${pk}`)

        }
    }
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const queryClient = useQueryClient();
    const [isAnimating, setIsAnimating] = useState(false);


    useEffect(() => {
        if (isDeleting === true || isCompleting === true) {
            setTimeout(() => {
                setIsDeleting(false);
                setIsCompleting(false);
            }, 500)
        }
    }, [isDeleting, isCompleting])

    const handleDeleteClick = (pk: number) => {
        setIsDeleting(true);
        taskdeleteMutation.mutate({ pk });
    }

    const handleCompletion = (pk: number) => {
        setIsCompleting(true);
        taskCompletionMutation.mutate({ pk });
    }


    const taskdeleteMutation = useMutation<
        MutationSuccess, MutationError, { pk: number }
    >(
        deletePersonalTask,
        {
            // Start of mutation handling
            onMutate: () => {
                addToast({
                    title: 'Deleting Task...',
                    description: "One moment!",
                    status: 'loading',
                    position: "top-right",
                    duration: 3000
                })
            },
            // Success handling based on API-file-declared interface
            onSuccess: (data) => {
                setIsAnimating(true)


                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Task Deleted`,
                        status: 'info',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                setTimeout(() => {

                    setIsAnimating(false)

                    queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            // Error handling based on API-file-declared interface
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Delete Task',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        }
    )


    const taskCompletionMutation = useMutation<
        MutationSuccess, MutationError, { pk: number }
    >(
        completeTask,
        {
            // Start of mutation handling
            onMutate: () => {
                addToast({
                    title: 'Completing Task...',
                    description: "One moment!",
                    status: 'loading',
                    position: "top-right",
                    duration: 3000
                })
            },
            // Success handling based on API-file-declared interface
            onSuccess: (data) => {
                setIsAnimating(true)


                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Task Completed`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                setTimeout(() => {

                    setIsAnimating(false)

                    queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            // Error handling based on API-file-declared interface
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Complete Task',
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        }
    )

    const { colorMode } = useColorMode();

    // const isFirstTask = task.id === 1; // You should replace this with the appropriate logic to determine if it's the first task.
    // const isLastTask = task.id === 10; // You should replace this with the appropriate logic to determine if it's the last task.

    const { isOpen, onOpen, onClose } = useDisclosure();


    return (
        <>
            <TaskDetailsModal
                isOpen={isOpen}
                onClose={onClose}
                task={task}
            />
            <Flex
                alignItems={"center"}
                border={"1px solid"}
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
                    mr={2}
                    alignItems={"center"}
                    alignContent={"center"}
                    boxSize={5}
                    w={"20px"}
                >
                    {task.task_type === "personal" ?
                        <FaUser /> : <MdPriorityHigh />
                    }
                </Center>
                <Box
                    mx={0}
                    maxW={"125px"}
                    w={"100%"}

                >
                    {task.task_type === "personal" ?
                        <Text>Personal</Text>
                        : <Text>Assigned</Text>

                    }


                </Box>
                <Divider
                    orientation='vertical'
                    // ml={-6}
                    mr={5}
                />
                {/* <SimpleDisplaySRTE

                                                                        data={document?.project.title}
                                                                        displayData={document?.project.title}
                                                                        displayArea="traditionalProjectTitle"
                                                                    /> */}

                <Text

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
                    onClick={() => {
                        if (task?.project?.pk) {
                            goToProject(task.project.pk);
                        }
                        else {
                            onOpen();
                        }
                    }}
                >
                    {`${task.name}`}
                </Text>
                <Flex
                    alignItems="center"
                    justifyContent={'flex-end'}
                    right={0}
                    flex={1}
                    pl={4}

                >
                    {task.task_type === "personal"
                        &&
                        // isHovered &&
                        (
                            <>
                                <Button
                                    size="xs"
                                    isDisabled={isDeleting}
                                    onClick={() => handleDeleteClick(task.pk)}
                                >
                                    <CloseIcon boxSize={2} />
                                </Button>
                                <Button
                                    isDisabled={isCompleting}
                                    ml={2}
                                    size={"xs"}
                                    bg={"green.500"}
                                    color={"white"}
                                    _hover={{
                                        bg: "green.400"
                                    }}
                                    onClick={() => handleCompletion(task.pk)}
                                >
                                    <CheckIcon boxSize={2} />
                                </Button>

                            </>
                        )
                    }
                    {task.task_type === "assigned" && (

                        <Tag
                            size={"sm"}
                            bg="red.600" color="white">
                            {`ASSIGNED`}
                        </Tag>

                    )}
                </Flex>

            </Flex>


            {/* </Flex> */}

        </>
    )
}



