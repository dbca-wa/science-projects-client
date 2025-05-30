// Component that shows the details of a project member, including their role, time allocation, whether they are the leader, and their position in
// the manage team component (drag and droppable by Admins and leader)

import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormHelperText,
  Grid,
  Icon,
  Image,
  Input,
  InputGroup,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  Spinner,
  Text,
  ToastId,
  useColorMode,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import { FcApproval } from "react-icons/fc";
import { FiCopy } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  RemoveUserMutationType,
  promoteUserToLeader,
  removeTeamMemberFromProject,
  updateProjectMember,
} from "../../../lib/api";
import { useCopyText } from "../../../lib/hooks/helper/useCopyText";
import { useFormattedDate } from "../../../lib/hooks/helper/useFormattedDate";
import { useFullUserByPk } from "../../../lib/hooks/tanstack/useFullUserByPk";
import { useUser } from "../../../lib/hooks/tanstack/useUser";

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
  const borderColor = colorMode === "light" ? "gray.300" : "gray.500";
  const sectionTitleColor = colorMode === "light" ? "gray.600" : "gray.300";
  const subsectionTitleColor = colorMode === "light" ? "gray.500" : "gray.500";

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

  // Toast
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
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

      addToast({
        status: "loading",
        title: "Updating Project Membership",
        position: "top-right",
      });
    },

    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `User Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
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
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Promote User",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const promoteUserMutation = useMutation({
    mutationFn: promoteUserToLeader,
    onMutate: () => {
      console.log("Promoting user");

      addToast({
        status: "loading",
        title: "Promoting Member",
        position: "top-right",
      });
    },

    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `User Promoted`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
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
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Promote User",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: removeTeamMemberFromProject,
    onMutate: () => {
      console.log("Removing user");

      addToast({
        status: "loading",
        title: "Removing Member",
        position: "top-right",
      });
    },

    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `User Removed`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
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
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Remove User",
          description: `${error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  useEffect(() => {
    console.log({
      currentUserPk: me?.userData?.pk,
      leaderPk: leader_pk,
    });
  });

  return loading || pk === undefined ? (
    <Center w={"100%"} h={"100%"}>
      <Spinner size={"xl"} />
    </Center>
  ) : (
    <Flex flexDir={"column"} h={"100%"}>
      <Flex mt={4}>
        <Avatar
          src={
            user?.image?.file
              ? user.image.file
              : user?.image?.old_file
                ? user.image.old_file
                : ""
          }
          size={"2xl"}
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
              ? `${user.display_first_name ?? user.first_name} ${user.display_last_name ?? user.last_name}`
              : `${user.username}`}
          </Text>
          {/* <Text userSelect={"none"}>{user?.expertise}</Text> */}
          <Text userSelect={"none"}>
            {user?.phone ? user.phone : "No Phone number"}
          </Text>
          <Flex
          // mt={1}
          >
            {/* {!user?.email?.startsWith("unset") && (
              <Button
                mr={2}
                size={"xs"}
                variant={"ghost"}
                color={"white"}
                background={colorMode === "light" ? "blue.500" : "blue.600"}
                _hover={{
                  background: colorMode === "light" ? "blue.400" : "blue.500",
                }}
                onClick={copyEmail}
              >
                <Icon as={FiCopy} />
              </Button>
            )} */}
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
        gridTemplateColumns={"repeat(2, 1fr)"}
        gridGap={4}
        mt={4}
        pt={2}
        pb={4}
      >
        {!user?.is_staff && (
          <Button
            bg={colorMode === "light" ? "blue.500" : "blue.400"}
            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
            isDisabled={user.email?.startsWith("unset")}
          >
            Email
          </Button>
        )}
        {user?.is_staff && (
          <Button
            bg={colorMode === "light" ? "blue.500" : "blue.400"}
            color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
            isDisabled={true}
          >
            Chat
          </Button>
        )}

        <Button
          bg={colorMode === "light" ? "red.500" : "red.600"}
          color={colorMode === "light" ? "whiteAlpha.900" : "whiteAlpha.900"}
          _hover={{
            bg: colorMode === "light" ? "red.400" : "red.500",
          }}
          onClick={removeThisUser}
          isDisabled={usersCount === 1}
          // TODO: Disable also if not superuser and not in project or in project but not leader (superusers can do whatever unless only one user)
        >
          Remove from Project
        </Button>
      </Grid>

      <Flex
        border={"1px solid"}
        rounded={"xl"}
        borderColor={borderColor}
        padding={4}
        mb={4}
        flexDir={"column"}
        mt={2}
      >
        {humanReadableRoleName(userRole) === "Project Leader" &&
        !me?.userData.is_superuser ? (
          "Project Leaders cannot change to a different role."
        ) : (
          <>
            <Flex>
              <Text
                fontWeight={"bold"}
                fontSize={"sm"}
                mb={1}
                color={sectionTitleColor}
              >
                Project Role (
                {userRole ? humanReadableRoleName(userRole) : "None"})
              </Text>
            </Flex>
            <FormControl py={2}>
              <InputGroup>
                <Select
                  variant="filled"
                  placeholder="Select a Role for the User" // This will show when no role is selected
                  onChange={(e) => handleUpdateRole(e.target.value)}
                  value={userRole}
                  isInvalid={!isRoleValid} // Show error state (all users need role)
                  isDisabled={
                    humanReadableRoleName(userRole) === "Project Leader" &&
                    !me?.userData.is_superuser
                  }
                >
                  {/* NO empty option - force user to pick a real role */}
                  {user?.is_staff ? (
                    <>
                      <option value="technical">Technical Support</option>
                      <option value="research">Science Support</option>
                    </>
                  ) : (
                    <>
                      <option value="academicsuper">Academic Supervisor</option>
                      <option value="consulted">Consulted Peer</option>
                      <option value="externalcol">External Collaborator</option>
                      <option value="group">Involved Group</option>
                      <option value="student">Supervised Student</option>
                    </>
                  )}
                </Select>{" "}
              </InputGroup>
              <FormHelperText color={!isRoleValid ? "red.500" : undefined}>
                {!isRoleValid
                  ? "Please select a role for this team member"
                  : "The role this team member fills within this project."}
              </FormHelperText>
            </FormControl>
          </>
        )}

        <Flex mt={4}>
          <Text
            fontWeight={"bold"}
            fontSize={"sm"}
            mb={1}
            color={sectionTitleColor}
          >
            Time Allocation ({fteValue} FTE)
          </Text>
        </Flex>
        {/* <Text>-</Text> */}
        <Slider
          defaultValue={fteValue}
          min={0}
          max={1}
          step={0.1}
          onChangeEnd={(sliderValue) => {
            handleUpdateFTE(sliderValue);
          }}
        >
          <SliderTrack bg="blue.100">
            <Box position="relative" right={10} />
            <SliderFilledTrack bg="blue.500" />
          </SliderTrack>
          <SliderThumb boxSize={6} bg="blue.300" />
        </Slider>

        <Flex mt={4}>
          <Text
            fontWeight={"bold"}
            fontSize={"sm"}
            mb={1}
            color={sectionTitleColor}
          >
            Short Code
          </Text>
        </Flex>
        <Input
          autoComplete="off"
          defaultValue={shortCode}
          onChange={(e) => setShortCodeValue(e.target.value)}
        />
        {/* <Text>-</Text> */}
        {!is_leader &&
          (me?.userData.is_superuser ||
            me?.userData.pk === ba_leader ||
            me?.userData?.pk === leader_pk) && (
            <Button
              mt={4}
              bg={colorMode === "dark" ? "green.600" : "green.500"}
              color={"white"}
              _hover={{
                bg: colorMode === "dark" ? "green.500" : "green.400",
              }}
              isDisabled={!user?.is_staff}
              onClick={promoteThisUser}

              // TODO: Disable also if not superuser and not in project or in project but not leader (superusers can do whatever unless only one user)
            >
              Promote to Leader
            </Button>
          )}
        <Button
          color={"white"}
          background={colorMode === "light" ? "blue.500" : "blue.600"}
          _hover={{
            background: colorMode === "light" ? "blue.400" : "blue.500",
          }}
          mt={4}
          isDisabled={!isRoleValid} // Disable if no role selected
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
      </Flex>

      <Box>
        <Flex
          border={"1px solid"}
          rounded={"xl"}
          borderColor={borderColor}
          padding={4}
          mb={4}
          flexDir={"column"}
        >
          <Flex flexDir={"column"}>
            {user?.is_staff && (
              <Flex h={"60px"}>
                <Image
                  rounded={"lg"}
                  w="60px"
                  h="60px"
                  src={"/dbca.jpg"}
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
          <Flex mt={4}>
            <Text
              fontWeight={"bold"}
              fontSize={"sm"}
              mb={1}
              color={sectionTitleColor}
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
          <Flex>
            <Text
              fontWeight={"bold"}
              fontSize={"sm"}
              mb={1}
              color={sectionTitleColor}
            >
              Details
            </Text>
          </Flex>
          <Grid gridTemplateColumns="1fr 3fr">
            {/* <Text color={subsectionTitleColor}>
              <b>Role: </b>
            </Text>
            <Text>
              {user?.role
                ? user.role
                : "This user has not filled in this section."}
            </Text> */}
            <Text color={subsectionTitleColor}>
              <b>Joined: </b>
            </Text>
            <Text>{formatted_date}</Text>
          </Grid>
          <Flex
            mt={4}
            rounded="xl"
            p={4}
            bg={colorMode === "light" ? "gray.50" : "gray.600"}
          >
            <Grid gridTemplateColumns="repeat(3, 1fr)" gap={3} w="100%">
              <Grid
                gridTemplateColumns={"repeat(1, 1fr)"}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <Text mb="8px" fontWeight={"bold"} color={subsectionTitleColor}>
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
                <Text mb="8px" fontWeight={"bold"} color={subsectionTitleColor}>
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
                <Text mb="8px" fontWeight={"bold"} color={subsectionTitleColor}>
                  Superuser?
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
      </Box>
    </Flex>
  );
};
