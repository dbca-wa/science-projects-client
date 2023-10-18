// Modal for promoting or demoting users

import { Button, Flex, FormControl, Grid, Input, InputGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, ToastId, useColorMode, useDisclosure, useToast } from "@chakra-ui/react"
import { useEffect, useRef } from "react";
import { useUserSearchContext } from "../../lib/hooks/UserSearchContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminSwitchVar, MutationError, MutationSuccess, switchAdmin } from "../../lib/api";
import { useForm } from "react-hook-form";

interface IModalProps {
    isOpen: boolean;
    onClose: () => void;
    userPk: string | number;
    userIsSuper: boolean;
    userIsMe: boolean;
    userIsExternal: boolean;
}


export const PromoteUserModal = ({ isOpen, onClose, userPk, userIsSuper, userIsMe, userIsExternal }: IModalProps) => {

    const { colorMode } = useColorMode();
    const { isOpen: isToastOpen, onOpen: openToast, onClose: closeToast } = useDisclosure();

    // useEffect(() => {
    //     if (isToastOpen) {
    //         onClose();
    //     }
    // }, [isToastOpen, onClose]);

    const handleToastClose = () => {
        closeToast();
        onClose();
    };


    // Toast
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const {
        reFetch
    } = useUserSearchContext();


    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const promotionMutation = useMutation<
        MutationSuccess, MutationError, AdminSwitchVar
    >(
        switchAdmin,
        {
            // Start of mutation handling
            onMutate: () => {
                addToast({
                    title: 'Updating membership...',
                    description: "One moment!",
                    status: 'loading',
                    position: "top-right",
                    // duration: 3000
                })
            },
            // Success handling based on API- file - declared interface
            onSuccess: (data) => {
                console.log(data)

                queryClient.refetchQueries([`user`, userPk])
                queryClient.refetchQueries([`personalInfo`, userPk])
                queryClient.refetchQueries([`membership`, userPk])
                queryClient.refetchQueries([`profile`, userPk])
                reFetch();
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Information Updated`,
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
            },
            // Error handling based on API - file - declared interface
            onError: (error) => {
                console.log(error)
                let errorMessage = 'An error occurred while updating'; // Default error message

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
                        title: 'Update failed',
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
        await promotionMutation.mutateAsync({ userPk });
        onClose();
    };


    const {
        register,
        // setValue,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminSwitchVar>();



    return (
        <Modal isOpen={isOpen} onClose={handleToastClose}>
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                <ModalHeader>{!userIsSuper ? "Promote User" : "Demote User"}?</ModalHeader>
                <ModalCloseButton />
                <Flex
                    as={"form"}
                    id="promotion-form"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <ModalBody>
                        {userIsExternal ?
                            (
                                <Text>This user is external and cannot be promoted to admin.</Text>
                            ) :
                            (
                                <>
                                    <Text>Are you sure you want to {!userIsSuper ? "promote" : "demote"} this user {!userIsSuper ? "to admin" : "from admin"}?</Text>

                                    <FormControl my={2} mb={4} userSelect="none">
                                        <InputGroup>
                                            <Input type="hidden" {...register("userPk", { required: true, value: userPk })} readOnly />
                                        </InputGroup>
                                    </FormControl>

                                </>

                            )
                        }

                    </ModalBody>
                </Flex>
                <ModalFooter
                // pos="absolute" bottom={0} right={0}
                >

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
                            // isDisabled={!changesMade}
                            isDisabled={userIsExternal}
                            isLoading={promotionMutation.isLoading}
                            form="promotion-form"
                            type="submit"
                            bgColor={colorMode === "light" ? `green.500` : `green.600`}
                            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                            _hover={{
                                bg: colorMode === "light" ? `green.600` : `green.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }}
                            ml={3}
                        >
                            {userIsSuper ? "Demote" : "Promote"}
                        </Button>
                    </Grid>
                </ModalFooter>

            </ModalContent>

        </Modal>
    )
}