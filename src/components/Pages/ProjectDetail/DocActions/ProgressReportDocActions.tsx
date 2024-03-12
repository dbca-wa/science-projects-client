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
  useDisclosure
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  ISetProjectProps,
  setProjectStatus
} from "../../../../lib/api";
import { useBusinessArea } from "../../../../lib/hooks/useBusinessArea";
import { useFormattedDate } from "../../../../lib/hooks/useFormattedDate";
import { useFullUserByPk } from "../../../../lib/hooks/useFullUserByPk";
import { useProjectTeam } from "../../../../lib/hooks/useProjectTeam";
import { useUser } from "../../../../lib/hooks/useUser";
import { IProgressReport, IProjectMember } from "../../../../types";
import { DeleteDocumentModal } from "../../../Modals/DeleteDocumentModal";
import { ProgressReportActionModal } from "../../../Modals/DocumentActionModals/ProgressReportActionModal";
import { UserProfile } from "../../Users/UserProfile";
import { ProjectDocumentPDFSection } from "./ProjectDocumentPDFSection";

interface IProgressDocumentActions {
  progressReportData: IProgressReport;
  refetchData: () => void;
  callSameData: () => void;
  documents: IProgressReport[];
  setToLastTab: (tabToGoTo?: number) => void;
}

export const ProgressReportDocActions = ({
  progressReportData,
  refetchData,
  documents,
  callSameData,
  setToLastTab,
}: // setSelectedProgressReport, setSelectedYear,
  // , projectPk
  IProgressDocumentActions) => {
  const { colorMode } = useColorMode();

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
    progressReportData?.document?.project?.business_area?.pk
  );
  const { userData: baLead } = useFullUserByPk(baData?.leader);
  const { userData: modifier, userLoading: modifierLoading } = useFullUserByPk(
    progressReportData?.document?.modifier
  );
  const { userData: creator, userLoading: creatorLoading } = useFullUserByPk(
    progressReportData?.document?.creator
  );

  const { teamData, isTeamLoading } = useProjectTeam(
    String(progressReportData?.document?.project?.pk)
  );

  const {
    isOpen: isDeleteDocumentModalOpen,
    onOpen: onOpenDeleteDocumentModal,
    onClose: onCloseDeleteDocumentModal,
  } = useDisclosure();

  const keyForDeleteDocumentModal = progressReportData?.document?.pk
    ? `document-${progressReportData?.document?.pk}`
    : `document-${progressReportData?.document?.id}`;

  const creationDate = useFormattedDate(
    progressReportData?.document?.created_at
  );
  const modifyDate = useFormattedDate(progressReportData?.document?.updated_at);

  const [actionsReady, setActionsReady] = useState(false);

  const [leaderMember, setLeaderMemeber] = useState<IProjectMember>();

  // useEffect(() => console.log(progressReportData))

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

  const projectPk = progressReportData?.document?.project.pk;

  const setStatusIfRequired = () => {
    if (documents.length <= 1) {
      const data: ISetProjectProps = {
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
                      progressReportData.document.status === "approved"
                        ? colorMode === "light"
                          ? "green.500"
                          : "green.600"
                        : progressReportData.document.status === "inapproval"
                          ? colorMode === "light"
                            ? "blue.500"
                            : "blue.600"
                          : progressReportData.document.status === "inreview"
                            ? colorMode === "light"
                              ? "orange.500"
                              : "orange.600"
                            : progressReportData.document.status === "revising"
                              ? "orange.500"
                              : // New
                              colorMode === "light"
                                ? "red.500"
                                : "red.600"
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {progressReportData.document.status === "inapproval"
                      ? "Approval Requested"
                      : progressReportData.document.status === "approved"
                        ? "Approved"
                        : progressReportData.document.status === "inreview"
                          ? "Review Requested"
                          : progressReportData.document.status === "revising"
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
                  <Text>{progressReportData?.document?.project?.pk}</Text>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedTop={"2xl"}
                  p={2}
                  borderBottom={"0px"}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Selected PR ID
                  </Text>
                  <Text>{progressReportData?.pk}</Text>
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
                    {progressReportData?.document?.pk
                      ? progressReportData?.document?.pk
                      : progressReportData?.document?.id}
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
                        progressReportData?.document
                          ?.project_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {progressReportData?.document
                        ?.project_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Grid
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      progressReportData?.document
                        ?.business_area_lead_approval_granted
                        ? 0
                        : 3
                    }
                    gridTemplateColumns={"repeat(1, 1fr)"}
                  >
                    {progressReportData?.document
                      ?.business_area_lead_approval_granted === false &&
                      progressReportData?.document
                        ?.project_lead_approval_granted === true &&
                      (userData?.is_superuser ||
                        userData?.pk === leaderMember?.user?.pk) && (
                        <Center justifyContent={"flex-end"}>
                          <ProgressReportActionModal
                            userData={userData}
                            refetchData={refetchData}
                            callSameData={callSameData}
                            baData={baData}
                            isOpen={isS1RecallModalOpen}
                            onClose={onS1RecallModalClose}
                            action={"recall"}
                            progressReportPk={progressReportData?.pk}
                            documentPk={progressReportData?.document?.pk}
                            stage={1}
                            projectData={progressReportData?.document?.project}
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

                    {progressReportData?.document
                      ?.business_area_lead_approval_granted === false &&
                      progressReportData?.document
                        ?.project_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.pk === leaderMember?.user?.pk) && (
                        <Center justifyContent={"flex-end"}>
                          <ProgressReportActionModal
                            userData={userData}
                            callSameData={callSameData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS1ApprovalModalOpen}
                            onClose={onS1ApprovalModalClose}
                            action={"approve"}
                            progressReportPk={progressReportData?.pk}
                            documentPk={progressReportData?.document?.pk}
                            stage={1}
                            projectData={progressReportData?.document?.project}
                          />

                          {/* {
                                                            all_documents?.progress_reports.length < 1
                                                            && ( */}
                          <>
                            <DeleteDocumentModal
                              key={keyForDeleteDocumentModal}
                              projectPk={
                                progressReportData?.document?.project?.pk
                                  ? progressReportData?.document?.project?.pk
                                  : progressReportData?.document?.project?.id
                              }
                              documentPk={
                                progressReportData?.document?.pk
                                  ? progressReportData?.document?.pk
                                  : progressReportData?.document?.id
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
                          {/* )
                                                        } */}

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
                            Submit
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
                        progressReportData?.document
                          ?.business_area_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {progressReportData?.document
                        ?.business_area_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      // progressReportData?.document?.project_lead_approval_granted === true &&
                      progressReportData?.document
                        ?.directorate_approval_granted === false
                        ? 3
                        : 0
                    }
                  // gridTemplateColumns={"repeat(2, 1fr)"}
                  >
                    {progressReportData?.document
                      ?.project_lead_approval_granted &&
                      progressReportData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.pk === baLead?.pk) && (
                        <Center
                        // justifyContent={"flex-start"}
                        // ml={4}
                        >
                          <ProgressReportActionModal
                            userData={userData}
                            callSameData={callSameData}
                            refetchData={refetchData}
                            action={"send_back"}
                            baData={baData}
                            isOpen={isS2SendbackModalOpen}
                            onClose={onS2SendbackModalClose}
                            progressReportPk={progressReportData?.pk}
                            documentPk={progressReportData?.document?.pk}
                            stage={2}
                            projectData={progressReportData?.document?.project}
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

                    {progressReportData?.document
                      ?.business_area_lead_approval_granted &&
                      progressReportData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.business_area?.leader === baData?.leader) && (
                        <Center
                          // justifyContent={"flex-start"}
                          ml={3}
                        >
                          <ProgressReportActionModal
                            userData={userData}
                            callSameData={callSameData}
                            refetchData={refetchData}
                            action={"recall"}
                            baData={baData}
                            isOpen={isS2RecallModalOpen}
                            onClose={onS2RecallModalClose}
                            progressReportPk={progressReportData?.pk}
                            documentPk={progressReportData?.document?.pk}
                            stage={2}
                            projectData={progressReportData?.document?.project}
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
                            onClick={onS2RecallModalOpen}
                          >
                            Recall Approval
                          </Button>
                        </Center>
                      )}

                    {progressReportData?.document
                      ?.project_lead_approval_granted &&
                      progressReportData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.pk === baData?.leader) && (
                        <Center
                          // justifyContent={"flex-end"}
                          ml={3}
                        >
                          <ProgressReportActionModal
                            userData={userData}
                            callSameData={callSameData}
                            refetchData={refetchData}
                            action={"approve"}
                            baData={baData}
                            isOpen={isS2ApprovalModalOpen}
                            onClose={onS2ApprovalModalClose}
                            progressReportPk={progressReportData?.pk}
                            documentPk={progressReportData?.document?.pk}
                            stage={2}
                            projectData={progressReportData?.document?.project}
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
                        progressReportData?.document
                          ?.directorate_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {progressReportData?.document
                        ?.directorate_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      progressReportData?.document
                        ?.business_area_lead_approval_granted
                        ? 3
                        : 0
                    }
                  >
                    {progressReportData?.document
                      ?.business_area_lead_approval_granted &&
                      progressReportData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate") && (
                        <Center justifyContent={"flex-end"} ml={3}>
                          <ProgressReportActionModal
                            userData={userData}
                            callSameData={callSameData}
                            action={"send_back"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3SendbackModalOpen}
                            onClose={onS3SendbackModalClose}
                            progressReportPk={progressReportData?.pk}
                            documentPk={progressReportData?.document?.pk}
                            stage={3}
                            projectData={progressReportData?.document?.project}
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

                    {progressReportData?.document
                      ?.directorate_approval_granted &&
                      (userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate") && (
                        <Center mt={3} justifyContent={"flex-start"} ml={3}>
                          <ProgressReportActionModal
                            userData={userData}
                            callSameData={callSameData}
                            action={"recall"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3RecallModalOpen}
                            onClose={onS3RecallModalClose}
                            progressReportPk={progressReportData?.pk}
                            documentPk={progressReportData?.document?.pk}
                            stage={3}
                            projectData={progressReportData?.document?.project}
                          />
                          <Button
                            // colorScheme="blue"
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

                    {progressReportData?.document
                      ?.business_area_lead_approval_granted &&
                      (userData?.is_superuser ||
                        userData?.business_area?.name === "Directorate") &&
                      !progressReportData?.document
                        ?.directorate_approval_granted && (
                        <Center ml={3} justifyContent={"flex-end"}>
                          <ProgressReportActionModal
                            userData={userData}
                            callSameData={callSameData}
                            action={"approve"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3ApprovalModalOpen}
                            onClose={onS3ApprovalModalClose}
                            progressReportPk={progressReportData?.pk}
                            documentPk={progressReportData?.document?.pk}
                            stage={3}
                            projectData={progressReportData?.document?.project}
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
                <ProjectDocumentPDFSection data_document={progressReportData} refetchData={callSameData} />


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
