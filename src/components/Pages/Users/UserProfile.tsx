// The drawer content that pops out when clicking on a user grid item

import { DeactivateUserModal } from "@/components/Modals/DeactivateUserModal";
import { RequestMergeUserModal } from "@/components/Modals/RequestMergeUserModal";
import { useInvolvedProjects } from "@/lib/hooks/tanstack/useInvolvedProjects";
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Image,
  Spacer,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { FcApproval } from "react-icons/fc";
import { FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useCopyText } from "../../../lib/hooks/helper/useCopyText";
import { useFormattedDate } from "../../../lib/hooks/helper/useFormattedDate";
import { useUpdatePage } from "../../../lib/hooks/helper/useUpdatePage";
import { useFullUserByPk } from "../../../lib/hooks/tanstack/useFullUserByPk";
import { useUser } from "../../../lib/hooks/tanstack/useUser";
import { IBranch, IBusinessArea } from "../../../types";
import { AddUserToProjectModal } from "../../Modals/AddUserToProjectModal";
import { DeleteUserModal } from "../../Modals/DeleteUserModal";
import { EditUserDetailsModal } from "../../Modals/EditUserDetailsModal";
import { PromoteUserModal } from "../../Modals/PromoteUserModal";
import { UserProjectsDataTable } from "../Dashboard/UserProjectsDataTable";
import { CaretakerModeConfirmModal } from "@/components/Modals/CaretakerModeConfirmModal";
import { SetCaretakerAdminModal } from "@/components/Modals/SetCaretakerAdminModal";
import { formatDate } from "date-fns";
import { useNoImage } from "@/lib/hooks/helper/useNoImage";
import useApiEndpoint from "@/lib/hooks/helper/useApiEndpoint";
import { RemoveCaretakerModal } from "@/components/Modals/RemoveCaretakerModal";

interface Props {
  pk: number;
  branches?: IBranch[] | undefined;
  businessAreas?: IBusinessArea[] | undefined;
}

export const UserProfile = ({ pk, branches, businessAreas }: Props) => {
  const baseAPI = useApiEndpoint();
  const noImage = useNoImage();

  const {
    userLoading: loading,
    userData: user,
    refetchUser: refetch,
  } = useFullUserByPk(pk);
  const formatted_date = useFormattedDate(user?.date_joined);

  const { currentPage } = useUpdatePage();

  const { colorMode } = useColorMode();
  const borderColor = colorMode === "light" ? "gray.300" : "gray.500";
  const sectionTitleColor = colorMode === "light" ? "gray.600" : "gray.300";
  const subsectionTitleColor = colorMode === "light" ? "gray.500" : "gray.500";
  const replaceLightWithDark = (htmlString: string): string => {
    // Replace 'light' with 'dark' in class attributes
    const modifiedHTML = htmlString.replace(
      /class\s*=\s*["']([^"']*light[^"']*)["']/gi,
      (match, group) => `class="${group.replace(/\blight\b/g, "dark")}"`,
    );

    // Add margin-right: 4px to all <li> elements (or modify as needed)
    const finalHTML = modifiedHTML.replace(
      /<li/g,
      '<li style="margin-right: 4px;"',
    );

    return finalHTML;
  };

  const replaceDarkWithLight = (htmlString: string): string => {
    // Replace 'dark' with 'light' in class attributes
    const modifiedHTML = htmlString.replace(
      /class\s*=\s*["']([^"']*dark[^"']*)["']/gi,
      (match, group) => {
        return `class="${group.replace(/\bdark\b/g, "light")}"`;
      },
    );

    // Add margin-right: 4px to all <li> elements
    const finalHTML = modifiedHTML.replace(
      /<li/g,
      '<li style="margin-left: 36px;"',
    );

    return finalHTML;
  };

  const sanitizeHtml = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const elements = doc.body.querySelectorAll("*");

    elements.forEach((element) => {
      if (
        element.tagName.toLowerCase() === "b" ||
        element.tagName.toLowerCase() === "strong"
      ) {
        const parent = element.parentNode;
        while (element.firstChild) {
          parent.insertBefore(element.firstChild, element);
        }
        parent.removeChild(element);
      } else {
        element.removeAttribute("style"); // Keep class if necessary for layout
      }
    });

    return doc.body.innerHTML;
  };

  // let baseUrl = useApiEndpoint();
  // const noImage = useNoImage();

  const copyEmail = useCopyText(user?.email);
  const openEmailAddressedToUser = () => {
    window.open(`mailto:${user?.email}`);
  };

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const {
    isOpen: isDeactivateModalOpen,
    onOpen: onDeactivateModalOpen,
    onClose: onDeactivateModalClose,
  } = useDisclosure();

  const {
    isOpen: isPromoteModalOpen,
    onOpen: onPromoteModalOpen,
    onClose: onPromoteModalClose,
  } = useDisclosure();
  const {
    isOpen: isAddToProjectModalOpen,
    onOpen: onAddToProjectModalOpen,
    onClose: onAddToProjectModalClose,
  } = useDisclosure();
  const {
    isOpen: isMergeUserModalOpen,
    onOpen: onMergeUserModalOpen,
    onClose: onMergeUserModalClose,
  } = useDisclosure();
  const {
    isOpen: isRequestCaretakerModalOpen,
    onOpen: onRequestCaretakerModalOpen,
    onClose: onRequestCaretakerModalClose,
  } = useDisclosure();

  const {
    isOpen: isSetCaretakerAdminModalOpen,
    onOpen: onOpenSetCaretakerAdminModal,
    onClose: onCloseSetCaretakerAdminModal,
  } = useDisclosure();

  const {
    isOpen: isRemoveCaretakerAdminModalOpen,
    onOpen: onOpenRemoveCaretakerAdminModal,
    onClose: onCloseRemoveCaretakerAdminModal,
  } = useDisclosure();

  const {
    isOpen: isEditUserDetailsModalOpen,
    onOpen: onEditUserDetailsModalOpen,
    onClose: onEditUserDetailsModalClose,
  } = useDisclosure();

  const me = useUser();

  const { userProjectsLoading, userProjectsData } = useInvolvedProjects(pk);
  // useEffect(() => console.log(userProjectsData));

  const [userInQuestionIsSuperuser, setUserInQuestionIsSuperuser] =
    useState(false);
  // const [userInQuestionIsMe, setUserInQuestionIsMe] = useState(false);

  const setVariablesForPromoteModalAndOpen = (
    isUserToChangeSuperUser: boolean,
  ) => {
    setUserInQuestionIsSuperuser(isUserToChangeSuperUser);
    onPromoteModalOpen();
  };

  const navigate = useNavigate();

  // const goToProject = (
  //   e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  //   pk: number | undefined,
  // ) => {
  //   if (isOnProjectsPage) {
  //     if (e.ctrlKey || e.metaKey) {
  //       window.open(`${pk}`, "_blank"); // Opens in a new tab
  //     } else {
  //       navigate(`${pk}`);
  //     }
  //   } else {
  //     if (e.ctrlKey || e.metaKey) {
  //       window.open(`/projects/${pk}`, "_blank"); // Opens in a new tab
  //     } else {
  //       navigate(`/projects/${pk}`);
  //     }
  //   }
  // };
  // const kindDict = {
  //   CF: {
  //     color: "red",
  //   },
  //   SP: {
  //     color: "green",
  //   },
  //   STP: {
  //     color: "blue",
  //   },
  //   EXT: {
  //     color: "gray",
  //   },
  // };

  return loading || !user || pk === undefined ? (
    <Center w={"100%"} h={"100%"}>
      <Spinner size={"xl"} />
    </Center>
  ) : (
    <>
      {me?.userData?.is_superuser && (
        <>
          <SetCaretakerAdminModal
            isOpen={isSetCaretakerAdminModalOpen}
            onClose={onCloseSetCaretakerAdminModal}
            userIsSuper={userInQuestionIsSuperuser}
            userPk={user.pk}
            refetch={refetch}
          />
          <RemoveCaretakerModal
            isOpen={isRemoveCaretakerAdminModalOpen}
            onClose={onCloseRemoveCaretakerAdminModal}
            caretakerObject={{
              id: user?.caretakers?.[0]?.caretaker_obj_id,
              user: user?.pk,
              caretaker: {
                pk: user?.caretakers?.[0]?.pk || null,
                display_first_name:
                  user?.caretakers?.[0]?.display_first_name || "",
                display_last_name:
                  user?.caretakers?.[0]?.display_last_name || "",

                image: user?.caretakers?.[0]?.image || null,
              },
              reason: "leave",
              notes: "",
              end_date: user?.caretakers?.[0]?.end_date || null,
            }}
            refetch={refetch}
          />
          <DeleteUserModal
            isOpen={isDeleteModalOpen}
            onClose={onDeleteModalClose}
            userIsSuper={userInQuestionIsSuperuser}
            userPk={user.pk}
          />
          <DeactivateUserModal
            isOpen={isDeactivateModalOpen}
            onClose={onDeactivateModalClose}
            userIsSuper={userInQuestionIsSuperuser}
            user={user}
          />
          <PromoteUserModal
            isOpen={isPromoteModalOpen}
            onClose={onPromoteModalClose}
            userPk={user.pk}
            userIsSuper={userInQuestionIsSuperuser}
            userIsExternal={!user.is_staff}
          />
        </>
      )}

      <AddUserToProjectModal
        isOpen={isAddToProjectModalOpen}
        onClose={onAddToProjectModalClose}
        preselectedUser={pk}
      />

      {user?.pk !== me?.userData?.pk && (
        <>
          <RequestMergeUserModal
            isOpen={isMergeUserModalOpen}
            onClose={onMergeUserModalClose}
            primaryUserPk={me?.userData?.pk}
            secondaryUserPks={[user?.pk]}
          />
          <CaretakerModeConfirmModal
            isOpen={isRequestCaretakerModalOpen}
            onClose={onRequestCaretakerModalClose}
            refetch={refetch}
            userPk={me?.userData?.pk}
            caretakerPk={user?.pk}
            endDate={undefined}
            reason={"leave"}
            notes={""}
          />
        </>
      )}

      <EditUserDetailsModal
        isOpen={isEditUserDetailsModalOpen}
        onClose={onEditUserDetailsModalClose}
        user={user}
        branches={branches}
        businessAreas={businessAreas}
      />
      <Flex flexDir={"column"} h={"100%"}>
        <Flex mt={4}>
          <Avatar
            src={user?.image?.file ? user.image.file : user?.image?.old_file}
            size={"2xl"}
            userSelect={"none"}
          />

          <Flex
            flexDir={"column"}
            flex={1}
            justifyContent={"center"}
            ml={4}
            overflow={"auto"}
          >
            <Text userSelect={"none"} fontWeight={"bold"}>
              {!user?.display_first_name?.startsWith("None")
                ? `${user?.display_first_name ?? user?.first_name} ${user?.display_last_name ?? user?.last_name}`
                : `${user?.username}`}
            </Text>
            <Text userSelect={"none"}>
              {user?.phone ? user.phone : "No Phone number"}
            </Text>
            <Flex>
              <Text userSelect={"none"}>
                {user?.email?.startsWith("unset") ? "No Email" : user?.email}
              </Text>
            </Flex>
            {!user?.email?.startsWith("unset") && (
              <Button
                // ml={2}
                size={"xs"}
                variant={"ghost"}
                color={"white"}
                background={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  background: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                onClick={copyEmail}
                leftIcon={<FiCopy />}
                ml={0}
                rounded={4}
                mt={2}
                px={4}
                w={"fit-content"}
              >
                Copy Email
                {/* <Icon as={FiCopy} /> */}
              </Button>
            )}
          </Flex>
        </Flex>

        <Grid
          gridTemplateColumns={
            user?.pk !== me?.userData?.pk ? "repeat(2, 1fr)" : "repeat(2, 1fr)"
          }
          gridGap={4}
          mt={4}
          pt={2}
          pb={4}
        >
          {!user?.is_staff && (
            <Button
              onClick={openEmailAddressedToUser}
              bg={colorMode === "light" ? "blue.500" : "blue.400"}
              color={
                colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
              }
              isDisabled={
                user.email?.startsWith("unset") ||
                me.userData.email === user.email
              }
              _hover={{
                bg: colorMode === "light" ? "blue.400" : "blue.300",
                color: "white",
              }}
            >
              Email
            </Button>
          )}
          {user?.is_staff && (
            <Button
              bg={colorMode === "light" ? "blue.500" : "blue.400"}
              color={
                colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
              }
              _hover={{
                bg: colorMode === "light" ? "blue.400" : "blue.300",
                color: "white",
              }}
              // isDisabled={true}
              onClick={openEmailAddressedToUser}
            >
              {/* Chat */}
              Email
            </Button>
          )}

          <Button
            bg={colorMode === "light" ? "green.500" : "green.400"}
            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
            onClick={onAddToProjectModalOpen}
            _hover={{
              bg: colorMode === "light" ? "green.400" : "green.300",
              color: "white",
            }}
            isDisabled={user.email === me.userData.email}
          >
            Add to Project
          </Button>

          {user?.pk !== me?.userData?.pk && (
            <>
              <Button
                bg={colorMode === "light" ? "red.500" : "red.400"}
                color={
                  colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                }
                onClick={onMergeUserModalOpen}
                _hover={{
                  bg: colorMode === "light" ? "red.400" : "red.300",
                  color: "white",
                }}
                isDisabled={user.email === me.userData.email}
              >
                Merge
              </Button>
              <Button
                bg={colorMode === "light" ? "red.500" : "red.400"}
                color={
                  colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                }
                onClick={onRequestCaretakerModalOpen}
                _hover={{
                  bg: colorMode === "light" ? "red.400" : "red.300",
                  color: "white",
                }}
                isDisabled={
                  user.email === me.userData.email || user.caretakers.length > 0
                }
              >
                Set as Caretaker
              </Button>
            </>
          )}
        </Grid>

        <Flex
          border={"1px solid"}
          rounded={"xl"}
          borderColor={borderColor}
          padding={4}
          // mb={4}
          flexDir={"column"}
          mt={2}
        >
          <Flex flexDir={"column"} userSelect={"none"}>
            {user?.is_staff && (
              <Flex h={"60px"}>
                <Image
                  rounded={"lg"}
                  w="60px"
                  h="60px"
                  src={
                    // user?.agency?.image ? user.agency.image.old_file : ""
                    "/dbca.jpg"
                  }
                  objectFit="cover"
                />
                <Center>
                  <Flex ml={3} flexDir="column">
                    <Text fontWeight="bold" color={sectionTitleColor}>
                      {user.agency !== null
                        ? user.agency.name
                        : "agency returning none"}
                    </Text>
                    <Text
                      fontSize="sm"
                      color={colorMode === "light" ? "gray.600" : "gray.400"}
                    >
                      {user.branch !== null
                        ? `${user.branch.name} Branch`
                        : "Branch not set"}
                    </Text>
                    <Text
                      fontSize="sm"
                      color={colorMode === "light" ? "blue.600" : "gray.400"}
                    >
                      {user?.business_area?.name ? (
                        <>
                          <span>
                            {user?.business_area?.leader.pk === user?.pk
                              ? "Business Area Leader, "
                              : ``}
                          </span>
                          <span
                            onClick={() => console.log(user)}
                            // style={{ color: "blue.500" }}
                          >
                            {user.business_area.name}
                          </span>
                        </>
                      ) : (
                        "Business Area not set"
                      )}
                    </Text>
                  </Flex>
                </Center>
              </Flex>
            )}
            {!user?.is_staff && (
              <Text color={colorMode === "light" ? "gray.600" : "gray.300"}>
                <b>External User</b> - This user does not belong to DBCA
              </Text>
            )}
          </Flex>
        </Flex>

        <Box mt={2}>
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            mb={4}
            flexDir={"column"}
            mt={2}
          >
            <Flex>
              <Text
                fontWeight={"bold"}
                fontSize={"sm"}
                mb={1}
                color={sectionTitleColor}
                userSelect={"none"}
              >
                About
              </Text>
            </Flex>
            <Box
              mt={1}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  colorMode === "dark"
                    ? replaceLightWithDark(
                        user?.about === "" ||
                          user?.about === "<p></p>" ||
                          user?.about ===
                            '<p class="editor-p-light"><br></p>' ||
                          user?.about === '<p class="editor-p-dark"><br></p>'
                          ? "<p>(Not Provided)</p>"
                          : (user?.about ?? "<p>(Not Provided)</p>"),
                      )
                    : replaceDarkWithLight(
                        user?.about === "" ||
                          user?.about === "<p></p>" ||
                          user?.about ===
                            '<p class="editor-p-light"><br></p>' ||
                          user?.about === '<p class="editor-p-dark"><br></p>'
                          ? "<p>(Not Provided)</p>"
                          : (user?.about ?? "<p>(Not Provided)</p>"),
                      ),
                ),
              }}
            />

            {/* <Text>
              {user.about
                ? user.about
                : "This user has not filled in this section."}
            </Text> */}
            <Flex mt={4}>
              <Text
                fontWeight={"bold"}
                fontSize={"sm"}
                mb={1}
                color={sectionTitleColor}
                userSelect={"none"}
              >
                Expertise
              </Text>
            </Flex>
            <Box
              mt={1}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  colorMode === "dark"
                    ? replaceLightWithDark(
                        user?.expertise === "" ||
                          user?.expertise === "<p></p>" ||
                          user?.expertise ===
                            '<p class="editor-p-light"><br></p>' ||
                          user?.expertise ===
                            '<p class="editor-p-dark"><br></p>'
                          ? "<p>(Not Provided)</p>"
                          : (user?.expertise ?? "<p>(Not Provided)</p>"),
                      )
                    : replaceDarkWithLight(
                        user?.expertise === "" ||
                          user?.expertise === "<p></p>" ||
                          user?.expertise ===
                            '<p class="editor-p-light"><br></p>' ||
                          user?.expertise ===
                            '<p class="editor-p-dark"><br></p>'
                          ? "<p>(Not Provided)</p>"
                          : (user?.expertise ?? "<p>(Not Provided)</p>"),
                      ),
                ),
              }}
            />

            {/* <Text>
              {user?.expertise
                ? user.expertise
                : "This user has not filled in this section."}
            </Text> */}
          </Flex>

          <Spacer />

          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            mb={4}
            flexDir={"column"}
            mt={2}
          >
            {" "}
            <Flex>
              <Text
                fontWeight={"bold"}
                fontSize={"sm"}
                mb={1}
                color={sectionTitleColor}
                userSelect={"none"}
              >
                Involved Projects
              </Text>
            </Flex>
            {!userProjectsLoading &&
              (userProjectsData?.length === 0 ? (
                <p>No Projects</p>
              ) : (
                <>
                  <UserProjectsDataTable
                    projectData={userProjectsData}
                    disabledColumns={{
                      kind: true,
                      status: true,
                      business_area: true,
                      created_at: true,
                      role: false,
                      title: false,
                    }}
                    defaultSorting={"title"}
                    noDataString="Not associated with any projects"
                  />
                </>
              ))}
            {/* <ExtractedHTMLTitle></ExtractedHTMLTitle> */}
          </Flex>

          <Spacer />

          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            mb={4}
            flexDir={"column"}
            mt={2}
          >
            <Flex>
              <Text
                fontWeight={"bold"}
                fontSize={"sm"}
                mb={1}
                color={sectionTitleColor}
                userSelect={"none"}
              >
                Details
              </Text>
            </Flex>

            <Grid gridTemplateColumns="1fr 3fr">
              {/* <Text color={subsectionTitleColor}
                                    userSelect={"none"}
                                    fontSize={"sm"}
                                ><b>Role: </b></Text><Text >{user?.role ? user.role : "This user has not filled in their 'role' section."}</Text> */}
              <Text
                color={subsectionTitleColor}
                userSelect={"none"}
                fontSize={"sm"}
              >
                <b>Joined: </b>
              </Text>
              <Text>{formatted_date}</Text>
            </Grid>
            <Flex
              mt={4}
              rounded="xl"
              p={4}
              bg={colorMode === "light" ? "gray.50" : "gray.600"}
              userSelect={"none"}
            >
              <Grid gridTemplateColumns="repeat(3, 1fr)" gap={3} w="100%">
                <Grid
                  gridTemplateColumns={"repeat(1, 1fr)"}
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text
                    mb="8px"
                    fontWeight={"bold"}
                    color={subsectionTitleColor}
                  >
                    Active?
                  </Text>
                  {user?.is_active ? (
                    <FcApproval />
                  ) : (
                    <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                      <AiFillCloseCircle />
                    </Box>
                  )}
                </Grid>

                <Grid
                  gridTemplateColumns={"repeat(1, 1fr)"}
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text
                    mb="8px"
                    fontWeight={"bold"}
                    color={subsectionTitleColor}
                  >
                    Staff?
                  </Text>
                  {user?.is_staff ? (
                    <FcApproval />
                  ) : (
                    <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                      <AiFillCloseCircle />
                    </Box>
                  )}
                </Grid>

                <Grid
                  gridTemplateColumns={"repeat(1, 1fr)"}
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text
                    mb="8px"
                    fontWeight={"bold"}
                    color={subsectionTitleColor}
                  >
                    Admin?
                  </Text>
                  {user?.is_superuser ? (
                    <FcApproval />
                  ) : (
                    <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                      <AiFillCloseCircle />
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Flex>
          </Flex>
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            mb={4}
            flexDir={"column"}
            mt={2}
          >
            <Flex mb={3}>
              <Text
                color={sectionTitleColor}
                userSelect={"none"}
                fontSize={"sm"}
                mr={2}
              >
                <b>Caretaker</b>
              </Text>
            </Flex>
            {user?.caretakers && user.caretakers.length > 0 && (
              <Flex
                justifyContent={"space-between"}
                mb={4}
                alignItems={"center"}
              >
                <Box display={"flex"} alignItems={"center"} gap={2}>
                  <Avatar
                    size="md"
                    name={`${user?.caretakers[0]?.display_first_name} ${user?.caretakers[0]?.display_last_name}`}
                    src={
                      user?.caretakers[0]?.image
                        ? user?.caretakers[0]?.image?.startsWith("http")
                          ? `${user?.caretakers[0]?.image}`
                          : `${baseAPI}${user?.caretakers[0]?.image}`
                        : noImage
                    }
                  />
                  <Box display={"flex"} flexDir={"column"}>
                    <Text
                      fontSize={"md"}
                      fontWeight={"semibold"}
                      color={colorMode === "light" ? "gray.800" : "gray.200"}
                    >
                      {`${user?.caretakers[0]?.display_first_name} ${
                        user?.caretakers[0]?.display_last_name
                      }`}
                    </Text>
                  </Box>
                </Box>
              </Flex>
            )}

            {me?.userData?.is_superuser && (
              <Flex mb={3} gap={4} w={"100%"} justifyContent={"space-between"}>
                <Button
                  w={"100%"}
                  onClick={onOpenSetCaretakerAdminModal}
                  bg={colorMode === "light" ? "green.600" : "green.700"}
                  color={
                    colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                  }
                  _hover={{
                    bg: colorMode === "light" ? "green.500" : "green.600",
                  }}
                  isDisabled={user?.caretakers && user.caretakers.length > 0}
                >
                  Set a Caretaker
                </Button>
                <Button
                  w={"100%"}
                  onClick={onOpenRemoveCaretakerAdminModal}
                  bg={colorMode === "light" ? "red.600" : "red.700"}
                  color={
                    colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                  }
                  _hover={{
                    bg: colorMode === "light" ? "red.500" : "red.600",
                  }}
                  isDisabled={user?.caretakers && user.caretakers.length === 0}
                >
                  Remove Caretaker
                </Button>
              </Flex>
            )}
          </Flex>
          {me.userData.is_superuser && (
            <Flex
              border={"1px solid"}
              rounded={"xl"}
              borderColor={borderColor}
              padding={4}
              mb={4}
              flexDir={"column"}
              mt={2}
            >
              <Flex pb={1}>
                <Text
                  fontWeight={"bold"}
                  fontSize={"sm"}
                  mb={1}
                  color={sectionTitleColor}
                  userSelect={"none"}
                >
                  Admin
                </Text>
              </Flex>
              <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={4}>
                <Button
                  onClick={
                    user.email === me.userData.email
                      ? () => {
                          navigate("/users/me");
                        }
                      : onEditUserDetailsModalOpen
                  }
                  bg={user?.is_superuser ? "blue.600" : "blue.500"}
                  color={
                    colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? user?.is_superuser
                          ? "blue.500"
                          : "blue.400"
                        : user?.is_superuser
                          ? "blue.500"
                          : "blue.400",
                    color: "white",
                  }}
                  isDisabled={
                    user.email === me.userData.email &&
                    currentPage === "/users/me"
                  }
                >
                  Edit Details
                </Button>
                <Button
                  onClick={() => {
                    setVariablesForPromoteModalAndOpen(user?.is_superuser);
                  }}
                  bg={
                    colorMode === "light"
                      ? user?.is_superuser
                        ? "red.600"
                        : "green.600"
                      : user?.is_superuser
                        ? "red.800"
                        : "green.500"
                  }
                  color={
                    colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? user?.is_superuser
                          ? "red.500"
                          : "green.500"
                        : user?.is_superuser
                          ? "red.700"
                          : "green.400",
                    color: "white",
                  }}
                  isDisabled={
                    !user?.is_staff || user.email === me.userData.email
                  }
                >
                  {user.is_superuser ? "Demote" : "Promote"}
                </Button>
                <Button
                  onClick={onDeactivateModalOpen}
                  bg={colorMode === "light" ? "orange.600" : "orange.700"}
                  color={
                    colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                  }
                  _hover={{
                    bg: colorMode === "light" ? "orange.500" : "orange.600",
                  }}
                  isDisabled={
                    user.is_superuser || user.email === me.userData.email
                  }
                >
                  {user?.is_active ? "Deactivate" : "Reactivate"}
                </Button>
                <Button
                  onClick={onDeleteModalOpen}
                  bg={colorMode === "light" ? "red.600" : "red.700"}
                  color={
                    colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                  }
                  _hover={{
                    bg: colorMode === "light" ? "red.500" : "red.600",
                  }}
                  isDisabled={
                    user.is_superuser || user.email === me.userData.email
                  }
                >
                  Delete
                </Button>
              </Grid>
            </Flex>
          )}
        </Box>
      </Flex>
    </>
  );
};
