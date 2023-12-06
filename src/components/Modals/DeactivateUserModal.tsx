// WIP: Delete User Modal - for removing users from the system all together. Admin only.

import { Button, Center, Flex, FormControl, Grid, Input, InputGroup, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, ToastId, UnorderedList, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { AdminSwitchVar, MutationError, MutationSuccess, deactivateUserAdmin, deleteUserAdmin } from "../../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserSearchContext } from "../../lib/hooks/UserSearchContext";

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    userIsSuper: boolean;
    userIsMe: boolean;
    userPk: string | number;
}


export const DeactivateUserModal = ({ isOpen, onClose, userIsSuper, userIsMe, userPk }: IModalProps) => {

    const { colorMode } = useColorMode();
    const { isOpen: isToastOpen, onOpen: openToast, onClose: closeToast } = useDisclosure();

    useEffect(() => {
        if (isToastOpen) {
            onClose();
        }
    }, [isToastOpen, onClose]);

    const handleToastClose = () => {
        closeToast();
        onClose();
    };


    const {
        reFetch
    } = useUserSearchContext();

    // Toast
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const queryClient = useQueryClient();


    const {
        register,
        // setValue,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminSwitchVar>();

    const deactivationMutation = useMutation<
        MutationSuccess, MutationError, AdminSwitchVar
    >(
        deactivateUserAdmin,
        {
            // Start of mutation handling
            onMutate: () => {
                addToast({
                    title: 'Deactivating Account...',
                    description: "One moment!",
                    status: 'loading',
                    position: "top-right",
                    // duration: 3000
                })
            },
            // Success handling based on API- file - declared interface
            onSuccess: (data) => {
                console.log(data)

                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `User Deactivated`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                //  Close the modal
                if (onClose) {
                    onClose();
                }
                reFetch();
            },
            // Error handling based on API - file - declared interface
            onError: (error) => {
                console.log(error)
                let errorMessage = 'An error occurred while deactivating'; // Default error message

                const collectErrors: any = (data: any, prefix = '') => {
                    if (typeof data === 'string') {
                        return [data];
                    }

                    const errorMessages = [];

                    for (const key in data) {
                        if (Array.isArray(data[key])) {
                            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
                            errorMessages.push(...nestedErrors);
                        } else if (typeof data[key] === 'object') {
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
                        errorMessage = errorMessages.join('\n'); // Join errors with new lines
                    }
                } else if (error.message) {
                    errorMessage = error.message; // Use the error message from the caught exception
                }

                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Deactivation failed',
                        description: errorMessage,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        }
    )


    const onSubmit = async ({ userPk }: AdminSwitchVar) => {
        console.log("Submitted deactivated")
        await deactivationMutation.mutateAsync({ userPk });
        onClose();
    };


    return (
        <Modal
            isOpen={isOpen}
            onClose={handleToastClose}
            size={"sm"}
        >
            <ModalOverlay />
            <Flex as={"form"}
                onSubmit={handleSubmit(onSubmit)}>
                <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ModalHeader>Delete User?</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>

                        <Center>
                            <Text
                                fontWeight={"bold"}
                                fontSize={"xl"}
                            >
                                Are you sure you want to deactivate this user?
                            </Text>
                        </Center>
                        <Center
                            mt={4}
                        >
                            <UnorderedList>
                                <ListItem>They will be no longer receive emails</ListItem>
                            </UnorderedList>
                        </Center>
                        <FormControl my={2} mb={4} userSelect="none">
                            <InputGroup>
                                <Input type="hidden" {...register("userPk", { required: true, value: userPk })} readOnly />
                            </InputGroup>
                        </FormControl>
                        <Center
                            mt={6}
                            p={5}
                        >
                            <Text>
                                If this is okay, please proceed.
                            </Text>
                        </Center>
                        {/* <Text>You can't demote yourself.</Text>
                    <Text>You can't delete yourself.</Text> */}


                    </ModalBody>
                    <ModalFooter>
                        <Grid
                            gridTemplateColumns={"repeat(2, 1fr)"}
                            gridGap={4}
                        >
                            <Button
                                colorScheme="gray"
                                onClick={onClose}

                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                // isDisabled={!changesMade}
                                isDisabled={userIsSuper}
                                isLoading={deactivationMutation.isLoading}
                                type="submit"
                                // bgColor={colorMode === "light" ? `green.500` : `green.600`}
                                // color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                                // _hover={{
                                //     bg: colorMode === "light" ? `green.600` : `green.400`,
                                //     color: colorMode === "light" ? `white` : `white`
                                // }}
                                ml={3}

                            >
                                Deactivate
                            </Button>
                        </Grid>
                    </ModalFooter>
                </ModalContent>
            </Flex>

        </Modal>
    )
}