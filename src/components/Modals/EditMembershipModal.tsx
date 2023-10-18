// Modal for editing a user's membership for their profile

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useColorMode, FormControl, FormLabel, InputGroup, Grid, useToast, Select, ModalFooter, Button, ToastId, useQuery, Input, Flex } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { IMembershipUpdateVariables, IProfileUpdateSuccess, MutationError, getAllBranches, updateMembership } from '../../lib/api';
import { useForm } from 'react-hook-form';
import { IBranch, IBusinessArea } from '../../types';
import { useBusinessAreas } from '../../lib/hooks/useBusinessAreas';
import { useBranches } from '../../lib/hooks/useBranches';


interface IEditMembershipModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentOrganisationData: string;
    currentBranchData: IBranch;
    currentBaData: IBusinessArea;
    userId: number;
}

export const EditMembershipModal = ({ isOpen, onClose, currentOrganisationData, currentBranchData, currentBaData, userId }: IEditMembershipModalProps) => {
    useEffect(() => {
        console.log(currentBaData);
        console.log(currentBranchData);
    }, [currentBranchData, currentBaData])



    const { colorMode } = useColorMode();
    // Toast
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const { baLoading, baData } = useBusinessAreas();
    const { branchesLoading, branchesData } = useBranches();



    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const mutation = useMutation<
        IProfileUpdateSuccess, MutationError, IMembershipUpdateVariables
    >(
        updateMembership,
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
                queryClient.refetchQueries([`membership`, userId])
                queryClient.refetchQueries([`me`])

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

    //  React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<IMembershipUpdateVariables>();

    //  When submitting form - starts the mutation
    const onSubmit = async ({
        userPk,
        branch,
        business_area,
    }: IMembershipUpdateVariables) => {
        await mutation.mutateAsync({ userPk, branch, business_area });
    };




    return (
        <Modal isOpen={isOpen} onClose={onClose}
            size={"3xl"} scrollBehavior='inside'
        >
            <ModalOverlay />
            <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                <Flex
                    direction="column"
                    height="100%"
                    as="form"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <ModalHeader>Edit Membership</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                    >
                        <FormControl my={2} mb={4} userSelect="none">
                            <InputGroup>
                                <Input type="hidden" {...register("userPk", { required: true, value: userId })} readOnly />
                            </InputGroup>
                        </FormControl>
                        <Grid
                            gridColumnGap={8}
                            gridTemplateColumns={"repeat(2, 1fr)"}
                        >
                            {/* Organisation */}
                            <FormControl my={2} mb={4}
                                userSelect={"none"}
                            >
                                <FormLabel>Organisation</FormLabel>
                                <InputGroup>
                                    <Select placeholder={'Department of Biodiversity, Conservation and Attractions'}
                                        isDisabled={true}
                                    >
                                        <option value='dbca'>
                                            Department of Biodiversity, Conservation and Attractions
                                        </option>
                                    </Select>
                                </InputGroup>
                            </FormControl>


                            {/* Branch */}
                            <FormControl my={2} mb={4}
                                userSelect={"none"}
                            >
                                <FormLabel>Branch</FormLabel>
                                <InputGroup>
                                    {!branchesLoading && branchesData &&
                                        (
                                            <Select placeholder={'Select a Branch'}
                                                // defaultValue={currentBranchData?.pk}
                                                defaultValue={currentBranchData?.pk || ""}

                                                {...register("branch")}
                                            >
                                                {branchesData.map((branch: IBranch, index: number) => {
                                                    return (
                                                        <option key={index} value={branch.pk}
                                                        // selected={branch.pk === currentBranchData?.pk || branch.pk === undefined}
                                                        >
                                                            {branch.name}
                                                        </option>
                                                    )
                                                })}
                                            </Select>
                                        )}

                                </InputGroup>
                            </FormControl>


                            {/* Business Area */}
                            <FormControl my={2} mb={4}
                                userSelect={"none"}
                            >
                                <FormLabel>Business Area</FormLabel>
                                <InputGroup>
                                    {!baLoading && baData &&
                                        (
                                            <Select
                                                placeholder={'Select a Business Area'}
                                                defaultValue={currentBaData?.pk || ""}

                                                {...register("business_area")}

                                            >
                                                {baData.map((ba: IBusinessArea, index: number) => {
                                                    return (
                                                        <option key={index} value={ba.pk}
                                                        // selected={ba.pk === currentBaData?.pk || ba.pk === undefined}
                                                        >
                                                            {ba.name}
                                                        </option>
                                                    )
                                                })}
                                            </Select>
                                        )}

                                </InputGroup>
                            </FormControl>

                        </Grid>
                    </ModalBody>
                    <ModalFooter
                    // pos="absolute" bottom={0} right={0}
                    >
                        <Button
                            isLoading={mutation.isLoading}
                            type="submit"
                            bgColor={colorMode === "light" ? `green.500` : `green.600`}
                            color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                            _hover={{
                                bg: colorMode === "light" ? `green.600` : `green.400`,
                                color: colorMode === "light" ? `white` : `white`
                            }}
                            ml={3}
                        >
                            Update
                        </Button>
                    </ModalFooter>
                </Flex>
            </ModalContent>
        </Modal>
    );

}