// Modal for promoting or demoting users

import {
    Button,
    Flex,
    FormControl,
    Grid,
    Input,
    InputGroup,
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
    useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import {
    MutationError,
    PRPopulationVar,
    getPreviousDataForProgressReportPopulation
} from "../../lib/api";

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    functionToRun: (dataToPaste: string) => void;
    writeable_document_kind: string;
    section: string;
    project_pk: number;
}

export const RTEPriorReportPopulationModal = ({
    isOpen,
    onClose,
    functionToRun,
    writeable_document_kind,
    section,
    project_pk,
}: IModalProps) => {
    const { colorMode } = useColorMode();
    const { onClose: closeToast } = useDisclosure();

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

    const populationMutation = useMutation<
        string,
        MutationError,
        PRPopulationVar
    >({
        // Start of mutation handling
        mutationFn: getPreviousDataForProgressReportPopulation,
        onMutate: () => {
            addToast({
                title: "Getting Previous Data...",
                description: "One moment!",
                status: "loading",
                position: "top-right",
                // duration: 3000
            });
        },
        // Success handling based on API- file - declared interface
        onSuccess: (data) => {
            console.log(data);
            functionToRun(data);

            // reFetch();
            if (toastIdRef.current) {
                toast.update(toastIdRef.current, {
                    title: "Success",
                    description: `Populated`,
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
            let errorMessage = "An error occurred while populating"; // Default error message

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
                    title: "Population failed",
                    description: errorMessage,
                    status: "error",
                    position: "top-right",
                    duration: 3000,
                    isClosable: true,
                });
            }
        },
    });

    const onSubmit = async ({ writeable_document_kind,
        section,
        project_pk, }: PRPopulationVar) => {
        await populationMutation.mutateAsync({
            writeable_document_kind,
            section,
            project_pk,
        });
        onClose();
    };

    const { register, handleSubmit } = useForm<PRPopulationVar>();

    return (
        <Modal isOpen={isOpen} onClose={handleToastClose}>
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                <ModalHeader>
                    Populate With Prior Data?
                </ModalHeader>
                <ModalCloseButton />
                <Flex as={"form"} id="promotion-form" onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody>
                        <Text>
                            Would you like to populate this section with the previous progress report's data?
                        </Text>
                        <Text mt={4} fontSize={"sm"} color={"blue.500"}>
                            Keep in mind that you will still need to update your report with data for the latest this Financial Year.
                        </Text>
                        <FormControl userSelect="none">
                            <InputGroup>
                                <Input
                                    type="hidden"
                                    {...register("project_pk", { required: true, value: project_pk })}
                                    readOnly
                                />
                                <Input
                                    type="hidden"
                                    {...register("section", { required: true, value: section })}
                                    readOnly
                                />
                                <Input
                                    type="hidden"
                                    {...register("writeable_document_kind", { required: true, value: writeable_document_kind })}
                                    readOnly
                                />
                            </InputGroup>
                        </FormControl>

                    </ModalBody>
                </Flex>
                <ModalFooter>
                    <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
                        <Button colorScheme="gray" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            isLoading={populationMutation.isPending}
                            form="promotion-form"
                            type="submit"
                            bgColor={colorMode === "light" ? `green.500` : `green.600`}
                            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                            _hover={{
                                bg: colorMode === "light" ? `green.600` : `green.400`,
                                color: colorMode === "light" ? `white` : `white`,
                            }}
                            ml={3}
                        >
                            Yes
                        </Button>
                    </Grid>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
