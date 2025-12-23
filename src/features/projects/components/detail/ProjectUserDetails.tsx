// Component that shows the details of a project member, including their role, time allocation, whether they are the leader, and their position in
// the manage team component (drag and droppable by Admins and leader)

import { toast } from "sonner";
import { useColorMode } from "@/shared/utils/theme.utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { FcApproval } from "react-icons/fc";
import { FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { cn } from "@/shared/utils";
import {
  RemoveUserMutationType,
  promoteUserToLeader,
  removeTeamMemberFromProject,
  updateProjectMember,
} from "@/features/projects/services/projects.service";
import { useCopyText } from "@/shared/hooks/useCopyText";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";
import { useFullUserByPk } from "@/features/users/hooks/useFullUserByPk";
import { useUser } from "@/features/users/hooks/useUser";

interface Props {
  pk: number;
  is_leader: boolean;
  leader_pk: number;
  role: string;
  time_allocation: number;
  usersCount: number;
  project_id: number;
  shortCode: number | string;
  refetchTeamData: () => void;
  onClose: () => void;
  ba_leader: number;
}

export const ProjectUserDetails = ({
  onClose,
  pk,
  is_leader,
  leader_pk,
  role,
  shortCode,
  time_allocation,
  usersCount,
  project_id,
  refetchTeamData,
  ba_leader,
}: Props) => {
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

  const { userLoading: loading, userData: user } = useFullUserByPk(pk);
  const formatted_date = useFormattedDate(user?.date_joined);

  const { colorMode } = useColorMode();

  const copyEmail = useCopyText(user?.email);

  const me = useUser();

  const [fteValue, setFteValue] = useState(time_allocation);
  const [userRole, setUserRole] = useState(role);
  const [shortCodeValue, setShortCodeValue] = useState(shortCode);

  // Add validation state to ensure role isnt blank
  const [isRoleValid, setIsRoleValid] = useState(userRole !== "");

  // Update the role handler to include validation
  const handleUpdateRole = (newRole: string) => {
    setUserRole(newRole);
    setIsRoleValid(newRole !== ""); // Validate role is not empty
  };

  const handleUpdateFTE = (newFTE: number) => {
    setFteValue(newFTE);
  };

  const humanReadableRoleName = (role: string) => {
    let humanReadable = "";

    switch (role) {
      case "academicsuper":
        humanReadable = "Academic Supervisor";
        break;
      case "consulted":
        humanReadable = "Consulted Peer";
        break;
      case "externalcol":
        humanReadable = "External Collaborator";
        break;
      case "externalpeer":
        humanReadable = "External Peer";
        break;
      case "group":
        humanReadable = "Involved Group";
        break;
      case "research":
        humanReadable = "Science Support";
        break;
      case "supervising":
        humanReadable = "Project Leader";
        break;
      case "student":
        humanReadable = "Supervised Student";
        break;
      case "technical":
        humanReadable = "Technical Support";
        break;

      default:
        humanReadable = "None";
        break;
    }
    return humanReadable;
  };

  const removeThisUser = () => {
    if (!is_leader && usersCount > 1) {
      const user_pk = user.pk;
      const formData: RemoveUserMutationType = {
        user: user_pk,
        project: project_id,
      };
      console.log(formData);
      console.log("removing");
      removeUserMutation.mutate(formData);
    }
  };

  const promoteThisUser = () => {
    if (!is_leader) {
      console.log(
        "This user is not the leader, so this section will perform demotion of the previous leader, and promotion of this user to leader. Their positions will swap.",
      );
      const user_pk = user.pk;
      const formData: RemoveUserMutationType = {
        user: user_pk,
        project: project_id,
      };
      console.log(formData);
      console.log("promoting");
      promoteUserMutation.mutate(formData);
    }
  };

  // removeUserMutation.mutate()
  // await removeTeamMemberFromProject({ user: user.pk, project: project_id });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const updateProjectUser = (formData) => {
    console.log(formData);
    updateMemberMutation.mutate(formData);
  };

  const updateMemberMutation = useMutation({
    mutationFn: updateProjectMember,
    onMutate: () => {
      console.log("Updating Project Membership");
      toast.loading("Updating Project Membership");
    },

    onSuccess: () => {
      toast.dismiss();
      toast.success("User Updated");
      // reset()

      setTimeout(
        // async
        () => {
          // await
          queryClient.invalidateQueries({
            queryKey: ["projects", project_id],
          });
          if (refetchTeamData) {
            refetchTeamData();
          }
          // const url =
          if (!location.pathname.includes("project")) {
            navigate(`/projects/${project_id}/overview`);
          } else {
            onClose();
          }
        },
        350,
      );
    },
    onError: (error) => {
      console.log(error);
      toast.dismiss();
      toast.error(`Could Not Update User: ${error}`);
    },
  });

  const promoteUserMutation = useMutation({
    mutationFn: promoteUserToLeader,
    onMutate: () => {
      console.log("Promoting user");
      toast.loading("Promoting Member");
    },

    onSuccess: () => {
      toast.dismiss();
      toast.success("User Promoted");
      // reset()

      setTimeout(
        // async
        () => {
          // await
          queryClient.invalidateQueries({
            queryKey: ["projects", project_id],
          });

          if (refetchTeamData) {
            refetchTeamData();
          } // const url =
          if (!location.pathname.includes("project")) {
            navigate(`/projects/${project_id}/overview`);
          } else {
            onClose();
          }
        },
        350,
      );
    },
    onError: (error) => {
      console.log(error);
      toast.dismiss();
      toast.error(`Could Not Promote User: ${error}`);
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: removeTeamMemberFromProject,
    onMutate: () => {
      console.log("Removing user");
      toast.loading("Removing Member");
    },

    onSuccess: () => {
      toast.dismiss();
      toast.success("User Removed");
      // reset()

      onClose();

      setTimeout(
        // async
        () => {
          // await
          queryClient.invalidateQueries({
            queryKey: ["projects", project_id],
          });
          if (refetchTeamData) {
            refetchTeamData();
          }
          // const url =
          if (!location.pathname.includes("project")) {
            navigate(`/projects/${project_id}/overview`);
          } else {
            // onClose();
          }
        },
        350,
      );
    },
    onError: (error) => {
      console.log(error);
      toast.dismiss();
      toast.error(`Could Not Remove User: ${error}`);
    },
  });

  useEffect(() => {
    console.log({
      currentUserPk: me?.userData?.pk,
      leaderPk: leader_pk,
    });
  });

  return loading || pk === undefined ? (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  ) : (
    <div className="flex flex-col h-full">
      <div className="flex mt-4">
        <Avatar className="w-16 h-16">
          <AvatarImage
            src={
              user?.image?.file
                ? user.image.file
                : user?.image?.old_file
                  ? user.image.old_file
                  : ""
            }
          />
          <AvatarFallback>
            {user?.display_first_name?.[0] || user?.first_name?.[0] || user?.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col flex-1 justify-center ml-4 overflow-auto">
          <p className="select-none font-bold">
            {!user?.display_first_name?.startsWith("None")
              ? `${user.display_first_name ?? user.first_name} ${user.display_last_name ?? user.last_name}`
              : `${user.username}`}
          </p>
          {/* <p className="select-none">{user?.expertise}</p> */}
          <p className="select-none">
            {user?.phone ? user.phone : "No Phone number"}
          </p>
          <div className="flex">
            {/* {!user?.email?.startsWith("unset") && (
              <Button
                mr={2}
                size={"xs"}
                variant={"ghost"}
                className={cn(
                  "text-white",
                  colorMode === "light" 
                    ? "bg-blue-500 hover:bg-blue-400" 
                    : "bg-blue-600 hover:bg-blue-500"
                )}
                onClick={copyEmail}
              >
                <Icon as={FiCopy} />
              </Button>
            )} */}
            <p className="select-none">
              {user?.email?.startsWith("unset") ? "No Email" : user?.email}
            </p>
          </div>
          {!user?.email?.startsWith("unset") && (
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "text-white mt-2 px-4 w-fit rounded",
                colorMode === "light" 
                  ? "bg-blue-500 hover:bg-blue-400" 
                  : "bg-blue-600 hover:bg-blue-500"
              )}
              onClick={copyEmail}
            >
              <FiCopy className="mr-2 h-4 w-4" />
              Copy Email
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-2 pb-4">
        {!user?.is_staff && (
          <Button
            className={cn(
              "text-white",
              colorMode === "light" ? "bg-blue-500" : "bg-blue-400"
            )}
            disabled={user.email?.startsWith("unset")}
          >
            Email
          </Button>
        )}
        {user?.is_staff && (
          <Button
            className={cn(
              "text-white",
              colorMode === "light" ? "bg-blue-500" : "bg-blue-400"
            )}
            disabled={true}
          >
            Chat
          </Button>
        )}

        <Button
          className={cn(
            "text-white",
            colorMode === "light" 
              ? "bg-red-500 hover:bg-red-400" 
              : "bg-red-600 hover:bg-red-500"
          )}
          onClick={removeThisUser}
          disabled={usersCount === 1}
          // TODO: Disable also if not superuser and not in project or in project but not leader (superusers can do whatever unless only one user)
        >
          Remove from Project
        </Button>
      </div>

      <div className={cn(
        "border rounded-xl p-4 mb-4 flex flex-col mt-2",
        colorMode === "light" ? "border-gray-300" : "border-gray-500"
      )}>
        {humanReadableRoleName(userRole) === "Project Leader" &&
        !me?.userData.is_superuser ? (
          "Project Leaders cannot change to a different role."
        ) : (
          <>
            <div className="flex">
              <p className={cn(
                "font-bold text-sm mb-1",
                colorMode === "light" ? "text-gray-600" : "text-gray-300"
              )}>
                Project Role (
                {userRole ? humanReadableRoleName(userRole) : "None"})
              </p>
            </div>
            <div className="py-2">
              <div className="w-full">
                <Select
                  value={userRole}
                  onValueChange={(value) => handleUpdateRole(value)}
                  disabled={
                    humanReadableRoleName(userRole) === "Project Leader" &&
                    !me?.userData.is_superuser
                  }
                >
                  <SelectTrigger className={cn(
                    "w-full",
                    !isRoleValid && "border-red-500"
                  )}>
                    <SelectValue placeholder="Select a Role for the User" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.is_staff ? (
                      <>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="research">Science Support</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="academicsuper">Academic Supervisor</SelectItem>
                        <SelectItem value="consulted">Consulted Peer</SelectItem>
                        <SelectItem value="externalcol">External Collaborator</SelectItem>
                        <SelectItem value="group">Involved Group</SelectItem>
                        <SelectItem value="student">Supervised Student</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <p className={cn(
                "text-sm mt-1",
                !isRoleValid ? "text-red-500" : "text-gray-500"
              )}>
                {!isRoleValid
                  ? "Please select a role for this team member"
                  : "The role this team member fills within this project."}
              </p>
            </div>
          </>
        )}

        <div className="flex mt-4">
          <p className={cn(
            "font-bold text-sm mb-1",
            colorMode === "light" ? "text-gray-600" : "text-gray-300"
          )}>
            Time Allocation ({fteValue} FTE)
          </p>
        </div>
        {/* <p>-</p> */}
        <Slider
          defaultValue={[fteValue]}
          min={0}
          max={1}
          step={0.1}
          onValueChange={(value) => handleUpdateFTE(value[0])}
          className="w-full"
        />

        <div className="flex mt-4">
          <p className={cn(
            "font-bold text-sm mb-1",
            colorMode === "light" ? "text-gray-600" : "text-gray-300"
          )}>
            Short Code
          </p>
        </div>
        <Input
          autoComplete="off"
          defaultValue={shortCode?.toString()}
          onChange={(e) => setShortCodeValue(e.target.value)}
        />
        {/* <p>-</p> */}
        {!is_leader &&
          (me?.userData.is_superuser ||
            me?.userData.pk === ba_leader ||
            me?.userData?.pk === leader_pk) && (
            <Button
              className={cn(
                "mt-4 text-white",
                colorMode === "dark" 
                  ? "bg-green-600 hover:bg-green-500" 
                  : "bg-green-500 hover:bg-green-400"
              )}
              disabled={!user?.is_staff}
              onClick={promoteThisUser}
              // TODO: Disable also if not superuser and not in project or in project but not leader (superusers can do whatever unless only one user)
            >
              Promote to Leader
            </Button>
          )}
        <Button
          className={cn(
            "text-white mt-4",
            colorMode === "light" 
              ? "bg-blue-500 hover:bg-blue-400" 
              : "bg-blue-600 hover:bg-blue-500"
          )}
          disabled={!isRoleValid} // Disable if no role selected
          onClick={() =>
            updateProjectUser({
              projectPk: project_id,
              userPk: pk,
              role: userRole,
              fte: fteValue,
              shortCode: shortCodeValue,
            })
          }
        >
          {!isRoleValid ? "Please Select a Role" : "Save Changes"}
        </Button>
      </div>

      <div>
        <div className={cn(
          "border rounded-xl p-4 mb-4 flex flex-col",
          colorMode === "light" ? "border-gray-300" : "border-gray-500"
        )}>
          <div className="flex flex-col">
            {user?.is_staff && (
              <div className="flex h-15">
                <img
                  className="rounded-lg w-15 h-15 object-cover"
                  src="/dbca.jpg"
                  alt="DBCA Logo"
                />
                <div className="flex items-center justify-center">
                  <div className="ml-3 flex flex-col">
                    <p className={cn(
                      "font-bold",
                      colorMode === "light" ? "text-gray-600" : "text-gray-300"
                    )}>
                      {user.agency !== null
                        ? user.agency.name
                        : "agency returning none"}
                    </p>
                    <p className={cn(
                      "text-sm",
                      colorMode === "light" ? "text-gray-600" : "text-gray-400"
                    )}>
                      {user.branch !== null
                        ? `${user.branch.name} Branch`
                        : "Branch not set"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!user?.is_staff && (
              <p className={cn(
                colorMode === "light" ? "text-gray-600" : "text-gray-300"
              )}>
                <b>External User</b> - This user does not belong to DBCA
              </p>
            )}
          </div>
        </div>

        <div className={cn(
          "border rounded-xl p-4 mb-4 flex flex-col mt-2",
          colorMode === "light" ? "border-gray-300" : "border-gray-500"
        )}>
          <div className="flex">
            <p className={cn(
              "font-bold text-sm mb-1",
              colorMode === "light" ? "text-gray-600" : "text-gray-300"
            )}>
              About
            </p>
          </div>
          <div
            className="mt-1"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                colorMode === "dark"
                  ? replaceLightWithDark(
                      user?.about === "" ||
                        user?.about === "<p></p>" ||
                        user?.about === '<p class="editor-p-light"><br></p>' ||
                        user?.about === '<p class="editor-p-dark"><br></p>'
                        ? "<p>(Not Provided)</p>"
                        : (user?.about ?? "<p>(Not Provided)</p>"),
                    )
                  : replaceDarkWithLight(
                      user?.about === "" ||
                        user?.about === "<p></p>" ||
                        user?.about === '<p class="editor-p-light"><br></p>' ||
                        user?.about === '<p class="editor-p-dark"><br></p>'
                        ? "<p>(Not Provided)</p>"
                        : (user?.about ?? "<p>(Not Provided)</p>"),
                    ),
              ),
            }}
          />
          {/* 
          <Text>
            {user.about
              ? user.about
              : "This user has not filled in this section."}
          </Text> */}
          <div className="flex mt-4">
            <p className={cn(
              "font-bold text-sm mb-1",
              colorMode === "light" ? "text-gray-600" : "text-gray-300"
            )}>
              Expertise
            </p>
          </div>
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
                        user?.expertise === '<p class="editor-p-dark"><br></p>'
                        ? "<p>(Not Provided)</p>"
                        : (user?.expertise ?? "<p>(Not Provided)</p>"),
                    )
                  : replaceDarkWithLight(
                      user?.expertise === "" ||
                        user?.expertise === "<p></p>" ||
                        user?.expertise ===
                          '<p class="editor-p-light"><br></p>' ||
                        user?.expertise === '<p class="editor-p-dark"><br></p>'
                        ? "<p>(Not Provided)</p>"
                        : (user?.expertise ?? "<p>(Not Provided)</p>"),
                    ),
              ),
            }}
          />
          {/* <p>
            {user?.expertise
              ? user.expertise
              : "This user has not filled in this section."}
          </p> */}
        </div>

        <div className="flex-grow" />

        <div className={cn(
          "border rounded-xl p-4 mb-4 flex flex-col mt-2",
          colorMode === "light" ? "border-gray-300" : "border-gray-500"
        )}>
          <div className="flex">
            <p className={cn(
              "font-bold text-sm mb-1",
              colorMode === "light" ? "text-gray-600" : "text-gray-300"
            )}>
              Details
            </p>
          </div>
          <div className="grid grid-cols-[1fr_3fr]">
            {/* <Text color={subsectionTitleColor}>
              <b>Role: </b>
            </Text>
            <Text>
              {user?.role
                ? user.role
                : "This user has not filled in this section."}
            </Text> */}
            <p className="text-gray-500">
              <b>Joined: </b>
            </p>
            <p>{formatted_date}</p>
          </div>
          <div className={cn(
            "mt-4 rounded-xl p-4",
            colorMode === "light" ? "bg-gray-50" : "bg-gray-600"
          )}>
            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="flex flex-col justify-center items-center">
                <p className="mb-2 font-bold text-gray-500">
                  Active?
                </p>
                {user?.is_active ? (
                  <FcApproval />
                ) : (
                  <div className={cn(
                    colorMode === "light" ? "text-red-500" : "text-red-600"
                  )}>
                    <AiFillCloseCircle />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center items-center">
                <p className="mb-2 font-bold text-gray-500">
                  Staff?
                </p>
                {user?.is_staff ? (
                  <FcApproval />
                ) : (
                  <div className={cn(
                    colorMode === "light" ? "text-red-500" : "text-red-600"
                  )}>
                    <AiFillCloseCircle />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center items-center">
                <p className="mb-2 font-bold text-gray-500">
                  Superuser?
                </p>
                {user?.is_superuser ? (
                  <FcApproval />
                ) : (
                  <div className={cn(
                    colorMode === "light" ? "text-red-500" : "text-red-600"
                  )}>
                    <AiFillCloseCircle />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
