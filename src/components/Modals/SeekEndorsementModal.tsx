// Modal designed to send out emails seeking endorsement on the project plan where required
// Will send an email out to users marked as is_biometrician, is_herb_curator, or is_aec

import { Text, Button, Center, Flex, FormControl, Grid, Input, InputGroup, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, UnorderedList, useToast, ToastId, useColorMode } from "@chakra-ui/react"
import { ISimplePkProp, ISpecialEndorsement, deleteProjectCall, seekEndorsement } from "../../lib/api";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IUserMe } from "../../types";
import { useForm } from "react-hook-form";


interface Props {
    projectPlanPk: number;
    biometricianEndorsementRequired: boolean;
    biometricianEndorsementProvided: boolean;
    aecEndorsementRequired: boolean;
    herbariumEndorsementRequired: boolean;
    aecEndorsementProvided: boolean;
    herbariumEndorsementProvided: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export const SeekEndorsementModal = (
    {
        projectPlanPk,
        biometricianEndorsementRequired, biometricianEndorsementProvided,
        herbariumEndorsementRequired, herbariumEndorsementProvided,
        aecEndorsementRequired, aecEndorsementProvided,
        isOpen, onClose
    }: Props
) => {

    const navigate = useNavigate();

    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const seekEndorsementMutation = useMutation(seekEndorsement,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: `Sending Emails`,
                    position: "top-right"
                })
            },
            onSuccess: async (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Emails Sent`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                // onClose();

                setTimeout(() => {
                    // if (setIsAnimating) {
                    //     setIsAnimating(false)
                    // }
                    queryClient.invalidateQueries(["projects"]);
                    navigate('/projects');

                    // queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: `Could Not Send Emails`,
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })


    const seekEndorsementFunc = (formData: ISimplePkProp) => {
        console.log(formData)
        seekEndorsementMutation.mutate(formData);
    }

    const { colorMode } = useColorMode();
    const { register, handleSubmit, reset, watch } = useForm<ISimplePkProp>();

    const projPlanPk = watch('pk');



    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={"2xl"}
        >
            <ModalOverlay />
            <Flex as={"form"}
                onSubmit={handleSubmit(seekEndorsementFunc)}>
                <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ModalHeader>Seek Endorsement?</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>

                        <Center>
                            <Text
                                fontWeight={"semibold"}
                                fontSize={"xl"}
                            >
                                {
                                    ((!aecEndorsementRequired) || (aecEndorsementRequired && aecEndorsementProvided)) &&
                                        ((!herbariumEndorsementRequired) || (herbariumEndorsementRequired && herbariumEndorsementProvided)) &&
                                        (!biometricianEndorsementRequired || (biometricianEndorsementRequired && biometricianEndorsementProvided))
                                        ?
                                        ("Endorsement emails are not necessary")
                                        :
                                        "Are you sure you want to seek endorsement for this project?"
                                }

                            </Text>
                        </Center>
                        <Center
                            mt={8}
                        >
                            <UnorderedList>

                                {/* IF BM endorsement required and not provided */}
                                {
                                    biometricianEndorsementRequired === true &&
                                    biometricianEndorsementProvided === false &&
                                    (
                                        <ListItem
                                            color={"red.700"}
                                        >
                                            As the biometrician has not signed off on this, and BM endorsement is marked as required but it has yet to be provided, an email will be sent to the listed biometrician
                                        </ListItem>
                                    )
                                }
                                {/* ELSE where DME not required */}
                                {
                                    biometricianEndorsementRequired === false &&
                                    (
                                        <ListItem
                                            color={"blue.500"}
                                        >
                                            As BM endorsement is marked as not required, no email will be sent to the listed BM
                                        </ListItem>
                                    )
                                }

                                {/* IF involves animals */}
                                {/* AND AEC endorsement required and not provided */}
                                {
                                    aecEndorsementRequired === true
                                    && aecEndorsementProvided === false
                                    &&
                                    (
                                        <ListItem
                                            color={"red.700"}
                                        >
                                            As this project involves animals, and you have marked that AEC endorsement as required but it has yet to be provided, an email will be sent to aec members to approve or reject this plan
                                        </ListItem>
                                    )}
                                {/* ELSE where AEC endorsement not required */}
                                {
                                    aecEndorsementRequired === false
                                    &&
                                    (
                                        <ListItem
                                            color={"blue.500"}
                                        >
                                            As this project involves animals, but you have marked that AEC endorsement as NOT required, no email will be sent
                                        </ListItem>
                                    )
                                }
                                {/* IF involves plants */}
                                {/* AND HC endorsement required */}
                                {
                                    herbariumEndorsementRequired === true &&
                                    herbariumEndorsementProvided === false &&
                                    (
                                        <ListItem
                                            color={"red.700"}
                                        >
                                            As this project involves plants, and you have marked that Herbarium endorsement as required but it has yet to be provided, an email will be sent to the herbarium curator to approve or reject this plan
                                        </ListItem>

                                    )
                                }

                                {/* ELSE where HC endorsement not required */}
                                {
                                    herbariumEndorsementRequired === false &&
                                    (
                                        <ListItem
                                            color={"blue.500"}
                                        >
                                            As this project involves plants, but you have marked that HC endorsement as NOT required, no email will be sent
                                        </ListItem>
                                    )
                                }



                            </UnorderedList>
                        </Center>
                        <FormControl>
                            <InputGroup>
                                <Input type="hidden" {...register("pk", { required: true, value: Number(projectPlanPk) })} readOnly />
                            </InputGroup>
                        </FormControl>


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
                                isLoading={seekEndorsementMutation.isLoading}
                                type="submit"
                                ml={3}
                                isDisabled={
                                    ((!aecEndorsementRequired) || (aecEndorsementRequired && aecEndorsementProvided)) &&
                                    ((!herbariumEndorsementRequired) || (herbariumEndorsementRequired && herbariumEndorsementProvided)) &&
                                    (!biometricianEndorsementRequired || (biometricianEndorsementRequired && biometricianEndorsementProvided))
                                }
                            >
                                Send Emails
                            </Button>
                        </Grid>
                    </ModalFooter>
                </ModalContent>
            </Flex>

        </Modal>

    )
}