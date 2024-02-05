// Delete User Modal - for removing users from the system all together. Admin only.

import {
    Box,
    Button,
    Center,
    Checkbox,
    Flex,
    Grid,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    ToastId,
    useColorMode,
    useDisclosure,
    useToast
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
    INewCycle,
    MutationError,
    MutationSuccess,
    openNewCycle,
} from "../../lib/api";
import { useLatestReportYear } from "@/lib/hooks/useLatestReportYear";


interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewCycleModal = ({
    isOpen,
    onClose,
}: IModalProps) => {
    const { colorMode } = useColorMode();
    const { isOpen: isToastOpen, onClose: closeToast } = useDisclosure();

    const { latestYear } = useLatestReportYear();

    useEffect(() => {
        if (isToastOpen) {
            onClose();
        }
    }, [isToastOpen, onClose]);

    const handleToastClose = () => {
        closeToast();
        onClose();
    };

    const [shouldIncludeUpdate, setShouldIncludeUpdate] = useState(false);

    // Toast
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data) => {
        toastIdRef.current = toast(data);
    };

    const newCycleMutation = useMutation<MutationSuccess, MutationError, INewCycle>(
        openNewCycle,
        {

            // Start of mutation handling
            onMutate: () => {
                addToast({
                    title: "Batch Creating Progress Reports...",
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
                        description: `Active projects have new progress reports!`,
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
                let errorMessage = "An error occurred while opening the new cycle"; // Default error message

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


    const onSubmit = async (formData: INewCycle) => {
        await newCycleMutation.mutateAsync(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
            <ModalOverlay />
            <Flex
            // as={"form"} onSubmit={handleSubmit(onSubmit)}
            >
                <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ModalHeader>Open New Report Cycle?</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <Center>
                            <Text fontWeight={"bold"} fontSize={"xl"}>
                                Are you sure you want to open a new reporting cycle for year FY {`${latestYear - 1}-${String(latestYear).substring(2)}`}?
                            </Text>
                        </Center>
                        <Text mt={4}>
                            Any projects with the status "active and approved" will get new progress reports for the latest year (if they dont already exist).
                        </Text>

                        <Box my={8}>
                            <Checkbox
                                isChecked={shouldIncludeUpdate}
                                onChange={() => setShouldIncludeUpdate(!shouldIncludeUpdate)}
                            >
                                Also include projects with status "Update Requested"?
                            </Checkbox>
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
                            If you would still like to proceed, press "Open Cycle".
                        </Text>
                    </ModalBody>
                    <ModalFooter>
                        <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
                            <Button colorScheme="gray" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color={"white"}
                                background={colorMode === "light" ? "green.500" : "green.600"}
                                _hover={{
                                    background: colorMode === "light" ? "green.400" : "green.500",
                                }} // isDisabled={!changesMade}
                                isLoading={newCycleMutation.isLoading}
                                onClick={(() => onSubmit({
                                    "alsoUpdate": shouldIncludeUpdate
                                }))}
                                ml={3}
                            >
                                Open Cycle
                            </Button>
                        </Grid>
                    </ModalFooter>
                </ModalContent>
            </Flex>
        </Modal>
    );
};
