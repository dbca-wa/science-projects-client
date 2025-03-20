import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  Grid,
  Spinner,
  Tag,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ISetProjectStatusProps, setProjectStatus } from "../../../../lib/api";
import { useFormattedDate } from "../../../../lib/hooks/helper/useFormattedDate";
import { useBusinessArea } from "../../../../lib/hooks/tanstack/useBusinessArea";
import { useFullUserByPk } from "../../../../lib/hooks/tanstack/useFullUserByPk";
import { useProjectTeam } from "../../../../lib/hooks/tanstack/useProjectTeam";
import { useUser } from "../../../../lib/hooks/tanstack/useUser";
import {
  ICaretakerPermissions,
  IProjectMember,
  IStudentReport,
} from "../../../../types";
import { DeleteDocumentModal } from "../../../Modals/DeleteDocumentModal";
import { StudentReportActionModal } from "../../../Modals/DocumentActionModals/StudentReportActionModal";
import { UserProfile } from "../../Users/UserProfile";
import { ProjectDocumentPDFSection } from "./ProjectDocumentPDFSection";
import { useDivisionDirectorateMembers } from "@/lib/hooks/tanstack/useDivisionDirectorateMembers";

interface IStudentDocumentActions extends ICaretakerPermissions {
  studentReportData: IStudentReport;
  refetchData: () => void;
  documents: IStudentReport[];
  callSameData: () => void;
  setToLastTab: (tabToGoTo?: number) => void;
  isBaLead: boolean;
  // setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  // setselectedStudentReport: React.Dispatch<React.SetStateAction<IStudentReport>>;
  // projectPk: number;
}

export const StudentReportDocActions = ({
  studentReportData,
  refetchData,
  documents,
  callSameData,
  setToLastTab,
  isBaLead,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: // setselectedStudentReport, setSelectedYear,
// , projectPk
IStudentDocumentActions) => {
  const { colorMode } = useColorMode();
  const kindDict = {
    core_function: {
      color: "red",
      string: "Core Function",
      tag: "CF",
    },
    science: {
      color: "green",
      string: "Science",
      tag: "SP",
    },
    student: {
      color: "blue",
      string: "Student",
      tag: "STP",
    },
    external: {
      color: "gray",
      string: "External",
      tag: "EXT",
    },
  };

  const {
    isOpen: isS1ApprovalModalOpen,
    onOpen: onS1ApprovalModalOpen,
    onClose: onS1ApprovalModalClose,
  } = useDisclosure();
  const {
    isOpen: isS2ApprovalModalOpen,
    onOpen: onS2ApprovalModalOpen,
    onClose: onS2ApprovalModalClose,
  } = useDisclosure();
  const {
    isOpen: isS3ApprovalModalOpen,
    onOpen: onS3ApprovalModalOpen,
    onClose: onS3ApprovalModalClose,
  } = useDisclosure();

  const {
    isOpen: isS1RecallModalOpen,
    onOpen: onS1RecallModalOpen,
    onClose: onS1RecallModalClose,
  } = useDisclosure();
  const {
    isOpen: isS2RecallModalOpen,
    onOpen: onS2RecallModalOpen,
    onClose: onS2RecallModalClose,
  } = useDisclosure();
  const {
    isOpen: isS3RecallModalOpen,
    onOpen: onS3RecallModalOpen,
    onClose: onS3RecallModalClose,
  } = useDisclosure();

  const {
    isOpen: isS2SendbackModalOpen,
    onOpen: onS2SendbackModalOpen,
    onClose: onS2SendbackModalClose,
  } = useDisclosure();
  const {
    isOpen: isS3SendbackModalOpen,
    onOpen: onS3SendbackModalOpen,
    onClose: onS3SendbackModalClose,
  } = useDisclosure();

  const { userData, userLoading } = useUser();

  const { baData, baLoading } = useBusinessArea(
    studentReportData?.document?.project?.business_area?.pk,
  );
  const { isDirectorateLoading, directorateData } =
    useDivisionDirectorateMembers(baData?.division);

  const { userData: baLead } = useFullUserByPk(baData?.leader);
  const { userData: modifier, userLoading: modifierLoading } = useFullUserByPk(
    studentReportData?.document?.modifier,
  );
  const { userData: creator, userLoading: creatorLoading } = useFullUserByPk(
    studentReportData?.document?.creator,
  );

  const { teamData, isTeamLoading } = useProjectTeam(
    String(studentReportData?.document?.project?.pk),
  );

  const {
    isOpen: isDeleteDocumentModalOpen,
    onOpen: onOpenDeleteDocumentModal,
    onClose: onCloseDeleteDocumentModal,
  } = useDisclosure();

  // const [docPk, setDocPk] = useState(
  //   studentReportData?.document?.pk
  //     ? studentReportData.document.pk
  //     : studentReportData?.document?.id
  // );

  const keyForDeleteDocumentModal = studentReportData?.document?.pk
    ? `document-${studentReportData?.document?.pk}`
    : `document-${studentReportData?.document?.id}`;

  // useEffect(() => {
  //   setDocPk(studentReportData.document.pk);
  // }, [studentReportData]);

  // useEffect(
  //     () => {
  //         setDocPk},
  //     [documents])

  const creationDate = useFormattedDate(
    studentReportData?.document?.created_at,
  );
  const modifyDate = useFormattedDate(studentReportData?.document?.updated_at);

  const [actionsReady, setActionsReady] = useState(false);

  const [leaderMember, setLeaderMemeber] = useState<IProjectMember>();

  useEffect(() => {
    if (
      actionsReady === false &&
      !userLoading &&
      !baLoading &&
      !modifierLoading &&
      !creatorLoading &&
      !isTeamLoading &&
      teamData &&
      userData &&
      baData &&
      modifier &&
      creator
    ) {
      if (!isTeamLoading) {
        setLeaderMemeber(teamData.find((member) => member.is_leader === true));
      }
      setActionsReady(true);
    }
  }, [
    userLoading,
    baLoading,
    modifierLoading,
    creatorLoading,
    userData,
    baData,
    modifier,
    creator,
    actionsReady,
    teamData,
    isTeamLoading,
  ]);

  useEffect(() => {
    if (actionsReady) {
      setLeaderMemeber(teamData.find((member) => member.is_leader === true));
    }
  }, [actionsReady, teamData, isTeamLoading]);

  const {
    isOpen: isModifierOpen,
    onOpen: onModifierOpen,
    onClose: onModifierClose,
  } = useDisclosure();
  const {
    isOpen: isCreatorOpen,
    onOpen: onCreatorOpen,
    onClose: onCreatorClose,
  } = useDisclosure();

  const projectPk = studentReportData?.document?.project.pk;

  const setStatusIfRequired = () => {
    if (documents.length <= 1) {
      const data: ISetProjectStatusProps = {
        projectId: projectPk,
        status: "pending",
      };
      setProjectStatus(data);
    }
  };

  return (
    <>
      {actionsReady && leaderMember ? (
        <>
          <Drawer
            isOpen={isCreatorOpen}
            placement="right"
            onClose={onCreatorClose}
            size={"sm"} //by default is xs
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerBody>
                <UserProfile pk={creator?.pk} />
              </DrawerBody>

              <DrawerFooter></DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Drawer
            isOpen={isModifierOpen}
            placement="right"
            onClose={onModifierClose}
            size={"sm"} //by default is xs
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerBody>
                <UserProfile pk={modifier?.pk} />
              </DrawerBody>

              <DrawerFooter></DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Grid
            bg={colorMode === "light" ? "gray.50" : "gray.700"}
            rounded={"lg"}
            p={4}
            my={6}
            gridGap={4}
            gridTemplateColumns={{
              base: "repeat(1, 1fr)",
              "1200px": "repeat(2, 1fr)",
            }}
          >
            {/* Details */}
            <Box
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              rounded={"lg"}
              p={4}
            >
              <Box flex={1} alignItems={"center"} display={"block"}>
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
                  <Text flex={1} fontWeight={"semibold"}>
                    Document Status
                  </Text>
                  <Tag
                    bg={
                      studentReportData.document.status === "approved"
                        ? colorMode === "light"
                          ? "green.500"
                          : "green.600"
                        : studentReportData.document.status === "inapproval"
                          ? colorMode === "light"
                            ? "blue.500"
                            : "blue.600"
                          : studentReportData.document.status === "inreview"
                            ? colorMode === "light"
                              ? "orange.500"
                              : "orange.600"
                            : studentReportData.document.status === "revising"
                              ? "orange.500"
                              : // New
                                colorMode === "light"
                                ? "red.500"
                                : "red.600"
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {studentReportData.document.status === "inapproval"
                      ? "Approval Requested"
                      : studentReportData.document.status === "approved"
                        ? "Approved"
                        : studentReportData.document.status === "inreview"
                          ? "Review Requested"
                          : studentReportData.document.status === "revising"
                            ? "Revising"
                            : "New Document"}
                  </Tag>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedTop={"2xl"}
                  borderBottom={"0px"}
                  p={2}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Project Tag
                  </Text>
                  <Tag
                    bg={
                      colorMode === "light"
                        ? `${kindDict[studentReportData?.document?.project?.kind].color}.400`
                        : `${kindDict[studentReportData?.document?.project?.kind].color}.500`
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {kindDict[studentReportData?.document?.project?.kind].tag}-
                    {studentReportData?.document?.project?.year}-
                    {studentReportData?.document?.project?.number}
                  </Tag>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedTop={"2xl"}
                  p={2}
                  borderBottom={"0px"}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Project ID
                  </Text>
                  <Text>{studentReportData?.document?.project?.pk}</Text>
                </Flex>
                {/* <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedTop={"2xl"}
                  p={2}
                  borderBottom={"0px"}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Selected PR ID
                  </Text>
                  <Text>{studentReportData?.pk}</Text>
                </Flex> */}
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedBottom={"2xl"}
                  borderBottom={0}
                  p={2}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Document ID
                  </Text>
                  <Text>
                    {studentReportData?.document?.pk
                      ? studentReportData?.document?.pk
                      : studentReportData?.document?.id}{" "}
                    (SR {studentReportData?.pk})
                  </Text>
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
                    justifyContent={"flex-end"}
                  >
                    <Text flex={1} fontWeight={"semibold"}>
                      Created
                    </Text>
                    <Text>
                      {creationDate}
                      {/* {creator?.first_name} {creator?.last_name} */}
                    </Text>
                  </Flex>

                  <Flex
                    w={"100%"}
                    // bg={"red"}
                    justifyContent={"flex-end"}
                  >
                    <Text flex={1} fontWeight={"semibold"}>
                      By
                    </Text>
                    <Button
                      // as={Link}
                      color={colorMode === "light" ? "blue.400" : "blue.300"}
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
                  // borderBottom={"0px"}
                  roundedBottom={"2xl"}
                  alignItems={"center"}
                  flexDir={"column"}
                >
                  <Flex
                    w={"100%"}
                    // bg={"red"}
                    justifyContent={"flex-end"}
                  >
                    <Text flex={1} fontWeight={"semibold"}>
                      Last Modifed
                    </Text>
                    <Text>{modifyDate}</Text>
                  </Flex>
                  <Flex
                    w={"100%"}
                    // bg={"red"}
                    justifyContent={"flex-end"}
                  >
                    <Text flex={1} fontWeight={"semibold"}>
                      By
                    </Text>
                    <Button
                      // flex={1}

                      // as={Link}
                      color={colorMode === "light" ? "blue.400" : "blue.300"}
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
              </Grid>
            </Box>

            {/* Actions */}
            <Box
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              rounded={"lg"}
              p={4}
              mt={{
                base: 0,
                // "3xl": 0,
              }}
            >
              <Box flex={1} alignItems={"center"} display={"block"}>
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
                    <Text flex={1} fontWeight={"semibold"}>
                      Project Lead
                    </Text>

                    <Tag
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      bg={
                        studentReportData?.document
                          ?.project_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {studentReportData?.document
                        ?.project_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Grid
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      studentReportData?.document
                        ?.business_area_lead_approval_granted
                        ? 0
                        : 3
                    }
                    gridTemplateColumns={"repeat(1, 1fr)"}
                  >
                    {studentReportData?.document
                      ?.business_area_lead_approval_granted === false &&
                      studentReportData?.document
                        ?.project_lead_approval_granted === true &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === leaderMember?.user?.pk ||
                        userIsCaretakerOfProjectLeader ||
                        isBaLead ||
                        userIsCaretakerOfBaLeader) && (
                        <Center justifyContent={"flex-end"}>
                          <StudentReportActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
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
                            color={"white"}
                            background={
                              colorMode === "light" ? "blue.500" : "blue.600"
                            }
                            _hover={{
                              background:
                                colorMode === "light" ? "blue.400" : "blue.500",
                            }}
                            size={"sm"}
                            onClick={onS1RecallModalOpen}
                          >
                            Recall Approval
                          </Button>
                        </Center>
                      )}

                    {studentReportData?.document
                      ?.business_area_lead_approval_granted === false &&
                      studentReportData?.document
                        ?.project_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === leaderMember?.user?.pk ||
                        userIsCaretakerOfProjectLeader ||
                        isBaLead ||
                        userIsCaretakerOfBaLeader) && (
                        <Center justifyContent={"flex-end"}>
                          <StudentReportActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
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
                              projectPk={
                                studentReportData?.document?.project?.pk
                                  ? studentReportData?.document?.project?.pk
                                  : studentReportData?.document?.project?.id
                              }
                              documentPk={
                                studentReportData?.document?.pk
                                  ? studentReportData?.document?.pk
                                  : studentReportData?.document?.id
                              }
                              documentKind="progressreport"
                              onClose={onCloseDeleteDocumentModal}
                              isOpen={isDeleteDocumentModalOpen}
                              onDeleteSuccess={setStatusIfRequired}
                              refetchData={refetchData}
                              setToLastTab={setToLastTab}
                            />
                            <Button
                              color={"white"}
                              background={
                                colorMode === "light" ? "red.500" : "red.600"
                              }
                              _hover={{
                                background:
                                  colorMode === "light" ? "red.400" : "red.500",
                              }}
                              size={"sm"}
                              onClick={() => {
                                // console.log(docPk);
                                onOpenDeleteDocumentModal();
                              }}
                              mr={2}
                            >
                              Delete Document
                            </Button>
                          </>

                          <Button
                            color={"white"}
                            background={
                              colorMode === "light" ? "green.500" : "green.600"
                            }
                            _hover={{
                              background:
                                colorMode === "light"
                                  ? "green.400"
                                  : "green.500",
                            }}
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
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  borderBottom={"0px"}
                  p={4}
                >
                  <Flex
                    mt={1}
                    justifyContent={"flex-end"}
                    alignItems={"center"}
                  >
                    <Text flex={1} fontWeight={"semibold"}>
                      Business Area Lead
                    </Text>

                    <Tag
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      bg={
                        studentReportData?.document
                          ?.business_area_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {studentReportData?.document
                        ?.business_area_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      studentReportData?.document
                        ?.project_lead_approval_granted &&
                      studentReportData?.document
                        ?.directorate_approval_granted === false
                        ? 3
                        : 0
                    }
                  >
                    {studentReportData?.document
                      ?.project_lead_approval_granted &&
                      studentReportData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === baLead?.pk ||
                        userIsCaretakerOfBaLeader) && (
                        <Center>
                          <StudentReportActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
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
                            color={"white"}
                            background={
                              colorMode === "light"
                                ? "orange.500"
                                : "orange.600"
                            }
                            _hover={{
                              background:
                                colorMode === "light"
                                  ? "orange.400"
                                  : "orange.500",
                            }}
                            size={"sm"}
                            onClick={onS2SendbackModalOpen}
                          >
                            Send Back
                          </Button>
                        </Center>
                      )}

                    {studentReportData?.document
                      ?.business_area_lead_approval_granted &&
                      studentReportData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.business_area?.leader === baData?.leader ||
                        userIsCaretakerOfBaLeader) && (
                        <Center
                          // justifyContent={"flex-start"}
                          ml={3}
                        >
                          <StudentReportActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
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
                            color={"white"}
                            background={
                              colorMode === "light" ? "blue.500" : "blue.600"
                            }
                            _hover={{
                              background:
                                colorMode === "light" ? "blue.400" : "blue.500",
                            }}
                            size={"sm"}
                            // onClick={onS3RecallModalOpen}
                            onClick={onS2RecallModalOpen}
                            disabled={
                              directorateData?.length < 1 &&
                              !userData?.is_superuser
                            }
                          >
                            Recall Approval
                          </Button>
                        </Center>
                      )}

                    {studentReportData?.document
                      ?.project_lead_approval_granted &&
                      studentReportData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === baData?.leader ||
                        userIsCaretakerOfBaLeader) && (
                        <Center
                          // justifyContent={"flex-end"}
                          ml={3}
                        >
                          <StudentReportActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
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
                            color={"white"}
                            background={
                              colorMode === "light" ? "green.500" : "green.600"
                            }
                            _hover={{
                              background:
                                colorMode === "light"
                                  ? "green.400"
                                  : "green.500",
                            }}
                            size={"sm"}
                            onClick={onS2ApprovalModalOpen}
                            disabled={
                              directorateData?.length < 1 &&
                              !userData?.is_superuser
                            }
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
                    <Text flex={1} fontWeight={"semibold"}>
                      Directorate
                    </Text>

                    {/* {
                                                userData
                                            } */}
                    <Tag
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      bg={
                        studentReportData?.document
                          ?.directorate_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {studentReportData?.document
                        ?.directorate_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      studentReportData?.document
                        ?.business_area_lead_approval_granted
                        ? 3
                        : 0
                    }
                  >
                    {studentReportData?.document
                      ?.business_area_lead_approval_granted &&
                      studentReportData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.business_area?.name === "Directorate") && (
                        <Center justifyContent={"flex-end"} ml={3}>
                          <StudentReportActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
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
                            color={"white"}
                            background={
                              colorMode === "light"
                                ? "orange.500"
                                : "orange.600"
                            }
                            _hover={{
                              background:
                                colorMode === "light"
                                  ? "orange.400"
                                  : "orange.500",
                            }}
                            size={"sm"}
                            onClick={onS3SendbackModalOpen}
                          >
                            Send Back
                          </Button>
                        </Center>
                      )}

                    {studentReportData?.document
                      ?.directorate_approval_granted &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.business_area?.name === "Directorate") && (
                        <Center justifyContent={"flex-start"} ml={3}>
                          <StudentReportActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
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
                            color={"white"}
                            background={
                              colorMode === "light" ? "blue.500" : "blue.600"
                            }
                            _hover={{
                              background:
                                colorMode === "light" ? "blue.400" : "blue.500",
                            }}
                            size={"sm"}
                            onClick={onS3RecallModalOpen}
                          >
                            Recall Approval
                          </Button>
                        </Center>
                      )}

                    {studentReportData?.document
                      ?.business_area_lead_approval_granted &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.business_area?.name === "Directorate") &&
                      !studentReportData?.document
                        ?.directorate_approval_granted && (
                        <Center ml={3} justifyContent={"flex-end"}>
                          <StudentReportActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
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
                            color={"white"}
                            background={
                              colorMode === "light" ? "green.500" : "green.600"
                            }
                            _hover={{
                              background:
                                colorMode === "light"
                                  ? "green.400"
                                  : "green.500",
                            }}
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
                <ProjectDocumentPDFSection
                  data_document={studentReportData}
                  refetchData={callSameData}
                />
              </Grid>
            </Box>
          </Grid>
        </>
      ) : baLoading === false && baData === undefined ? (
        <Grid
          my={4}
          gridTemplateColumns={"repeat(1, 1fr)"}
          justifyContent={"center"}
        >
          <Text textAlign={"center"} fontWeight={"semibold"}>
            Document Actions cannot be displayed as this project has no business
            area.
          </Text>
          <Text textAlign={"center"} fontWeight={"semibold"}>
            Please set a business area for this project from the project
            settings.
          </Text>
        </Grid>
      ) : actionsReady && !leaderMember ? (
        <Grid
          my={4}
          gridTemplateColumns={"repeat(1, 1fr)"}
          justifyContent={"center"}
        >
          <Text textAlign={"center"} fontWeight={"semibold"}>
            This project has no members/leader so document actions are not shown
            here.
          </Text>
          <Text textAlign={"center"} fontWeight={"semibold"}>
            Please add members to adjust document actions.
          </Text>
        </Grid>
      ) : (
        <Center>
          <Spinner />
        </Center>
      )}
    </>
  );
};
