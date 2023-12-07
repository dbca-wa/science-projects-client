import { useEffect, useRef, useState } from "react";
import { IConceptPlan, IProjectClosure, IProjectDocuments, IProjectMember } from "../../../../types";
import { Box, Text, Flex, Tag, useColorMode, Grid, Button, Center, useDisclosure, Spinner, Drawer, DrawerOverlay, DrawerContent, DrawerBody, DrawerFooter, useToast, ToastId, Input } from "@chakra-ui/react";
import { useUser } from "../../../../lib/hooks/useUser";
import { useBusinessArea } from "../../../../lib/hooks/useBusinessArea";
import { useFullUserByPk } from "../../../../lib/hooks/useFullUserByPk";
import { useFormattedDate } from "../../../../lib/hooks/useFormattedDate";
import { Link } from "react-router-dom";
import { UserProfile } from "../../Users/UserProfile";
import { useProjectTeam } from "../../../../lib/hooks/useProjectTeam";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
    IDocGenerationProps, generateProjectDocument, downloadProjectDocument, spawnNewEmptyDocument, ISpawnDocument,
    setProjectStatus, ISetProjectProps, closeProjectCall, ICloseProjectProps, openProjectCall, ISimplePkProp
} from "../../../../lib/api";
import { AxiosError } from "axios";
import { ProjectClosureActionModal } from "../../../Modals/DocumentActionModals/ProjectClosureActionModal";
import { DeleteDocumentModal } from "../../../Modals/DeleteDocumentModal";

interface IConceptDocumentActions {
    projectClosureData: IProjectClosure;
    refetchData: () => void;
    all_documents: IProjectDocuments;
    setToLastTab: (tabToGoTo?: number) => void;
    // projectPk: number;
}

export const ProjectClosureDocActions = ({ all_documents, projectClosureData, refetchData, setToLastTab,
    // , projectPk 
}: IConceptDocumentActions) => {
    const [showActions, setShowActions] = useState(false);
    const handleToggleActionsVisibility = () => {
        setShowActions(!showActions);
    }
    const { colorMode } = useColorMode();

    useEffect(() => {
        console.log(projectClosureData)

    }, [projectClosureData])

    const { isOpen: isS1ApprovalModalOpen, onOpen: onS1ApprovalModalOpen, onClose: onS1ApprovalModalClose } = useDisclosure();
    const { isOpen: isS2ApprovalModalOpen, onOpen: onS2ApprovalModalOpen, onClose: onS2ApprovalModalClose } = useDisclosure();
    const { isOpen: isS3ApprovalModalOpen, onOpen: onS3ApprovalModalOpen, onClose: onS3ApprovalModalClose } = useDisclosure();

    const { isOpen: isS1RecallModalOpen, onOpen: onS1RecallModalOpen, onClose: onS1RecallModalClose } = useDisclosure();
    const { isOpen: isS2RecallModalOpen, onOpen: onS2RecallModalOpen, onClose: onS2RecallModalClose } = useDisclosure();
    const { isOpen: isS3RecallModalOpen, onOpen: onS3RecallModalOpen, onClose: onS3RecallModalClose } = useDisclosure();


    const { isOpen: isS1SendbackModalOpen, onOpen: onS1SendbackModalOpen, onClose: onS1SendbackModalClose } = useDisclosure();
    const { isOpen: isS2SendbackModalOpen, onOpen: onS2SendbackModalOpen, onClose: onS2SendbackModalClose } = useDisclosure();
    const { isOpen: isS3SendbackModalOpen, onOpen: onS3SendbackModalOpen, onClose: onS3SendbackModalClose } = useDisclosure();

    const { isOpen: isS3ReopenModalOpen, onOpen: onS3ReopenModalOpen, onClose: onS3ReopenModalClose } = useDisclosure();


    const { userData, userLoading } = useUser();

    const { baData, baLoading } = useBusinessArea(projectClosureData?.document?.project?.business_area?.pk)
    useEffect(() => {
        if (!baLoading)
            console.log(projectClosureData?.document)
        console.log(baData)

    }, [baData, baLoading, projectClosureData])
    const { userData: baLead, userLoading: baLeadLoading } = useFullUserByPk(baData?.leader)
    const { userData: modifier, userLoading: modifierLoading } = useFullUserByPk(projectClosureData?.document?.modifier);
    const { userData: creator, userLoading: creatorLoading } = useFullUserByPk(projectClosureData?.document?.creator);

    const { teamData, isTeamLoading, refetchTeamData } = useProjectTeam(String(projectClosureData?.document?.project?.pk));


    useEffect(() => {
        if (!userLoading && !baLoading && !baLeadLoading) {
            console.log(
                {
                    "ba": baData,
                    "leadUser": baLead,
                    "me": userData
                }
            )
        }

    }, [baLead, baLoading, baData, baLeadLoading, userData, userLoading])

    const creationDate = useFormattedDate(projectClosureData?.document?.created_at);
    const modifyDate = useFormattedDate(projectClosureData?.document?.updated_at);

    const [actionsReady, setActionsReady] = useState(false);
    const [userIsLeader, setUserIsLeader] = useState(false);
    // const [teamLeaderPk, setTeamLeaderPk] = useState(0);

    // Find the team member with is_leader === true
    // const leaderMember = teamData.find((member) => member.is_leader === true);

    const [leaderMember, setLeaderMemeber] = useState<IProjectMember>();

    useEffect(() => {
        if (actionsReady === false &&
            !userLoading && !baLoading && !modifierLoading && !creatorLoading && !isTeamLoading
            && teamData && userData && baData && modifier && creator
        ) {
            console.log('hereeee')
            if (!isTeamLoading) {
                setLeaderMemeber(teamData.find((member) => member.is_leader === true))
            }
            setActionsReady(true);
        }
        // else {
        //     console.log({
        //         userLoading, baLoading, modifierLoading, creatorLoading, userData, baData, modifier, creator, actionsReady, teamData, isTeamLoading
        //     })
        // }
        // else {
        //     if (actionsReady === true) {
        //         setActionsReady(false);

        //     }
        // }
    }, [userLoading, baLoading, modifierLoading, creatorLoading, userData, baData, modifier, creator, actionsReady, teamData, isTeamLoading])


    useEffect(() => {
        if (actionsReady) {
            setLeaderMemeber(teamData.find((member) => member.is_leader === true))
            console.log(userData);
            console.log(projectClosureData?.document)
        }
    }, [actionsReady, teamData, isTeamLoading])

    const { isOpen: isModifierOpen, onOpen: onModifierOpen, onClose: onModifierClose } = useDisclosure();
    const { isOpen: isCreatorOpen, onOpen: onCreatorOpen, onClose: onCreatorClose } = useDisclosure();



    const queryClient = useQueryClient();
    const { register, handleSubmit, reset } = useForm<IDocGenerationProps>();
    const toast = useToast();
    const toastIdRef = useRef<ToastId>();
    const addToast = (data: any) => {
        toastIdRef.current = toast(data)
    }

    const projectPDFDownloadMutation = useMutation(downloadProjectDocument,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: "Downloading PDF",
                    position: "top-right"
                })
            },
            onSuccess: (data) => {

                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `PDF Downloaded`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            },
            onError: (error: AxiosError) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Download PDF',
                        description: `${error?.response?.data}`,
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        })

    const projectDocPDFGenerationMutation = useMutation(generateProjectDocument,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: "Generating PDF",
                    position: "top-right"
                })
            },
            onSuccess: (data) => {

                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `PDF Generated`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            },
            onError: (error: AxiosError) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Generate PDF',
                        description: error?.response?.data
                            ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
                            : 'Error',
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        })



    const beginProjectDocPDFDownload = (formData: IDocGenerationProps) => {
        // const docPk = projectClosureData?.document?.pk;
        projectPDFDownloadMutation.mutate(formData);
    }

    const beginProjectDocPDFGeneration = (formData: IDocGenerationProps) => {
        // const docPk = projectClosureData?.document?.pk;
        projectDocPDFGenerationMutation.mutate(formData);
    }



    useEffect(() => {
        console.log(leaderMember)
    }, [leaderMember])

    // const closeProjectMutation = useMutation(closeProjectCall,
    //     {
    //         onMutate: () => {
    //             addToast({
    //                 status: "loading",
    //                 title: "Closing Project",
    //                 position: "top-right"
    //             })
    //         },
    //         onSuccess: async (data) => {

    //             if (toastIdRef.current) {
    //                 toast.update(toastIdRef.current, {
    //                     title: 'Success',
    //                     description: `Project Closed`,
    //                     status: 'success',
    //                     position: "top-right",
    //                     duration: 3000,
    //                     isClosable: true,
    //                 })
    //             }
    //             const updateData: ISetProjectProps = {
    //                 projectId: projectClosureData?.document?.project.pk ? projectClosureData.document.project.pk : projectClosureData?.document?.project?.id,
    //                 status: 'closed',
    //             }
    //             await setProjectStatus(updateData)
    //             queryClient.invalidateQueries(["projects", updateData.projectId]);
    //             refetchData();
    //         },
    //         onError: (error: AxiosError) => {
    //             if (toastIdRef.current) {
    //                 toast.update(toastIdRef.current, {
    //                     title: 'Could Not Close Project',
    //                     description: error?.response?.data
    //                         ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
    //                         : 'Error',
    //                     status: 'error',
    //                     position: "top-right",
    //                     duration: 3000,
    //                     isClosable: true,
    //                 })
    //             }
    //         }
    //     })

    const openProjectMutation = useMutation(openProjectCall,
        {
            onMutate: () => {
                addToast({
                    status: "loading",
                    title: "Reopening Project",
                    position: "top-right"
                })
            },
            onSuccess: async (data) => {

                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Success',
                        description: `Project Reopened`,
                        status: 'success',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
                const updateData: ISetProjectProps = {
                    projectId: projectClosureData?.document?.project.pk ? projectClosureData.document.project.pk : projectClosureData?.document?.project?.id,
                    status: 'closed',
                }
                await setProjectStatus(updateData)
                queryClient.invalidateQueries(["projects", updateData.projectId]);
                refetchData();
            },
            onError: (error: AxiosError) => {
                if (toastIdRef.current) {
                    toast.update(toastIdRef.current, {
                        title: 'Could Not Reopen Project',
                        description: error?.response?.data
                            ? `${error.response.status}: ${Object.values(error.response.data)[0]}`
                            : 'Error',
                        status: 'error',
                        position: "top-right",
                        duration: 3000,
                        isClosable: true,
                    })
                }
            }
        })




    // const closeProjectFunc = (data: ICloseProjectProps) => {
    //     console.log(data);
    //     closeProjectMutation.mutate(data);
    // }

    const openProjectFunc = (data: ISimplePkProp) => {
        console.log(data);
        openProjectMutation.mutate(data);
    }

    const { isOpen: isDeleteDocumentModalOpen, onOpen: onOpenDeleteDocumentModal, onClose: onCloseDeleteDocumentModal } = useDisclosure();


    const keyForDeleteDocumentModal = projectClosureData?.document?.pk
        ? `document-${projectClosureData?.document?.pk}`
        : `document-${projectClosureData?.document?.id}`;

    const setStatusIfRequired = (projectPk, desiredProjectState: "new" | "pending" | "active" | "updating" | "terminated" | "suspended" | "closed") => {

        const data: ISetProjectProps = {
            projectId: projectPk,
            status: desiredProjectState,
        };

        setProjectStatus(data);
    };
    const [docPk, setDocPk] = useState(projectClosureData?.document?.pk ? projectClosureData.document.pk : projectClosureData?.document?.id)

    return (
        <>
            {actionsReady && leaderMember ?
                (
                    <>
                        <Drawer
                            isOpen={isCreatorOpen}
                            placement='right'
                            onClose={onCreatorClose}
                            size={"sm"} //by default is xs
                        >
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerBody>
                                    <UserProfile
                                        pk={creator?.pk}
                                    />
                                </DrawerBody>

                                <DrawerFooter>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>

                        <Drawer
                            isOpen={isModifierOpen}
                            placement='right'
                            onClose={onModifierClose}
                            size={"sm"} //by default is xs
                        >
                            <DrawerOverlay />
                            <DrawerContent>
                                <DrawerBody>
                                    <UserProfile
                                        pk={modifier?.pk}
                                    />
                                </DrawerBody>

                                <DrawerFooter>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>



                        <Grid
                            bg={colorMode === "light" ? "gray.50" : "gray.700"}
                            rounded={"lg"}
                            p={4}
                            my={6}
                            gridGap={4}
                            gridTemplateColumns={
                                {
                                    base: "repeat(1, 1fr)",
                                    "1200px": "repeat(2, 1fr)"
                                }
                            }
                        >


                            {/* Details */}
                            <Box
                                bg={colorMode === "light" ? "gray.100" : "gray.700"}
                                rounded={"lg"}
                                p={4}
                            >
                                <Box
                                    flex={1}
                                    alignItems={"center"}
                                    display={"block"}
                                >
                                    <Text
                                        fontWeight={"bold"}
                                        fontSize={"lg"}
                                        color={colorMode === "light" ? "gray.800" : "gray.100"}
                                        userSelect={"none"}
                                    >
                                        Details
                                    </Text>

                                </Box>
                                <Grid
                                    pt={2}
                                // gridGap={2}

                                >
                                    <Flex
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        roundedTop={"2xl"}
                                        borderBottom={"0px"}
                                        p={2}
                                    >
                                        <Text
                                            flex={1}
                                            fontWeight={"semibold"}
                                        >
                                            Document Status
                                        </Text>
                                        <Tag
                                            bg={
                                                projectClosureData.document.status === "approved" ? "green.500" :
                                                    projectClosureData.document.status === "inapproval" ? "blue.500" :
                                                        projectClosureData.document.status === "inreview" ? "orange.500" :
                                                            projectClosureData.document.status === "revising" ? "orange.500" :
                                                                // New
                                                                "red.500"
                                            }
                                            color={"white"}
                                            size={"md"}
                                        >
                                            {
                                                projectClosureData.document.status === "inapproval" ?
                                                    "Approval Requested" :
                                                    projectClosureData.document.status === "approved" ? "Approved" :
                                                        projectClosureData.document.status === "inreview" ? "Review Requested" :
                                                            projectClosureData.document.status === "revising" ? "Revising" : "New Document"
                                            }
                                        </Tag>
                                    </Flex>
                                    <Flex
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        // roundedTop={"2xl"}
                                        borderBottom={"0px"}
                                        alignItems={"center"}

                                        p={2}
                                        flexDir={"column"}

                                    >
                                        <Flex
                                            w={"100%"}
                                            // bg={"red"}
                                            justifyContent={'flex-end'}

                                        >
                                            <Text
                                                flex={1}
                                                fontWeight={"semibold"}
                                            >
                                                Created
                                            </Text>
                                            <Text

                                            >
                                                {creationDate}
                                                {/* {creator?.first_name} {creator?.last_name} */}
                                            </Text>

                                        </Flex>

                                        <Flex
                                            w={"100%"}
                                            // bg={"red"}
                                            justifyContent={'flex-end'}

                                        >
                                            <Text
                                                flex={1}
                                                fontWeight={"semibold"}
                                            >
                                                By
                                            </Text>
                                            <Button
                                                // as={Link}
                                                color={"blue.400"}
                                                cursor={"pointer"}
                                                fontSize={"md"}
                                                fontWeight="semibold"
                                                whiteSpace={"normal"}
                                                textOverflow={"ellipsis"}
                                                variant={"link"}
                                                onClick={onCreatorOpen}
                                            >
                                                {/* {creationDate} */}
                                                {creator?.first_name} {creator?.last_name}
                                            </Button>

                                        </Flex>

                                    </Flex>
                                    <Flex
                                        // gridTemplateColumns={"repeat(2, 1fr)"}
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        // roundedTop={"2xl"}
                                        p={2}
                                        borderBottom={"0px"}
                                        alignItems={"center"}

                                        flexDir={"column"}
                                    >
                                        <Flex
                                            w={"100%"}
                                            // bg={"red"}
                                            justifyContent={'flex-end'}
                                        >
                                            <Text
                                                flex={1}

                                                fontWeight={"semibold"}
                                            >
                                                Last Modifed
                                            </Text>
                                            <Text
                                            >
                                                {modifyDate}
                                            </Text>

                                        </Flex>
                                        <Flex
                                            w={"100%"}
                                            // bg={"red"}
                                            justifyContent={'flex-end'}
                                        >
                                            <Text
                                                flex={1}
                                                fontWeight={"semibold"}
                                            >
                                                By

                                            </Text>
                                            <Button
                                                // flex={1}

                                                // as={Link}
                                                color={"blue.400"}
                                                cursor={"pointer"}
                                                fontSize={"md"}
                                                fontWeight="semibold"
                                                whiteSpace={"normal"}
                                                textOverflow={"ellipsis"}
                                                variant={"link"}
                                                onClick={onModifierOpen}
                                            >
                                                {modifier?.first_name} {modifier?.last_name}
                                            </Button>

                                        </Flex>
                                    </Flex>
                                    <Flex
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        // roundedTop={"2xl"}
                                        p={2}
                                        borderBottom={"0px"}

                                    >
                                        <Text
                                            flex={1}
                                            fontWeight={"semibold"}
                                        >
                                            Project ID

                                        </Text>
                                        <Text>
                                            {projectClosureData?.document?.project?.pk}
                                        </Text>
                                    </Flex>
                                    <Flex
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        // roundedTop={"2xl"}
                                        p={2}
                                        borderBottom={"0px"}

                                    >
                                        <Text
                                            flex={1}
                                            fontWeight={"semibold"}
                                        >
                                            Selected PC ID</Text>
                                        <Text>
                                            {projectClosureData?.pk}
                                        </Text>
                                    </Flex>
                                    <Flex
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        roundedBottom={"2xl"}
                                        p={2}
                                    >
                                        <Text
                                            flex={1}
                                            fontWeight={"semibold"}
                                        >
                                            Document ID</Text>
                                        <Text>
                                            {projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                        </Text>
                                    </Flex>
                                </Grid>

                            </Box>

                            {/* Actions */}
                            <Box
                                bg={colorMode === "light" ? "gray.100" : "gray.700"}
                                rounded={"lg"}
                                p={4}
                                mt={

                                    {
                                        base: 0,
                                        // "3xl": 0,
                                    }
                                }
                            >

                                <Box
                                    flex={1}
                                    alignItems={"center"}
                                    display={"block"}
                                >
                                    <Text
                                        fontWeight={"bold"}
                                        fontSize={"lg"}
                                        color={colorMode === "light" ? "gray.800" : "gray.100"}
                                        userSelect={"none"}
                                    >
                                        Actions
                                    </Text>

                                </Box>



                                <Grid
                                    pt={2}

                                    gridTemplateColumns={"repeat(1, 1fr)"}
                                // gridGap={2}
                                // pt={4}
                                // pos={"relative"}
                                >
                                    {/* Project Lead GRID */}
                                    <Grid
                                        // gridTemplateColumns={"repeat(1, 1fr)"}
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        roundedTop={"2xl"}
                                        borderBottom={"0px"}

                                        p={4}
                                    >
                                        <Flex
                                            mt={1}
                                            justifyContent={"flex-end"}
                                            alignItems={"center"}
                                        >
                                            <Text
                                                flex={1}
                                                fontWeight={"semibold"}

                                            >
                                                Project Lead
                                            </Text>

                                            <Tag
                                                alignItems={"center"}
                                                justifyContent={"center"}
                                                display={"flex"}
                                                bg={projectClosureData?.document?.project_lead_approval_granted === true ? "green.500" : "red.500"}
                                                color={"white"}
                                            >
                                                {projectClosureData?.document?.project_lead_approval_granted === true ? "Granted" : "Required"}
                                            </Tag>

                                        </Flex>
                                        <Grid
                                            justifyContent={"flex-end"}
                                            w={"100%"}
                                            mt={projectClosureData?.document?.business_area_lead_approval_granted ? 0 : 3}
                                            gridTemplateColumns={"repeat(1, 1fr)"}
                                        >
                                            {projectClosureData?.document?.business_area_lead_approval_granted === false
                                                && projectClosureData?.document?.project_lead_approval_granted === true
                                                && (userData?.is_superuser || userData?.pk === leaderMember?.user?.pk) && (
                                                    <Center
                                                        justifyContent={"flex-end"}
                                                    >
                                                        <ProjectClosureActionModal
                                                            userData={userData}
                                                            refetchData={refetchData}
                                                            baData={baData}
                                                            isOpen={isS1RecallModalOpen}
                                                            onClose={onS1RecallModalClose}
                                                            action={"recall"}
                                                            projectClosurePk={projectClosureData?.pk}
                                                            documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                            stage={1}
                                                            projectData={projectClosureData?.document?.project}
                                                        />
                                                        <Button
                                                            colorScheme="blue"
                                                            size={"sm"}
                                                            onClick={onS1RecallModalOpen}
                                                        >
                                                            Recall Approval
                                                        </Button>

                                                    </Center>

                                                )
                                            }

                                            {/* {
                                                            all_documents?.progress_reports.length < 1
                                                            && ( */}

                                            {projectClosureData?.document?.business_area_lead_approval_granted === false &&
                                                (projectClosureData?.document?.id || projectClosureData?.document?.pk) &&
                                                projectClosureData?.document?.project_lead_approval_granted === false
                                                && (userData?.is_superuser || userData?.pk === leaderMember?.user?.pk) && (

                                                    <Center
                                                        justifyContent={"flex-end"}>

                                                        <>
                                                            <DeleteDocumentModal
                                                                key={keyForDeleteDocumentModal}
                                                                projectPk={projectClosureData?.document?.project?.pk ? projectClosureData?.document?.project?.pk : projectClosureData?.document?.project?.id}
                                                                documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                                documentKind="projectclosure"
                                                                onClose={onCloseDeleteDocumentModal}
                                                                isOpen={isDeleteDocumentModalOpen}
                                                                onDeleteSuccess={() => { setStatusIfRequired(projectClosureData?.document?.project?.pk ? projectClosureData?.document?.project?.pk : projectClosureData?.document?.project?.id, "updating") }}
                                                                refetchData={refetchData}
                                                                setToLastTab={setToLastTab}
                                                            />
                                                            <Button
                                                                colorScheme="red"
                                                                size={"sm"}
                                                                onClick={() => {
                                                                    console.log(docPk);
                                                                    onOpenDeleteDocumentModal();
                                                                }}
                                                                mr={2}
                                                            >
                                                                Delete Document
                                                            </Button>
                                                        </>
                                                        <>
                                                            <ProjectClosureActionModal
                                                                userData={userData}
                                                                refetchData={refetchData}
                                                                baData={baData}
                                                                isOpen={isS1ApprovalModalOpen}
                                                                onClose={onS1ApprovalModalClose}
                                                                action={"approve"}
                                                                stage={1}
                                                                projectClosurePk={projectClosureData?.pk}
                                                                documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                                projectData={projectClosureData?.document?.project}
                                                            />
                                                            <Button
                                                                colorScheme="green"
                                                                size={"sm"}
                                                                onClick={onS1ApprovalModalOpen}
                                                            >
                                                                Approve
                                                            </Button>

                                                        </>

                                                    </Center>





                                                )}


                                        </Grid>

                                    </Grid>


                                    {/* Business Area GRID */}
                                    <Grid
                                        // gridTemplateColumns={"repeat(1, 1fr)"}
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        borderBottom={"0px"}
                                        // rounded={"2xl"}
                                        p={4}
                                    // pos={"relative"}

                                    >
                                        <Flex
                                            mt={1}
                                            justifyContent={"flex-end"}
                                            alignItems={"center"}
                                        >
                                            <Text
                                                flex={1}
                                                fontWeight={"semibold"}

                                            >
                                                Business Area Lead
                                            </Text>



                                            {/* {
                                                userData
                                            } */}
                                            <Tag
                                                alignItems={"center"}
                                                justifyContent={"center"}
                                                display={"flex"}
                                                bg={projectClosureData?.document?.business_area_lead_approval_granted === true ? "green.500" : "red.500"}
                                                color={"white"}
                                            >
                                                {projectClosureData?.document?.business_area_lead_approval_granted === true ? "Granted" : "Required"}
                                            </Tag>

                                        </Flex>
                                        <Flex
                                            justifyContent={"flex-end"}
                                            w={"100%"}
                                            mt={projectClosureData?.document?.project_lead_approval_granted && projectClosureData?.document?.directorate_approval_granted === false ? 3 : 0}
                                        // gridTemplateColumns={"repeat(2, 1fr)"}
                                        >
                                            {projectClosureData?.document?.project_lead_approval_granted
                                                && projectClosureData?.document?.business_area_lead_approval_granted === false
                                                && (userData?.is_superuser || userData?.pk === baLead?.pk) &&


                                                (
                                                    <Center
                                                    // justifyContent={"flex-start"}
                                                    // ml={4}
                                                    >
                                                        <ProjectClosureActionModal
                                                            userData={userData}
                                                            refetchData={refetchData}

                                                            action={"send_back"}
                                                            baData={baData}
                                                            isOpen={isS2SendbackModalOpen}
                                                            onClose={onS2SendbackModalClose}
                                                            projectClosurePk={projectClosureData?.pk}
                                                            documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                            stage={2}
                                                            projectData={projectClosureData?.document?.project}
                                                        />
                                                        <Button
                                                            colorScheme="orange"
                                                            size={"sm"}

                                                            onClick={onS2SendbackModalOpen}
                                                        >
                                                            Send Back
                                                        </Button>

                                                    </Center>
                                                )
                                            }

                                            {projectClosureData?.document?.business_area_lead_approval_granted
                                                && projectClosureData?.document?.directorate_approval_granted === false
                                                && (userData?.is_superuser || userData?.business_area?.leader === baData?.leader) && (
                                                    <Center
                                                        // justifyContent={"flex-start"}
                                                        ml={3}
                                                    >
                                                        <ProjectClosureActionModal
                                                            userData={userData}
                                                            refetchData={refetchData}

                                                            action={"recall"}
                                                            baData={baData}
                                                            isOpen={isS2RecallModalOpen}
                                                            onClose={onS2RecallModalClose}
                                                            projectClosurePk={projectClosureData?.pk}
                                                            documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                            stage={2}
                                                            projectData={projectClosureData?.document?.project}
                                                        />

                                                        <Button
                                                            colorScheme="blue"
                                                            size={"sm"}
                                                            // onClick={onS3RecallModalOpen}
                                                            onClick={onS2RecallModalOpen}
                                                        >
                                                            Recall Approval
                                                        </Button>

                                                    </Center>

                                                )
                                            }

                                            {projectClosureData?.document?.project_lead_approval_granted
                                                && projectClosureData?.document?.business_area_lead_approval_granted === false

                                                && (userData?.is_superuser || userData?.pk === baData?.leader) && (
                                                    <Center
                                                        // justifyContent={"flex-end"}
                                                        ml={3}
                                                    >
                                                        <ProjectClosureActionModal
                                                            userData={userData}
                                                            refetchData={refetchData}

                                                            action={"approve"}
                                                            baData={baData}
                                                            isOpen={isS2ApprovalModalOpen}
                                                            onClose={onS2ApprovalModalClose}
                                                            projectClosurePk={projectClosureData?.pk}
                                                            documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                            stage={2}
                                                            projectData={projectClosureData?.document?.project}
                                                        />
                                                        <Button
                                                            colorScheme="green"
                                                            size={"sm"}
                                                            onClick={onS2ApprovalModalOpen}
                                                        >
                                                            Approve
                                                        </Button>

                                                    </Center>

                                                )}


                                        </Flex>

                                    </Grid>



                                    {/* Directorate GRID */}
                                    <Grid
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        roundedBottom={"2xl"}
                                        p={4}

                                    >
                                        <Flex
                                            mt={1}
                                            justifyContent={"flex-end"}
                                            alignItems={"center"}
                                        >
                                            <Text
                                                flex={1}
                                                fontWeight={"semibold"}

                                            >
                                                Directorate
                                            </Text>



                                            {/* {
                                                userData
                                            } */}
                                            <Tag
                                                alignItems={"center"}
                                                justifyContent={"center"}
                                                display={"flex"}
                                                bg={projectClosureData?.document?.directorate_approval_granted === true ? "green.500" : "red.500"}
                                                color={"white"}
                                            >
                                                {projectClosureData?.document?.directorate_approval_granted === true ? "Granted" : "Required"}
                                            </Tag>

                                        </Flex>
                                        <Flex
                                            justifyContent={"flex-end"}
                                            w={"100%"}
                                            mt={projectClosureData?.document?.business_area_lead_approval_granted ? 3 : 0}
                                        >


                                            {projectClosureData?.document?.business_area_lead_approval_granted && projectClosureData?.document?.directorate_approval_granted === false
                                                && (userData?.is_superuser || userData?.business_area?.name === "Directorate") &&
                                                (
                                                    <Center
                                                        justifyContent={"flex-end"}
                                                        ml={3}
                                                    >
                                                        <ProjectClosureActionModal
                                                            userData={userData}
                                                            action={"send_back"}
                                                            refetchData={refetchData}

                                                            baData={baData}
                                                            isOpen={isS3SendbackModalOpen}
                                                            onClose={onS3SendbackModalClose}
                                                            projectClosurePk={projectClosureData?.pk}
                                                            documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                            stage={3}
                                                            projectData={projectClosureData?.document?.project}
                                                        />

                                                        <Button
                                                            colorScheme="orange"
                                                            size={"sm"}
                                                            onClick={onS3SendbackModalOpen}
                                                        >
                                                            Send Back
                                                        </Button>

                                                    </Center>
                                                )
                                            }



                                            {projectClosureData?.document?.directorate_approval_granted
                                                && (userData?.is_superuser || userData?.business_area?.name === "Directorate") && (
                                                    <Center

                                                        justifyContent={"flex-start"}
                                                        ml={3}
                                                    >
                                                        <ProjectClosureActionModal
                                                            userData={userData}
                                                            action={"recall"}
                                                            refetchData={refetchData}

                                                            baData={baData}
                                                            isOpen={isS3RecallModalOpen}
                                                            onClose={onS3RecallModalClose}
                                                            projectClosurePk={projectClosureData?.pk}
                                                            documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                            stage={3}
                                                            projectData={projectClosureData?.document?.project}
                                                        />
                                                        <Button
                                                            colorScheme="blue"
                                                            size={"sm"}
                                                            onClick={onS3RecallModalOpen}
                                                        >
                                                            Recall Approval
                                                        </Button>

                                                        <ProjectClosureActionModal
                                                            userData={userData}
                                                            action={"reopen"}
                                                            refetchData={refetchData}

                                                            baData={baData}
                                                            isOpen={isS3ReopenModalOpen}
                                                            onClose={onS3ReopenModalClose}
                                                            projectClosurePk={projectClosureData?.pk}
                                                            documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                            stage={3}
                                                            projectData={projectClosureData?.document?.project}
                                                        />

                                                        <Button
                                                            colorScheme="orange"
                                                            size={"sm"}
                                                            onClick={onS3ReopenModalOpen}

                                                            // onClick={
                                                            //     () => openProjectFunc(
                                                            //         {
                                                            //             pk: projectClosureData?.document?.project?.id ? projectClosureData.document.project.id : projectClosureData.document.project.pk,
                                                            //         }
                                                            //     )
                                                            // }
                                                            ml={2}
                                                        >
                                                            Reopen Project
                                                        </Button>
                                                    </Center>

                                                )
                                            }

                                            {projectClosureData?.document?.business_area_lead_approval_granted
                                                && (userData?.is_superuser || userData?.business_area?.name === "Directorate") &&
                                                !projectClosureData?.document?.directorate_approval_granted &&
                                                (
                                                    <Center
                                                        ml={3}

                                                        justifyContent={"flex-end"}
                                                    >
                                                        <ProjectClosureActionModal
                                                            userData={userData}
                                                            action={"approve"}
                                                            refetchData={refetchData}

                                                            baData={baData}
                                                            isOpen={isS3ApprovalModalOpen}
                                                            onClose={onS3ApprovalModalClose}
                                                            projectClosurePk={projectClosureData?.pk}
                                                            documentPk={projectClosureData?.document?.pk ? projectClosureData?.document?.pk : projectClosureData?.document?.id}
                                                            stage={3}
                                                            projectData={projectClosureData?.document?.project}
                                                        />
                                                        <Button
                                                            colorScheme="green"
                                                            size={"sm"}
                                                            onClick={onS3ApprovalModalOpen}
                                                        >
                                                            Approve
                                                        </Button>

                                                    </Center>

                                                )}


                                        </Flex>
                                    </Grid>

                                    {/* PDF and email buttons */}

                                    <Flex
                                        bg={colorMode === "light" ? "gray.100" : "gray.700"}
                                        rounded={"2xl"}
                                        p={4}
                                        w={"100%"}
                                        justifyContent={"space-between"}
                                        border={"1px solid"}
                                        borderColor={"gray.300"}
                                        my={2}
                                    >
                                        <Box
                                            alignSelf={"center"}
                                        // bg={"red"}
                                        // justifyContent={""}
                                        >
                                            <Text fontWeight={"semibold"}>PDF</Text>
                                        </Box>

                                        <Box
                                        >
                                            <Box
                                                as="form"
                                                id="pdf-generation-form"
                                                onSubmit={handleSubmit(beginProjectDocPDFGeneration)}
                                            >
                                                <Input
                                                    type="hidden"
                                                    {...register("docPk", { required: true, value: projectClosureData?.document?.pk })}
                                                />
                                                <Input
                                                    type="hidden"
                                                    {...register("kind", { required: true, value: projectClosureData?.document?.kind })}
                                                />
                                            </Box>
                                            <Box
                                                as="form"
                                                id="pdf-download-form"
                                                onSubmit={handleSubmit(beginProjectDocPDFDownload)}
                                            >
                                                <Input
                                                    type="hidden"
                                                    {...register("docPk", { required: true, value: projectClosureData?.document?.pk })}
                                                />
                                            </Box>
                                            {
                                                // projectClosureData?.document?.pdf && (

                                                <Button
                                                    size={"sm"}
                                                    ml={2}
                                                    variant={"solid"}
                                                    colorScheme="blue"
                                                    // onClick={beginProjectDocPDFGeneration}
                                                    type="submit"
                                                    form="pdf-download-form"
                                                    isDisabled
                                                    isLoading={
                                                        // projectClosureData?.document?.pdf_generation_in_progress
                                                        // ||
                                                        projectPDFDownloadMutation.isLoading
                                                    }
                                                    loadingText={'Downloading'}
                                                >
                                                    Download PDF
                                                </Button>
                                                // )
                                            }


                                            <Button
                                                size={"sm"}
                                                ml={2}
                                                variant={"solid"}
                                                colorScheme="green"
                                                // onClick={beginProjectDocPDFGeneration}
                                                isDisabled
                                                type="submit"
                                                form="pdf-generation-form"
                                                isLoading={
                                                    // projectClosureData?.document?.pdf_generation_in_progress
                                                    // ||
                                                    projectDocPDFGenerationMutation.isLoading
                                                }
                                                loadingText={'PDF Generation In Progress'}
                                            >
                                                Generate PDF
                                            </Button>

                                        </Box>

                                    </Flex>


                                </Grid>
                            </Box>



                        </Grid>
                    </>

                ) :
                baLoading === false && baData === undefined
                    ? <Grid
                        my={4}
                        gridTemplateColumns={"repeat(1, 1fr)"}
                        justifyContent={"center"}
                    >
                        <Text
                            textAlign={"center"}
                            fontWeight={'semibold'}
                        >
                            Document Actions cannot be displayed as this project has no business area.
                        </Text>
                        <Text
                            textAlign={"center"}
                            fontWeight={'semibold'}
                        >
                            Please set a business area for this project from the project settings.
                        </Text>
                    </Grid> :

                    <Center>
                        <Spinner
                        />
                    </Center>

            }
        </>
    )
}