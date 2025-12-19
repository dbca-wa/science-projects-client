// The drawer content that pops out when clicking on a user grid item

import { BecomeCaretakerModal } from "@/features/users/components/modals/BecomeCaretakerModal";
import { CancelCaretakerRequestModal } from "@/features/users/components/modals/CancelCaretakerRequestModal";
import { CaretakerModeConfirmModal } from "@/features/users/components/modals/CaretakerModeConfirmModal";
import { RemoveCaretakerModal } from "@/features/users/components/modals/RemoveCaretakerModal";
import { SetCaretakerAdminModal } from "@/features/users/components/modals/SetCaretakerAdminModal";
import { SetCaretakerForMyAccountModal } from "@/features/users/components/modals/SetCaretakerForMyAccountModal";
import { DeactivateUserModal } from "@/features/users/components/modals/DeactivateUserModal";
import { RequestMergeUserModal } from "@/features/users/components/modals/RequestMergeUserModal";
import useApiEndpoint from "@/shared/hooks/useApiEndpoint";
import { useNoImage } from "@/shared/hooks/useNoImage";
import { useCheckExistingCaretaker } from "@/features/users/hooks/useCheckExistingCaretaker";
import { useInvolvedProjects } from "@/features/projects/hooks/useInvolvedProjects";
import { useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { FcApproval } from "react-icons/fc";
import { FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useCopyText } from "@/shared/hooks/useCopyText";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";
import { useUpdatePage } from "@/shared/hooks/useUpdatePage";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import { useUser } from "@/features/users/hooks/useUser";
import type { IBranch, IBusinessArea } from "@/shared/types";
import { AddUserToProjectModal } from "@/features/projects/components/modals/AddUserToProjectModal";
import { DeleteUserModal } from "@/features/users/components/modals/DeleteUserModal";
import { EditUserDetailsModal } from "@/features/users/components/modals/EditUserDetailsModal";
import { PromoteUserModal } from "@/features/users/components/modals/PromoteUserModal";
import { UserProjectsDataTable } from "@/features/dashboard/components/UserProjectsDataTable";
import { useColorMode } from "@chakra-ui/react/color-mode";
import { Center } from "@chakra-ui/react/center";
import { Spinner } from "@chakra-ui/react/spinner";
import { Flex } from "@chakra-ui/react/flex";
import { Avatar } from "@radix-ui/react-avatar";
import { cn } from "@/shared/utils";
import { Button } from "@chakra-ui/react/button";
import { Grid } from "@chakra-ui/react/grid";
import { Spacer } from "@chakra-ui/react/spacer";
import { Image } from "@chakra-ui/react/image";
import { Tooltip } from "@chakra-ui/react/tooltip";

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
          parent?.insertBefore(element.firstChild, element);
        }
        parent?.removeChild(element);
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
    isOpen: cancelModalIsOpen,
    onOpen: onCancelModalOpen,
    onClose: onCancelModalClose,
  } = useDisclosure();

  const {
    isOpen: cancelBecomeModalIsOpen,
    onOpen: onOpenCancelBecomeModal,
    onClose: onCancelBecomeModalClose,
  } = useDisclosure();

  const {
    isOpen: isSetCaretakerMyModalOpen,
    onOpen: onOpenSetCaretakerMyModal,
    onClose: onCloseSetCaretakerMyModal,
  } = useDisclosure();

  const {
    isOpen: isBecomeCaretakerModalOpen,
    onOpen: onOpenBecomeCaretakerModal,
    onClose: onCloseBecomeCaretakerModal,
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

  const { caretakerData, caretakerDataLoading, refetchCaretakerData } =
    useCheckExistingCaretaker();

  // useEffect(() => {
  //   if (!caretakerDataLoading) console.log(caretakerData);
  //   console.log(user);
  // }, [caretakerData, caretakerDataLoading, user]);

  const viewingUserIsAccount = me?.userData?.pk === user?.pk;
  const viewingUserIsSuper = me?.userData?.is_superuser;
  const accountIsStaff = user?.is_staff;
  const accountIsSuper = user?.is_superuser;
  const accountHasCaretakers = user?.caretakers?.length > 0;
  const caretakerIsMe = user?.caretakers?.[0]?.pk === me?.userData?.pk;
  const caretakeeIsMe = user?.caretaking_for?.[0]?.pk === me?.userData?.pk;
  const accountIsCaretaking = user?.caretaking_for?.length > 0;

  return loading || !user || pk === undefined || caretakerDataLoading ? (
    <Center w={"100%"} h={"100%"}>
      <Spinner size={"xl"} />
    </Center>
  ) : (
    <>
      {(viewingUserIsSuper || viewingUserIsAccount || caretakerIsMe) && (
        <>
          {viewingUserIsAccount && (
            <SetCaretakerForMyAccountModal
              isOpen={isSetCaretakerMyModalOpen}
              onClose={onCloseSetCaretakerMyModal}
              userIsSuper={userInQuestionIsSuperuser}
              userPk={user?.pk}
              userData={user}
              refetch={() => {
                refetch();
                refetchCaretakerData();
              }}
            />
          )}
        </>
      )}

      {/* {caretakeeIsMe && (
        <RemoveCaretakerModal
          isOpen={isRemoveCaretakerAdminModalOpen}
          onClose={onCloseRemoveCaretakerAdminModal}
          caretakerObject={{
            id: caretakerData?.caretaker_object?.id,
            user: user?.pk,
            caretaker: {
              pk: user?.caretaker_for?.[0]?.pk || null,
              display_first_name: user?.display_first_name || "",
              display_last_name: user?.display_last_name || "",
              image: user?.caretaker_for?.[0]?.image || null,
            },
            reason: "leave",
            notes: "",
            end_date: user?.caretaker_for?.[0]?.end_date || null,
          }}
          refetch={() => {
            refetch();
            refetchCaretakerData();
          }}
        />
      )} */}

      {/* <RemoveCaretakerModal
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
            refetch={() => {
              refetch();
              refetchCaretakerData();
            }}
          /> */}

      {viewingUserIsSuper && (
        <>
          <SetCaretakerAdminModal
            isOpen={isSetCaretakerAdminModalOpen}
            onClose={onCloseSetCaretakerAdminModal}
            userIsSuper={userInQuestionIsSuperuser}
            userPk={user?.pk}
            userData={user}
            refetch={() => {
              refetch();
              refetchCaretakerData();
            }}
          />
          <DeleteUserModal
            isOpen={isDeleteModalOpen}
            onClose={onDeleteModalClose}
            userIsSuper={userInQuestionIsSuperuser}
            userPk={user?.pk}
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
            userPk={user?.pk}
            userIsSuper={userInQuestionIsSuperuser}
            userIsExternal={!user.is_staff}
          />
        </>
      )}

      <BecomeCaretakerModal
        isOpen={isBecomeCaretakerModalOpen}
        onClose={onCloseBecomeCaretakerModal}
        myPk={me?.userData?.pk}
        user={user}
        refetch={() => {
          refetch();
          refetchCaretakerData();
        }}
      />

      <AddUserToProjectModal
        isOpen={isAddToProjectModalOpen}
        onClose={onAddToProjectModalClose}
        preselectedUser={pk}
      />

      {!viewingUserIsAccount && (
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
            refetch={() => {
              refetch();
              refetchCaretakerData();
            }}
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
            draggable="false"
            className="pointer-events-none"
          />

          <Flex
            flexDir={"column"}
            flex={1}
            justifyContent={"center"}
            ml={4}
            overflow={"auto"}
          >
            <p className={cn("font-bold select-none")}>
              {!user?.display_first_name?.startsWith("None")
                ? `${user?.display_first_name ?? user?.first_name} ${user?.display_last_name ?? user?.last_name}`
                : `${user?.username}`}
            </p>
            <p className={cn("select-none")}>
              {user?.phone ? user.phone : "No Phone number"}
            </p>
            <Flex>
              <p className={cn("select-none")}>
                {user?.email?.startsWith("unset") ? "No Email" : user?.email}
              </p>
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
            !viewingUserIsAccount ? "repeat(2, 1fr)" : "repeat(2, 1fr)"
          }
          gridGap={4}
          mt={4}
          pt={2}
          pb={4}
        >
          {!accountIsStaff && (
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
          {accountIsStaff && (
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
            {accountIsStaff && (
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
                  className="pointer-events-none select-none"
                />
                <Center>
                  <Flex ml={3} flexDir="column">
                    <p
                      className={cn("font-bold", `text-[${sectionTitleColor}]`)}
                    >
                      {user.agency !== null
                        ? user.agency.name
                        : "agency returning none"}
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        colorMode === "light"
                          ? "text-gray-600"
                          : "text-gray-400",
                      )}
                    >
                      {user.branch !== null
                        ? `${user.branch.name} Branch`
                        : "Branch not set"}
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        colorMode === "light"
                          ? "text-blue-600"
                          : "text-gray-400",
                      )}
                    >
                      {user?.business_area?.name ? (
                        <>
                          <span>
                            {user?.business_area?.leader?.pk === user?.pk
                              ? "Business Area Leader, "
                              : ``}
                          </span>
                          <span
                          // onClick={() => console.log(user)}
                          // style={{ color: "blue.500" }}
                          >
                            {user.business_area.name}
                          </span>
                        </>
                      ) : (
                        "Business Area not set"
                      )}
                    </p>
                  </Flex>
                </Center>
              </Flex>
            )}
            {!accountIsStaff && (
              <p
                className={cn()}
                color={colorMode === "light" ? "gray.600" : "gray.300"}
              >
                <b>External User</b> - This user does not belong to DBCA
              </p>
            )}
          </Flex>
        </Flex>

        <div className={"mt-2"}>
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
              <p
                className={cn("mb-1 text-sm font-bold select-none")}
                color={sectionTitleColor}
              >
                About
              </p>
            </Flex>
            <div
              className="mt-1"
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

            {/* <p className={
            cn()}>
              {user.about
                ? user.about
                : "This user has not filled in this section."}
            </p> */}
            <Flex mt={4}>
              <p
                className={cn(
                  "mb-1 text-sm font-bold select-none",
                  `text-[${sectionTitleColor}]`,
                )}
              >
                Expertise
              </p>
            </Flex>
            <div
              className="mt-1"
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

            {/* <p className={
            cn()}>
              {user?.expertise
                ? user.expertise
                : "This user has not filled in this section."}
            </p> */}
          </Flex>

          <Spacer />

          {!userProjectsLoading && userProjectsData?.length > 0 && (
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
                <p
                  className={cn(
                    "mb-1 text-sm font-bold select-none",
                    `text-[${sectionTitleColor}]`,
                  )}
                >
                  Involved Projects
                </p>
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
          )}

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
            <Flex mb={3}>
              <p
                className={cn(
                  "mr-2 text-sm select-none",
                  `text-[${sectionTitleColor}]`,
                )}
              >
                <b>Caretaker and Merging</b>
              </p>
            </Flex>

            <Flex flexDir={"column"} gap={2}>
              <p
                className={cn(
                  "text-sm select-none",
                  `text-${subsectionTitleColor}`,
                  accountHasCaretakers ? "mb-3" : "mb-2",
                )}
              >
                <b>Caretaker</b>
              </p>
              {accountHasCaretakers ? (
                <div>
                  <Flex
                    justifyContent={"space-between"}
                    mb={4}
                    alignItems={"center"}
                  >
                    <div className="flex items-center gap-2">
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
                        className="pointer-events-none select-none"
                      />
                      <div className="flex flex-col">
                        <p
                          className={cn(
                            "font-bold",
                            colorMode === "light"
                              ? "text-gray-800"
                              : "text-gray-200",
                          )}
                        >
                          {`${user?.caretakers[0]?.display_first_name} ${
                            user?.caretakers[0]?.display_last_name
                          }`}
                        </p>
                      </div>
                    </div>
                    {(viewingUserIsAccount ||
                      caretakerIsMe ||
                      viewingUserIsSuper) && (
                      <div>
                        <Button
                          bg={colorMode === "light" ? "red.600" : "red.700"}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.900"
                          }
                          _hover={{
                            bg: colorMode === "light" ? "red.500" : "red.600",
                          }}
                          onClick={onOpenRemoveCaretakerAdminModal}
                        >
                          Remove Caretaker
                        </Button>
                      </div>
                    )}
                  </Flex>
                </div>
              ) : (
                <>
                  {caretakerData?.caretaker_request_object?.status &&
                    caretakerData?.caretaker_request_object?.status ===
                      "pending" && (
                      <CancelCaretakerRequestModal
                        isOpen={cancelModalIsOpen}
                        onClose={onCancelModalClose}
                        refresh={() => {
                          refetch();
                          refetchCaretakerData();
                        }}
                        taskPk={caretakerData?.caretaker_request_object?.id}
                      />
                    )}

                  {caretakerData?.become_caretaker_request_object?.status &&
                    caretakerData?.become_caretaker_request_object?.status ===
                      "pending" && (
                      <CancelCaretakerRequestModal
                        isOpen={cancelBecomeModalIsOpen}
                        onClose={onCancelBecomeModalClose}
                        refresh={() => {
                          refetch();
                          refetchCaretakerData();
                        }}
                        taskPk={
                          caretakerData?.become_caretaker_request_object?.id
                        }
                      />
                    )}
                  <Flex
                    justifyContent={"space-between"}
                    mb={0}
                    alignItems={"center"}
                  >
                    <p className={cn()}>
                      {caretakerData?.caretaker_request_object?.status &&
                      caretakerData?.caretaker_request_object?.status ===
                        "pending"
                        ? caretakerData?.caretaker_request_object?.primary_user
                            ?.pk === me?.userData?.pk
                          ? `You have requested that this user be your caretaker`
                          : `A Caretaker request has been made (${caretakerData?.caretaker_request_object?.secondary_users[0]?.display_first_name} ${caretakerData?.caretaker_request_object?.secondary_users[0]?.display_last_name})`
                        : viewingUserIsAccount
                          ? "You have not set a caretaker."
                          : "No caretaker has been set for this user."}
                    </p>
                    {!accountHasCaretakers && viewingUserIsAccount && (
                      <Button
                        // w={"100%"}
                        onClick={
                          caretakerData?.caretaker_request_object?.status &&
                          caretakerData?.caretaker_request_object?.status ===
                            "pending"
                            ? onCancelModalOpen
                            : viewingUserIsSuper
                              ? onOpenSetCaretakerAdminModal
                              : onOpenSetCaretakerMyModal
                        }
                        bg={
                          caretakerData?.caretaker_request_object?.status &&
                          caretakerData?.caretaker_request_object?.status ===
                            "pending"
                            ? colorMode === "light"
                              ? `gray.500`
                              : `gray.500`
                            : colorMode === "light"
                              ? `green.600`
                              : `green.700`
                        }
                        color={
                          colorMode === "light"
                            ? "whiteAlpha.900"
                            : "whiteAlpha.900"
                        }
                        _hover={{
                          bg:
                            caretakerData?.caretaker_request_object?.status &&
                            caretakerData?.caretaker_request_object?.status ===
                              "pending"
                              ? colorMode === "light"
                                ? `gray.400`
                                : `gray.400`
                              : colorMode === "light"
                                ? `green.500`
                                : `green.600`,
                        }}
                        isDisabled={
                          user?.caretakers && user.caretakers.length > 0
                        }
                      >
                        {caretakerData?.caretaker_request_object?.status &&
                        caretakerData?.caretaker_request_object?.status ===
                          "pending"
                          ? "Cancel Request"
                          : viewingUserIsSuper
                            ? "Set Caretaker"
                            : "Request Caretaker"}
                      </Button>
                    )}
                  </Flex>

                  {accountHasCaretakers && accountIsStaff ? (
                    <>
                      <p
                        className={cn(
                          "text-sm text-balance",
                          colorMode === "light"
                            ? "text-gray-500"
                            : "text-gray-400",
                        )}
                      >
                        To set or become caretaker, visit your profile and
                        remove your current caretaker.
                      </p>

                      {/* <Flex w={"100%"} justifyContent={"space-between"} pr={2}>
                        {" "}
                        <p className={
                        cn()}>Click here to remove your caretaker</p>
                        <p className={
                        cn()}
                          color={
                            colorMode === "light" ? "blue.500" : "blue.400"
                          }
                          fontWeight={"semibold"}
                          onClick={}
                        >
                          Remove
                        </p>
                      </Flex> */}
                    </>
                  ) : (
                    !viewingUserIsAccount &&
                    accountIsStaff && (
                      <>
                        <BecomeCaretakerModal
                          isOpen={isSetCaretakerAdminModalOpen}
                          onClose={onCloseSetCaretakerAdminModal}
                          myPk={me?.userData?.pk}
                          user={user}
                          refetch={() => {
                            refetch();
                            refetchCaretakerData();
                          }}
                        />
                        <Flex
                          justifyContent={"space-between"}
                          alignItems={"center"}
                          mb={0}
                        >
                          {caretakerData?.become_caretaker_request_object
                            ?.secondary_users[0]?.pk === me?.userData?.pk && (
                            <p
                              className={cn(
                                "text-sm text-balance",
                                colorMode === "light"
                                  ? "text-gray-500"
                                  : "text-gray-400",
                              )}
                            >
                              Your request has been made to become this user's
                              caretaker
                            </p>
                          )}

                          <Button
                            mt={2}
                            w={
                              caretakerData?.become_caretaker_request_object
                                ?.secondary_users[0]?.pk === me?.userData?.pk
                                ? undefined
                                : "100%"
                            }
                            onClick={
                              caretakerData?.become_caretaker_request_object
                                ?.status === "pending" &&
                              caretakerData?.become_caretaker_request_object
                                ?.secondary_users[0]?.pk === me?.userData?.pk
                                ? onOpenCancelBecomeModal
                                : onOpenBecomeCaretakerModal
                            }
                            bg={
                              caretakerData?.become_caretaker_request_object
                                ?.status === "pending" &&
                              caretakerData?.become_caretaker_request_object
                                ?.secondary_users[0]?.pk === me?.userData?.pk
                                ? colorMode === "light"
                                  ? "red.500"
                                  : "red.600"
                                : colorMode === "light"
                                  ? "green.600"
                                  : "green.700"
                            }
                            color={
                              colorMode === "light"
                                ? "whiteAlpha.900"
                                : "whiteAlpha.900"
                            }
                            _hover={{
                              bg:
                                caretakerData?.become_caretaker_request_object
                                  ?.status === "pending" &&
                                caretakerData?.become_caretaker_request_object
                                  ?.secondary_users[0]?.pk === me?.userData?.pk
                                  ? colorMode === "light"
                                    ? "red.400"
                                    : "red.500"
                                  : colorMode === "light"
                                    ? "green.500"
                                    : "green.600",
                            }}
                            isDisabled={
                              accountHasCaretakers ||
                              caretakerData?.caretaker_request_object
                                ?.primary_user?.pk === me?.userData?.pk ||
                              caretakerData?.caretaker_object?.caretaker?.pk ===
                                user?.pk
                              //     ||
                              //     caretakerData?.become_caretaker_request_object
                              //   ?.status === "pending" &&
                              // caretakerData?.become_caretaker_request_object
                              //   ?.secondary_users[0]?.pk === me?.userData?.pk
                            }
                          >
                            {/* {
                            caretakerData?.caretaker_request_object
                              ?.secondary_users[0]?.display_first_name
                          } */}
                            {caretakerData?.become_caretaker_request_object
                              ?.status === "pending" &&
                            caretakerData?.become_caretaker_request_object
                              ?.secondary_users[0]?.pk === me?.userData?.pk
                              ? "Cancel Request"
                              : "Become Caretaker"}
                          </Button>
                        </Flex>
                      </>
                    )
                  )}
                </>
              )}

              {viewingUserIsSuper && accountIsStaff && (
                <Flex
                  mb={0}
                  gap={4}
                  w={"100%"}
                  justifyContent={"space-between"}
                >
                  {user?.caretakers && user.caretakers.length > 0 && (
                    <Button
                      w={"100%"}
                      onClick={onOpenRemoveCaretakerAdminModal}
                      bg={colorMode === "light" ? "red.600" : "red.700"}
                      color={
                        colorMode === "light"
                          ? "whiteAlpha.900"
                          : "whiteAlpha.900"
                      }
                      _hover={{
                        bg: colorMode === "light" ? "red.500" : "red.600",
                      }}
                      isDisabled={accountHasCaretakers ? false : true}
                    >
                      Remove Caretaker
                    </Button>
                  )}
                </Flex>
              )}

              {/* {accountIsCaretaking && ( */}
              <div className={"mt-2"}>
                <p
                  className={cn(
                    "text-sm select-none",
                    `text-[${subsectionTitleColor}]`,
                    accountIsCaretaking ? "mb-3" : "mb-1",
                  )}
                >
                  <b>Caretaking For</b>
                </p>
                {accountIsCaretaking ? (
                  <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={4}>
                    {user?.caretaking_for?.map((obj) => (
                      <Tooltip
                        key={obj?.pk}
                        label={`This user has authority to act on ${obj.display_first_name} ${obj.display_last_name}'s behalf`}
                      >
                        {viewingUserIsAccount ||
                          viewingUserIsSuper ||
                          caretakeeIsMe ||
                          (caretakerIsMe && (
                            <RemoveCaretakerModal
                              isOpen={isRemoveCaretakerAdminModalOpen}
                              onClose={onCloseRemoveCaretakerAdminModal}
                              caretakerObject={{
                                id: obj?.caretaker_obj_id,
                                user: obj?.pk,
                                caretaker: {
                                  pk: user?.pk || null,
                                  display_first_name:
                                    user?.display_first_name || "",
                                  display_last_name:
                                    user?.display_last_name || "",
                                  image: user?.image || null,
                                },
                                reason: "leave",
                                notes: "",
                                end_date: null,
                              }}
                              refetch={() => {
                                refetch();
                                refetchCaretakerData();
                              }}
                            />
                          ))}

                        <Flex
                          key={obj?.pk}
                          bg={colorMode === "light" ? "gray.50" : "gray.600"}
                          p={2}
                          rounded={"xl"}
                          alignItems={"center"}
                          justifyContent={"space-between"}
                        >
                          <Flex alignItems={"center"}>
                            <Avatar
                              size="sm"
                              className="pointer-events-none select-none"
                              name={`${obj.display_first_name} ${obj.display_last_name}`}
                              src={
                                obj.image
                                  ? obj.image.startsWith("http")
                                    ? `${obj.image}`
                                    : `${baseAPI}${obj.image}`
                                  : noImage
                              }
                            />
                            <p className={cn("ml-2")}>
                              {obj.display_first_name} {obj.display_last_name}
                            </p>
                          </Flex>
                          {(viewingUserIsAccount ||
                            viewingUserIsSuper ||
                            caretakerIsMe ||
                            caretakeeIsMe) && (
                            <Button
                              variant={"ghost"}
                              color={"white"}
                              background={
                                colorMode === "light" ? "red.500" : "red.600"
                              }
                              _hover={{
                                background:
                                  colorMode === "light" ? "red.400" : "red.500",
                              }}
                              onClick={onOpenRemoveCaretakerAdminModal}
                            >
                              Remove
                            </Button>
                          )}
                        </Flex>
                      </Tooltip>
                    ))}
                  </Grid>
                ) : (
                  <p className={cn()}>
                    {viewingUserIsAccount
                      ? "You are not caretaking for anyone."
                      : "This user is not caretaking for anyone."}
                  </p>
                )}
              </div>
              {/* )} */}

              {!viewingUserIsAccount && (
                <>
                  {accountIsStaff &&
                    (caretakerData?.caretaker_request_object?.status ===
                      "pending" &&
                    caretakerData?.caretaker_request_object?.secondary_users[0]
                      ?.pk === user?.pk ? (
                      <Flex
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        my={2}
                      >
                        <p
                          className={cn(
                            "text-sm text-balance",
                            colorMode === "light"
                              ? "text-gray-500"
                              : "text-gray-400",
                          )}
                        >
                          Your request has been made to set this user as your
                          caretaker
                        </p>
                        <Button
                          bg={colorMode === "light" ? "red.600" : "red.700"}
                          color={
                            colorMode === "light"
                              ? "whiteAlpha.900"
                              : "whiteAlpha.900"
                          }
                          _hover={{
                            bg: colorMode === "light" ? "red.500" : "red.600",
                          }}
                          onClick={onCancelModalOpen}
                        >
                          Cancel Request
                        </Button>
                      </Flex>
                    ) : (
                      <Button
                        bg={colorMode === "light" ? "red.500" : "red.400"}
                        color={
                          colorMode === "light"
                            ? "whiteAlpha.900"
                            : "whiteAlpha.900"
                        }
                        onClick={onRequestCaretakerModalOpen}
                        _hover={{
                          bg: colorMode === "light" ? "red.400" : "red.300",
                          color: "white",
                        }}
                        isDisabled={
                          // accountHasCaretakers &&
                          caretakerIsMe ||
                          // accountIsCaretaking ||
                          viewingUserIsAccount ||
                          (caretakerData?.caretaker_request_object?.status ===
                            "pending" &&
                            caretakerData?.caretaker_request_object
                              ?.secondary_users[0]?.pk === me?.userData?.pk) ||
                          // If user already has an open request elsewhere
                          (caretakerData?.become_caretaker_request_object
                            ?.status === "pending" &&
                            caretakerData?.become_caretaker_request_object
                              ?.secondary_users[0]?.pk === me?.userData?.pk) ||
                          // If user is already being cared for by this user (check if user pk is in caretaking_for)
                          user?.caretaking_for?.some(
                            (obj) => obj?.pk === me?.userData?.pk,
                          ) ||
                          // If user already has a caretaker set
                          me?.userData?.caretakers?.length > 0
                        }
                      >
                        Set as Caretaker
                      </Button>
                    ))}

                  <Button
                    bg={colorMode === "light" ? "red.500" : "red.400"}
                    color={
                      colorMode === "light"
                        ? "whiteAlpha.900"
                        : "whiteAlpha.900"
                    }
                    onClick={onMergeUserModalOpen}
                    _hover={{
                      bg: colorMode === "light" ? "red.400" : "red.300",
                      color: "white",
                    }}
                    isDisabled={user.email === me.userData.email}
                  >
                    Merge with My Account
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
          {viewingUserIsSuper && (
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
                <p
                  className={cn(
                    "mb-1 text-sm font-bold select-none",
                    `text-[${subsectionTitleColor}]`,
                  )}
                >
                  Admin
                </p>
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
                  bg={accountIsSuper ? "blue.600" : "blue.500"}
                  color={
                    colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? accountIsSuper
                          ? "blue.500"
                          : "blue.400"
                        : accountIsSuper
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
                    setVariablesForPromoteModalAndOpen(accountIsSuper);
                  }}
                  bg={
                    colorMode === "light"
                      ? accountIsSuper
                        ? "red.600"
                        : "green.600"
                      : accountIsSuper
                        ? "red.800"
                        : "green.500"
                  }
                  color={
                    colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"
                  }
                  _hover={{
                    bg:
                      colorMode === "light"
                        ? accountIsSuper
                          ? "red.500"
                          : "green.500"
                        : accountIsSuper
                          ? "red.700"
                          : "green.400",
                    color: "white",
                  }}
                  isDisabled={
                    !accountIsStaff || user.email === me.userData.email
                  }
                >
                  {accountIsSuper ? "Demote" : "Promote"}
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
                    accountIsSuper || user.email === me.userData.email
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
                  _hover={{ bg: colorMode === "light" ? "red.500" : "red.600" }}
                  isDisabled={
                    accountIsSuper || user.email === me.userData.email
                  }
                >
                  Delete
                </Button>
              </Grid>
            </Flex>
          )}

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
              <p
                className={cn(
                  "mb-1 text-sm font-bold select-none",
                  `text-[${subsectionTitleColor}]`,
                )}
              >
                Details
              </p>
            </Flex>

            <Flex>
              {/* <p className={
              cn()} color={subsectionTitleColor}
                                    userSelect={"none"}
                                    fontSize={"sm"}
                                ><b>Role: </b></p><p className={
                                cn()} >{user?.role ? user.role : "This user has not filled in their 'role' section."}</p> */}
              <p
                className={cn(
                  "text-sm select-none",
                  `text-[${subsectionTitleColor}]`,
                )}
              >
                <b>Joined&nbsp;</b>
              </p>{" "}
              <p className={cn("text-sm")}>{`${formatted_date}`}</p>
            </Flex>
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
                  <p
                    className={cn(
                      "mb-2 font-bold",
                      `text-[${subsectionTitleColor}]`,
                    )}
                  >
                    Active?
                  </p>
                  {user?.is_active ? (
                    <FcApproval />
                  ) : (
                    <div
                      className={
                        colorMode === "light" ? "text-red-500" : "text-red-600"
                      }
                    >
                      <AiFillCloseCircle />
                    </div>
                  )}
                </Grid>

                <Grid
                  gridTemplateColumns={"repeat(1, 1fr)"}
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                >
                  <p
                    className={cn(
                      "mb-2 font-bold",
                      `text-[${subsectionTitleColor}]`,
                    )}
                  >
                    Staff?
                  </p>
                  {accountIsStaff ? (
                    <FcApproval />
                  ) : (
                    <div
                      className={cn(
                        colorMode === "light" ? "text-red-500" : "text-red-600",
                      )}
                    >
                      <AiFillCloseCircle />
                    </div>
                  )}
                </Grid>

                <Grid
                  gridTemplateColumns={"repeat(1, 1fr)"}
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                >
                  <p
                    className={cn(
                      "mb-2 font-bold",
                      `text-[${subsectionTitleColor}]`,
                    )}
                  >
                    Admin?
                  </p>
                  {accountIsSuper ? (
                    <FcApproval />
                  ) : (
                    <div
                      className={cn(
                        colorMode === "light" ? "text-red-500" : "text-red-600",
                      )}
                      color={colorMode === "light" ? "red.500" : "red.600"}
                    >
                      <AiFillCloseCircle />
                    </div>
                  )}
                </Grid>
              </Grid>
            </Flex>
          </Flex>
        </div>
      </Flex>
    </>
  );
};
