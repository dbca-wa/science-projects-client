// Modal designed to send out emails seeking endorsement on the project plan where required
// Will send an email out to users marked as is_biometrician, is_herb_curator, or is_aec

import { Text, Button, Center, Flex, FormControl, Grid, Input, InputGroup, ListItem, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, UnorderedList, useToast, ToastId, useColorMode, Checkbox, Box } from "@chakra-ui/react"
import { ISimplePkProp, ISpecialEndorsement, deleteProjectCall, seekEndorsementAndSave } from "../../lib/api";
import { useEffect, useRef, useState } from "react";
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

    const [shouldSendEmail, setShouldSendEmail] = useState(false);
    // Mutation, query client, onsubmit, and api function 
    const queryClient = useQueryClient();

    const seekEndorsementAndSaveMutation = useMutation(seekEndorsementAndSave,
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


    const seekEndorsementAndSaveFunc = (formData: ISpecialEndorsement) => {
        console.log(formData)
        seekEndorsementAndSaveMutation.mutate(formData);
    }

    const { colorMode } = useColorMode();
    const { register, handleSubmit, reset, watch } = useForm<ISpecialEndorsement>();

    const projPlanPk = watch('projectPlanPk');



    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={"2xl"}
        >
            <ModalOverlay />
            <Flex
                as={"form"}
                onSubmit={handleSubmit(seekEndorsementAndSaveFunc)}
            >
                <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
                    <ModalHeader>Save Endorsements</ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>

                        <Box
                            mt={2}
                        >
                            <Text
                                fontWeight={"semibold"}
                                fontSize={"lg"}
                            >
                                {
                                    ((!aecEndorsementRequired) || (aecEndorsementRequired && aecEndorsementProvided)) &&
                                        ((!herbariumEndorsementRequired) || (herbariumEndorsementRequired && herbariumEndorsementProvided)) &&
                                        (!biometricianEndorsementRequired || (biometricianEndorsementRequired && biometricianEndorsementProvided))
                                        ?
                                        ("As no endorsement is marked as required, endorsement emails are not necessary. You may still save.")
                                        :
                                        "Also send notifications?"
                                }

                            </Text>
                            <Flex>
                                <Checkbox
                                    mt={4}
                                    isChecked={shouldSendEmail}
                                    onChange={() => setShouldSendEmail(!shouldSendEmail)}
                                    isDisabled={
                                        ((!aecEndorsementRequired) || (aecEndorsementRequired && aecEndorsementProvided)) &&
                                        ((!herbariumEndorsementRequired) || (herbariumEndorsementRequired && herbariumEndorsementProvided)) &&
                                        (!biometricianEndorsementRequired || (biometricianEndorsementRequired && biometricianEndorsementProvided))
                                    }
                                >
                                    Send Notifications
                                </Checkbox>
                            </Flex>

                        </Box>
                        {
                            shouldSendEmail ?
                                (
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
                                                        color={"blue.400"}
                                                    >
                                                        As Biometrician endorsement is marked as required but it has yet to be provided, an email will be sent to Biometricians to approve or reject this plan
                                                    </ListItem>
                                                )
                                            }
                                            {/* ELSE where DME not required */}
                                            {
                                                biometricianEndorsementRequired === false &&
                                                (
                                                    <ListItem
                                                        color={"gray.400"}

                                                    >
                                                        As Biometrician endorsement is marked as not required, no email will be sent to Biometricians.
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
                                                        color={"blue.400"}
                                                    >
                                                        As Herbarium Curator endorsement is required but it has yet to be provided, an email will be sent to Herbarium Curators to approve or reject this plan
                                                    </ListItem>

                                                )
                                            }

                                            {/* ELSE where HC endorsement not required */}
                                            {
                                                herbariumEndorsementRequired === false &&
                                                (
                                                    <ListItem
                                                        color={"gray.400"}
                                                    >
                                                        As Herbarium Curator endorsement is marked as not required, no email will be sent to Herbarium Curators
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
                                                        color={"blue.400"}
                                                    >
                                                        As Animal Ethics Committee endorsement is marked as required but it has yet to be provided, an email will be sent to Animal Ethics Committee approvers to approve or reject this plan
                                                    </ListItem>
                                                )}
                                            {/* ELSE where AEC endorsement not required */}
                                            {
                                                aecEndorsementRequired === false
                                                &&
                                                (
                                                    <ListItem
                                                        color={"gray.400"}
                                                    >
                                                        As Animal Ethics Committee endorsement is marked as not required, no email will be sent to Animal Ethics Committee approvers
                                                    </ListItem>
                                                )
                                            }

                                        </UnorderedList>
                                    </Center>
                                ) :
                                null
                        }

                        <FormControl>
                            <InputGroup>
                                <Input type="hidden" {...register("projectPlanPk", { required: true, value: Number(projectPlanPk) })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("aecEndorsementRequired", { required: true, value: aecEndorsementRequired })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("aecEndorsementProvided", { required: true, value: aecEndorsementProvided })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("herbariumEndorsementRequired", { required: true, value: herbariumEndorsementRequired })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("herbariumEndorsementProvided", { required: true, value: herbariumEndorsementProvided })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("bmEndorsementRequired", { required: true, value: biometricianEndorsementRequired })} readOnly />
                            </InputGroup>
                            <InputGroup>
                                <Input type="hidden" {...register("bmEndorsementProvided", { required: true, value: biometricianEndorsementProvided })} readOnly />
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
                                colorScheme="blue"
                                isLoading={seekEndorsementAndSaveMutation.isLoading}
                                type="submit"
                                ml={3}
                                isDisabled={
                                    (shouldSendEmail &&
                                        ((!aecEndorsementRequired) || (aecEndorsementRequired && aecEndorsementProvided)) &&
                                        ((!herbariumEndorsementRequired) || (herbariumEndorsementRequired && herbariumEndorsementProvided)) &&
                                        (!biometricianEndorsementRequired || (biometricianEndorsementRequired && biometricianEndorsementProvided)))
                                }
                            >

                                {shouldSendEmail ? `Save and Send Emails` : `Save`}
                            </Button>

                        </Grid>
                    </ModalFooter>
                </ModalContent>
            </Flex>

        </Modal>

    )
}