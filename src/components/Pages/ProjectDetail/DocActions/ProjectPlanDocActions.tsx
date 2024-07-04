import { SetAreasModal } from "@/components/Modals/SetAreasModal";
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
import { useFormattedDate } from "../../../../lib/hooks/helper/useFormattedDate";
import { useBusinessArea } from "../../../../lib/hooks/tanstack/useBusinessArea";
import { useFullUserByPk } from "../../../../lib/hooks/tanstack/useFullUserByPk";
import { useProjectTeam } from "../../../../lib/hooks/tanstack/useProjectTeam";
import { useUser } from "../../../../lib/hooks/tanstack/useUser";
import {
  IProjectAreas,
  IProjectDocuments,
  IProjectMember,
  IProjectPlan,
} from "../../../../types";
import { CreateProgressReportModal } from "../../../Modals/CreateProgressReportModal";
import { DeleteDocumentModal } from "../../../Modals/DeleteDocumentModal";
import { ProjectPlanActionModal } from "../../../Modals/DocumentActionModals/ProjectPlanActionModal";
import { UserProfile } from "../../Users/UserProfile";
import { ProjectDocumentPDFSection } from "./ProjectDocumentPDFSection";

interface IProjectPlanDocumentActions {
  projectPlanData: IProjectPlan;
  refetchData: () => void;
  all_documents: IProjectDocuments;
  projectAreas: IProjectAreas;
  setToLastTab: (tabToGoTo?: number) => void;
  isBaLead: boolean;
}

export const ProjectPlanDocActions = ({
  all_documents,
  projectAreas,
  projectPlanData,
  refetchData,
  isBaLead,
  setToLastTab,
}: IProjectPlanDocumentActions) => {
  const { colorMode } = useColorMode();

  const {
    isOpen: isSetAreasModalOpen,
    onOpen: onSetAreasModalOpen,
    onClose: onSetAreasModalClose,
  } = useDisclosure();
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

  const {
    isOpen: isDeleteDocumentModalOpen,
    onOpen: onOpenDeleteDocumentModal,
    onClose: onCloseDeleteDocumentModal,
  } = useDisclosure();
  const {
    isOpen: isCreateProgressReportModalOpen,
    onOpen: onOpenCreateProgressReportModal,
    onClose: onCloseCreateProgressReportModal,
  } = useDisclosure();

  const { userData, userLoading } = useUser();

  const { baData, baLoading } = useBusinessArea(
    projectPlanData?.document?.project?.business_area?.pk,
  );

  const { userData: baLead } = useFullUserByPk(baData?.leader);
  const { userData: modifier, userLoading: modifierLoading } = useFullUserByPk(
    projectPlanData?.document?.modifier,
  );
  const { userData: creator, userLoading: creatorLoading } = useFullUserByPk(
    projectPlanData?.document?.creator,
  );

  const { teamData, isTeamLoading } = useProjectTeam(
    String(projectPlanData?.document?.project?.pk),
  );

  const creationDate = useFormattedDate(projectPlanData?.document?.created_at);
  const modifyDate = useFormattedDate(projectPlanData?.document?.updated_at);

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

  return (
    <>
      <CreateProgressReportModal
        projectPk={projectPlanData?.document?.project?.pk}
        documentKind="progressreport"
        onClose={onCloseCreateProgressReportModal}
        isOpen={isCreateProgressReportModalOpen}
        refetchData={refetchData}
      />
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
                      projectPlanData.document.status === "approved"
                        ? colorMode === "light"
                          ? "green.500"
                          : "green.600"
                        : projectPlanData.document.status === "inapproval"
                          ? colorMode === "light"
                            ? "blue.500"
                            : "blue.600"
                          : projectPlanData.document.status === "inreview"
                            ? colorMode === "light"
                              ? "orange.500"
                              : "orange.600"
                            : projectPlanData.document.status === "revising"
                              ? "orange.500"
                              : // New
                              colorMode === "light"
                                ? "red.500"
                                : "red.600"
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {projectPlanData.document.status === "inapproval"
                      ? "Approval Requested"
                      : projectPlanData.document.status === "approved"
                        ? "Approved"
                        : projectPlanData.document.status === "inreview"
                          ? "Review Requested"
                          : projectPlanData.document.status === "revising"
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
                        ? `${kindDict[projectPlanData?.document?.project?.kind].color}.400`
                        : `${kindDict[projectPlanData?.document?.project?.kind].color}.500`
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {kindDict[projectPlanData?.document?.project?.kind].tag}-
                    {projectPlanData?.document?.project?.year}-
                    {projectPlanData?.document?.project?.number}
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
                  <Text>{projectPlanData?.document?.project?.pk}</Text>
                </Flex>
                {/* <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedTop={"2xl"}
                  p={2}
                  borderBottom={"0px"}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Selected PP ID
                  </Text>
                  <Text>{projectPlanData?.pk}</Text>
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
                    {projectPlanData?.document?.pk
                      ? projectPlanData?.document?.pk
                      : projectPlanData?.document?.id}{" "}
                    (PP {projectPlanData?.pk})
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
                  roundedBottom={"2xl"}
                  p={2}
                  // borderBottom={"0px"}
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
                        projectPlanData?.document
                          ?.project_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {projectPlanData?.document
                        ?.project_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Grid
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      projectPlanData?.document
                        ?.business_area_lead_approval_granted
                        ? 0
                        : 3
                    }
                    gridTemplateColumns={"repeat(1, 1fr)"}
                  >
                    {projectPlanData?.document
                      ?.business_area_lead_approval_granted === false &&
                      projectPlanData?.document
                        ?.project_lead_approval_granted === true &&
                      (userData?.is_superuser ||
                        userData?.pk === leaderMember?.user?.pk ||
                        isBaLead) && (
                        <Center justifyContent={"flex-end"}>
                          <ProjectPlanActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS1RecallModalOpen}
                            onClose={onS1RecallModalClose}
                            action={"recall"}
                            projectPlanPk={projectPlanData?.pk}
                            documentPk={
                              projectPlanData?.document?.pk
                                ? projectPlanData?.document?.pk
                                : projectPlanData?.document?.id
                            }
                            stage={1}
                            projectData={projectPlanData?.document?.project}
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
                            Recall
                          </Button>
                        </Center>
                      )}

                    {projectPlanData?.document
                      ?.business_area_lead_approval_granted === false &&
                      (projectPlanData?.document?.id ||
                        projectPlanData?.document?.pk) &&
                      projectPlanData?.document
                        ?.project_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.pk === leaderMember?.user?.pk ||
                        isBaLead) && (
                        <Center justifyContent={"flex-end"}>
                          <ProjectPlanActionModal
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS1ApprovalModalOpen}
                            onClose={onS1ApprovalModalClose}
                            action={"approve"}
                            stage={1}
                            projectPlanPk={projectPlanData?.pk}
                            documentPk={
                              projectPlanData?.document?.pk
                                ? projectPlanData?.document?.pk
                                : projectPlanData?.document?.id
                            }
                            projectData={projectPlanData?.document?.project}
                          />
                          {/* <ConceptPlanActionModal
                                                            refetchData={refetchData}
                                                            baData={baData}
                                                            isOpen={isS1ApprovalModalOpen}
                                                            onClose={onS1ApprovalModalClose}
                                                            action={"approve"}
                                                            stage={1}
                                                            projectPlanPk={projectPlanData?.pk}
                                                            documentPk={projectPlanData?.document?.pk ? projectPlanData?.document?.pk : projectPlanData?.document?.id}
                                                            projectData={projectPlanData?.document?.project}
                                                        /> */}
                          {all_documents?.progress_reports.length < 1 &&
                            all_documents?.concept_plan && (
                              <>
                                <DeleteDocumentModal
                                  projectPk={
                                    projectPlanData?.document?.project?.pk
                                  }
                                  documentPk={
                                    projectPlanData?.document?.pk
                                      ? projectPlanData?.document?.pk
                                      : projectPlanData?.document?.id
                                  }
                                  // deleting the main doc will also delete the projectplan
                                  documentKind="projectplan"
                                  onClose={onCloseDeleteDocumentModal}
                                  isOpen={isDeleteDocumentModalOpen}
                                  refetchData={refetchData}
                                  setToLastTab={setToLastTab}
                                />
                                <Button
                                  color={"white"}
                                  background={
                                    colorMode === "light"
                                      ? "red.500"
                                      : "red.600"
                                  }
                                  _hover={{
                                    background:
                                      colorMode === "light"
                                        ? "red.400"
                                        : "red.500",
                                  }}
                                  size={"sm"}
                                  onClick={onOpenDeleteDocumentModal}
                                  mr={2}
                                >
                                  Delete Document
                                </Button>
                              </>
                            )}

                          {projectAreas.areas.length < 1 ? (
                            <>
                              <SetAreasModal
                                projectPk={
                                  projectPlanData?.document?.project?.pk
                                }
                                onClose={onSetAreasModalClose}
                                isOpen={isSetAreasModalOpen}
                                refetchData={refetchData}
                                setToLastTab={setToLastTab}
                              />
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
                                onClick={onSetAreasModalOpen}
                              >
                                Set Areas
                              </Button>
                            </>
                          ) : (
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
                              onClick={onS1ApprovalModalOpen}
                            >
                              Submit
                            </Button>
                          )}
                        </Center>
                      )}

                    {projectPlanData?.document
                      ?.project_lead_approval_granted === true &&
                      projectPlanData?.document
                        ?.business_area_lead_approval_granted === true &&
                      projectPlanData?.document?.directorate_approval_granted ===
                      true &&
                      all_documents?.progress_reports?.length < 1 &&
                      (userData?.is_superuser ||
                        leaderMember?.user?.pk === userData?.pk ||
                        isBaLead) ? (
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
                          onClick={onOpenCreateProgressReportModal}
                          ml={2}
                        >
                          Create Progress Report
                        </Button>
                      </Flex>
                    ) : null}
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
                    <Text flex={1} fontWeight={"semibold"}>
                      Business Area Lead
                    </Text>

                    {/* {
                                                userData
                                            } */}
                    <Tag
                      alignItems={"center"}
                      justifyContent={"center"}
                      display={"flex"}
                      bg={
                        projectPlanData?.document
                          ?.business_area_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {projectPlanData?.document
                        ?.business_area_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      projectPlanData?.document
                        ?.project_lead_approval_granted &&
                        projectPlanData?.document
                          ?.directorate_approval_granted === false
                        ? 3
                        : 0
                    }
                  // gridTemplateColumns={"repeat(2, 1fr)"}
                  >
                    {projectPlanData?.document?.project_lead_approval_granted &&
                      projectPlanData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.pk === baLead?.pk) && (
                        <Center
                        // justifyContent={"flex-start"}
                        // ml={4}
                        >
                          <ProjectPlanActionModal
                            userData={userData}
                            refetchData={refetchData}
                            action={"send_back"}
                            baData={baData}
                            isOpen={isS2SendbackModalOpen}
                            onClose={onS2SendbackModalClose}
                            projectPlanPk={projectPlanData?.pk}
                            documentPk={
                              projectPlanData?.document?.pk
                                ? projectPlanData?.document?.pk
                                : projectPlanData?.document?.id
                            }
                            stage={2}
                            projectData={projectPlanData?.document?.project}
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

                    {projectPlanData?.document
                      ?.business_area_lead_approval_granted &&
                      projectPlanData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.business_area?.leader === baData?.leader) && (
                        <Center
                          // justifyContent={"flex-start"}
                          ml={3}
                        >
                          <ProjectPlanActionModal
                            userData={userData}
                            refetchData={refetchData}
                            action={"recall"}
                            baData={baData}
                            isOpen={isS2RecallModalOpen}
                            onClose={onS2RecallModalClose}
                            projectPlanPk={projectPlanData?.pk}
                            documentPk={
                              projectPlanData?.document?.pk
                                ? projectPlanData?.document?.pk
                                : projectPlanData?.document?.id
                            }
                            stage={2}
                            projectData={projectPlanData?.document?.project}
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
                          >
                            Recall Approval
                          </Button>
                        </Center>
                      )}

                    {projectPlanData?.document?.project_lead_approval_granted &&
                      projectPlanData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.pk === baData?.leader) && (
                        <Center
                          // justifyContent={"flex-end"}
                          ml={3}
                        >
                          <ProjectPlanActionModal
                            userData={userData}
                            refetchData={refetchData}
                            action={"approve"}
                            baData={baData}
                            isOpen={isS2ApprovalModalOpen}
                            onClose={onS2ApprovalModalClose}
                            projectPlanPk={projectPlanData?.pk}
                            documentPk={
                              projectPlanData?.document?.pk
                                ? projectPlanData?.document?.pk
                                : projectPlanData?.document?.id
                            }
                            stage={2}
                            projectData={projectPlanData?.document?.project}
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
                          >
                            Approve
                          </Button>
                        </Center>
                      )}
                  </Flex>
                  {all_documents?.progress_reports?.length < 1 &&
                    (userData?.is_superuser ||
                      projectPlanData?.document?.project?.business_area
                        ?.leader === userData?.pk) &&
                    projectPlanData?.document?.project_lead_approval_granted ===
                    true &&
                    projectPlanData?.document
                      ?.business_area_lead_approval_granted === true &&
                    projectPlanData?.document?.directorate_approval_granted ===
                    true ? (
                    <Flex justifyContent={"flex-end"}>
                      {/* <CreateProgressReportModal
                          projectPk={
                            projectPlanData?.document?.project?.pk
                          }
                          documentKind="progressreport"
                          onClose={onCloseCreateProgressReportModal}
                          isOpen={isCreateProgressReportModalOpen}
                          refetchData={refetchData}
                        /> */}

                      <Button
                        mt={3}
                        color={"white"}
                        background={
                          colorMode === "light" ? "orange.500" : "orange.600"
                        }
                        _hover={{
                          background:
                            colorMode === "light" ? "orange.400" : "orange.500",
                        }}
                        size={"sm"}
                        onClick={onOpenCreateProgressReportModal}
                        ml={2}
                      >
                        Create Progress Report
                      </Button>
                    </Flex>
                  ) : null}
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
                        projectPlanData?.document
                          ?.directorate_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {projectPlanData?.document
                        ?.directorate_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      projectPlanData?.document
                        ?.business_area_lead_approval_granted
                        ? 3
                        : 0
                    }
                  >
                    {projectPlanData?.document
                      ?.business_area_lead_approval_granted &&
                      projectPlanData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate") && (
                        <Center justifyContent={"flex-end"} ml={3}>
                          <ProjectPlanActionModal
                            userData={userData}
                            action={"send_back"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3SendbackModalOpen}
                            onClose={onS3SendbackModalClose}
                            projectPlanPk={projectPlanData?.pk}
                            documentPk={
                              projectPlanData?.document?.pk
                                ? projectPlanData?.document?.pk
                                : projectPlanData?.document?.id
                            }
                            stage={3}
                            projectData={projectPlanData?.document?.project}
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

                    {projectPlanData?.document?.directorate_approval_granted &&
                      (userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate") && (
                        <Center justifyContent={"flex-start"} ml={3}>
                          {/* {all_documents?.progress_reports.length >=
                          1 ? null : ( */}
                          <>
                            <ProjectPlanActionModal
                              userData={userData}
                              action={"recall"}
                              refetchData={refetchData}
                              baData={baData}
                              isOpen={isS3RecallModalOpen}
                              onClose={onS3RecallModalClose}
                              projectPlanPk={projectPlanData?.pk}
                              documentPk={
                                projectPlanData?.document?.pk
                                  ? projectPlanData?.document?.pk
                                  : projectPlanData?.document?.id
                              }
                              stage={3}
                              projectData={projectPlanData?.document?.project}
                            />
                            <Button
                              color={"white"}
                              background={
                                colorMode === "light"
                                  ? "blue.500"
                                  : "blue.600"
                              }
                              _hover={{
                                background:
                                  colorMode === "light"
                                    ? "blue.400"
                                    : "blue.500",
                              }}
                              size={"sm"}
                              onClick={onS3RecallModalOpen}
                            >
                              Recall Approval
                            </Button>
                          </>
                          {/* )} */}
                          {all_documents?.progress_reports?.length < 1 &&
                            projectPlanData?.document
                              ?.project_lead_approval_granted === true &&
                            projectPlanData?.document
                              ?.business_area_lead_approval_granted === true &&
                            projectPlanData?.document
                              ?.directorate_approval_granted === true ? (
                            <>
                              {/* <CreateProgressReportModal
                                projectPk={
                                  projectPlanData?.document?.project?.pk
                                }
                                documentKind="progressreport"
                                onClose={onCloseCreateProgressReportModal}
                                isOpen={isCreateProgressReportModalOpen}
                                refetchData={refetchData}
                              /> */}

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
                                onClick={
                                  onOpenCreateProgressReportModal
                                  // () => spawnProgressReport(
                                  //     {
                                  //         project_pk: projectPlanData?.document?.project?.id ? projectPlanData.document.project.id : projectPlanData.document.project.pk,
                                  //         kind: "progressreport"
                                  //     }
                                  // )
                                }
                                ml={2}
                              >
                                Create Progress Report
                              </Button>
                            </>
                          ) : null}
                        </Center>
                      )}

                    {projectPlanData?.document
                      ?.business_area_lead_approval_granted &&
                      (userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate") &&
                      !projectPlanData?.document
                        ?.directorate_approval_granted && (
                        <Center ml={3} justifyContent={"flex-end"}>
                          <ProjectPlanActionModal
                            userData={userData}
                            action={"approve"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3ApprovalModalOpen}
                            onClose={onS3ApprovalModalClose}
                            projectPlanPk={projectPlanData?.pk}
                            documentPk={
                              projectPlanData?.document?.pk
                                ? projectPlanData?.document?.pk
                                : projectPlanData?.document?.id
                            }
                            stage={3}
                            projectData={projectPlanData?.document?.project}
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
                  data_document={projectPlanData}
                  refetchData={refetchData}
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
