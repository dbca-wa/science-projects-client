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
  ToastId,
  useColorMode,
  useDisclosure,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import {
  ISetProjectStatusProps,
  ISpawnDocument,
  // generateConceptPlan,
  setProjectStatus,
  spawnNewEmptyDocument,
} from "@/lib/api";
import { useFormattedDate } from "@/lib/hooks/helper/useFormattedDate";
import { useBusinessArea } from "@/lib/hooks/tanstack/useBusinessArea";
import { useFullUserByPk } from "@/lib/hooks/tanstack/useFullUserByPk";
import { useProjectTeam } from "@/lib/hooks/tanstack/useProjectTeam";
import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  ICaretakerPermissions,
  IConceptPlan,
  IProjectDocuments,
  IProjectMember,
} from "@/types";
import { ConceptPlanActionModal } from "../../../Modals/DocumentActionModals/ConceptPlanActionModal";
import { UserProfile } from "../../Users/UserProfile";
import { ProjectDocumentPDFSection } from "./ProjectDocumentPDFSection";
import useCaretakerPermissions from "@/lib/hooks/helper/useCaretakerPermissions";
import { useDivisionDirectorateMembers } from "@/lib/hooks/tanstack/useDivisionDirectorateMembers";

interface IConceptDocumentActions extends ICaretakerPermissions {
  conceptPlanData: IConceptPlan;
  refetchData: () => void;
  all_documents: IProjectDocuments;
  members: IProjectMember[];
}

export const ConceptPlanDocActions = ({
  all_documents,
  conceptPlanData,
  refetchData,
  members,
  userIsCaretakerOfAdmin,
  userIsCaretakerOfBaLeader,
  userIsCaretakerOfMember,
  userIsCaretakerOfProjectLeader,
}: // , projectPk
IConceptDocumentActions) => {
  const { baData, baLoading } = useBusinessArea(
    conceptPlanData?.document?.project?.business_area?.pk,
  );

  const { directorateData, isDirectorateLoading } =
    useDivisionDirectorateMembers(baData?.division);

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
  const userInDivisionalDirectorate = directorateData?.some(
    (user) => user.pk === userData?.pk,
  );
  // useEffect(() => {
  //   console.log({
  //     userIsCaretakerOfMember,
  //     userIsCaretakerOfProjectLeader,
  //     userIsCaretakerOfBaLeader,
  //     userIsCaretakerOfAdmin,
  //   });
  // }, [
  //   userIsCaretakerOfMember,
  //   userIsCaretakerOfProjectLeader,
  //   userIsCaretakerOfBaLeader,
  //   userIsCaretakerOfAdmin,
  // ]);

  const { userData: baLead } = useFullUserByPk(baData?.leader);
  const { userData: modifier, userLoading: modifierLoading } = useFullUserByPk(
    conceptPlanData?.document?.modifier,
  );
  const { userData: creator, userLoading: creatorLoading } = useFullUserByPk(
    conceptPlanData?.document?.creator,
  );

  const { teamData, isTeamLoading } = useProjectTeam(
    String(conceptPlanData?.document?.project?.pk),
  );

  const creationDate = useFormattedDate(conceptPlanData?.document?.created_at);
  const modifyDate = useFormattedDate(conceptPlanData?.document?.updated_at);

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

  const queryClient = useQueryClient();

  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const spawnMutation = useMutation({
    mutationFn: spawnNewEmptyDocument,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Spawning Project Plan",
        position: "top-right",
      });
    },
    onSuccess: async () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Project Plan Spawned`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      const updateData: ISetProjectStatusProps = {
        projectId: conceptPlanData?.document?.project.pk
          ? conceptPlanData.document.project.pk
          : conceptPlanData?.document?.project?.id,
        status: "pending",
      };
      await setProjectStatus(updateData);
      queryClient.invalidateQueries({
        queryKey: ["projects", updateData.projectId],
      });
      refetchData();
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Spawn Project Plan",
          description: error?.response?.data
            ? `${error.response.status}: ${
                Object.values(error.response.data)[0]
              }`
            : "Error",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const spawnDocumentFunc = (data: ISpawnDocument) => {
    spawnMutation.mutate(data);
  };

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
                      conceptPlanData.document.status === "approved"
                        ? colorMode === "light"
                          ? "green.500"
                          : "green.600"
                        : conceptPlanData.document.status === "inapproval"
                          ? colorMode === "light"
                            ? "blue.500"
                            : "blue.600"
                          : conceptPlanData.document.status === "inreview"
                            ? colorMode === "light"
                              ? "orange.500"
                              : "orange.600"
                            : conceptPlanData.document.status === "revising"
                              ? "orange.500"
                              : // New
                                colorMode === "light"
                                ? "red.500"
                                : "red.600"
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {conceptPlanData.document.status === "inapproval"
                      ? "Approval Requested"
                      : conceptPlanData.document.status === "approved"
                        ? "Approved"
                        : conceptPlanData.document.status === "inreview"
                          ? "Review Requested"
                          : conceptPlanData.document.status === "revising"
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
                        ? `${kindDict[conceptPlanData?.document?.project?.kind].color}.400`
                        : `${kindDict[conceptPlanData?.document?.project?.kind].color}.500`
                    }
                    color={"white"}
                    size={"md"}
                  >
                    {kindDict[conceptPlanData?.document?.project?.kind].tag}-
                    {conceptPlanData?.document?.project?.year}-
                    {conceptPlanData?.document?.project?.number}
                  </Tag>
                </Flex>

                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedTop={"2xl"}
                  p={2}
                  borderBottom={"0px"}
                  // roundedBottom={"2xl"}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Project ID
                  </Text>
                  <Text>{conceptPlanData?.document?.project?.pk}</Text>
                </Flex>
                <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedBottom={"2xl"}
                  borderBottom={"0px"}
                  p={2}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Document ID
                  </Text>
                  <Text>
                    {conceptPlanData?.document?.pk
                      ? conceptPlanData?.document?.pk
                      : conceptPlanData?.document?.id}{" "}
                    (CP {conceptPlanData?.pk})
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
                    <Text>{creationDate}</Text>
                  </Flex>

                  <Flex w={"100%"} justifyContent={"flex-end"}>
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
                  border={"1px solid"}
                  borderColor={"gray.300"}
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
                {/* <Flex
                  border={"1px solid"}
                  borderColor={"gray.300"}
                  // roundedTop={"2xl"}
                  p={2}
                  borderBottom={"0px"}
                >
                  <Text flex={1} fontWeight={"semibold"}>
                    Selected CP ID
                  </Text>
                  <Text>{conceptPlanData?.pk}</Text>
                </Flex> */}
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

              <Grid pt={2} gridTemplateColumns={"repeat(1, 1fr)"}>
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
                        conceptPlanData?.document
                          ?.project_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {conceptPlanData?.document
                        ?.project_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Grid
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      conceptPlanData?.document
                        ?.business_area_lead_approval_granted
                        ? 0
                        : 3
                    }
                    gridTemplateColumns={"repeat(1, 1fr)"}
                  >
                    {conceptPlanData?.document
                      ?.business_area_lead_approval_granted === false &&
                      conceptPlanData?.document
                        ?.project_lead_approval_granted === true &&
                      (userIsCaretakerOfBaLeader ||
                        userIsCaretakerOfProjectLeader ||
                        userData?.is_superuser ||
                        userData?.pk === leaderMember?.user?.pk ||
                        userData?.pk === baLead?.pk) && (
                        <Center justifyContent={"flex-end"}>
                          <ConceptPlanActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS1RecallModalOpen}
                            onClose={onS1RecallModalClose}
                            action={"recall"}
                            conceptPlanPk={conceptPlanData?.pk}
                            documentPk={
                              conceptPlanData?.document?.pk
                                ? conceptPlanData?.document?.pk
                                : conceptPlanData?.document?.id
                            }
                            stage={1}
                            projectData={conceptPlanData?.document?.project}
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
                            Recall Submission
                          </Button>
                        </Center>
                      )}

                    {conceptPlanData?.document
                      ?.business_area_lead_approval_granted === false &&
                      (conceptPlanData?.document?.id ||
                        conceptPlanData?.document?.pk) &&
                      conceptPlanData?.document
                        ?.project_lead_approval_granted === false &&
                      (userIsCaretakerOfBaLeader ||
                        userIsCaretakerOfProjectLeader ||
                        userData?.is_superuser ||
                        userData?.pk === leaderMember?.user?.pk ||
                        userData?.pk === baLead?.pk) && (
                        <Center justifyContent={"flex-end"}>
                          <ConceptPlanActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS1ApprovalModalOpen}
                            onClose={onS1ApprovalModalClose}
                            action={"approve"}
                            stage={1}
                            conceptPlanPk={conceptPlanData?.pk}
                            documentPk={
                              conceptPlanData?.document?.pk
                                ? conceptPlanData?.document?.pk
                                : conceptPlanData?.document?.id
                            }
                            projectData={conceptPlanData?.document?.project}
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
                    mb={2}
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
                        conceptPlanData?.document
                          ?.business_area_lead_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {conceptPlanData?.document
                        ?.business_area_lead_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      conceptPlanData?.document
                        ?.project_lead_approval_granted &&
                      conceptPlanData?.document
                        ?.directorate_approval_granted === false
                        ? 3
                        : 0
                    }
                    // gridTemplateColumns={"repeat(2, 1fr)"}
                  >
                    {conceptPlanData?.document?.project_lead_approval_granted &&
                      conceptPlanData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.pk === baLead?.pk ||
                        userIsCaretakerOfBaLeader) && (
                        <Center
                        // justifyContent={"flex-start"}
                        // ml={4}
                        >
                          <ConceptPlanActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
                            refetchData={refetchData}
                            action={"send_back"}
                            baData={baData}
                            isOpen={isS2SendbackModalOpen}
                            onClose={onS2SendbackModalClose}
                            conceptPlanPk={conceptPlanData?.pk}
                            documentPk={
                              conceptPlanData?.document?.pk
                                ? conceptPlanData?.document?.pk
                                : conceptPlanData?.document?.id
                            }
                            stage={2}
                            projectData={conceptPlanData?.document?.project}
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

                    {conceptPlanData?.document
                      ?.business_area_lead_approval_granted &&
                      conceptPlanData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.business_area?.leader === baData?.leader ||
                        userIsCaretakerOfBaLeader) && (
                        <Center
                          // justifyContent={"flex-start"}
                          ml={3}
                        >
                          <ConceptPlanActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
                            refetchData={refetchData}
                            action={"recall"}
                            baData={baData}
                            isOpen={isS2RecallModalOpen}
                            onClose={onS2RecallModalClose}
                            conceptPlanPk={conceptPlanData?.pk}
                            documentPk={
                              conceptPlanData?.document?.pk
                                ? conceptPlanData?.document?.pk
                                : conceptPlanData?.document?.id
                            }
                            stage={2}
                            projectData={conceptPlanData?.document?.project}
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
                            disabled={
                              !userData?.is_superuser &&
                              directorateData?.length < 1
                            }
                            onClick={onS2RecallModalOpen}
                          >
                            Recall Approval
                          </Button>
                        </Center>
                      )}

                    {conceptPlanData?.document?.project_lead_approval_granted &&
                      conceptPlanData?.document
                        ?.business_area_lead_approval_granted === false &&
                      (userData?.is_superuser ||
                        userData?.pk === baData?.leader ||
                        userIsCaretakerOfBaLeader) && (
                        <Center
                          // justifyContent={"flex-end"}
                          ml={3}
                        >
                          <ConceptPlanActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
                            refetchData={refetchData}
                            action={"approve"}
                            baData={baData}
                            isOpen={isS2ApprovalModalOpen}
                            onClose={onS2ApprovalModalClose}
                            conceptPlanPk={conceptPlanData?.pk}
                            documentPk={
                              conceptPlanData?.document?.pk
                                ? conceptPlanData?.document?.pk
                                : conceptPlanData?.document?.id
                            }
                            stage={2}
                            projectData={conceptPlanData?.document?.project}
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
                            disabled={
                              !userData?.is_superuser &&
                              directorateData?.length < 1
                            }
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
                        conceptPlanData?.document
                          ?.directorate_approval_granted === true
                          ? "green.500"
                          : "red.500"
                      }
                      color={"white"}
                    >
                      {conceptPlanData?.document
                        ?.directorate_approval_granted === true
                        ? "Granted"
                        : "Required"}
                    </Tag>
                  </Flex>
                  <Flex
                    justifyContent={"flex-end"}
                    w={"100%"}
                    mt={
                      conceptPlanData?.document
                        ?.business_area_lead_approval_granted
                        ? 3
                        : 0
                    }
                  >
                    {conceptPlanData?.document
                      ?.business_area_lead_approval_granted &&
                      conceptPlanData?.document
                        ?.directorate_approval_granted === false &&
                      (userData?.is_superuser ||
                        userInDivisionalDirectorate ||
                        userIsCaretakerOfAdmin) && (
                        <Center justifyContent={"flex-end"} ml={3}>
                          <ConceptPlanActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
                            action={"send_back"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3SendbackModalOpen}
                            onClose={onS3SendbackModalClose}
                            conceptPlanPk={conceptPlanData?.pk}
                            documentPk={
                              conceptPlanData?.document?.pk
                                ? conceptPlanData?.document?.pk
                                : conceptPlanData?.document?.id
                            }
                            stage={3}
                            projectData={conceptPlanData?.document?.project}
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
                            // disabled={directorateData?.length < 1}
                            onClick={onS3SendbackModalOpen}
                          >
                            Send Back
                          </Button>
                        </Center>
                      )}

                    {conceptPlanData?.document?.directorate_approval_granted &&
                      (userData?.is_superuser ||
                        userInDivisionalDirectorate ||
                        userIsCaretakerOfAdmin) && (
                        // !all_documents?.project_plan &&
                        <Center justifyContent={"flex-start"} ml={3}>
                          <ConceptPlanActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
                            action={"recall"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3RecallModalOpen}
                            onClose={onS3RecallModalClose}
                            conceptPlanPk={conceptPlanData?.pk}
                            documentPk={
                              conceptPlanData?.document?.pk
                                ? conceptPlanData?.document?.pk
                                : conceptPlanData?.document?.id
                            }
                            stage={3}
                            projectData={conceptPlanData?.document?.project}
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
                          {all_documents?.project_plan?.document ? null : (
                            <Button
                              colorScheme="orange"
                              size={"sm"}
                              onClick={() =>
                                spawnDocumentFunc({
                                  projectPk: conceptPlanData?.document?.project
                                    ?.id
                                    ? conceptPlanData.document.project.id
                                    : conceptPlanData.document.project.pk,
                                  kind: "projectplan",
                                })
                              }
                              ml={2}
                            >
                              Begin Project Plan
                            </Button>
                          )}
                        </Center>
                      )}

                    {conceptPlanData?.document
                      ?.business_area_lead_approval_granted &&
                      (userData?.is_superuser ||
                        userInDivisionalDirectorate ||
                        userIsCaretakerOfAdmin) &&
                      !conceptPlanData?.document
                        ?.directorate_approval_granted && (
                        <Center ml={3} justifyContent={"flex-end"}>
                          <ConceptPlanActionModal
                            directorateData={directorateData}
                            isDirectorateLoading={isDirectorateLoading}
                            userData={userData}
                            action={"approve"}
                            refetchData={refetchData}
                            baData={baData}
                            isOpen={isS3ApprovalModalOpen}
                            onClose={onS3ApprovalModalClose}
                            conceptPlanPk={conceptPlanData?.pk}
                            documentPk={
                              conceptPlanData?.document?.pk
                                ? conceptPlanData?.document?.pk
                                : conceptPlanData?.document?.id
                            }
                            stage={3}
                            projectData={conceptPlanData?.document?.project}
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
                  data_document={conceptPlanData}
                  refetchData={refetchData}
                />
              </Grid>
            </Box>
          </Grid>
        </>
      ) : // <Spinner/>
      baLoading === false && baData === undefined ? (
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
