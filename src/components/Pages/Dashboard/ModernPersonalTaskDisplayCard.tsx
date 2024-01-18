// Component for rendering the actual task to the dashboard; this is the design and how the data is mapped for a single task

import {
  Box,
  Button,
  Center,
  Flex,
  Image,
  Tag,
  Text,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { ITaskDisplayCard } from "../../../types";
import { useEffect, useRef, useState } from "react";

import NoImageFile from "/sad-face.gif";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MutationError,
  MutationSuccess,
  completeTask,
  deletePersonalTask,
} from "../../../lib/api";
import { motion } from "framer-motion";
import { CloseIcon } from "@chakra-ui/icons";
import { ExtractedHTMLTitle } from "@/components/ExtractedHTMLTitle";
import { FaUser } from "react-icons/fa";

export const ModernPersonalTaskDisplayCard = ({
  pk,
  creator,
  project,
  document,

  name,
  description,
  task_type,
  date_assigned,
}: ITaskDisplayCard) => {
  const { colorMode } = useColorMode();

  // Convert date_assigned to a Date object if it's a string
  const parsedDate =
    date_assigned instanceof Date ? date_assigned : new Date(date_assigned);

  const day = parsedDate.getDate();
  const month = parsedDate.toLocaleString("en-US", { month: "long" });

  const formattedDate = `${day}${getDaySuffix(day)} ${month}`;

  const [isHovered, setIsHovered] = useState(false);
  const [isHoverAnimating, setIsHoverAnimating] = useState(false);

  useEffect(() => {
    if (isHovered) {
      // console.log("Hoverstate: ", isHovered)
      setIsHoverAnimating(true);
    } else {
      // console.log("Hoverstate: ", isHovered)
      setIsHoverAnimating(false);
    }
  }, [isHovered]);

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
        navigate(`projects/${project.pk}`);
        // Handle logic for opening the doc via a link
        // navigate(`projects/${project.pk}?docToOpen=${document.pk}`)
      } else {
        navigate(`projects/${project.pk}`);
      }
    }
  };

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const queryClient = useQueryClient();

  const mutation = useMutation<MutationSuccess, MutationError, { pk: number }>(
    completeTask,
    {
      // Start of mutation handling
      onMutate: () => {
        addToast({
          title: "Completing Task...",
          description: "One moment!",
          status: "loading",
          position: "top-right",
          duration: 3000,
        });
      },
      // Success handling based on API-file-declared interface
      onSuccess: () => {
        setIsAnimating(true);

        if (toastIdRef.current) {
          toast.update(toastIdRef.current, {
            title: "Success",
            description: `Task Completed`,
            status: "success",
            position: "top-right",
            duration: 3000,
            isClosable: true,
          });
        }
        setTimeout(() => {
          setIsAnimating(false);

          queryClient.refetchQueries([`mytasks`]);
        }, 350);
      },
      // Error handling based on API-file-declared interface
      onError: (error) => {
        if (toastIdRef.current) {
          toast.update(toastIdRef.current, {
            title: "Could Not Complete Task",
            description: `${error}`,
            status: "error",
            position: "top-right",
            duration: 3000,
            isClosable: true,
          });
        }
      },
    }
  );

  const handleCompletion = (pk: number) => {
    mutation.mutate({ pk });
  };
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDeleteClick = (pk: number) => {
    taskdeleteMutation.mutate({ pk });
  };

  const taskdeleteMutation = useMutation<
    MutationSuccess,
    MutationError,
    { pk: number }
  >(deletePersonalTask, {
    // Start of mutation handling
    onMutate: () => {
      addToast({
        title: "Deleting Task...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        duration: 3000,
      });
    },
    // Success handling based on API-file-declared interface
    onSuccess: () => {
      setIsAnimating(true);

      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Task Deleted`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      setTimeout(() => {
        setIsAnimating(false);

        queryClient.refetchQueries([`mytasks`]);
      }, 350);
    },
    // Error handling based on API-file-declared interface
    onError: (error) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Delete Task",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <motion.div
      initial={{ scale: 1, opacity: 1 }} // Initial scale (no animation)
      animate={{
        scale: isAnimating ? 0 : isHoverAnimating ? 1.05 : 1,
        opacity: isAnimating ? 0 : 1,
      }} // Scale to 0 when isAnimating is true
      transition={{ duration: 0.2 }} // Animation duration in seconds
    >
      <Flex
        userSelect={"none"}
        rounded="lg"
        bg={colorMode === "light" ? "gray.50" : "gray.700"}
        minH="230px"
        // minW="300px"
        // p={4}
        boxShadow={
          colorMode === "light"
            ? "0px 7px 12px -3px rgba(0, 0, 0, 0.15), 0px 1.4px 1.75px -0.7px rgba(0, 0, 0, 0.03), -2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465), 2.1px 0px 7px -1.4px rgba(0, 0, 0, 0.0465)"
            : "0px 1.4px 2.1px -0.7px rgba(255, 255, 255, 0.0465), 0px 0.7px 1.4px -0.7px rgba(255, 255, 255, 0.028), -1.4px 0px 2.1px -0.7px rgba(255, 255, 255, 0.032)"
        }
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="stretch"
        pos={"relative"}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        cursor={isHoverAnimating ? "pointer" : "unset"}
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
          <Flex mt={2} px={4}>
            <Box rounded="lg" overflow="hidden" w="100px" h="69px">
              <Image
                src={
                  project?.image?.file
                    ? project.image.file
                    : project?.image?.old_file
                    ? project.image.old_file
                    : NoImageFile
                }
                width={"100%"}
                height={"100%"}
                objectFit={"cover"}
              />
            </Box>
            <Flex ml={2} flexDir="column" w="100%">
              <Text fontSize="md" fontWeight="semibold">
                {project.title.length >= 30
                  ? `${project.title.slice(0, 30)}...`
                  : project.title}
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
          <ExtractedHTMLTitle
            htmlContent={`<p>${name}</p>`}
            color={colorMode === "light" ? "blue.500" : "blue.300"}
            fontWeight={"semibold"}
          />
          <Box>
            <Text
              color={colorMode === "light" ? "gray.500" : "gray.300"}
              fontWeight={"semibold"}
              fontSize={"small"}
              mt={2}
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
          {isHovered && task_type === "personal" && (
            <Flex justifyContent={"flex-end"} width={"100%"}>
              <Button
                size={"sm"}
                // fontSize={"xs"}
                bg={"green.500"}
                color={"white"}
                _hover={{ bg: "green.400" }}
                onClick={() => handleCompletion(pk)}
              >
                Complete
              </Button>
            </Flex>
          )}
          {!isHovered && task_type === "personal" && (
            <Flex justifyContent={"flex-end"} width={"100%"}>
              <Box
                pos={"absolute"}
                bottom={0}
                right={1.5}
                px={1}
                // bg={"red"}
                // justifyContent={"center"}
              >
                <Flex>
                  <Center
                    textAlign={"center"}
                    color={colorMode === "light" ? "blue.500" : "blue.400"}
                    mr={2}
                    mt={0.5}
                    boxSize={5}
                    w={"20px"}

                    // w={"100%"}
                    // bg={"orange"}
                  >
                    <FaUser />
                  </Center>
                  <Box
                    // mx={0}
                    w={"100%"}
                  >
                    <Text
                      as={"span"}
                      color={colorMode === "light" ? "blue.500" : "blue.400"}
                      fontWeight={"semibold"}
                      fontSize={"small"}
                      mr={1}
                    >
                      Quick Task
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </Flex>
          )}{" "}
          {task_type === "assigned" && (
            <Tag bg="red.600" color="white">
              {`ASSIGNED`}
            </Tag>
          )}
        </Flex>
      </Flex>
    </motion.div>
  );
};
