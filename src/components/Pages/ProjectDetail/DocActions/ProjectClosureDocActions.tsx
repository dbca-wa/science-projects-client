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
import { ISetProjectProps, setProjectStatus } from "../../../../lib/api";
import { useFormattedDate } from "../../../../lib/hooks/helper/useFormattedDate";
import { useBusinessArea } from "../../../../lib/hooks/tanstack/useBusinessArea";
import { useFullUserByPk } from "../../../../lib/hooks/tanstack/useFullUserByPk";
import { useProjectTeam } from "../../../../lib/hooks/tanstack/useProjectTeam";
import { useUser } from "../../../../lib/hooks/tanstack/useUser";
import {
  IProjectClosure,
  IProjectDocuments,
  IProjectMember,
} from "../../../../types";
import { DeleteDocumentModal } from "../../../Modals/DeleteDocumentModal";
import { ProjectClosureActionModal } from "../../../Modals/DocumentActionModals/ProjectClosureActionModal";
import { UserProfile } from "../../Users/UserProfile";
import { ProjectDocumentPDFSection } from "./ProjectDocumentPDFSection";

interface IConceptDocumentActions {
  projectClosureData: IProjectClosure;
  refetchData: () => void;
  all_documents: IProjectDocuments;
  setToLastTab: (tabToGoTo?: number) => void;
  // projectPk: number;
}

export const ProjectClosureDocActions = ({
  projectClosureData,
  refetchData,
  setToLastTab,
}: // , projectPk
IConceptDocumentActions) => {
  const { colorMode } = useColorMode();

  // useEffect(() => {
  //   console.log(projectClosureData);
  // }, [projectClosureData]);

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
    isOpen: isS1ReopenModalOpen,
    onOpen: onS1ReopenModalOpen,
    onClose: onS1ReopenModalClose,
  } = useDisclosure();

  const {
    isOpen: isS2ReopenModalOpen,
    onOpen: onS2ReopenModalOpen,
    onClose: onS2ReopenModalClose,
  } = useDisclosure();

  const {
    isOpen: isS3ReopenModalOpen,
    onOpen: onS3ReopenModalOpen,
    onClose: onS3ReopenModalClose,
  } = useDisclosure();

  const { userData, userLoading } = useUser();

  const { baData, baLoading } = useBusinessArea(
    projectClosureData?.document?.project?.business_area?.pk
  );

  const { userData: baLead } = useFullUserByPk(baData?.leader);
  const { userData: modifier, userLoading: modifierLoading } = useFullUserByPk(
    projectClosureData?.document?.modifier
  );
  const { userData: creator, userLoading: creatorLoading } = useFullUserByPk(
    projectClosureData?.document?.creator
  );

  const { teamData, isTeamLoading } = useProjectTeam(
    String(projectClosureData?.document?.project?.pk)
  );

  const creationDate = useFormattedDate(
    projectClosureData?.document?.created_at
  );
  const modifyDate = useFormattedDate(projectClosureData?.document?.updated_at);

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
      // console.log("hereeee");
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

  const {
    isOpen: isDeleteDocumentModalOpen,
    onOpen: onOpenDeleteDocumentModal,
    onClose: onCloseDeleteDocumentModal,
  } = useDisclosure();

  const keyForDeleteDocumentModal = projectClosureData?.document?.pk
    ? `document-${projectClosureData?.document?.pk}`
    : `document-${projectClosureData?.document?.id}`;

  const setStatusIfRequired = (
    projectPk,
    desiredProjectState:
      | "new"
      | "pending"
      | "active"
      | "updating"
      | "terminated"
      | "suspended"
      | "closed"
  ) => {
    const data: ISetProjectProps = {
      projectId: projectPk,
      status: desiredProjectState,
    };

    setProjectStatus(data);
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
                      projectClosureData.document.status === "approved"
                        ? colorMode === "light"
                          ? "green.500"
                          : "green.600"
                        : projectClosureData.document.status === "inapproval"
                          ? colorMode === "light"
                            ? "blue.500"
                            : "blue.600"
                          : projectClosureData.document.status === "inreview"
                            ? colorMode === "light"
                              ? "orange.500"
                              : "orange.600"
                            : projectClosureData.document.status === "revising"
                              ? "orange.500"
                              : // New
                                colorMode === "light"
                                ? "red.500"
                                : "red.600"
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {projectClosureData.document.status === "inapproval"
                      ? "Approval Requested"
                      : projectClosureData.document.status === "approved"
                        ? "Approved"
                        : projectClosureData.document.status === "inreview"
                          ? "Review Requested"
                          : projectClosureData.document.status === "revising"
                            ? "Revising"
                            : "New Document"}
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
                  borderBottom={"0px"}
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
                  <Text>{projectClosureData?.document?.project?.pk}</Text>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedTop={"2xl"}
                  p={2}
                  borderBottom={"0px"}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Selected PC ID
                  </Text>
                  <Text>{projectClosureData?.pk}</Text>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  roundedBottom={"2xl"}
                  p={2}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Document ID
                  </Text>
                  <Text>
                    {projectClosureData?.document?.pk
                      ? projectClosureData?.document?.pk
                      : projectClosureData?.document?.id}
                  </Text>
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
                        projectClosureData?.document
                          ?.project_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {projectClosureData?.document
                        ?.project_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Grid
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={1}
                    gridTemplateColumns={"repeat(1, 1fr)"}
                  >
                    <ProjectClosureActionModal
                      userData={userData}
                      action={"reopen"}
                      refetchData={refetchData}
                      baData={baData}
                      isOpen={isS1ReopenModalOpen}
                      onClose={onS1ReopenModalClose}
                      projectClosurePk={projectClosureData?.pk}
                      documentPk={
                        projectClosureData?.document?.pk
                          ? projectClosureData?.document?.pk
                          : projectClosureData?.document?.id
                      }
                      stage={1}
                      projectData={projectClosureData?.document?.project}
                    />
                    <Flex
                      justifyContent={"flex-end"}
                      w={"100%"}
                      mt={
                        projectClosureData?.document?.project?.status ===
                        "completed"
                          ? 3
                          : projectClosureData?.document
                                ?.business_area_lead_approval_granted
                            ? 0
                            : 3
                      }
                    >
                      {projectClosureData?.document?.project?.status ===
                        "completed" && (
                        <>
                          {/* <ProjectClosureActionModal
                            userData={userData}
                            action={"reopen"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS1ReopenModalOpen}
                            onClose={onS1ReopenModalClose}
                            projectClosurePk={projectClosureData?.pk}
                            documentPk={
                              projectClosureData?.document?.pk
                                ? projectClosureData?.document?.pk
                                : projectClosureData?.document?.id
                            }
                            stage={1}
                            projectData={projectClosureData?.document?.project}
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
                            onClick={onS1ReopenModalOpen}
                            // mr={3}
                          >
                            Reopen Project
                          </Button>
                        </>
                      )}

                      {projectClosureData?.document
                        ?.business_area_lead_approval_granted === false &&
                        projectClosureData?.document
                          ?.project_lead_approval_granted === true &&
                        (userData?.is_superuser ||
                          userData?.pk === leaderMember?.user?.pk) && (
                          <>
                            <ProjectClosureActionModal
                              userData={userData}
                              refetchData={refetchData}
                              baData={baData}
                              isOpen={isS1RecallModalOpen}
                              onClose={onS1RecallModalClose}
                              action={"recall"}
                              projectClosurePk={projectClosureData?.pk}
                              documentPk={
                                projectClosureData?.document?.pk
                                  ? projectClosureData?.document?.pk
                                  : projectClosureData?.document?.id
                              }
                              stage={1}
                              projectData={
                                projectClosureData?.document?.project
                              }
                            />

                            <Button
                              ml={3}
                              color={"white"}
                              background={
                                colorMode === "light" ? "blue.500" : "blue.600"
                              }
                              _hover={{
                                background:
                                  colorMode === "light"
                                    ? "blue.400"
                                    : "blue.500",
                              }}
                              size={"sm"}
                              onClick={onS1RecallModalOpen}
                            >
                              Recall
                            </Button>
                          </>
                        )}

                      {projectClosureData?.document
                        ?.business_area_lead_approval_granted === false &&
                        (projectClosureData?.document?.id ||
                          projectClosureData?.document?.pk) &&
                        projectClosureData?.document
                          ?.project_lead_approval_granted === false &&
                        (userData?.is_superuser ||
                          userData?.pk === leaderMember?.user?.pk) && (
                          <Center justifyContent={"flex-end"}>
                            <>
                              <DeleteDocumentModal
                                key={keyForDeleteDocumentModal}
                                projectPk={
                                  projectClosureData?.document?.project?.pk
                                    ? projectClosureData?.document?.project?.pk
                                    : projectClosureData?.document?.project?.id
                                }
                                documentPk={
                                  projectClosureData?.document?.pk
                                    ? projectClosureData?.document?.pk
                                    : projectClosureData?.document?.id
                                }
                                documentKind="projectclosure"
                                onClose={onCloseDeleteDocumentModal}
                                isOpen={isDeleteDocumentModalOpen}
                                onDeleteSuccess={() => {
                                  setStatusIfRequired(
                                    projectClosureData?.document?.project?.pk
                                      ? projectClosureData?.document?.project
                                          ?.pk
                                      : projectClosureData?.document?.project
                                          ?.id,
                                    "updating"
                                  );
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
                                onClick={() => {
                                  // console.log(docPk);
                                  onOpenDeleteDocumentModal();
                                }}
                                mr={2}
                                ml={3}
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
                                documentPk={
                                  projectClosureData?.document?.pk
                                    ? projectClosureData?.document?.pk
                                    : projectClosureData?.document?.id
                                }
                                projectData={
                                  projectClosureData?.document?.project
                                }
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
                                onClick={onS1ApprovalModalOpen}
                              >
                                Submit
                              </Button>
                            </>
                          </Center>
                        )}
                    </Flex>
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
                        projectClosureData?.document
                          ?.business_area_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {projectClosureData?.document
                        ?.business_area_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      projectClosureData?.document?.project?.status ===
                      "completed"
                        ? 3
                        : projectClosureData?.document
                              ?.directorate_approval_granted
                          ? 0
                          : 3
                    }
                    // gridTemplateColumns={"repeat(2, 1fr)"}
                  >
                    <ProjectClosureActionModal
                      userData={userData}
                      action={"reopen"}
                      refetchData={refetchData}
                      baData={baData}
                      isOpen={isS2ReopenModalOpen}
                      onClose={onS2ReopenModalClose}
                      projectClosurePk={projectClosureData?.pk}
                      documentPk={
                        projectClosureData?.document?.pk
                          ? projectClosureData?.document?.pk
                          : projectClosureData?.document?.id
                      }
                      stage={2}
                      projectData={projectClosureData?.document?.project}
                    />
                    {projectClosureData?.document
                      ?.project_lead_approval_granted &&
                    projectClosureData?.document
                      ?.business_area_lead_approval_granted === false &&
                    (userData?.is_superuser || userData?.pk === baLead?.pk) ? (
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
                          documentPk={
                            projectClosureData?.document?.pk
                              ? projectClosureData?.document?.pk
                              : projectClosureData?.document?.id
                          }
                          stage={2}
                          projectData={projectClosureData?.document?.project}
                        />

                        {/* <Button
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
                          onClick={onS2ReopenModalOpen}
                          mr={4}
                        >
                          Reopen Project
                        </Button> */}

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
                          onClick={onS2SendbackModalOpen}
                        >
                          Send Back
                        </Button>
                      </Center>
                    ) : projectClosureData?.document?.project?.status ===
                      "completed" ? (
                      <Button
                        color={"white"}
                        background={
                          colorMode === "light" ? "orange.500" : "orange.600"
                        }
                        _hover={{
                          background:
                            colorMode === "light" ? "orange.400" : "orange.500",
                        }}
                        size={"sm"}
                        onClick={onS2ReopenModalOpen}
                        mr={0}
                      >
                        Reopen Project
                      </Button>
                    ) : null}

                    {projectClosureData?.document
                      ?.business_area_lead_approval_granted &&
                      projectClosureData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.business_area?.leader === baData?.leader) && (
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
                            documentPk={
                              projectClosureData?.document?.pk
                                ? projectClosureData?.document?.pk
                                : projectClosureData?.document?.id
                            }
                            stage={2}
                            projectData={projectClosureData?.document?.project}
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

                    {projectClosureData?.document
                      ?.project_lead_approval_granted &&
                      projectClosureData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.pk === baData?.leader) && (
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
                            documentPk={
                              projectClosureData?.document?.pk
                                ? projectClosureData?.document?.pk
                                : projectClosureData?.document?.id
                            }
                            stage={2}
                            projectData={projectClosureData?.document?.project}
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
                        projectClosureData?.document
                          ?.directorate_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {projectClosureData?.document
                        ?.directorate_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex justifyContent={"flex-end"} w={"100%"} mt={3}>
                    <ProjectClosureActionModal
                      userData={userData}
                      action={"reopen"}
                      refetchData={refetchData}
                      baData={baData}
                      isOpen={isS3ReopenModalOpen}
                      onClose={onS3ReopenModalClose}
                      projectClosurePk={projectClosureData?.pk}
                      documentPk={
                        projectClosureData?.document?.pk
                          ? projectClosureData?.document?.pk
                          : projectClosureData?.document?.id
                      }
                      stage={3}
                      projectData={projectClosureData?.document?.project}
                    />
                    {projectClosureData?.document?.project?.status ===
                    "completed" ? (
                      <Button
                        color={"white"}
                        background={
                          colorMode === "light" ? "orange.500" : "orange.600"
                        }
                        _hover={{
                          background:
                            colorMode === "light" ? "orange.400" : "orange.500",
                        }}
                        size={"sm"}
                        onClick={onS3ReopenModalOpen}
                        ml={2}
                      >
                        Reopen Project
                      </Button>
                    ) : null}

                    {projectClosureData?.document
                      ?.business_area_lead_approval_granted &&
                      projectClosureData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate") && (
                        <Center justifyContent={"flex-end"} ml={3}>
                          <ProjectClosureActionModal
                            userData={userData}
                            action={"send_back"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3SendbackModalOpen}
                            onClose={onS3SendbackModalClose}
                            projectClosurePk={projectClosureData?.pk}
                            documentPk={
                              projectClosureData?.document?.pk
                                ? projectClosureData?.document?.pk
                                : projectClosureData?.document?.id
                            }
                            stage={3}
                            projectData={projectClosureData?.document?.project}
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

                    {projectClosureData?.document
                      ?.directorate_approval_granted &&
                      (userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate") && (
                        <Center justifyContent={"flex-start"} ml={3}>
                          <ProjectClosureActionModal
                            userData={userData}
                            action={"recall"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3RecallModalOpen}
                            onClose={onS3RecallModalClose}
                            projectClosurePk={projectClosureData?.pk}
                            documentPk={
                              projectClosureData?.document?.pk
                                ? projectClosureData?.document?.pk
                                : projectClosureData?.document?.id
                            }
                            stage={3}
                            projectData={projectClosureData?.document?.project}
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
                          {/* 
                          <ProjectClosureActionModal
                            userData={userData}
                            action={"reopen"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3ReopenModalOpen}
                            onClose={onS3ReopenModalClose}
                            projectClosurePk={projectClosureData?.pk}
                            documentPk={
                              projectClosureData?.document?.pk
                                ? projectClosureData?.document?.pk
                                : projectClosureData?.document?.id
                            }
                            stage={3}
                            projectData={projectClosureData?.document?.project}
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
                            onClick={onS3ReopenModalOpen}
                            ml={2}
                          >
                            Reopen Project
                          </Button> */}
                        </Center>
                      )}

                    {projectClosureData?.document
                      ?.business_area_lead_approval_granted &&
                      (userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate") &&
                      !projectClosureData?.document
                        ?.directorate_approval_granted && (
                        <Center ml={3} justifyContent={"flex-end"}>
                          <ProjectClosureActionModal
                            userData={userData}
                            action={"approve"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3ApprovalModalOpen}
                            onClose={onS3ApprovalModalClose}
                            projectClosurePk={projectClosureData?.pk}
                            documentPk={
                              projectClosureData?.document?.pk
                                ? projectClosureData?.document?.pk
                                : projectClosureData?.document?.id
                            }
                            stage={3}
                            projectData={projectClosureData?.document?.project}
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
                {projectClosureData ? (
                  <ProjectDocumentPDFSection
                    data_document={projectClosureData}
                    refetchData={refetchData}
                  />
                ) : null}
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
