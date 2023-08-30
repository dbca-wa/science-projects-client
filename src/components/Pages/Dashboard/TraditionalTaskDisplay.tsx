import { Box, Button, Flex, Grid, Tag, Text, ToastId, useToast } from "@chakra-ui/react"
import { ITaskDisplayCard } from "../../../types";
import { useNavigate } from "react-router-dom";
import { useProjectSearchContext } from "../../../lib/hooks/ProjectSearchContext";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloseIcon, CheckIcon } from "@chakra-ui/icons";
import { MutationError, MutationSuccess, completeTask, deletePersonalTask } from "../../../lib/api";

interface Props {
    task: ITaskDisplayCard;
}


export const TraditionalTaskDisplay = ({ task }: Props) => {

    const [isHovered, setIsHovered] = useState(false);

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


    const handleDeleteClick = (pk: number) => {
        taskdeleteMutation.mutate({ pk });
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
    const handleCompletion = (pk: number) => {
        taskCompletionMutation.mutate({ pk });
    }



    return (
        <Flex
            minH={"40px"}
            py={2}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box
            // bg={"red"}
            >
                <Text
                    color={
                        "blue.200"
                    }
                    fontWeight={"bold"}
                    cursor={"pointer"}
                    _hover={
                        {
                            color: "blue.100",
                            textDecoration: "underline",
                        }
                    }
                    onClick={() => {
                        if (task?.project?.pk) {
                            goToProject(task.project.pk);
                        }
                    }}
                >
                    {`- ${task.name}`}
                </Text>

            </Box>

            <Flex
                alignItems="center"
                justifyContent={'flex-end'}
                right={0}
                flex={1}
            >
                {task.task_type === "personal"
                    &&
                    (
                        <>
                            <Button
                                size="xs"
                                onClick={() => handleDeleteClick(task.pk)}
                            >
                                <CloseIcon boxSize={2} />
                            </Button>
                            <Button
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

    )
}



