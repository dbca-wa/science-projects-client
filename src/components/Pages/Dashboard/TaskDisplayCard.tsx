// Component for rendering the actual task to the dashboard; this is the design and how the data is mapped for a single task

import { Box, Button, Flex, Image, Tag, Text, ToastId, useColorMode, useToast } from "@chakra-ui/react";
import { ITaskDisplayCard } from "../../../types";
import { useRef, useState } from "react";

import NoImageFile from '/sad-face.gif'
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationError, MutationSuccess, completeTask, deletePersonalTask } from "../../../lib/api";
import { motion } from "framer-motion";
import { CloseIcon } from "@chakra-ui/icons";

export const TaskDisplayCard = (
    {
        pk,
        creator,
        user,
        project,
        document,

        name,
        description,
        notes,
        status,
        task_type,
        date_assigned,
    }: ITaskDisplayCard) => {


    const { colorMode } = useColorMode();

    // Convert date_assigned to a Date object if it's a string
    const parsedDate = date_assigned instanceof Date ? date_assigned : new Date(date_assigned);

    const day = parsedDate.getDate();
    const month = parsedDate.toLocaleString("en-US", { month: "long" });

    const formattedDate = `${day}${getDaySuffix(day)} ${month}`;

    const [isHovered, setIsHovered] = useState(false);

    function getDaySuffix(day: number) {
        if (day >= 11 && day <= 13) {
            return "th";
        }

        const lastDigit = day % 10;

        switch (lastDigit) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }

    const navigate = useNavigate();

    const handleProjectTaskCardClick = () => {
        if (project) {
            if (document) {
                navigate(`projects/${project.pk}`)
                // Handle logic for opening the doc via a link
                // navigate(`projects/${project.pk}?docToOpen=${document.pk}`)

            }
            else {
                navigate(`projects/${project.pk}`)
            }
        }
    }

    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const queryClient = useQueryClient();

    const mutation = useMutation<
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
        mutation.mutate({ pk });
    }
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



    return (
        <motion.div
            initial={{ scale: 1, opacity: 1 }} // Initial scale (no animation)
            animate={{ scale: isAnimating ? 0 : 1, opacity: isAnimating ? 0 : 1 }} // Scale to 0 when isAnimating is true
            transition={{ duration: 0.3 }} // Animation duration in seconds
        >
            <Flex
                userSelect={"none"}
                rounded="lg"
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                minH="230px"
                // minW="300px"
                // p={4}
                boxShadow={
                    colorMode === "light" ?
                        "0px 20px 30px -10px rgba(0, 0, 0, 0.3), 0px 4px 5px -2px rgba(0, 0, 0, 0.06), -3px 0px 10px -2px rgba(0, 0, 0, 0.1), 3px 0px 10px -2px rgba(0, 0, 0, 0.1)"
                        :
                        "0px 4px 6px -1px rgba(255, 255, 255, 0.1), 0px 2px 4px -1px rgba(255, 255, 255, 0.06)"

                }
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="stretch"
                pos={"relative"}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                cursor={task_type === "assigned" ? "pointer" : "unset"}
                onClick={handleProjectTaskCardClick}
            >
                {isHovered && task_type !== "assigned" && (
                    <Button
                        size="sm"
                        position="absolute"
                        top={2}
                        right={2}
                        zIndex={1}
                        onClick={() => handleDeleteClick(pk)}
                    >
                        <CloseIcon boxSize={2} />
                    </Button>
                )}
                {task_type === "assigned" && (
                    <Flex mt={2}
                        px={4}
                    >
                        <Box rounded="lg" overflow="hidden" w="100px" h="69px">
                            <Image
                                src={project?.image?.file ? project.image.file : project?.image?.old_file ? project.image.old_file : NoImageFile}
                                width={"100%"}
                                height={"100%"}
                                objectFit={"cover"}

                            />
                        </Box>
                        <Flex ml={2} flexDir="column" w="100%">
                            <Text fontSize="md" fontWeight="semibold">
                                {
                                    project.title.length >= 30
                                        ? `${project.title.slice(0, 30)}...`
                                        : project.title
                                }
                            </Text>
                            <Text flex={1} fontSize="xs">
                                {formattedDate} by {creator.first_name} {creator.last_name}
                            </Text>

                        </Flex>

                    </Flex>
                )}

                <Box
                    flex={1}
                    py={task_type === "assigned" ? 3 : 0}
                    pt={task_type === "assigned" ? 6 : 0}
                    p={4}
                >
                    <Text
                        fontSize="sm" fontWeight="bold"
                        color={colorMode === "light" ? "gray.600" : "gray.300"}
                    >
                        {name}
                    </Text>

                    <Box>
                        <Text
                            fontSize="xs"
                            fontWeight="normal"
                            mt={2}
                            color={colorMode === "light" ? "gray.700" : "gray.300"}
                        >
                            {description}
                        </Text>
                    </Box>

                </Box>
                <Flex
                    justifyContent={"space-between"}
                    flex={1}
                    pos={"absolute"}
                    // right={4}
                    bottom={2}
                    w={"100%"}
                    // bg={"red"}
                    // px={10}
                    px={4}
                >
                    <Tag
                        size={"md"}
                        py={2}
                    >
                        {status.toUpperCase()}
                    </Tag>
                    {isHovered && task_type === "personal" &&

                        (<Button
                            size={"sm"}
                            // fontSize={"xs"}
                            bg={"green.500"}
                            color={"white"}
                            _hover={
                                { bg: "green.400" }
                            }
                            onClick={() => handleCompletion(pk)}
                        >
                            Complete
                        </Button>
                        )
                    }
                    {task_type === "assigned" &&
                        (
                            <Tag bg="red.600" color="white">
                                {`ASSIGNED`}
                            </Tag>
                        )
                    }
                </Flex>
            </Flex>
        </motion.div>
    );
};




// {task_type === "assigned" && (
//     <Text fontSize="sm" ml={1}>  {formattedDate} by {`${creator?.first_name} ${creator?.last_name}`}
//     </Text>
// )}


