import { Button, Text, FormControl, Input, InputGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, ToastId, useColorMode, useToast, Box, Checkbox, Grid, Center } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { IApproveDocument, IBusinessArea, IProjectData, IUserMe } from "../../../types";
import { handleDocumentAction } from "../../../lib/api";
import { useBusinessArea } from "../../../lib/hooks/useBusinessArea";
import { useFullUserByPk } from "../../../lib/hooks/useFullUserByPk";
import { useDirectorateMembers } from "../../../lib/hooks/useDirectorateMembers";

interface Props {
    userData: IUserMe;

    action: "approve" | "recall" | "send_back";
    stage: number;
    documentPk: number;
    projectClosurePk: number;
    projectData: IProjectData;
    baData: IBusinessArea;
    isOpen: boolean;
    refetchData: () => void;
    onClose: () => void;
}

export const ProjectClosureActionModal = (
    { userData, stage, documentPk, projectClosurePk, action,
        onClose, isOpen, projectData, baData, refetchData }: Props
) => {

    useEffect(() => {
        console.log(
            { stage: stage, documentPk: documentPk, projectClosurePk: projectClosurePk }
        )
    }
        , [stage, documentPk, projectClosurePk])

    const { colorMode } = useColorMode();
    const queryClient = useQueryClient();
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const { register, handleSubmit, reset, watch } = useForm<IApproveDocument>();

    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }


    const watchedAction = watch("action");
    const watchedStage = watch("stage");
    const watchedDocumentPk = watch("documentPk");
    // const watchedprojectClosurePk = watch("projectClosurePk");


    const [shouldSendEmail, setShouldSendEmail] = useState(true);
    const { userData: baLead, userLoading: baLeadLoading } = useFullUserByPk(baData?.leader)

    const sendEmail = async () => {
        if (!baLeadLoading && baLead !== undefined && baData !== undefined) {
            if (shouldSendEmail) {
                console.log(`Sending Email to ${baLead?.first_name} ${baLead?.last_name}`)

            } else {
                console.log("No email sent")
            }

        }
    }

    const approveProjectClosureMutation = useMutation(handleDocumentAction,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: `${action === "approve" ? "Approving" : action === "recall" ? "Recalling" : "Sending Back"}`,
                    position: "top-right"
                })
            },
            onSuccess: async (data) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Document ${action === "approve" ? "Approved" : action === "recall" ? "Recalled" : "Sent Back"}`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                reset();
                await refetchData();
                await sendEmail();

                onClose();

                setTimeout(() => {
                    // if (setIsAnimating) {
                    //     setIsAnimating(false)
                    // }
                    queryClient.invalidateQueries(["projects", projectData?.pk]);

                    // queryClient.refetchQueries([`mytasks`])
                }, 350)
            },
            onError: (error) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: `Could Not ${action === "approve" ? "Approve" : action === "recall" ? "Recall" : "Send Back"} project closure`,
                        description: `${error}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }


        })

    const onApprove = (formData: IApproveDocument) => {
        console.log(formData)
        approveProjectClosureMutation.mutate(formData);
    }

    useEffect(() => {
        console.log(
            stage, documentPk, projectClosurePk, projectData
        )
        if (baData) {
            console.log(baData)
        }
    }, [baData])

    const { directorateData, isDirectorateLoading, refetchDirectorateData } = useDirectorateMembers();

    useEffect(() => {
        if (directorateData)
            console.log(directorateData)
    }, [directorateData])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={"lg"}
            scrollBehavior="inside"
        // isCentered={true}
        >
            <ModalOverlay />
            <ModalContent
                color={colorMode === "light" ? "black" : "white"}
                bg={colorMode === "light" ? "white" : "gray.800"}
            >
                <ModalHeader
                >
                    {action === "approve" ? "Approve" : action === "recall" ? "Recall" : "Send Back"} Document?
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody
                    as="form" id="approval-form"
                    onSubmit={handleSubmit(onApprove)}
                >
                    {!baData || !baLead
                        // || isDirectorateLoading || directorateData?.length < 1 
                        ?
                        null : (
                            <>
                                <Input type="hidden" {...register("stage", { required: true, value: stage })} readOnly />
                                <Input type="hidden" {...register("action", { required: true, value: action })} readOnly />
                                <Input type="hidden" {...register("documentPk", { required: true, value: documentPk })} readOnly />
                                {/* <Input type="hidden" {...register("projectClosurePk", { required: true, value: projectClosurePk })} readOnly /> */}
                                {stage === 1 ?
                                    (
                                        <Box>
                                            <Text fontWeight={"bold"}>Stage 1</Text>
                                            <br />
                                            <Text>In your capacity as Project Lead, would you like to {action} this project closure?</Text>
                                            <br />
                                            <Text>
                                                {action === "approve" ?
                                                    "This will send an email to the Business Area Lead for approval and the document will be locked until the Business Area lead has reviewed the document."
                                                    :
                                                    "This will return the approval status from 'Granted' to 'Required' and send an email to the Business Area Lead letting them know the document has been recalled from your approval."
                                                }
                                            </Text>

                                            <Checkbox
                                                isDisabled={!userData?.is_superuser}

                                                mt={8}
                                                isChecked={shouldSendEmail}
                                                onChange={() => setShouldSendEmail(!shouldSendEmail)}
                                            >
                                                Send an email to the business area lead <strong>({baLead.first_name} {baLead.last_name} - {baLead.email})</strong> alerting them that you have {action === "approve" ? "approved" : "recalled"} this document?
                                            </Checkbox>
                                        </Box>
                                    )
                                    :
                                    stage === 2 ?
                                        (
                                            <Box>
                                                <Text fontWeight={"bold"}>Stage 2</Text>
                                                <br />
                                                <Text>
                                                    In your capacity as Business Area Lead, would you like to {action} this project closure?
                                                </Text>
                                                <br />
                                                <Text>
                                                    {action === "approve" ?
                                                        "This will send an email to members of the Directorate for approval and the document will be locked until the Directorate has reviewed the document."
                                                        :
                                                        action === "recall" ?
                                                            "This will return the approval status from 'Granted' to 'Required' and send an email to the Directorate letting them know that you recalled your approval."
                                                            :
                                                            "This will return the approval status from 'Granted' to 'Required' and send an email to the Project Lead letting them know the document has been sent back for revision."
                                                    }
                                                </Text>


                                                <Box pt={4}
                                                    border={"1px solid"}
                                                    borderColor={"gray.500"}
                                                    rounded={"2xl"}
                                                    p={4}
                                                    mt={4}
                                                >
                                                    <Text
                                                        // px={1}
                                                        fontWeight={"semibold"}
                                                    >
                                                        Directorate Members
                                                    </Text>
                                                    <Grid
                                                        pt={2}
                                                        gridTemplateColumns={"repeat(2, 1fr)"}
                                                    >

                                                        {directorateData?.map((member, index) => {
                                                            return (
                                                                <Center
                                                                    key={index}
                                                                // bg={"red"}
                                                                >
                                                                    <Box
                                                                        px={2}
                                                                        // bg={"red"}
                                                                        w={"100%"}
                                                                    >

                                                                        <Text
                                                                        >
                                                                            {member.first_name} {member.last_name}
                                                                        </Text>
                                                                    </Box>


                                                                </Center>
                                                            )
                                                        })}
                                                    </Grid>

                                                </Box>
                                                <Checkbox
                                                    isDisabled={!userData?.is_superuser}

                                                    mt={8}
                                                    isChecked={shouldSendEmail}
                                                    onChange={() => setShouldSendEmail(!shouldSendEmail)}
                                                >
                                                    Send emails to members of the Directorate alerting them that you have approved this document?

                                                </Checkbox>
                                            </Box>

                                        ) :
                                        <Box>
                                            <Text fontWeight={"bold"}>Stage 3</Text>
                                            <br />
                                            <Text>
                                                In your capacity as Directorate, would you like to {action} this project closure?
                                            </Text>
                                            <br />
                                            <Text>
                                                {action === "approve" ?
                                                    "This will provide final approval for this project closure, enabling creation of a project plan."
                                                    :
                                                    action === "recall" ?
                                                        "This will return the approval status from 'Granted' to 'Required'."
                                                        :
                                                        "This will return the approval status from 'Granted' to 'Required' and send an email to the Business Area Lead letting them know the document has been sent back for revision."
                                                }
                                            </Text>

                                            {action === "send_back"
                                                &&
                                                (
                                                    <>
                                                        <Box pt={4}
                                                            border={"1px solid"}
                                                            borderColor={"gray.500"}
                                                            rounded={"2xl"}
                                                            p={4}
                                                            mt={4}
                                                        >
                                                            <Text
                                                                // px={1}
                                                                fontWeight={"semibold"}
                                                            >
                                                                Business Area Lead
                                                            </Text>
                                                            <Box
                                                                pt={2}
                                                            >
                                                                {baLead?.first_name} {baLead?.last_name}
                                                            </Box>

                                                        </Box>
                                                        <Checkbox
                                                            isDisabled={!userData?.is_superuser}

                                                            mt={8}
                                                            isChecked={shouldSendEmail}
                                                            onChange={() => setShouldSendEmail(!shouldSendEmail)}
                                                        >
                                                            Send an email to Business Area Lead alerting them that you have sent this document back?

                                                        </Checkbox>
                                                    </>
                                                )}

                                        </Box>
                                }
                            </>
                        )}
                </ModalBody>

                <ModalFooter>
                    <Button
                        // variant="ghost" 
                        mr={3}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        form="approval-form"
                        type="submit"
                        onClick={() => console.log(watchedDocumentPk, watchedStage, watchedAction)}
                        isLoading={approveProjectClosureMutation.isLoading}
                        bg={colorMode === "dark" ? "green.500" : "green.400"}
                        color={"white"}
                        _hover={
                            {
                                bg: colorMode === "dark" ? "green.400" : "green.300",
                            }
                        }
                    >
                        {action === "approve" ? "Approve" : action === "recall" ? "Recall" : "Send Back"}
                    </Button>
                </ModalFooter>
            </ModalContent>

        </Modal>
    )
}