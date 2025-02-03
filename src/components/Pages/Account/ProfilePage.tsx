// Handles Profile Page view

import ScienceStaffSearchResult from "@/components/StaffProfiles/Staff/All/ScienceStaffSearchResult";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Image,
  Input,
  InputGroup,
  Spinner,
  Text,
  ToastId,
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AiFillCloseCircle, AiFillEdit, AiFillEye } from "react-icons/ai";
import { FcApproval } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import useServerImageUrl from "../../../lib/hooks/helper/useServerImageUrl";
import { useUser } from "../../../lib/hooks/tanstack/useUser";
import { EditMembershipModal } from "../../Modals/EditMembershipModal";
import { EditPersonalInformationModal } from "../../Modals/EditPersonalInformationModal";
import { EditProfileModal } from "../../Modals/EditProfileModal";
import { UserGridItem } from "../Users/UserGridItem";
import { IoIosSave } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { IUpdatePublicEmail, updatePublicEmail } from "@/lib/api";
import { AxiosError } from "axios";
import ToggleStaffProfileVisibilityModal from "@/components/Modals/ToggleStaffProfileVisibilityModal";

const AnimatedClickToEdit = () => {
  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 10, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        height: "100%",
        animation: "ease-in-out infinite",
      }}
    >
      <Text color={"blue.500"}>Click to edit</Text>
    </motion.div>
  );
};

export const ProfilePage = () => {
  const { userLoading: loading, userData: me, refetchUser } = useUser();
  const VITE_PRODUCTION_PROFILES_BASE_URL = import.meta.env
    .VITE_PRODUCTION_PROFILES_BASE_URL;
  const VITE_PRODUCTION_BASE_URL = import.meta.env.VITE_PRODUCTION_BASE_URL;
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

  // useEffect(() => {
  //   if (!loading) {
  //     console.log(me);
  //   }
  // }, [me, loading]);
  const NoDataText = "--";

  const { colorMode } = useColorMode();
  const borderColor = colorMode === "light" ? "gray.300" : "gray.500";
  const sectionTitleColor = colorMode === "light" ? "gray.800" : "gray.300";
  const subsectionTitleColor = colorMode === "light" ? "gray.500" : "gray.500";

  const {
    isOpen: isEditPersonalInformationModalOpen,
    onOpen: onOpenEditPersonalInformationModal,
    onClose: onCloseEditPersonalInformationModal,
  } = useDisclosure();

  const {
    isOpen: isEditProfileModalOpen,
    onOpen: onOpenEditProfileModal,
    onClose: onCloseEditProfileModal,
  } = useDisclosure();

  const {
    isOpen: isEditMembershipModalOpen,
    onOpen: onOpenEditMembershipModal,
    onClose: onCloseEditMembershipModal,
  } = useDisclosure();

  const {
    isOpen: isToggleStaffProfileVisibilityModalOpen,
    onOpen: onOpenToggleStaffProfileVisibilityModal,
    onClose: onCloseToggleStaffProfileVisibilityModal,
  } = useDisclosure();

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleMouseEnter = (itemName: string) => {
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const imageUrl = useServerImageUrl(me?.image?.file);
  const navigate = useNavigate();
  const setHref = (url: string) => {
    window.location.href = url;
  };

  const queryClient = useQueryClient();

  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  const {
    register: updatePublicEmailRegister,
    handleSubmit: handleUpdatePublicEmailSubmit,
    watch: watchUpdatePublicEmail,
    formState: { isValid },
  } = useForm<IUpdatePublicEmail>({
    mode: "onChange", // Validate on change
    defaultValues: {
      public_email: "",
    },
  });

  const beginUpdatePublicEmail = (formData: IUpdatePublicEmail) => {
    console.log(formData);
    updatePublicEmailMutation.mutate(formData);
  };

  const updatePublicEmailMutation = useMutation({
    mutationFn: updatePublicEmail,
    onMutate: () => {
      addToast({
        status: "loading",
        title: "Updating Email",
        position: "top-right",
      });
    },
    onSuccess: () => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Email Updated Successfully`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["publicStaffEmail", me?.staff_profile_pk],
      });
    },
    onError: (error: AxiosError) => {
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Could Not Update Email",
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

  useEffect(() => {
    console.log(me);
  }, [me]);

  return (
    <Box h={"100%"}>
      {loading || me.pk === undefined ? (
        <Spinner />
      ) : (
        <>
          <EditPersonalInformationModal
            userId={`${me.pk}`}
            isOpen={isEditPersonalInformationModalOpen}
            onClose={onCloseEditPersonalInformationModal}
          />

          <EditProfileModal
            userId={`${me.pk}`}
            isOpen={isEditProfileModalOpen}
            onClose={onCloseEditProfileModal}
            currentImage={`${me.image?.file}`}
          />

          <EditMembershipModal
            currentOrganisationData={`${me?.agency?.pk}`}
            currentBranchData={me?.branch}
            currentBaData={me?.business_area}
            currentAffiliationData={me?.affiliation}
            userId={me.pk}
            isOpen={isEditMembershipModalOpen}
            onClose={onCloseEditMembershipModal}
          />

          <ToggleStaffProfileVisibilityModal
            isOpen={isToggleStaffProfileVisibilityModalOpen}
            onClose={onCloseToggleStaffProfileVisibilityModal}
            staffProfilePk={me?.staff_profile_pk}
            profileIsHidden={me?.staff_profile_hidden}
            refetch={refetchUser}
          />

          {/* ACCESS PUBLIC PROFILE */}
          {
            // me?.is_superuser ? (
            <Flex
              border={"1px solid"}
              rounded={"xl"}
              borderColor={borderColor}
              padding={4}
              mb={4}
              flexDir={"column"}
              // cursor={"pointer"}
              onMouseEnter={() => handleMouseEnter("public appearance")}
              onMouseLeave={handleMouseLeave}
              _hover={{
                scale: 1.1,
                boxShadow:
                  colorMode === "light"
                    ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                    : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)",
              }}
            >
              <Flex flexDir={"row"}>
                <Flex flexDir={"column"}>
                  <Text
                    fontWeight={"bold"}
                    fontSize={"lg"}
                    mb={1}
                    color={sectionTitleColor}
                  >
                    Public Appearance
                  </Text>
                  <Box mb={2}>
                    <Text
                      color={colorMode === "light" ? "gray.500" : "gray.500"}
                      fontSize={"sm"}
                    >
                      View and edit how your staff profile appears to the public
                    </Text>
                  </Box>
                </Flex>

                <Flex
                  justifyContent={"end"}
                  w={"100%"}
                  flexDir={{
                    base: "column",
                    // lg: "row",
                  }}
                >
                  {/* View Public Profile Button */}

                  {/* Edit/View */}
                  <Flex
                    justifyContent={{ base: "end" }}
                    alignItems={"center"}
                    w={"100%"}
                    py={4}
                  >
                    <Tooltip
                      label="See and edit your staff profile"
                      aria-label="A tooltip"
                    >
                      <Button
                        bg={colorMode === "light" ? "blue.500" : "blue.500"}
                        _hover={{
                          bg: colorMode === "light" ? "blue.500" : "blue.500",
                        }}
                        color={"white"}
                        leftIcon={<AiFillEdit />}
                        onClick={() => {
                          if (process.env.NODE_ENV === "development") {
                            navigate(`/staff/${me?.pk}`);
                          } else {
                            setHref(
                              `${VITE_PRODUCTION_PROFILES_BASE_URL}staff/${me?.pk}`,
                            );
                          }
                        }}
                      >
                        Edit Public Profile
                      </Button>
                    </Tooltip>
                  </Flex>

                  {/* Set Profile to Hidden */}
                  <Flex
                    justifyContent={"end"}
                    alignItems={"center"}
                    w={"100%"}
                    py={2}
                  >
                    <Tooltip
                      label="Change the visibility of your staff profile"
                      aria-label="A tooltip"
                    >
                      <Button
                        onClick={onOpenToggleStaffProfileVisibilityModal}
                        leftIcon={<AiFillEye />}
                      >
                        {me?.staff_profile_hidden
                          ? "Show Staff Profile"
                          : "Hide Staff Profile"}
                      </Button>
                    </Tooltip>
                  </Flex>
                </Flex>
              </Flex>
              <Flex flexDir={"row"} className="mt-4 w-full items-center">
                <Flex
                  w={"100%"}
                  className="flex-grow"
                  as="form"
                  id="update-public-email-form"
                  onSubmit={handleUpdatePublicEmailSubmit(
                    beginUpdatePublicEmail,
                  )}
                >
                  <FormControl>
                    <FormLabel>Public Email</FormLabel>
                    <InputGroup className="-mt-3 items-center">
                      <Input
                        w={"100%"}
                        autoComplete="off"
                        type="hidden"
                        {...updatePublicEmailRegister("staff_profile_pk", {
                          required: true,
                          value: me?.staff_profile_pk,
                        })}
                      />
                      <Input
                        placeholder={me?.public_email ?? me?.email ?? ""}
                        w={"100%"}
                        autoComplete="off"
                        type="email"
                        {...updatePublicEmailRegister("public_email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, // Basic email regex
                            message: "Invalid email address",
                          },
                        })}
                      />
                      <Flex
                        justifyContent={{ base: "end" }}
                        alignItems={"center"}
                        w={"100%"}
                        py={4}
                        flex={0}
                        ml={4}
                      >
                        <Tooltip
                          label="Update the address for receiving public emails"
                          aria-label="A tooltip"
                        >
                          <Button
                            bg={
                              colorMode === "light" ? "green.500" : "green.500"
                            }
                            _hover={{
                              bg:
                                colorMode === "light"
                                  ? "green.500"
                                  : "green.500",
                            }}
                            color={"white"}
                            leftIcon={<IoIosSave />}
                            // onClick={() => {}}
                            loadingText={"Updating..."}
                            isDisabled={
                              updatePublicEmailMutation.isPending || !isValid
                            }
                            type="submit"
                            form="update-public-email-form"
                            isLoading={updatePublicEmailMutation.isPending}
                          >
                            Update Public Email
                          </Button>
                        </Tooltip>
                      </Flex>
                    </InputGroup>
                    <FormHelperText
                      className="-mt-1"
                      color={colorMode === "light" ? "gray.500" : "gray.500"}
                      fontSize={"sm"}
                    >
                      The email address used for receiving emails from the
                      public. By default your DBCA email address is used.
                    </FormHelperText>
                  </FormControl>
                </Flex>
              </Flex>
            </Flex>
            // ) : null
          }

          {/* IN APP APPEARANCE */}
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            mb={4}
            flexDir={"column"}
            onMouseEnter={() => handleMouseEnter("spms appearance")}
            onMouseLeave={handleMouseLeave}
            _hover={{
              scale: 1.1,
              boxShadow:
                colorMode === "light"
                  ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                  : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)",
            }}
          >
            <Flex>
              <Text
                fontWeight={"bold"}
                fontSize={"lg"}
                mb={1}
                color={sectionTitleColor}
              >
                In-App Search Appearance
              </Text>
            </Flex>
            <Box mb={4}>
              <Text
                color={colorMode === "light" ? "gray.500" : "gray.500"}
                fontSize={"xs"}
              >
                This is how your account will appear when searched within SPMS
              </Text>
            </Box>
            <Flex>
              <Flex w={"100%"} p={2}>
                <Tooltip
                  // label="Click to view your SPMS profile"
                  aria-label="A tooltip"
                >
                  <Box w={"100%"}>
                    <UserGridItem
                      pk={me.pk}
                      username={me.username}
                      email={me.email}
                      first_name={me.first_name}
                      last_name={me.last_name}
                      display_first_name={me.display_first_name}
                      display_last_name={me.display_last_name}
                      is_staff={me.is_staff}
                      is_superuser={me.is_superuser}
                      image={me.image}
                      business_area={me.business_area}
                      role={me.role}
                      branch={me.branch}
                      is_active={me.is_active}
                      affiliation={me.affiliation}
                    />
                  </Box>
                </Tooltip>
              </Flex>
            </Flex>
          </Flex>

          {/* PERSONAL INFORMATION */}
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            flexDir={"column"}
            mb={4}
            onClick={onOpenEditPersonalInformationModal}
            cursor={"pointer"}
            onMouseEnter={() => handleMouseEnter("personal information")}
            onMouseLeave={handleMouseLeave}
            _hover={{
              scale: 1.1,
              boxShadow:
                colorMode === "light"
                  ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                  : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)",
            }}
          >
            <Flex>
              <Flex>
                <Text
                  fontWeight={"bold"}
                  fontSize={"lg"}
                  mb={1}
                  color={sectionTitleColor}
                >
                  Personal Information
                </Text>
              </Flex>
              {hoveredItem === "personal information" && (
                <Flex
                  flex={1}
                  // bg={"pink"}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                  px={4}
                >
                  <AnimatedClickToEdit />
                </Flex>
              )}
            </Flex>

            <Box mb={4}>
              <Text
                color={colorMode === "light" ? "gray.500" : "gray.500"}
                fontSize={"xs"}
              >
                Optionally adjust these details for in-app and PDF display
                (including annual report). Your email cannot be changed.
              </Text>
            </Box>

            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              {/* REPLACED WITH DISPLAY FIRST_NAME SO OIM SSO STILL WORKS BUT NAMES EDITABLE */}
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  First Name
                </Text>
                <Text>{me.display_first_name ?? me.first_name}</Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Last Name
                </Text>
                <Text>{me.display_last_name ?? me.last_name}</Text>
              </Flex>
              {/* <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  First Name
                </Text>
                <Text>{me.first_name}</Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Last Name
                </Text>
                <Text>{me.last_name}</Text>
              </Flex> */}
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Phone
                </Text>
                <Text>{me.phone ? me.phone : "--"}</Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Fax
                </Text>
                <Text>{me.fax ? me.fax : "--"}</Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Title
                </Text>
                <Text>
                  {me.title
                    ? me.title === "mr"
                      ? "Mr"
                      : me.title === "mrs"
                        ? "Mrs"
                        : me.title === "ms"
                          ? "Ms"
                          : me.title === "aprof"
                            ? "A/Prof"
                            : me.title === "prof"
                              ? "Prof"
                              : me.title === "dr"
                                ? "Dr"
                                : "Bad Title"
                    : "--"}
                </Text>
              </Flex>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Email Address
                </Text>
                <Text>{me.email}</Text>
              </Flex>
            </Grid>
          </Flex>

          {/* PROFILE */}
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            flexDir={"column"}
            mb={4}
            cursor={"pointer"}
            onClick={onOpenEditProfileModal}
            onMouseEnter={() => handleMouseEnter("profile")}
            onMouseLeave={handleMouseLeave}
            _hover={{
              scale: 1.1,
              boxShadow:
                colorMode === "light"
                  ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                  : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)",
            }}
          >
            <Flex>
              <Flex>
                <Text
                  fontWeight={"bold"}
                  fontSize={"lg"}
                  mb={1}
                  color={sectionTitleColor}
                >
                  Profile
                </Text>
              </Flex>
              {hoveredItem === "profile" && (
                <Flex
                  flex={1}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                  px={4}
                >
                  <AnimatedClickToEdit />
                </Flex>
              )}
            </Flex>

            <Box mb={4}>
              <Text
                color={colorMode === "light" ? "gray.500" : "gray.500"}
                fontSize={"xs"}
              >
                Adjust these details for in-app and public display. In uploading
                an image of your self, you are consenting to its use in your
                public profile.
              </Text>
            </Box>

            <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={8}>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Image
                </Text>
                <Center
                  width={"100%"}
                  maxH={"300px"}
                  bg={"gray.50"}
                  mt={1}
                  rounded={"lg"}
                  overflow={"hidden"}
                >
                  <Image
                    objectFit={"cover"}
                    src={
                      imageUrl
                      // me?.image ? `${baseAPI}${me.image.file}` : "/sad-face.png"
                    }
                    top={0}
                    left={0}
                    userSelect={"none"}
                  />
                </Center>
              </Flex>
              <Flex flexDir={"column"}>
                <Box>
                  <Text color={subsectionTitleColor} fontSize={"sm"}>
                    About
                  </Text>
                  <Box
                    mt={1}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        colorMode === "dark"
                          ? replaceLightWithDark(
                              me?.about === "" ||
                                me?.about === "<p></p>" ||
                                me?.about ===
                                  '<p class="editor-p-light"><br></p>' ||
                                me?.about ===
                                  '<p class="editor-p-dark"><br></p>'
                                ? "<p>(Not Provided)</p>"
                                : (me?.about ?? "<p>(Not Provided)</p>"),
                            )
                          : replaceDarkWithLight(
                              me?.about === "" ||
                                me?.about === "<p></p>" ||
                                me?.about ===
                                  '<p class="editor-p-light"><br></p>' ||
                                me?.about ===
                                  '<p class="editor-p-dark"><br></p>'
                                ? "<p>(Not Provided)</p>"
                                : (me?.about ?? "<p>(Not Provided)</p>"),
                            ),
                      ),
                    }}
                  />
                </Box>
                <Box mt={8}>
                  <Text color={subsectionTitleColor} fontSize={"sm"}>
                    Expertise
                  </Text>
                  <Box
                    mt={1}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(
                        colorMode === "dark"
                          ? replaceLightWithDark(
                              me?.expertise === "" ||
                                me?.expertise === "<p></p>" ||
                                me?.expertise ===
                                  '<p class="editor-p-light"><br></p>' ||
                                me?.expertise ===
                                  '<p class="editor-p-dark"><br></p>'
                                ? "<p>(Not Provided)</p>"
                                : (me?.expertise ?? "<p>(Not Provided)</p>"),
                            )
                          : replaceDarkWithLight(
                              me?.expertise === "" ||
                                me?.expertise === "<p></p>" ||
                                me?.expertise ===
                                  '<p class="editor-p-light"><br></p>' ||
                                me?.expertise ===
                                  '<p class="editor-p-dark"><br></p>'
                                ? "<p>(Not Provided)</p>"
                                : (me?.expertise ?? "<p>(Not Provided)</p>"),
                            ),
                      ),
                    }}
                  />
                </Box>
              </Flex>
            </Grid>
          </Flex>

          {/* ORGANISATION */}
          <Flex
            border={"1px solid"}
            rounded={"xl"}
            borderColor={borderColor}
            padding={4}
            flexDir={"column"}
            mb={4}
            cursor={"pointer"}
            onClick={onOpenEditMembershipModal}
            onMouseEnter={() => handleMouseEnter("membership")}
            onMouseLeave={handleMouseLeave}
            _hover={{
              scale: 1.1,
              boxShadow:
                colorMode === "light"
                  ? "0px 12px 18px -6px rgba(0, 0, 0, 0.18), 0px 2.4px 3px -1.2px rgba(0, 0, 0, 0.036), -2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072), 2.4px 0px 6px -1.2px rgba(0, 0, 0, 0.072)"
                  : "0px 2.4px 3.6px -0.6px rgba(255, 255, 255, 0.06), 0px 1.2px 2.4px -0.6px rgba(255, 255, 255, 0.036)",
            }}
          >
            <Flex>
              <Flex>
                <Text
                  fontWeight={"bold"}
                  fontSize={"lg"}
                  mb={1}
                  color={sectionTitleColor}
                >
                  Membership
                </Text>
              </Flex>
              {hoveredItem === "membership" && (
                <Flex
                  flex={1}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                  px={4}
                >
                  <AnimatedClickToEdit />
                </Flex>
              )}
            </Flex>
            <Box mb={4}>
              <Text
                color={colorMode === "light" ? "gray.500" : "gray.500"}
                fontSize={"xs"}
              >
                Set your branch and business area for in-app and public display.
                Optionally set an affiliation.
              </Text>
            </Box>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Flex flexDir={"column"}>
                <Text color={subsectionTitleColor} fontSize={"sm"}>
                  Organisation Name
                </Text>
                <Text>
                  {!me.is_staff
                    ? "External"
                    : me?.agency?.name
                      ? me.agency.name
                      : NoDataText}
                </Text>
              </Flex>
              {me.is_staff && (
                <>
                  <Flex flexDir={"column"}>
                    <Text color={subsectionTitleColor} fontSize={"sm"}>
                      Branch
                    </Text>
                    <Text>
                      {me?.branch?.name ? me?.branch?.name : NoDataText}
                    </Text>
                  </Flex>
                  <Flex flexDir={"column"}>
                    <Text color={subsectionTitleColor} fontSize={"sm"}>
                      Business Area
                    </Text>
                    <Text>
                      {me?.business_area?.name
                        ? me?.business_area?.name
                        : NoDataText}
                    </Text>
                  </Flex>
                  <Flex flexDir={"column"}>
                    <Text color={subsectionTitleColor} fontSize={"sm"}>
                      Affiliation
                    </Text>
                    <Text>
                      {me?.affiliation ? me.affiliation?.name : NoDataText}
                    </Text>
                  </Flex>
                </>
              )}
            </Grid>
          </Flex>

          {/* STATUS */}
          <Grid
            mb={4}
            gridTemplateColumns={"repeat(3, 1fr)"}
            rounded={"xl"}
            gap={3}
            flex={1}
            p={4}
            bg={colorMode === "light" ? "gray.50" : "gray.900"} //BUGGY for some reason
          >
            <Grid
              gridTemplateColumns={"repeat(1, 1fr)"}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Text mb="8px" fontWeight={"bold"}>
                Active?
              </Text>
              {me?.is_active ? (
                <Box color={colorMode === "light" ? "green.500" : "green.600"}>
                  <FcApproval />
                </Box>
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
              <Text mb="8px" fontWeight={"bold"}>
                Staff?
              </Text>
              {me?.is_staff ? (
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
              <Text mb="8px" fontWeight={"bold"}>
                Admin?
              </Text>
              {me?.is_superuser ? (
                <FcApproval />
              ) : (
                <Box color={colorMode === "light" ? "red.500" : "red.600"}>
                  <AiFillCloseCircle />
                </Box>
              )}
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
