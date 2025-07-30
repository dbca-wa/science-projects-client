import { CreateProgressReportModal } from "@/components/Modals/CreateProgressReportModal";
import { DeleteDocumentModal } from "@/components/Modals/DeleteDocumentModal";
import { UnifiedDocumentActionModal } from "@/components/Modals/DocumentActionModals/UnifiedDocumentActionModal";
import { SetAreasModal } from "@/components/Modals/SetAreasModal";
import { ISetProjectStatusProps, setProjectStatus } from "@/lib/api";
import { useFormattedDate } from "@/lib/hooks/helper/useFormattedDate";
import { useBusinessArea } from "@/lib/hooks/tanstack/useBusinessArea";
import { useDivisionDirectorateMembers } from "@/lib/hooks/tanstack/useDivisionDirectorateMembers";
import { useFullUserByPk } from "@/lib/hooks/tanstack/useFullUserByPk";
import { useProjectTeam } from "@/lib/hooks/tanstack/useProjectTeam";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  ICaretakerPermissions,
  IConceptPlan,
  IProgressReport,
  IProjectClosure,
  IProjectDocuments,
  IProjectMember,
  IProjectPlan,
  IStudentReport,
  ProjectStatus,
} from "@/types";
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
import { UserProfile } from "../../Users/UserProfile";
import { ProjectDocumentPDFSection } from "./ProjectDocumentPDFSection";

// Type for document type
export type DocumentType =
  | "concept"
  | "projectplan"
  | "progressreport"
  | "studentreport"
  | "projectclosure";

// Mapping to DeleteDocumentModal documentKind
const documentKindMapping = {
  concept: "conceptplan",
  projectplan: "projectplan",
  progressreport: "progressreport",
  studentreport: "studentreport",
  projectclosure: "projectclosure",
} as const;

// Type for all possible document data
export type DocumentData =
  | IConceptPlan
  | IProjectPlan
  | IProgressReport
  | IStudentReport
  | IProjectClosure;

// Props interface for unified document actions
interface UnifiedDocumentActionsProps extends ICaretakerPermissions {
  documentType: DocumentType;
  documentData: DocumentData;
  refetchData: () => void;
  callSameData?: () => void;
  all_documents?: IProjectDocuments;
  projectAreas?: any;
  documents?: DocumentData[];
  setToLastTab?: (tabToGoTo?: number) => void;
  isBaLead?: boolean;
}

// Type guards for document types
const isConceptPlan = (doc: DocumentData): doc is IConceptPlan => {
  return "tags" in doc;
};

const isProjectPlan = (doc: DocumentData): doc is IProjectPlan => {
  return "background" in doc;
};

const isProgressReport = (doc: DocumentData): doc is IProgressReport => {
  return "activities" in doc;
};

const isStudentReport = (doc: DocumentData): doc is IStudentReport => {
  return "supervisor" in doc;
};

const isProjectClosure = (doc: DocumentData): doc is IProjectClosure => {
  return "intended_outcome" in doc;
};

// Get document name for display
const getDocumentName = (type: DocumentType): string => {
  switch (type) {
    case "concept":
      return "Concept Plan";
    case "projectplan":
      return "Project Plan";
    case "progressreport":
      return "Progress Report";
    case "studentreport":
      return "Student Report";
    case "projectclosure":
      return "Project Closure";
  }
};

export const UnifiedDocumentActions = ({
  documentType,
  documentData,
  refetchData,
  callSameData,
  all_documents,
  projectAreas,
  documents,
  setToLastTab,
  isBaLead,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: UnifiedDocumentActionsProps) => {
  const { colorMode } = useColorMode();

  // Disclosure hooks for all modals
  const createModals = () => {
    return {
      s1Approval: useDisclosure(),
      s2Approval: useDisclosure(),
      s3Approval: useDisclosure(),
      s1Recall: useDisclosure(),
      s2Recall: useDisclosure(),
      s3Recall: useDisclosure(),
      s2SendBack: useDisclosure(),
      s3SendBack: useDisclosure(),
      s1Reopen: useDisclosure(),
      s2Reopen: useDisclosure(),
      s3Reopen: useDisclosure(),
      deleteDocument: useDisclosure(),
      modifier: useDisclosure(),
      creator: useDisclosure(),
      createProgressReport: useDisclosure(),
      setAreas: useDisclosure(),
    };
  };

  const modals = createModals();

  // Common hooks needed by all document types
  const { userData, userLoading } = useUser();
  const { baData, baLoading } = useBusinessArea(
    documentData?.document?.project?.business_area?.pk,
  );
  const { directorateData, isDirectorateLoading } =
    useDivisionDirectorateMembers(baData?.division);
  const userInDivisionalDirectorate = directorateData?.some(
    (user) => user.pk === userData?.pk,
  );
  const { userData: baLead } = useFullUserByPk(baData?.leader);
  const { userData: modifier, userLoading: modifierLoading } = useFullUserByPk(
    documentData?.document?.modifier,
  );
  const { userData: creator, userLoading: creatorLoading } = useFullUserByPk(
    documentData?.document?.creator,
  );
  const { teamData, isTeamLoading } = useProjectTeam(
    String(documentData?.document?.project?.pk),
  );

  // Formatted dates
  const creationDate = useFormattedDate(documentData?.document?.created_at);
  const modifyDate = useFormattedDate(documentData?.document?.updated_at);

  // State
  const [actionsReady, setActionsReady] = useState(false);
  const [leaderMember, setLeaderMember] = useState<IProjectMember>();

  // Set up for delete document modal
  const keyForDeleteDocumentModal = documentData?.document?.pk
    ? `document-${documentData.document.pk}`
    : `document-${documentData.document.id}`;

  // Color dictionary for project kinds
  const kindDict = {
    core_function: { color: "red", string: "Core Function", tag: "CF" },
    science: { color: "green", string: "Science", tag: "SP" },
    student: { color: "blue", string: "Student", tag: "STP" },
    external: { color: "gray", string: "External", tag: "EXT" },
  };

  // Set up actions ready state
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
        setLeaderMember(teamData.find((member) => member.is_leader === true));
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
      setLeaderMember(teamData.find((member) => member.is_leader === true));
    }
  }, [actionsReady, teamData, isTeamLoading]);

  // Helper function for status updates
  const setStatusIfRequired = (
    projectPk: number,
    status: ProjectStatus = "pending",
  ) => {
    const data: ISetProjectStatusProps = {
      projectId: projectPk,
      status,
    };
    setProjectStatus(data);
  };

  // Document-specific features
  const getDocumentSpecificButtons = () => {
    // Project Plan specific - Create Progress Report button
    if (
      documentType === "projectplan" &&
      all_documents?.progress_reports?.length < 1 &&
      documentData?.document?.project_lead_approval_granted === true &&
      documentData?.document?.business_area_lead_approval_granted === true &&
      documentData?.document?.directorate_approval_granted === true &&
      (userData?.is_superuser ||
        userIsCaretakerOfAdmin ||
        userData?.pk === leaderMember?.user?.pk ||
        userIsCaretakerOfProjectLeader ||
        isBaLead ||
        userIsCaretakerOfBaLeader)
    ) {
      return (
        <>
          <CreateProgressReportModal
            projectPk={documentData?.document?.project?.pk}
            documentKind="progressreport"
            onClose={modals.createProgressReport.onClose}
            isOpen={modals.createProgressReport.isOpen}
            refetchData={refetchData}
          />
          <Button
            mt={3}
            color={"white"}
            background={colorMode === "light" ? "orange.500" : "orange.600"}
            _hover={{
              background: colorMode === "light" ? "orange.400" : "orange.500",
            }}
            size={"sm"}
            onClick={modals.createProgressReport.onOpen}
            ml={2}
          >
            Create Progress Report
          </Button>
        </>
      );
    }

    // Project Plan specific - Set Areas button
    if (
      documentType === "projectplan" &&
      projectAreas &&
      projectAreas.areas.length < 1 &&
      documentData?.document?.project_lead_approval_granted === false
    ) {
      return (
        <>
          <SetAreasModal
            projectPk={documentData?.document?.project?.pk}
            onClose={modals.setAreas.onClose}
            isOpen={modals.setAreas.isOpen}
            refetchData={refetchData}
            setToLastTab={setToLastTab}
          />
          <Button
            color={"white"}
            background={colorMode === "light" ? "green.500" : "green.600"}
            _hover={{
              background: colorMode === "light" ? "green.400" : "green.500",
            }}
            size={"sm"}
            onClick={modals.setAreas.onOpen}
          >
            Set Areas
          </Button>
        </>
      );
    }

    // Reopen project button for Project Closure
    if (
      documentType === "projectclosure" &&
      (documentData?.document?.project?.status === "completed" ||
        documentData?.document?.project?.status === "terminated" ||
        documentData?.document?.project?.status === "suspended") &&
      (userData?.is_superuser ||
        userIsCaretakerOfAdmin ||
        userData?.pk === leaderMember?.user?.pk ||
        userIsCaretakerOfProjectLeader ||
        isBaLead ||
        userIsCaretakerOfBaLeader)
    ) {
      return (
        <Button
          color={"white"}
          background={colorMode === "light" ? "orange.500" : "orange.600"}
          _hover={{
            background: colorMode === "light" ? "orange.400" : "orange.500",
          }}
          size={"sm"}
          onClick={
            documentData?.document?.directorate_approval_granted
              ? modals.s3Reopen.onOpen
              : documentData?.document?.business_area_lead_approval_granted
                ? modals.s2Reopen.onOpen
                : modals.s1Reopen.onOpen
          }
          mt={3}
        >
          {userData?.is_superuser || userIsCaretakerOfAdmin
            ? "Delete Closure"
            : "Reopen Project"}
        </Button>
      );
    }

    return null;
  };

  // Delete document button conditional rendering
  const canShowDeleteButton = () => {
    // Only show if document is not approved
    if (documentData?.document?.directorate_approval_granted) {
      return false;
    }

    // Only show for new documents
    if (documentData?.document?.project_lead_approval_granted === false) {
      return true;
    }

    // Special case for project plans
    if (
      documentType === "projectplan" &&
      all_documents?.progress_reports?.length < 1
    ) {
      return true;
    }

    return false;
  };

  // Main render
  return (
    <>
      {actionsReady && leaderMember ? (
        <>
          {/* User Profile Drawers */}
          <Drawer
            isOpen={modals.creator.isOpen}
            placement="right"
            onClose={modals.creator.onClose}
            size={"sm"}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerBody>
                <UserProfile pk={creator?.pk} />
              </DrawerBody>
              <DrawerFooter />
            </DrawerContent>
          </Drawer>

          <Drawer
            isOpen={modals.modifier.isOpen}
            placement="right"
            onClose={modals.modifier.onClose}
            size={"sm"}
          >
            <DrawerOverlay />
            <DrawerContent>
              <DrawerBody>
                <UserProfile pk={modifier?.pk} />
              </DrawerBody>
              <DrawerFooter />
            </DrawerContent>
          </Drawer>

          {/* Main Grid Layout */}
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
            {/* Details Panel */}
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
              <Grid pt={2}>
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
                      documentData.document.status === "approved"
                        ? colorMode === "light"
                          ? "green.500"
                          : "green.600"
                        : documentData.document.status === "inapproval"
                          ? colorMode === "light"
                            ? "blue.500"
                            : "blue.600"
                          : documentData.document.status === "inreview"
                            ? colorMode === "light"
                              ? "orange.500"
                              : "orange.600"
                            : documentData.document.status === "revising"
                              ? "orange.500"
                              : colorMode === "light"
                                ? "red.500"
                                : "red.600"
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {documentData.document.status === "inapproval"
                      ? "Approval Requested"
                      : documentData.document.status === "approved"
                        ? "Approved"
                        : documentData.document.status === "inreview"
                          ? "Review Requested"
                          : documentData.document.status === "revising"
                            ? "Revising"
                            : "New Document"}
                  </Tag>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  borderBottom={"0px"}
                  p={2}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Project Tag
                  </Text>
                  <Tag
                    bg={
                      colorMode === "light"
                        ? `${kindDict[documentData?.document?.project?.kind].color}.400`
                        : `${kindDict[documentData?.document?.project?.kind].color}.500`
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {kindDict[documentData?.document?.project?.kind].tag}-
                    {documentData?.document?.project?.year}-
                    {documentData?.document?.project?.number}
                  </Tag>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  p={2}
                  borderBottom={"0px"}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Project ID
                  </Text>
                  <Text>{documentData?.document?.project?.pk}</Text>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  borderBottom={0}
                  p={2}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Document ID
                  </Text>
                  <Text>
                    {documentData?.document?.pk
                      ? documentData?.document?.pk
                      : documentData?.document?.id}{" "}
                    ({documentType.charAt(0).toUpperCase()}
                    {documentType === "concept"
                      ? "P"
                      : documentType === "projectplan"
                        ? "P"
                        : documentType === "progressreport"
                          ? "R"
                          : documentType === "studentreport"
                            ? "R"
                            : "C"}{" "}
                    {documentData?.pk})
                  </Text>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  borderBottom={"0px"}
                  alignItems={"center"}
                  p={2}
                  flexDir={"column"}
                >
                  <Flex w={"100%"} justifyContent={"flex-end"}>
                    <Text flex={1} fontWeight={"semibold"}>
                      Created
                    </Text>
                    <Text>{creationDate}</Text>
                  </Flex>
                  <Flex w={"100%"} justifyContent={"flex-end"}>
                    <Text flex={1} fontWeight={"semibold"}>
                      By
                    </Text>
                    <Button
                      color={colorMode === "light" ? "blue.400" : "blue.300"}
                      cursor={"pointer"}
                      fontSize={"md"}
                      fontWeight="semibold"
                      whiteSpace={"normal"}
                      textOverflow={"ellipsis"}
                      variant={"link"}
                      onClick={modals.creator.onOpen}
                    >
                      {creator?.first_name} {creator?.last_name}
                    </Button>
                  </Flex>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  p={2}
                  roundedBottom={"2xl"}
                  alignItems={"center"}
                  flexDir={"column"}
                >
                  <Flex w={"100%"} justifyContent={"flex-end"}>
                    <Text flex={1} fontWeight={"semibold"}>
                      Last Modified
                    </Text>
                    <Text>{modifyDate}</Text>
                  </Flex>
                  <Flex w={"100%"} justifyContent={"flex-end"}>
                    <Text flex={1} fontWeight={"semibold"}>
                      By
                    </Text>
                    <Button
                      color={colorMode === "light" ? "blue.400" : "blue.300"}
                      cursor={"pointer"}
                      fontSize={"md"}
                      fontWeight="semibold"
                      whiteSpace={"normal"}
                      textOverflow={"ellipsis"}
                      variant={"link"}
                      onClick={modals.modifier.onOpen}
                    >
                      {modifier?.first_name} {modifier?.last_name}
                    </Button>
                  </Flex>
                </Flex>
              </Grid>
            </Box>

            {/* Actions Panel */}
            <Box
              bg={colorMode === "light" ? "gray.100" : "gray.700"}
              rounded={"lg"}
              p={4}
              mt={{ base: 0 }}
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

              <Grid pt={2} gridTemplateColumns={"repeat(1, 1fr)"}>
                {/* Project Lead Section */}
                <Grid
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
                        documentData?.document
                          ?.project_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {documentData?.document?.project_lead_approval_granted ===
                      true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>

                  <Grid
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      documentData?.document
                        ?.business_area_lead_approval_granted
                        ? 0
                        : 3
                    }
                    gridTemplateColumns={"repeat(1, 1fr)"}
                  >
                    {/* Recall Button (Only show when project lead approved but BA lead hasn't) */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted === false &&
                      documentData?.document?.project_lead_approval_granted ===
                        true &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === leaderMember?.user?.pk ||
                        userIsCaretakerOfProjectLeader ||
                        isBaLead ||
                        userIsCaretakerOfBaLeader) && (
                        <Center justifyContent={"flex-end"}>
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s1Recall.isOpen}
                            onClose={modals.s1Recall.onClose}
                            action={"recall"}
                            documentType={documentType}
                            stage={1}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
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
                            onClick={modals.s1Recall.onOpen}
                          >
                            Recall Approval
                          </Button>
                        </Center>
                      )}

                    {/* Submit/Approve & Delete Buttons */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted === false &&
                      (documentData?.document?.id ||
                        documentData?.document?.pk) &&
                      documentData?.document?.project_lead_approval_granted ===
                        false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === leaderMember?.user?.pk ||
                        userIsCaretakerOfProjectLeader ||
                        isBaLead ||
                        userIsCaretakerOfBaLeader) && (
                        <Center justifyContent={"flex-end"}>
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s1Approval.isOpen}
                            onClose={modals.s1Approval.onClose}
                            action={"approve"}
                            documentType={documentType}
                            stage={1}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
                          />

                          {/* Delete button */}
                          {canShowDeleteButton() && (
                            <>
                              <DeleteDocumentModal
                                key={keyForDeleteDocumentModal}
                                projectPk={
                                  documentData?.document?.project?.pk ||
                                  documentData?.document?.project?.id
                                }
                                documentPk={
                                  documentData?.document?.pk ||
                                  documentData?.document?.id
                                }
                                documentKind={documentKindMapping[documentType]}
                                onClose={modals.deleteDocument.onClose}
                                isOpen={modals.deleteDocument.isOpen}
                                onDeleteSuccess={() => {
                                  if (documentType === "projectclosure") {
                                    setStatusIfRequired(
                                      documentData?.document?.project?.pk ||
                                        documentData?.document?.project?.id,
                                      "updating",
                                    );
                                  } else if (
                                    documents &&
                                    documents.length <= 1
                                  ) {
                                    setStatusIfRequired(
                                      documentData?.document?.project?.pk ||
                                        documentData?.document?.project?.id,
                                    );
                                  }
                                }}
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
                                    colorMode === "light"
                                      ? "red.400"
                                      : "red.500",
                                }}
                                size={"sm"}
                                onClick={modals.deleteDocument.onOpen}
                                mr={2}
                              >
                                Delete Document
                              </Button>
                            </>
                          )}

                          {/* Document-specific buttons */}
                          {getDocumentSpecificButtons() || (
                            <Button
                              color={"white"}
                              background={
                                colorMode === "light"
                                  ? "green.500"
                                  : "green.600"
                              }
                              _hover={{
                                background:
                                  colorMode === "light"
                                    ? "green.400"
                                    : "green.500",
                              }}
                              size={"sm"}
                              onClick={modals.s1Approval.onOpen}
                            >
                              Submit
                            </Button>
                          )}
                        </Center>
                      )}

                    {/* Document-specific advanced actions */}
                    {documentData?.document?.project_lead_approval_granted &&
                      documentData?.document
                        ?.business_area_lead_approval_granted &&
                      documentData?.document?.directorate_approval_granted &&
                      getDocumentSpecificButtons()}
                  </Grid>
                </Grid>

                {/* Business Area Lead Section */}
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
                        documentData?.document
                          ?.business_area_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {documentData?.document
                        ?.business_area_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>

                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      documentData?.document?.project?.status === "completed"
                        ? 3
                        : documentData?.document
                              ?.project_lead_approval_granted &&
                            documentData?.document
                              ?.directorate_approval_granted === false
                          ? 3
                          : 0
                    }
                  >
                    {/* Send Back Button */}
                    {documentData?.document?.project_lead_approval_granted &&
                      documentData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === baLead?.pk ||
                        userIsCaretakerOfBaLeader) && (
                        <Center>
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s2SendBack.isOpen}
                            onClose={modals.s2SendBack.onClose}
                            action={"send_back"}
                            documentType={documentType}
                            stage={2}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
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
                            onClick={modals.s2SendBack.onOpen}
                          >
                            Send Back
                          </Button>
                        </Center>
                      )}

                    {/* Reopen Project Button (for Project Closure) */}
                    {documentType === "projectclosure" &&
                      (documentData?.document?.project?.status ===
                        "completed" ||
                        documentData?.document?.project?.status ===
                          "terminated" ||
                        documentData?.document?.project?.status ===
                          "suspended") &&
                      (isBaLead ||
                        userIsCaretakerOfBaLeader ||
                        userData?.is_superuser ||
                        userIsCaretakerOfAdmin) && (
                        <Button
                          color={"white"}
                          background={
                            colorMode === "light" ? "orange.500" : "orange.600"
                          }
                          _hover={{
                            background:
                              colorMode === "light"
                                ? "orange.400"
                                : "orange.500",
                          }}
                          size={"sm"}
                          onClick={modals.s2Reopen.onOpen}
                        >
                          Reopen Project
                        </Button>
                      )}

                    {/* Recall Approval Button */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted &&
                      documentData?.document?.directorate_approval_granted ===
                        false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.business_area?.leader === baData?.leader ||
                        userIsCaretakerOfBaLeader) && (
                        <Center ml={3}>
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s2Recall.isOpen}
                            onClose={modals.s2Recall.onClose}
                            action={"recall"}
                            documentType={documentType}
                            stage={2}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
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
                            onClick={modals.s2Recall.onOpen}
                            disabled={
                              directorateData?.length < 1 &&
                              !userData?.is_superuser
                            }
                          >
                            Recall Approval
                          </Button>
                        </Center>
                      )}

                    {/* Approve Button */}
                    {documentData?.document?.project_lead_approval_granted &&
                      documentData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userData?.pk === baData?.leader ||
                        userIsCaretakerOfBaLeader) && (
                        <Center ml={3}>
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s2Approval.isOpen}
                            onClose={modals.s2Approval.onClose}
                            action={"approve"}
                            documentType={documentType}
                            stage={2}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
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
                            onClick={modals.s2Approval.onOpen}
                            disabled={
                              !userData?.is_superuser &&
                              directorateData?.length < 1
                            }
                          >
                            Approve
                          </Button>
                        </Center>
                      )}
                  </Flex>

                  {/* Additional Document-Specific buttons for BA */}
                  {documentType === "projectplan" &&
                    all_documents?.progress_reports?.length < 1 &&
                    (userData?.is_superuser ||
                      userIsCaretakerOfAdmin ||
                      documentData?.document?.project?.business_area?.leader ===
                        userData?.pk ||
                      userIsCaretakerOfBaLeader) &&
                    documentData?.document?.project_lead_approval_granted ===
                      true &&
                    documentData?.document
                      ?.business_area_lead_approval_granted === true &&
                    documentData?.document?.directorate_approval_granted ===
                      true && (
                      <Flex justifyContent={"flex-end"}>
                        <Button
                          mt={3}
                          color={"white"}
                          background={
                            colorMode === "light" ? "orange.500" : "orange.600"
                          }
                          _hover={{
                            background:
                              colorMode === "light"
                                ? "orange.400"
                                : "orange.500",
                          }}
                          size={"sm"}
                          onClick={modals.createProgressReport.onOpen}
                          ml={2}
                        >
                          Create Progress Report
                        </Button>
                      </Flex>
                    )}
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
                    <Tag
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      bg={
                        documentData?.document?.directorate_approval_granted ===
                        true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {documentData?.document?.directorate_approval_granted ===
                      true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>

                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      documentData?.document
                        ?.business_area_lead_approval_granted
                        ? 3
                        : 0
                    }
                  >
                    {/* Reopen Project Button */}
                    {documentType === "projectclosure" &&
                      (documentData?.document?.project?.status ===
                        "completed" ||
                        documentData?.document?.project?.status ===
                          "terminated" ||
                        documentData?.document?.project?.status ===
                          "suspended") &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <Button
                          color={"white"}
                          background={
                            colorMode === "light" ? "orange.500" : "orange.600"
                          }
                          _hover={{
                            background:
                              colorMode === "light"
                                ? "orange.400"
                                : "orange.500",
                          }}
                          size={"sm"}
                          onClick={modals.s3Reopen.onOpen}
                          ml={2}
                        >
                          Reopen Project
                        </Button>
                      )}

                    {/* Send Back Button */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted &&
                      documentData?.document?.directorate_approval_granted ===
                        false &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <Center justifyContent={"flex-end"} ml={3}>
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s3SendBack.isOpen}
                            onClose={modals.s3SendBack.onClose}
                            action={"send_back"}
                            documentType={documentType}
                            stage={3}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
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
                            onClick={modals.s3SendBack.onOpen}
                          >
                            Send Back
                          </Button>
                        </Center>
                      )}

                    {/* Recall Approval Button */}
                    {documentData?.document?.directorate_approval_granted &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <Center justifyContent={"flex-start"} ml={3}>
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s3Recall.isOpen}
                            onClose={modals.s3Recall.onClose}
                            action={"recall"}
                            documentType={documentType}
                            stage={3}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
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
                            onClick={modals.s3Recall.onOpen}
                          >
                            Recall Approval
                          </Button>
                        </Center>
                      )}

                    {/* Create Progress Report Button (if needed) */}
                    {documentType === "projectplan" &&
                      all_documents?.progress_reports?.length < 1 &&
                      documentData?.document?.project_lead_approval_granted ===
                        true &&
                      documentData?.document
                        ?.business_area_lead_approval_granted === true &&
                      documentData?.document?.directorate_approval_granted ===
                        true &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <Button
                          color={"white"}
                          background={
                            colorMode === "light" ? "orange.500" : "orange.600"
                          }
                          _hover={{
                            background:
                              colorMode === "light"
                                ? "orange.400"
                                : "orange.500",
                          }}
                          size={"sm"}
                          onClick={modals.createProgressReport.onOpen}
                          ml={2}
                        >
                          Create Progress Report
                        </Button>
                      )}

                    {/* Approve Button */}
                    {documentData?.document
                      ?.business_area_lead_approval_granted &&
                      !documentData?.document?.directorate_approval_granted &&
                      (userData?.is_superuser ||
                        userIsCaretakerOfAdmin ||
                        userInDivisionalDirectorate) && (
                        <Center ml={3} justifyContent={"flex-end"}>
                          <UnifiedDocumentActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={modals.s3Approval.isOpen}
                            onClose={modals.s3Approval.onClose}
                            action={"approve"}
                            documentType={documentType}
                            stage={3}
                            documentPk={
                              documentData?.document?.pk ||
                              documentData?.document?.id
                            }
                            projectData={documentData?.document?.project}
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            callSameData={callSameData}
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
                            onClick={modals.s3Approval.onOpen}
                          >
                            Approve
                          </Button>
                        </Center>
                      )}
                  </Flex>
                </Grid>

                {/* PDF and email buttons */}
                <ProjectDocumentPDFSection
                  data_document={documentData}
                  refetchData={callSameData || refetchData}
                />
              </Grid>
            </Box>
          </Grid>

          {/* Document Action Modal Instances for projectclosure reopening */}
          {documentType === "projectclosure" && (
            <>
              <UnifiedDocumentActionModal
                userData={userData}
                refetchData={refetchData}
                baData={baData}
                isOpen={modals.s1Reopen.isOpen}
                onClose={modals.s1Reopen.onClose}
                action={"reopen"}
                documentType={documentType}
                stage={1}
                documentPk={
                  documentData?.document?.pk || documentData?.document?.id
                }
                projectData={documentData?.document?.project}
                directorateData={directorateData}
                isDirectorateLoading={isDirectorateLoading}
                callSameData={callSameData}
              />
              <UnifiedDocumentActionModal
                userData={userData}
                refetchData={refetchData}
                baData={baData}
                isOpen={modals.s2Reopen.isOpen}
                onClose={modals.s2Reopen.onClose}
                action={"reopen"}
                documentType={documentType}
                stage={2}
                documentPk={
                  documentData?.document?.pk || documentData?.document?.id
                }
                projectData={documentData?.document?.project}
                directorateData={directorateData}
                isDirectorateLoading={isDirectorateLoading}
                callSameData={callSameData}
              />
              <UnifiedDocumentActionModal
                userData={userData}
                refetchData={refetchData}
                baData={baData}
                isOpen={modals.s3Reopen.isOpen}
                onClose={modals.s3Reopen.onClose}
                action={"reopen"}
                documentType={documentType}
                stage={3}
                documentPk={
                  documentData?.document?.pk || documentData?.document?.id
                }
                projectData={documentData?.document?.project}
                directorateData={directorateData}
                isDirectorateLoading={isDirectorateLoading}
                callSameData={callSameData}
              />
            </>
          )}
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
