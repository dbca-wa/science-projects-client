// Delete User Modal - for removing users from the system all together. Admin only.

import {
    Box,
    Button,
    Center,
    Flex,
    Grid,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    ToastId,
    UnorderedList,
    useColorMode,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
    MutationError,
    MutationSuccess,
    batchApproveOLDProgressAndStudentReports,
} from "../../lib/api";

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BatchApproveOldModal = ({
    isOpen,
    onClose,
}: IModalProps) => {
    const { colorMode } = useColorMode();
    const { isOpen: isToastOpen, onClose: closeToast } = useDisclosure();

    useEffect(() => {
        if (isToastOpen) {
            onClose();
        }
    }, [isToastOpen, onClose]);

    const handleToastClose = () => {
        closeToast();
        onClose();
    };

    // Toast
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data) => {
        toastIdRef.current = toast(data);
    };

    const batchApproveMutation = useMutation<
        MutationSuccess,
        MutationError
    >(batchApproveOLDProgressAndStudentReports, {
        // Start of mutation handling
        onMutate: () => {
            addToast({
                title: "Batch Approving Old Progress and Student Reports...",
                description: "One moment!",
                status: "loading",
                position: "top-right",
                // duration: 3000
            });
        },
        // Success handling based on API- file - declared interface
        onSuccess: () => {
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Success",
                    description: `Docs awaiting final approval belonging to previous reports have been approved.`,
                    status: "success",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            }
            //  Close the modal
            if (onClose) {
                onClose();
            }
        },
        // Error handling based on API - file - declared interface
        onError: (error) => {
            console.log(error);
            let errorMessage = "An error occurred while batch approving old reports"; // Default error message

            const collectErrors = (data, prefix = "") => {
                if (typeof data === "string") {
                    return [data];
                }

                const errorMessages = [];

                for (const key in data) {
                    if (Array.isArray(data[key])) {
                        const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
                        errorMessages.push(...nestedErrors);
                    } else if (typeof data[key] === "object") {
                        const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
                        errorMessages.push(...nestedErrors);
                    } else {
                        errorMessages.push(`${prefix}${key}: ${data[key]}`);
                    }
                }

                return errorMessages;
            };

            if (error.response && error.response.data) {
                const errorMessages = collectErrors(error.response.data);
                if (errorMessages.length > 0) {
                    errorMessage = errorMessages.join("\n"); // Join errors with new lines
                }
            } else if (error.message) {
                errorMessage = error.message; // Use the error message from the caught exception
            }

            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Update failed",
                    description: errorMessage,
                    status: "error",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            }
        },
    });

    const onSubmit = async () => {
        await batchApproveMutation.mutateAsync();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
            <ModalOverlay />
            <Flex
            // as={"form"} onSubmit={handleSubmit(onSubmit)}
            >
                <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ModalHeader>Batch Approve Older Reports?</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <Center>
                            <Text fontWeight={"bold"} fontSize={"xl"}>
                                Are you sure you want to batch approve older reports?
                            </Text>
                        </Center>
                        <Text mt={4}>
                            Any progress reports and student reports which meet these conditions, will get project lead, business area lead and final approval:
                        </Text>
                        <Box mt={4}>
                            <UnorderedList>
                                <ListItem>
                                    Belongs to any annual report which is not the most recent one
                                </ListItem>
                                <ListItem>
                                    Belongs to an active project
                                </ListItem>
                                <ListItem>Is yet to be approved by Directorate</ListItem>

                            </UnorderedList>
                        </Box>
                        {/* <FormControl my={2} mb={4} userSelect="none">
                <InputGroup>
                  <Input
                    type="hidden"
                    {...register("userPk", { required: true, value: userPk })}
                    readOnly
                  />
                </InputGroup>
              </FormControl> */}
                        <Text mt={4}>
                            If you would still like to proceed, press "Batch Approve".
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
                            <Button colorScheme="gray" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color={"white"}
                                background={colorMode === "light" ? "red.500" : "red.600"}
                                _hover={{
                                    background: colorMode === "light" ? "red.400" : "red.500",
                                }} // isDisabled={!changesMade}
                                isLoading={batchApproveMutation.isLoading}
                                onClick={(() => onSubmit())}
                                ml={3}
                            >
                                Batch Approve
                            </Button>
                        </Grid>
                    </ModalFooter>
                </ModalContent>
            </Flex>
        </Modal>
    );
};