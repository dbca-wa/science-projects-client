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
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/utils";

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

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const borderColor = isDark ? "border-gray-500" : "border-gray-300";
  const sectionTitleColor = isDark ? "text-gray-300" : "text-gray-600";
  const subsectionTitleColor = "text-gray-500";
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

  // Replace useDisclosure with React state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isAddToProjectModalOpen, setIsAddToProjectModalOpen] = useState(false);
  const [isMergeUserModalOpen, setIsMergeUserModalOpen] = useState(false);
  const [isRequestCaretakerModalOpen, setIsRequestCaretakerModalOpen] = useState(false);
  const [isSetCaretakerAdminModalOpen, setIsSetCaretakerAdminModalOpen] = useState(false);
  const [cancelModalIsOpen, setCancelModalIsOpen] = useState(false);
  const [cancelBecomeModalIsOpen, setCancelBecomeModalIsOpen] = useState(false);
  const [isSetCaretakerMyModalOpen, setIsSetCaretakerMyModalOpen] = useState(false);
  const [isBecomeCaretakerModalOpen, setIsBecomeCaretakerModalOpen] = useState(false);
  const [isRemoveCaretakerAdminModalOpen, setIsRemoveCaretakerAdminModalOpen] = useState(false);
  const [isEditUserDetailsModalOpen, setIsEditUserDetailsModalOpen] = useState(false);

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
    setIsPromoteModalOpen(true);
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
    <div className="flex items-center justify-center w-full h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ) : (
    <>
      {(viewingUserIsSuper || viewingUserIsAccount || caretakerIsMe) && (
        <>
          {viewingUserIsAccount && (
            <SetCaretakerForMyAccountModal
              isOpen={isSetCaretakerMyModalOpen}
              onClose={() => setIsSetCaretakerMyModalOpen(false)}
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
            onClose={() => setIsSetCaretakerAdminModalOpen(false)}
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
            onClose={() => setIsDeleteModalOpen(false)}
            userIsSuper={userInQuestionIsSuperuser}
            userPk={user?.pk}
          />
          <DeactivateUserModal
            isOpen={isDeactivateModalOpen}
            onClose={() => setIsDeactivateModalOpen(false)}
            userIsSuper={userInQuestionIsSuperuser}
            user={user}
          />
          <PromoteUserModal
            isOpen={isPromoteModalOpen}
            onClose={() => setIsPromoteModalOpen(false)}
            userPk={user?.pk}
            userIsSuper={userInQuestionIsSuperuser}
            userIsExternal={!user.is_staff}
          />
        </>
      )}

      <BecomeCaretakerModal
        isOpen={isBecomeCaretakerModalOpen}
        onClose={() => setIsBecomeCaretakerModalOpen(false)}
        myPk={me?.userData?.pk}
        user={user}
        refetch={() => {
          refetch();
          refetchCaretakerData();
        }}
      />

      <AddUserToProjectModal
        isOpen={isAddToProjectModalOpen}
        onClose={() => setIsAddToProjectModalOpen(false)}
        preselectedUser={pk}
      />

      {!viewingUserIsAccount && (
        <>
          <RequestMergeUserModal
            isOpen={isMergeUserModalOpen}
            onClose={() => setIsMergeUserModalOpen(false)}
            primaryUserPk={me?.userData?.pk}
            secondaryUserPks={[user?.pk]}
          />
          <CaretakerModeConfirmModal
            isOpen={isRequestCaretakerModalOpen}
            onClose={() => setIsRequestCaretakerModalOpen(false)}
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
        onClose={() => setIsEditUserDetailsModalOpen(false)}
        user={user}
        branches={branches}
        businessAreas={businessAreas}
      />
      <div className="flex flex-col h-full">
        <div className="flex mt-4">
          <Avatar className="w-20 h-20 select-none pointer-events-none">
            <AvatarImage 
              src={user?.image?.file ? user.image.file : user?.image?.old_file} 
              alt={`${user?.display_first_name} ${user?.display_last_name}`}
            />
            <AvatarFallback>
              {user?.display_first_name?.[0]}{user?.display_last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col flex-1 justify-center ml-4 overflow-auto">
            <p className={cn("font-bold select-none")}>
              {!user?.display_first_name?.startsWith("None")
                ? `${user?.display_first_name ?? user?.first_name} ${user?.display_last_name ?? user?.last_name}`
                : `${user?.username}`}
            </p>
            <p className={cn("select-none")}>
              {user?.phone ? user.phone : "No Phone number"}
            </p>
            <div className="flex">
              <p className={cn("select-none")}>
                {user?.email?.startsWith("unset") ? "No Email" : user?.email}
              </p>
            </div>
            {!user?.email?.startsWith("unset") && (
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "text-white mt-2 px-4 w-fit rounded",
                  isDark ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"
                )}
                onClick={copyEmail}
              >
                <FiCopy className="mr-2 h-4 w-4" />
                Copy Email
              </Button>
            )}
          </div>
        </div>

        <div className={cn(
          "grid gap-4 mt-4 pt-2 pb-4",
          !viewingUserIsAccount ? "grid-cols-2" : "grid-cols-2"
        )}>
          {!accountIsStaff && (
            <Button
              onClick={openEmailAddressedToUser}
              className={cn(
                "text-white",
                isDark ? "bg-blue-400 hover:bg-blue-300" : "bg-blue-500 hover:bg-blue-400"
              )}
              disabled={
                user.email?.startsWith("unset") ||
                me.userData.email === user.email
              }
            >
              Email
            </Button>
          )}
          {accountIsStaff && (
            <Button
              className={cn(
                "text-white",
                isDark ? "bg-blue-400 hover:bg-blue-300" : "bg-blue-500 hover:bg-blue-400"
              )}
              onClick={openEmailAddressedToUser}
            >
              Email
            </Button>
          )}

          <Button
            className={cn(
              "text-white",
              isDark ? "bg-green-400 hover:bg-green-300" : "bg-green-500 hover:bg-green-400"
            )}
            onClick={() => setIsAddToProjectModalOpen(true)}
            disabled={user.email === me.userData.email}
          >
            Add to Project
          </Button>
        </div>

        <div className={cn(
          "border rounded-xl p-4 flex flex-col mt-2",
          borderColor
        )}>
          <div className="flex flex-col select-none">
            {accountIsStaff && (
              <div className="flex h-15">
                <img
                  className="rounded-lg w-15 h-15 object-cover pointer-events-none select-none"
                  src="/dbca.jpg"
                  alt="DBCA Logo"
                />
                <div className="flex items-center">
                  <div className="ml-3 flex flex-col">
                    <p className={cn("font-bold", sectionTitleColor)}>
                      {user.agency !== null
                        ? user.agency.name
                        : "agency returning none"}
                    </p>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>
                      {user.branch !== null
                        ? `${user.branch.name} Branch`
                        : "Branch not set"}
                    </p>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-blue-600"
                    )}>
                      {user?.business_area?.name ? (
                        <>
                          <span>
                            {user?.business_area?.leader?.pk === user?.pk
                              ? "Business Area Leader, "
                              : ``}
                          </span>
                          <span>
                            {user.business_area.name}
                          </span>
                        </>
                      ) : (
                        "Business Area not set"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!accountIsStaff && (
              <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
                <b>External User</b> - This user does not belong to DBCA
              </p>
            )}
          </div>
        </div>

        <div className="mt-2">
          <div className={cn(
            "border rounded-xl p-4 mb-4 flex flex-col mt-2",
            borderColor
          )}>
            <div className="flex">
              <p className={cn("mb-1 text-sm font-bold select-none", sectionTitleColor)}>
                About
              </p>
            </div>
            <div
              className="mt-1"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  isDark
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

            <div className="flex mt-4">
              <p className={cn("mb-1 text-sm font-bold select-none", sectionTitleColor)}>
                Expertise
              </p>
            </div>
            <div
              className="mt-1"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  isDark
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
          </div>

          <div className="flex-1" />

          {!userProjectsLoading && userProjectsData?.length > 0 && (
            <div className={cn(
              "border rounded-xl p-4 mb-4 flex flex-col mt-2",
              borderColor
            )}>
              <div className="flex">
                <p className={cn("mb-1 text-sm font-bold select-none", sectionTitleColor)}>
                  Involved Projects
                </p>
              </div>
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
            </div>
          )}

          <div className="flex-1" />

          <div className={cn(
            "border rounded-xl p-4 mb-4 flex flex-col mt-2",
            borderColor
          )}>
            <div className="flex mb-3">
              <p className={cn("mr-2 text-sm select-none", sectionTitleColor)}>
                <b>Caretaker and Merging</b>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className={cn(
                "text-sm select-none",
                subsectionTitleColor,
                accountHasCaretakers ? "mb-3" : "mb-2"
              )}>
                <b>Caretaker</b>
              </p>
              {accountHasCaretakers ? (
                <div>
                  <div className="flex justify-between mb-4 items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-10 h-10 pointer-events-none select-none">
                        <AvatarImage
                          src={
                            user?.caretakers[0]?.image
                              ? user?.caretakers[0]?.image?.startsWith("http")
                                ? `${user?.caretakers[0]?.image}`
                                : `${baseAPI}${user?.caretakers[0]?.image}`
                              : noImage
                          }
                          alt={`${user?.caretakers[0]?.display_first_name} ${user?.caretakers[0]?.display_last_name}`}
                        />
                        <AvatarFallback>
                          {user?.caretakers[0]?.display_first_name?.[0]}{user?.caretakers[0]?.display_last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className={cn(
                          "font-bold",
                          isDark ? "text-gray-200" : "text-gray-800"
                        )}>
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
                          className={cn(
                            "text-white",
                            isDark ? "bg-red-700 hover:bg-red-600" : "bg-red-600 hover:bg-red-500"
                          )}
                          onClick={() => setIsRemoveCaretakerAdminModalOpen(true)}
                        >
                          Remove Caretaker
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {caretakerData?.caretaker_request_object?.status &&
                    caretakerData?.caretaker_request_object?.status ===
                      "pending" && (
                      <CancelCaretakerRequestModal
                        isOpen={cancelModalIsOpen}
                        onClose={() => setCancelModalIsOpen(false)}
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
                        onClose={() => setCancelBecomeModalIsOpen(false)}
                        refresh={() => {
                          refetch();
                          refetchCaretakerData();
                        }}
                        taskPk={
                          caretakerData?.become_caretaker_request_object?.id
                        }
                      />
                    )}
                  <div className="flex justify-between mb-0 items-center">
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
                        onClick={
                          caretakerData?.caretaker_request_object?.status &&
                          caretakerData?.caretaker_request_object?.status ===
                            "pending"
                            ? () => setCancelModalIsOpen(true)
                            : viewingUserIsSuper
                              ? () => setIsSetCaretakerAdminModalOpen(true)
                              : () => setIsSetCaretakerMyModalOpen(true)
                        }
                        className={cn(
                          "text-white",
                          caretakerData?.caretaker_request_object?.status &&
                          caretakerData?.caretaker_request_object?.status ===
                            "pending"
                            ? "bg-gray-500 hover:bg-gray-400"
                            : isDark
                              ? "bg-green-700 hover:bg-green-600"
                              : "bg-green-600 hover:bg-green-500"
                        )}
                        disabled={
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
                  </div>

                  {accountHasCaretakers && accountIsStaff ? (
                    <>
                      <p className={cn(
                        "text-sm text-balance",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>
                        To set or become caretaker, visit your profile and
                        remove your current caretaker.
                      </p>
                    </>
                  ) : (
                    !viewingUserIsAccount &&
                    accountIsStaff && (
                      <>
                        <BecomeCaretakerModal
                          isOpen={isSetCaretakerAdminModalOpen}
                          onClose={() => setIsSetCaretakerAdminModalOpen(false)}
                          myPk={me?.userData?.pk}
                          user={user}
                          refetch={() => {
                            refetch();
                            refetchCaretakerData();
                          }}
                        />
                        <div className="flex justify-between items-center mb-0">
                          {caretakerData?.become_caretaker_request_object
                            ?.secondary_users[0]?.pk === me?.userData?.pk && (
                            <p className={cn(
                              "text-sm text-balance",
                              isDark ? "text-gray-400" : "text-gray-500"
                            )}>
                              Your request has been made to become this user's
                              caretaker
                            </p>
                          )}

                          <Button
                            className={cn(
                              "mt-2 text-white",
                              caretakerData?.become_caretaker_request_object
                                ?.secondary_users[0]?.pk === me?.userData?.pk
                                ? undefined
                                : "w-full",
                              caretakerData?.become_caretaker_request_object
                                ?.status === "pending" &&
                              caretakerData?.become_caretaker_request_object
                                ?.secondary_users[0]?.pk === me?.userData?.pk
                                ? isDark
                                  ? "bg-red-600 hover:bg-red-500"
                                  : "bg-red-500 hover:bg-red-400"
                                : isDark
                                  ? "bg-green-700 hover:bg-green-600"
                                  : "bg-green-600 hover:bg-green-500"
                            )}
                            onClick={
                              caretakerData?.become_caretaker_request_object
                                ?.status === "pending" &&
                              caretakerData?.become_caretaker_request_object
                                ?.secondary_users[0]?.pk === me?.userData?.pk
                                ? () => setCancelBecomeModalIsOpen(true)
                                : () => setIsBecomeCaretakerModalOpen(true)
                            }
                            disabled={
                              accountHasCaretakers ||
                              caretakerData?.caretaker_request_object
                                ?.primary_user?.pk === me?.userData?.pk ||
                              caretakerData?.caretaker_object?.caretaker?.pk ===
                                user?.pk
                            }
                          >
                            {caretakerData?.become_caretaker_request_object
                              ?.status === "pending" &&
                            caretakerData?.become_caretaker_request_object
                              ?.secondary_users[0]?.pk === me?.userData?.pk
                              ? "Cancel Request"
                              : "Become Caretaker"}
                          </Button>
                        </div>
                      </>
                    )
                  )}
                </>
              )}

              {viewingUserIsSuper && accountIsStaff && (
                <div className="flex mb-0 gap-4 w-full justify-between">
                  {user?.caretakers && user.caretakers.length > 0 && (
                    <Button
                      className={cn(
                        "w-full text-white",
                        isDark ? "bg-red-700 hover:bg-red-600" : "bg-red-600 hover:bg-red-500"
                      )}
                      onClick={() => setIsRemoveCaretakerAdminModalOpen(true)}
                      disabled={accountHasCaretakers ? false : true}
                    >
                      Remove Caretaker
                    </Button>
                  )}
                </div>
              )}

              <div className="mt-2">
                <p className={cn(
                  "text-sm select-none",
                  subsectionTitleColor,
                  accountIsCaretaking ? "mb-3" : "mb-1"
                )}>
                  <b>Caretaking For</b>
                </p>
                {accountIsCaretaking ? (
                  <div className="grid grid-cols-1 gap-4">
                    {user?.caretaking_for?.map((obj) => (
                      <TooltipProvider key={obj?.pk}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              {viewingUserIsAccount ||
                                viewingUserIsSuper ||
                                caretakeeIsMe ||
                                (caretakerIsMe && (
                                  <RemoveCaretakerModal
                                    isOpen={isRemoveCaretakerAdminModalOpen}
                                    onClose={() => setIsRemoveCaretakerAdminModalOpen(false)}
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

                              <div className={cn(
                                "flex p-2 rounded-xl items-center justify-between",
                                isDark ? "bg-gray-600" : "bg-gray-50"
                              )}>
                                <div className="flex items-center">
                                  <Avatar className="w-8 h-8 pointer-events-none select-none">
                                    <AvatarImage
                                      src={
                                        obj.image
                                          ? obj.image.startsWith("http")
                                            ? `${obj.image}`
                                            : `${baseAPI}${obj.image}`
                                          : noImage
                                      }
                                      alt={`${obj.display_first_name} ${obj.display_last_name}`}
                                    />
                                    <AvatarFallback>
                                      {obj.display_first_name?.[0]}{obj.display_last_name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className={cn("ml-2")}>
                                    {obj.display_first_name} {obj.display_last_name}
                                  </p>
                                </div>
                                {(viewingUserIsAccount ||
                                  viewingUserIsSuper ||
                                  caretakerIsMe ||
                                  caretakeeIsMe) && (
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      "text-white",
                                      isDark ? "bg-red-600 hover:bg-red-500" : "bg-red-500 hover:bg-red-400"
                                    )}
                                    onClick={() => setIsRemoveCaretakerAdminModalOpen(true)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This user has authority to act on {obj.display_first_name} {obj.display_last_name}'s behalf</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ) : (
                  <p className={cn()}>
                    {viewingUserIsAccount
                      ? "You are not caretaking for anyone."
                      : "This user is not caretaking for anyone."}
                  </p>
                )}
              </div>

              {!viewingUserIsAccount && (
                <>
                  {accountIsStaff &&
                    (caretakerData?.caretaker_request_object?.status ===
                      "pending" &&
                    caretakerData?.caretaker_request_object?.secondary_users[0]
                      ?.pk === user?.pk ? (
                      <div className="flex justify-between items-center my-2">
                        <p className={cn(
                          "text-sm text-balance",
                          isDark ? "text-gray-400" : "text-gray-500"
                        )}>
                          Your request has been made to set this user as your
                          caretaker
                        </p>
                        <Button
                          className={cn(
                            "text-white",
                            isDark ? "bg-red-700 hover:bg-red-600" : "bg-red-600 hover:bg-red-500"
                          )}
                          onClick={() => setCancelModalIsOpen(true)}
                        >
                          Cancel Request
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className={cn(
                          "text-white",
                          isDark ? "bg-red-400 hover:bg-red-300" : "bg-red-500 hover:bg-red-400"
                        )}
                        onClick={() => setIsRequestCaretakerModalOpen(true)}
                        disabled={
                          caretakerIsMe ||
                          viewingUserIsAccount ||
                          (caretakerData?.caretaker_request_object?.status ===
                            "pending" &&
                            caretakerData?.caretaker_request_object
                              ?.secondary_users[0]?.pk === me?.userData?.pk) ||
                          (caretakerData?.become_caretaker_request_object
                            ?.status === "pending" &&
                            caretakerData?.become_caretaker_request_object
                              ?.secondary_users[0]?.pk === me?.userData?.pk) ||
                          user?.caretaking_for?.some(
                            (obj) => obj?.pk === me?.userData?.pk,
                          ) ||
                          me?.userData?.caretakers?.length > 0
                        }
                      >
                        Set as Caretaker
                      </Button>
                    ))}

                  <Button
                    className={cn(
                      "text-white",
                      isDark ? "bg-red-400 hover:bg-red-300" : "bg-red-500 hover:bg-red-400"
                    )}
                    onClick={() => setIsMergeUserModalOpen(true)}
                    disabled={user.email === me.userData.email}
                  >
                    Merge with My Account
                  </Button>
                </>
              )}
            </div>
          </div>
          {viewingUserIsSuper && (
            <div className={cn(
              "border rounded-xl p-4 mb-4 flex flex-col mt-2",
              borderColor
            )}>
              <div className="flex pb-1">
                <p className={cn("mb-1 text-sm font-bold select-none", subsectionTitleColor)}>
                  Admin
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={
                    user.email === me.userData.email
                      ? () => {
                          navigate("/users/me");
                        }
                      : () => setIsEditUserDetailsModalOpen(true)
                  }
                  className={cn(
                    "text-white",
                    accountIsSuper
                      ? "bg-blue-600 hover:bg-blue-500"
                      : "bg-blue-500 hover:bg-blue-400"
                  )}
                  disabled={
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
                  className={cn(
                    "text-white",
                    accountIsSuper
                      ? isDark
                        ? "bg-red-800 hover:bg-red-700"
                        : "bg-red-600 hover:bg-red-500"
                      : isDark
                        ? "bg-green-500 hover:bg-green-400"
                        : "bg-green-600 hover:bg-green-500"
                  )}
                  disabled={
                    !accountIsStaff || user.email === me.userData.email
                  }
                >
                  {accountIsSuper ? "Demote" : "Promote"}
                </Button>
                <Button
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className={cn(
                    "text-white",
                    isDark ? "bg-orange-700 hover:bg-orange-600" : "bg-orange-600 hover:bg-orange-500"
                  )}
                  disabled={
                    accountIsSuper || user.email === me.userData.email
                  }
                >
                  {user?.is_active ? "Deactivate" : "Reactivate"}
                </Button>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className={cn(
                    "text-white",
                    isDark ? "bg-red-700 hover:bg-red-600" : "bg-red-600 hover:bg-red-500"
                  )}
                  disabled={
                    accountIsSuper || user.email === me.userData.email
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          )}

          <div className={cn(
            "border rounded-xl p-4 mb-4 flex flex-col mt-2",
            borderColor
          )}>
            <div className="flex">
              <p className={cn("mb-1 text-sm font-bold select-none", subsectionTitleColor)}>
                Details
              </p>
            </div>

            <div className="flex">
              <p className={cn("text-sm select-none", subsectionTitleColor)}>
                <b>Joined&nbsp;</b>
              </p>{" "}
              <p className={cn("text-sm")}>{`${formatted_date}`}</p>
            </div>
            <div className={cn(
              "flex mt-4 rounded-xl p-4 select-none",
              isDark ? "bg-gray-600" : "bg-gray-50"
            )}>
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className="grid grid-cols-1 flex flex-col justify-center items-center">
                  <p className={cn("mb-2 font-bold", subsectionTitleColor)}>
                    Active?
                  </p>
                  {user?.is_active ? (
                    <FcApproval />
                  ) : (
                    <div className={isDark ? "text-red-600" : "text-red-500"}>
                      <AiFillCloseCircle />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 flex flex-col justify-center items-center">
                  <p className={cn("mb-2 font-bold", subsectionTitleColor)}>
                    Staff?
                  </p>
                  {accountIsStaff ? (
                    <FcApproval />
                  ) : (
                    <div className={cn(isDark ? "text-red-600" : "text-red-500")}>
                      <AiFillCloseCircle />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 flex flex-col justify-center items-center">
                  <p className={cn("mb-2 font-bold", subsectionTitleColor)}>
                    Admin?
                  </p>
                  {accountIsSuper ? (
                    <FcApproval />
                  ) : (
                    <div className={cn(isDark ? "text-red-600" : "text-red-500")}>
                      <AiFillCloseCircle />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
