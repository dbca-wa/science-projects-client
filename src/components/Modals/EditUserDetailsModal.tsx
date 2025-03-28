// Modal for editing user details

import { useUser } from "@/lib/hooks/tanstack/useUser";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  ToastId,
  UseToastOptions,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { AiFillPhone } from "react-icons/ai";
import { GiGraduateCap } from "react-icons/gi";
import { GrMail } from "react-icons/gr";
import { MdFax } from "react-icons/md";
import { RiNumber1, RiNumber2 } from "react-icons/ri";
import {
  IFullUserUpdateVariables,
  MutationError,
  MutationSuccess,
  adminUpdateUser,
  removeUserAvatar,
} from "../../lib/api";
import { useUserSearchContext } from "../../lib/hooks/helper/UserSearchContext";
import { useFullUserByPk } from "../../lib/hooks/tanstack/useFullUserByPk";
import { IAffiliation, IBranch, IBusinessArea, IUserData } from "../../types";
import { AffiliationCreateSearchDropdown } from "../Navigation/AffiliationCreateSearchDropdown";
import { StatefulMediaChanger } from "../Pages/Admin/StatefulMediaChanger";
import DatabaseRichTextEditor from "../StaffProfiles/Editor/DatabaseRichTextEditor";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUserData;
  branches: IBranch[] | undefined;
  businessAreas: IBusinessArea[] | undefined;
}

export const EditUserDetailsModal = ({
  isOpen,
  onClose,
  user,
  branches,
  businessAreas,
}: IModalProps) => {
  const { colorMode } = useColorMode();
  const { isOpen: isToastOpen, onClose: closeToast } = useDisclosure();

  useEffect(() => {
    if (isToastOpen) {
      onClose(); // Close the modal when the toast is shown
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    closeToast();
    onClose(); // Close the modal when the toast is manually closed
  };

  const { userLoading, userData } = useFullUserByPk(user.pk);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
    control,
    watch,
  } = useForm<IFullUserUpdateVariables>();

  // PI ====================================================
  const [hoveredTitle, setHoveredTitle] = useState(false);
  const titleBorderColor = `${
    colorMode === "light"
      ? hoveredTitle
        ? "blackAlpha.300"
        : "blackAlpha.200"
      : hoveredTitle
        ? "whiteAlpha.400"
        : "whiteAlpha.300"
  }`;

  // // Regex for validity of phone variable
  const phoneValidationPattern = /^(\+)?[\d\s]+$/;

  // Profile ====================================================
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [aboutValue, setAboutValue] = useState(userData?.about || "");
  const [expertiseValue, setExpertiseValue] = useState(
    userData?.expertise || "",
  );
  const [activeOption, setActiveOption] = useState<"url" | "upload">(
    userData?.image?.old_file ? "url" : "upload",
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    userData?.image?.file || userData?.image?.old_file || null,
  );
  const isValidImageUrl =
    (selectedImageUrl !== null &&
      selectedImageUrl !== undefined &&
      selectedImageUrl?.startsWith("https") &&
      selectedImageUrl.trim() !== "" &&
      selectedImageUrl.match(/\.(jpg|jpeg|png)$/i)) ||
    selectedImageUrl?.startsWith("https://imagedelivery.net/");
  const handleImageLoadError = () => {
    setImageLoadFailed(true);
  };

  const handleImageLoadSuccess = () => {
    setImageLoadFailed(false);
  };
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!userLoading) {
      setAboutValue(userData?.about || "");
      setExpertiseValue(userData?.expertise || "");
    }
  }, [userData, userLoading]);

  // Toast
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  const { reFetch } = useUserSearchContext();

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const fullMutation = useMutation<
    MutationSuccess,
    MutationError,
    IFullUserUpdateVariables
  >({
    // Start of mutation handling
    mutationFn: adminUpdateUser,
    onMutate: () => {
      addToast({
        title: "Updating membership...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`user`, user.pk] });
      queryClient.refetchQueries({ queryKey: [`personalInfo`, user.pk] });
      queryClient.refetchQueries({ queryKey: [`membership`, user.pk] });
      queryClient.refetchQueries({ queryKey: [`profile`, user.pk] });
      reFetch();
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Success",
          description: `Information Updated`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      onClose?.();
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while updating"; // Default error message

      const collectErrors = (data, prefix = "") => {
        if (typeof data === "string") {
          return [data];
        }

        const errorMessages = [];

        for (const key in data) {
          if (Array.isArray(data[key])) {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else if (typeof data[key] === "object") {
            const nestedErrors = collectErrors(data[key], `${prefix}${key}.`);
            errorMessages.push(...nestedErrors);
          } else {
            errorMessages.push(`${prefix}${key}: ${data[key]}`);
          }
        }

        return errorMessages;
      };

      if (error.response && error.response.data) {
        const errorMessages = collectErrors(error.response.data);
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join("\n"); // Join errors with new lines
        }
      } else if (error.message) {
        errorMessage = error.message; // Use the error message from the caught exception
      }

      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Update failed",
          description: errorMessage,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  const onSubmit = async ({
    display_first_name,
    display_last_name,
    userPk,
    title,
    phone,
    fax,
    branch,
    business_area,
    about,
    expertise,
    affiliation,
  }: IFullUserUpdateVariables) => {
    const image = activeOption === "url" ? selectedImageUrl : selectedFile;
    // console.log(affiliation);
    await fullMutation.mutateAsync({
      display_first_name,
      display_last_name,
      userPk,
      title,
      phone,
      fax,
      branch,
      business_area,
      image,
      about,
      expertise,
      affiliation,
    });
  };

  // useEffect(() => {
  //   if (!isValid) {
  //     console.log("Form validation errors:", errors);
  //   }
  // }, [errors, isValid]);
  const me = useUser();
  // useEffect(() => console.log({ user, userData }), [user, userData]);

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"3xl"}>
      <ModalOverlay />
      <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
        <ModalHeader>Edit User?</ModalHeader>
        <ModalCloseButton />
        <Flex as={"form"} onSubmit={handleSubmit(onSubmit)} id="edit-details">
          <ModalBody>
            {!userLoading && (
              <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                  <Tab>Base Information</Tab>
                  <Tab>Profile</Tab>
                  <Tab>Organisation</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {!userLoading && (
                      <>
                        <FormControl my={2} mb={4} userSelect="none">
                          <InputGroup>
                            <Input
                              autoComplete="off"
                              type="hidden"
                              {...register("userPk", {
                                required: true,
                                value: user.pk,
                              })}
                              readOnly
                            />
                          </InputGroup>
                        </FormControl>
                        <Grid
                          gridColumnGap={8}
                          gridTemplateColumns={"repeat(2, 1fr)"}
                        >
                          {/* Title */}
                          <FormControl my={2} mb={4} userSelect={"none"}>
                            <FormLabel
                              onMouseEnter={() => setHoveredTitle(true)}
                              onMouseLeave={() => setHoveredTitle(false)}
                            >
                              Title
                            </FormLabel>

                            <InputGroup>
                              <InputLeftAddon
                                left={0}
                                bg="transparent"
                                pl={2}
                                zIndex={1}
                                borderColor={titleBorderColor}
                                borderTopRightRadius={"none"}
                                borderBottomRightRadius={"none"}
                                borderRight={"none"}
                              >
                                <Icon as={GiGraduateCap} />
                              </InputLeftAddon>
                              <Select
                                placeholder={"Select a title"}
                                borderLeft={"none"}
                                borderTopLeftRadius={"none"}
                                borderBottomLeftRadius={"none"}
                                pl={"0.5px"}
                                borderLeftColor={"transparent"}
                                onMouseEnter={() => setHoveredTitle(true)}
                                onMouseLeave={() => setHoveredTitle(false)}
                                {...register("title", {
                                  value: userData?.title,
                                })}
                              >
                                <option value="dr">Dr</option>
                                <option value="mr">Mr</option>
                                <option value="mrs">Mrs</option>
                                <option value="ms">Ms</option>
                                <option value="aprof">A/Prof</option>
                                <option value="prof">Prof</option>
                              </Select>
                            </InputGroup>
                            {errors.title && (
                              <FormErrorMessage>
                                {errors.title.message}
                              </FormErrorMessage>
                            )}
                          </FormControl>

                          {/* Phone */}
                          <FormControl my={2} mb={4} userSelect={"none"}>
                            <FormLabel>Phone</FormLabel>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={AiFillPhone} />
                              </InputLeftElement>
                              <Input
                                autoComplete="off"
                                type="text"
                                placeholder={"Enter a phone number"}
                                {...register("phone", {
                                  pattern: {
                                    value: phoneValidationPattern,
                                    message: "Invalid phone number",
                                  },
                                  value: userData?.phone,
                                })}
                              />
                            </InputGroup>
                            {errors.phone && (
                              <FormErrorMessage>
                                {errors.phone.message}
                              </FormErrorMessage>
                            )}
                          </FormControl>

                          {/* Fax */}
                          <FormControl my={2} mb={4} userSelect={"none"}>
                            <FormLabel>Fax</FormLabel>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={MdFax} />
                              </InputLeftElement>
                              <Input
                                autoComplete="off"
                                type="text"
                                placeholder={"Enter a fax number"}
                                {...register("fax", {
                                  pattern: {
                                    value: phoneValidationPattern,
                                    message: "Invalid fax number",
                                  },
                                  value: userData?.fax,
                                })}
                              />
                            </InputGroup>
                            {errors.fax && (
                              <FormErrorMessage>
                                {errors.fax.message}
                              </FormErrorMessage>
                            )}
                          </FormControl>

                          {/* Email */}
                          <FormControl my={2} mb={4} userSelect={"none"}>
                            <FormLabel>Email</FormLabel>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={GrMail} />
                              </InputLeftElement>
                              <Input
                                type="email"
                                placeholder={userData?.email}
                                value={userData?.email}
                                isDisabled={true}
                              />
                            </InputGroup>
                          </FormControl>

                          {/* First Name */}
                          <FormControl my={2} mb={4} userSelect={"none"}>
                            <FormLabel>First Name</FormLabel>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={RiNumber1} />
                              </InputLeftElement>
                              <Input
                                autoComplete="off"
                                type="text"
                                placeholder={
                                  userData?.display_first_name ??
                                  userData?.first_name
                                }
                                {...register("display_first_name", {
                                  value:
                                    userData?.display_first_name ??
                                    userData?.first_name,
                                })}
                                isDisabled={!me?.userData?.is_superuser}
                              />
                            </InputGroup>
                          </FormControl>

                          {/* Last Name */}
                          <FormControl my={2} mb={4} userSelect={"none"}>
                            <FormLabel>Last Name</FormLabel>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={RiNumber2} />
                              </InputLeftElement>
                              <Input
                                type="text"
                                isDisabled={!me?.userData?.is_superuser}
                                placeholder={
                                  userData?.display_last_name ??
                                  userData?.last_name
                                }
                                {...register("display_last_name", {
                                  value:
                                    userData?.display_last_name ??
                                    userData?.last_name,
                                })}
                              />
                            </InputGroup>
                          </FormControl>
                        </Grid>
                      </>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {!userLoading && (
                      <Grid>
                        <Box my={2}>
                          <Controller
                            name="about"
                            control={control}
                            defaultValue={userData?.about || ""}
                            render={({ field }) => (
                              <DatabaseRichTextEditor
                                populationData={userData?.about || ""}
                                label="About"
                                // hideLabel
                                htmlFor="about"
                                isEdit
                                field={field}
                                registerFn={register}
                                // isMobile={!isDesktop}
                              />
                            )}
                          />
                        </Box>
                        <Box my={2}>
                          <Controller
                            name="expertise"
                            control={control}
                            defaultValue={userData?.expertise || ""}
                            render={({ field }) => (
                              <DatabaseRichTextEditor
                                populationData={userData?.expertise || ""}
                                label="Expertise"
                                // hideLabel
                                htmlFor="expertise"
                                isEdit
                                field={field}
                                registerFn={register}
                                // isMobile={!isDesktop}
                              />
                            )}
                          />
                        </Box>

                        <Box>
                          <FormLabel>Image</FormLabel>
                          <StatefulMediaChanger
                            helperText={"Upload an image that represents you."}
                            selectedImageUrl={selectedImageUrl}
                            setSelectedImageUrl={setSelectedImageUrl}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            clearImageAddedFunctionality={async () => {
                              const data = await removeUserAvatar({
                                pk: Number(userData?.pk),
                              });
                              queryClient.refetchQueries({
                                queryKey: ["users", userData?.pk],
                              });
                            }}
                          />
                        </Box>
                      </Grid>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {!userLoading && userData.is_staff && (
                      <Grid>
                        {/* Branch */}
                        <FormControl my={2} mb={4} userSelect={"none"}>
                          <FormLabel>Branch</FormLabel>
                          <InputGroup>
                            {branches && (
                              <Select
                                placeholder={"Select a Branch"}
                                defaultValue={userData?.branch?.pk || ""}
                                {...register("branch")}
                              >
                                {branches.map(
                                  (branch: IBranch, index: number) => {
                                    return (
                                      <option key={index} value={branch.pk}>
                                        {branch.name}
                                      </option>
                                    );
                                  },
                                )}
                              </Select>
                            )}
                          </InputGroup>
                        </FormControl>

                        {/* Business Area */}
                        <FormControl my={2} mb={4} userSelect={"none"}>
                          <FormLabel>Business Area</FormLabel>
                          <InputGroup>
                            {businessAreas && (
                              <Select
                                placeholder={"Select a Business Area"}
                                defaultValue={userData?.business_area?.pk || ""}
                                {...register("business_area")}
                              >
                                {businessAreas
                                  .sort((a: IBusinessArea, b: IBusinessArea) =>
                                    a.name.localeCompare(b.name),
                                  )
                                  .map((ba: IBusinessArea, index: number) => {
                                    return (
                                      <option key={index} value={ba.pk}>
                                        {ba.name}
                                      </option>
                                    );
                                  })}
                              </Select>
                            )}
                          </InputGroup>
                        </FormControl>

                        {/* Affiliation */}
                        <FormControl my={2} mb={4} userSelect={"none"}>
                          <AffiliationCreateSearchDropdown
                            // autoFocus
                            isRequired={false}
                            preselectedAffiliationPk={userData?.affiliation?.pk}
                            setterFunction={(
                              selectedAffiliation: IAffiliation | undefined,
                            ) => {
                              if (selectedAffiliation) {
                                setValue("affiliation", selectedAffiliation.pk);
                              } else {
                                setValue("affiliation", undefined); // Clear the affiliation in the form
                              }
                            }}
                            isEditable
                            hideTags
                            label="Affiliation"
                            placeholder="Search for or an affiliation"
                            helperText="The entity this user is affiliated with"
                          />
                        </FormControl>
                      </Grid>
                    )}

                    {!userLoading && !userData.is_staff && (
                      <>
                        <Text>
                          This user is external. You may only set their
                          affiliation.
                        </Text>

                        <FormControl my={2} mb={4} userSelect={"none"}>
                          <AffiliationCreateSearchDropdown
                            // autoFocus
                            isRequired={false}
                            preselectedAffiliationPk={userData?.affiliation?.pk}
                            setterFunction={(
                              selectedAffiliation: IAffiliation | undefined,
                            ) => {
                              if (selectedAffiliation) {
                                setValue("affiliation", selectedAffiliation.pk);
                              } else {
                                setValue("affiliation", undefined); // Clear the affiliation in the form
                              }
                            }}
                            isEditable
                            hideTags
                            label="Affiliation"
                            placeholder="Search for or an affiliation"
                            helperText="The entity this user is affiliated with"
                          />
                        </FormControl>
                      </>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
        </Flex>

        <ModalFooter>
          <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
            <Button colorScheme="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button
              isDisabled={!isValid}
              isLoading={fullMutation.isPending}
              form="edit-details"
              type="submit"
              bgColor={colorMode === "light" ? `green.500` : `green.600`}
              color={colorMode === "light" ? `white` : `whiteAlpha.900`}
              _hover={{
                bg: colorMode === "light" ? `green.600` : `green.400`,
                color: colorMode === "light" ? `white` : `white`,
              }}
              ml={3}
            >
              Update
            </Button>
          </Grid>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
