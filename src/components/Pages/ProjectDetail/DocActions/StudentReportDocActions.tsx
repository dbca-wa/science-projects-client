import { useEffect, useRef, useState } from "react";
import { IStudentReport, IProjectMember } from "../../../../types";
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
import { IDocGenerationProps, generateProjectDocument, downloadProjectDocument, setProjectStatus, ISetProjectProps } from "../../../../lib/api";
import { AxiosError } from "axios";
import { DeleteDocumentModal } from "../../../Modals/DeleteDocumentModal";
import { StudentReportActionModal } from "../../../Modals/DocumentActionModals/StudentReportActionModal";

interface IStudentDocumentActions {
    studentReportData: IStudentReport;
    refetchData: () => void;
    documents: IStudentReport[];
    callSameData: () => void;
    // setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
    // setselectedStudentReport: React.Dispatch<React.SetStateAction<IStudentReport>>;
    // projectPk: number;
}

export const StudentReportDocActions = ({ studentReportData, refetchData, documents,
    callSameData,
    // setselectedStudentReport, setSelectedYear,
    // , projectPk 
}: IStudentDocumentActions) => {
    const [showActions, setShowActions] = useState(false);
    const handleToggleActionsVisibility = () => {
        setShowActions(!showActions);
    }
    const { colorMode } = useColorMode();

    useEffect(() => {
        console.log(studentReportData)
        console.log(studentReportData?.document?.creator)
        console.log(studentReportData?.document?.modifier)
        // console.log(studentReportData?.document?.created_at);
        // console.log(studentReportData?.document?.updated_at);
        // setCreationDate(studentReportData?.document?.created_at);
        // setModifyDate(studentReportData?.document?.updated_at);
    }, [studentReportData])

    const { isOpen: isS1ApprovalModalOpen, onOpen: onS1ApprovalModalOpen, onClose: onS1ApprovalModalClose } = useDisclosure();
    const { isOpen: isS2ApprovalModalOpen, onOpen: onS2ApprovalModalOpen, onClose: onS2ApprovalModalClose } = useDisclosure();
    const { isOpen: isS3ApprovalModalOpen, onOpen: onS3ApprovalModalOpen, onClose: onS3ApprovalModalClose } = useDisclosure();

    const { isOpen: isS1RecallModalOpen, onOpen: onS1RecallModalOpen, onClose: onS1RecallModalClose } = useDisclosure();
    const { isOpen: isS2RecallModalOpen, onOpen: onS2RecallModalOpen, onClose: onS2RecallModalClose } = useDisclosure();
    const { isOpen: isS3RecallModalOpen, onOpen: onS3RecallModalOpen, onClose: onS3RecallModalClose } = useDisclosure();


    const { isOpen: isS1SendbackModalOpen, onOpen: onS1SendbackModalOpen, onClose: onS1SendbackModalClose } = useDisclosure();
    const { isOpen: isS2SendbackModalOpen, onOpen: onS2SendbackModalOpen, onClose: onS2SendbackModalClose } = useDisclosure();
    const { isOpen: isS3SendbackModalOpen, onOpen: onS3SendbackModalOpen, onClose: onS3SendbackModalClose } = useDisclosure();


    const { userData, userLoading } = useUser();

    const { baData, baLoading } = useBusinessArea(studentReportData?.document?.project?.business_area?.pk)
    const { userData: baLead, userLoading: baLeadLoading } = useFullUserByPk(baData?.leader)
    const { userData: modifier, userLoading: modifierLoading } = useFullUserByPk(studentReportData?.document?.modifier);
    const { userData: creator, userLoading: creatorLoading } = useFullUserByPk(studentReportData?.document?.creator);

    const { teamData, isTeamLoading, refetchTeamData } = useProjectTeam(String(studentReportData?.document?.project?.pk));

    const { isOpen: isDeleteDocumentModalOpen, onOpen: onOpenDeleteDocumentModal, onClose: onCloseDeleteDocumentModal } = useDisclosure();


    const [docPk, setDocPk] = useState(studentReportData?.document?.pk ? studentReportData.document.pk : studentReportData?.document?.id)

    const keyForDeleteDocumentModal = studentReportData?.document?.pk
        ? `document-${studentReportData?.document?.pk}`
        : `document-${studentReportData?.document?.id}`;



    // useEffect(() => {
    //     const highestYearDocument = documents.reduce((maxDocument, currentDocument) => {
    //         if (!maxDocument || currentDocument.year > maxDocument.year) {
    //             return currentDocument;
    //         }
    //         return maxDocument;
    //     }, null)

    //     setSelectedYear(highestYearDocument.year)
    //     setselectedStudentReport(highestYearDocument);
    //     // console.log('DOC LENGTH: ', documents.length);
    //     // refetchDataForYearFunction();
    // }, [documents])


    useEffect(() => {
        setDocPk(studentReportData.document.pk)
    }, [studentReportData])

    // useEffect(
    //     () => {
    //         setDocPk},
    //     [documents])


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

    const creationDate = useFormattedDate(studentReportData?.document?.created_at);
    const modifyDate = useFormattedDate(studentReportData?.document?.updated_at);

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
            console.log()
            if (!isTeamLoading) {
                setLeaderMemeber(teamData.find((member) => member.is_leader === true))
            }
            setActionsReady(true);
        }
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
            console.log(studentReportData?.document)
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

    const projectPk = studentReportData?.document?.project.pk;

    const setStatusIfRequired = () => {
        if (documents.length <= 1) {
            const data: ISetProjectProps = {
                projectId: projectPk,
                status: "pending",
            }
            setProjectStatus(data);
        }
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
        // const docPk = studentReportData?.document?.pk;
        projectPDFDownloadMutation.mutate(formData);
    }



    const beginProjectDocPDFGeneration = (formData: IDocGenerationProps) => {
        // const docPk = studentReportData?.document?.pk;
        projectDocPDFGenerationMutation.mutate(formData);
    }

    useEffect(() => {
        console.log(leaderMember)
    }, [leaderMember])

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
                                                studentReportData.document.status === "approved" ? "green.500" :
                                                    studentReportData.document.status === "inapproval" ? "blue.500" :
                                                        studentReportData.document.status === "inreview" ? "orange.500" :
                                                            studentReportData.document.status === "revising" ? "orange.500" :
                                                                // New
                                                                "red.500"
                                            }
                                            color={"white"}
                                            size={"md"}
                                        >
                                            {
                                                studentReportData.document.status === "inapproval" ?
                                                    "Approval Requested" :
                                                    studentReportData.document.status === "approved" ? "Approved" :
                                                        studentReportData.document.status === "inreview" ? "Review Requested" :
                                                            studentReportData.document.status === "revising" ? "Revising" : "New Document"
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
                                            {studentReportData?.document?.project?.pk}
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
                                            Selected PR ID</Text>
                                        <Text>
                                            {studentReportData?.pk}
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
                                            {studentReportData?.document?.pk ? studentReportData?.document?.pk : studentReportData?.document?.id}
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
                                                bg={studentReportData?.document?.project_lead_approval_granted === true ? "green.500" : "red.500"}
                                                color={"white"}
                                            >
                                                {studentReportData?.document?.project_lead_approval_granted === true ? "Granted" : "Required"}
                                            </Tag>

                                        </Flex>
                                        <Grid
                                            justifyContent={"flex-end"}
                                            w={"100%"}
                                            mt={studentReportData?.document?.business_area_lead_approval_granted ? 0 : 3}
                                            gridTemplateColumns={"repeat(1, 1fr)"}
                                        >
                                            {studentReportData?.document?.business_area_lead_approval_granted === false
                                                && studentReportData?.document?.project_lead_approval_granted === true
                                                && (userData?.is_superuser || userData?.pk === leaderMember?.user?.pk) && (
                                                    <Center
                                                        justifyContent={"flex-end"}
                                                    >
                                                        <StudentReportActionModal
                                                            callSameData={callSameData}
                                                            refetchData={refetchData}
                                                            baData={baData}
                                                            isOpen={isS1RecallModalOpen}
                                                            onClose={onS1RecallModalClose}
                                                            action={"recall"}
                                                            studentReportPk={studentReportData?.pk}
                                                            documentPk={studentReportData?.document?.pk}
                                                            stage={1}
                                                            projectData={studentReportData?.document?.project}
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

                                            {studentReportData?.document?.business_area_lead_approval_granted === false &&
                                                studentReportData?.document?.project_lead_approval_granted === false
                                                && (userData?.is_superuser || userData?.pk === leaderMember?.user?.pk) && (
                                                    <Center
                                                        justifyContent={"flex-end"}>
                                                        <StudentReportActionModal
                                                            callSameData={callSameData}

                                                            refetchData={refetchData}
                                                            baData={baData}
                                                            isOpen={isS1ApprovalModalOpen}
                                                            onClose={onS1ApprovalModalClose}
                                                            action={"approve"}
                                                            studentReportPk={studentReportData?.pk}
                                                            documentPk={studentReportData?.document?.pk}
                                                            stage={1}
                                                            projectData={studentReportData?.document?.project}
                                                        />

                                                        {/* {
                                                            all_documents?.progress_reports.length < 1
                                                            && ( */}
                                                        <>
                                                            <DeleteDocumentModal
                                                                key={keyForDeleteDocumentModal}
                                                                projectPk={studentReportData?.document?.project?.pk ? studentReportData?.document?.project?.pk : studentReportData?.document?.project?.id}
                                                                documentPk={studentReportData?.document?.pk ? studentReportData?.document?.pk : studentReportData?.document?.id}
                                                                documentKind="progressreport"
                                                                onClose={onCloseDeleteDocumentModal}
                                                                isOpen={isDeleteDocumentModalOpen}
                                                                onDeleteSuccess={setStatusIfRequired}
                                                                refetchData={refetchData}
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
                                                        {/* )
                                                        } */}


                                                        <Button
                                                            colorScheme="green"
                                                            size={"sm"}
                                                            onClick={onS1ApprovalModalOpen}
                                                        >
                                                            Approve
                                                        </Button>

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
                                                bg={studentReportData?.document?.business_area_lead_approval_granted === true ? "green.500" : "red.500"}
                                                color={"white"}
                                            >
                                                {studentReportData?.document?.business_area_lead_approval_granted === true ? "Granted" : "Required"}
                                            </Tag>

                                        </Flex>
                                        <Flex
                                            justifyContent={"flex-end"}
                                            w={"100%"}
                                            mt={studentReportData?.document?.project_lead_approval_granted && studentReportData?.document?.directorate_approval_granted === false ? 3 : 0}
                                        // gridTemplateColumns={"repeat(2, 1fr)"}
                                        >
                                            {studentReportData?.document?.project_lead_approval_granted
                                                && studentReportData?.document?.business_area_lead_approval_granted === false
                                                && (userData?.is_superuser || userData?.pk === baLead?.pk) &&


                                                (
                                                    <Center
                                                    // justifyContent={"flex-start"}
                                                    // ml={4}
                                                    >
                                                        <StudentReportActionModal
                                                            refetchData={refetchData}
                                                            callSameData={callSameData}


                                                            action={"send_back"}
                                                            baData={baData}
                                                            isOpen={isS2SendbackModalOpen}
                                                            onClose={onS2SendbackModalClose}
                                                            studentReportPk={studentReportData?.pk}
                                                            documentPk={studentReportData?.document?.pk}
                                                            stage={2}
                                                            projectData={studentReportData?.document?.project}
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

                                            {studentReportData?.document?.business_area_lead_approval_granted
                                                && studentReportData?.document?.directorate_approval_granted === false
                                                && (userData?.is_superuser || userData?.business_area?.leader === baData?.leader) && (
                                                    <Center
                                                        // justifyContent={"flex-start"}
                                                        ml={3}
                                                    >
                                                        <StudentReportActionModal
                                                            refetchData={refetchData}
                                                            callSameData={callSameData}


                                                            action={"recall"}
                                                            baData={baData}
                                                            isOpen={isS2RecallModalOpen}
                                                            onClose={onS2RecallModalClose}
                                                            studentReportPk={studentReportData?.pk}
                                                            documentPk={studentReportData?.document?.pk}
                                                            stage={2}
                                                            projectData={studentReportData?.document?.project}
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

                                            {studentReportData?.document?.project_lead_approval_granted
                                                && studentReportData?.document?.business_area_lead_approval_granted === false

                                                && (userData?.is_superuser || userData?.pk === baData?.leader) && (
                                                    <Center
                                                        // justifyContent={"flex-end"}
                                                        ml={3}
                                                    >
                                                        <StudentReportActionModal
                                                            refetchData={refetchData}
                                                            callSameData={callSameData}


                                                            action={"approve"}
                                                            baData={baData}
                                                            isOpen={isS2ApprovalModalOpen}
                                                            onClose={onS2ApprovalModalClose}
                                                            studentReportPk={studentReportData?.pk}
                                                            documentPk={studentReportData?.document?.pk}
                                                            stage={2}
                                                            projectData={studentReportData?.document?.project}
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
                                                bg={studentReportData?.document?.directorate_approval_granted === true ? "green.500" : "red.500"}
                                                color={"white"}
                                            >
                                                {studentReportData?.document?.directorate_approval_granted === true ? "Granted" : "Required"}
                                            </Tag>

                                        </Flex>
                                        <Flex
                                            justifyContent={"flex-end"}
                                            w={"100%"}
                                            mt={studentReportData?.document?.business_area_lead_approval_granted ? 3 : 0}
                                        >


                                            {studentReportData?.document?.business_area_lead_approval_granted && studentReportData?.document?.directorate_approval_granted === false
                                                && (userData?.is_superuser || userData?.business_area?.name === "Directorate") &&
                                                (
                                                    <Center
                                                        justifyContent={"flex-end"}
                                                        ml={3}
                                                    >
                                                        <StudentReportActionModal
                                                            action={"send_back"}
                                                            refetchData={refetchData}
                                                            callSameData={callSameData}


                                                            baData={baData}
                                                            isOpen={isS3SendbackModalOpen}
                                                            onClose={onS3SendbackModalClose}
                                                            studentReportPk={studentReportData?.pk}
                                                            documentPk={studentReportData?.document?.pk}
                                                            stage={3}
                                                            projectData={studentReportData?.document?.project}
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



                                            {studentReportData?.document?.directorate_approval_granted
                                                && (userData?.is_superuser || userData?.business_area?.name === "Directorate") && (
                                                    <Center

                                                        justifyContent={"flex-start"}
                                                        ml={3}
                                                    >
                                                        <StudentReportActionModal
                                                            action={"recall"}
                                                            refetchData={refetchData}
                                                            callSameData={callSameData}


                                                            baData={baData}
                                                            isOpen={isS3RecallModalOpen}
                                                            onClose={onS3RecallModalClose}
                                                            studentReportPk={studentReportData?.pk}
                                                            documentPk={studentReportData?.document?.pk}
                                                            stage={3}
                                                            projectData={studentReportData?.document?.project}
                                                        />
                                                        <Button
                                                            colorScheme="blue"
                                                            size={"sm"}
                                                            onClick={onS3RecallModalOpen}
                                                        >
                                                            Recall Approval
                                                        </Button>

                                                    </Center>

                                                )
                                            }

                                            {studentReportData?.document?.business_area_lead_approval_granted
                                                && (userData?.is_superuser || userData?.business_area?.name === "Directorate") &&
                                                !studentReportData?.document?.directorate_approval_granted &&
                                                (
                                                    <Center
                                                        ml={3}

                                                        justifyContent={"flex-end"}
                                                    >
                                                        <StudentReportActionModal
                                                            action={"approve"}
                                                            refetchData={refetchData}
                                                            callSameData={callSameData}


                                                            baData={baData}
                                                            isOpen={isS3ApprovalModalOpen}
                                                            onClose={onS3ApprovalModalClose}
                                                            studentReportPk={studentReportData?.pk}
                                                            documentPk={studentReportData?.document?.pk}
                                                            stage={3}
                                                            projectData={studentReportData?.document?.project}
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
                                                    {...register("docPk", { required: true, value: studentReportData?.document?.pk })}
                                                />
                                                <Input
                                                    type="hidden"
                                                    {...register("kind", { required: true, value: studentReportData?.document?.kind })}
                                                />
                                            </Box>
                                            <Box
                                                as="form"
                                                id="pdf-download-form"
                                                onSubmit={handleSubmit(beginProjectDocPDFDownload)}
                                            >
                                                <Input
                                                    type="hidden"
                                                    {...register("docPk", { required: true, value: studentReportData?.document?.pk })}
                                                />
                                            </Box>
                                            {
                                                // studentReportData?.document?.pdf && (

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
                                                        // studentReportData?.document?.pdf_generation_in_progress
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
                                                type="submit"
                                                form="pdf-generation-form"
                                                isDisabled
                                                isLoading={
                                                    // studentReportData?.document?.pdf_generation_in_progress
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
                <Spinner
                />
            }
        </>
    )
}