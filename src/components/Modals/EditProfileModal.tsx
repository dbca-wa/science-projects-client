// Modal for editing profile section of user

import { useProfile } from "@/lib/hooks/tanstack/useProfile";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  Image,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  IProfileUpdateError,
  IProfileUpdateSuccess,
  IProfileUpdateVariables,
  updateProfile,
} from "../../lib/api";
import { useNoImage } from "../../lib/hooks/helper/useNoImage";
import useServerImageUrl from "../../lib/hooks/helper/useServerImageUrl";
import { IProfile } from "../../types";

interface IEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentImage: string;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  userId,
  currentImage,
}: IEditProfileModalProps) => {
  const imageUrl = useServerImageUrl(currentImage);

  const noImageLink = useNoImage();

  const { isLoading, profileData: data } = useProfile(userId);

  const { colorMode } = useColorMode();

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    currentImage
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Update this useEffect to set the selectedImageUrl when a new file is selected
  useEffect(() => {
    if (selectedFile) {
      setSelectedImageUrl(URL.createObjectURL(selectedFile));
    }
  }, [selectedFile]);

  const initialData: IProfile = data || {
    image: null,
    about: "",
    expertise: "",
    // Initialize other properties with default values
  };

  const isFieldChanged = (fieldName: keyof IProfile, fieldValue: string) => {
    return data ? data[fieldName] !== fieldValue : false;
  };

  //  React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IProfileUpdateVariables>();

  // Toast
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();
  const addToast = (data) => {
    toastIdRef.current = toast(data);
  };

  // Mutation, query client, onsubmit, and api function
  const queryClient = useQueryClient();

  const mutation = useMutation<
    IProfileUpdateSuccess,
    IProfileUpdateError,
    IProfileUpdateVariables
  >({
    // Start of mutation handling
    mutationFn: updateProfile,
    onMutate: () => {
      addToast({
        title: "Updating profile...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [`profile`, userId] });
      queryClient.refetchQueries({ queryKey: [`me`] });

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
      //  Close the modal
      if (onClose) {
        onClose();
      }
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      if (toastIdRef.current) {
        toast.update(toastIdRef.current, {
          title: "Update failed",
          description: `${error?.response?.data ? error.response.data : error}`,
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  //  When submitting form - starts the mutation
  const onSubmit = async ({
    userPk,
    about,
    expertise,
  }: IProfileUpdateVariables) => {
    const image = selectedFile;
    // console.log(selectedFile);
    // Check if about and expertise fields have changed
    const aboutChanged = about !== undefined && isFieldChanged("about", about);
    const expertiseChanged =
      expertise !== undefined && isFieldChanged("expertise", expertise);

    if (selectedFile !== null || aboutChanged || expertiseChanged) {
      if (aboutChanged && expertiseChanged) {
        // console.log("image + about and expertise changed");
        await mutation.mutateAsync({ userPk, image, about, expertise });
      } else if (aboutChanged) {
        // console.log("image + about changed");
        await mutation.mutateAsync({ userPk, image, about });
      } else if (expertiseChanged) {
        // console.log("image + expertise changed");
        await mutation.mutateAsync({ userPk, image, expertise });
      } else if (!expertiseChanged && !aboutChanged) {
        // console.log("only image changed");
        await mutation.mutateAsync({ userPk, image });
      }
      // onClose();
    } else {
      if (aboutChanged && expertiseChanged) {
        // console.log("about + expertise changed");
        await mutation.mutateAsync({ userPk, about, expertise });
      } else if (aboutChanged) {
        // console.log("about changed");

        await mutation.mutateAsync({ userPk, about });
      } else if (expertiseChanged) {
        // console.log("expertise changed");

        await mutation.mutateAsync({ userPk, expertise });
      } else {
        // console.log("Nothing changed");
      }
    }
  };

  const [aboutValue, setAboutValue] = useState(data?.about || "");
  const [expertiseValue, setExpertiseValue] = useState(data?.expertise || "");

  useEffect(() => {
    if (!isLoading) {
      setAboutValue(data?.about || "");
      setExpertiseValue(data?.expertise || "");
    }
  }, [data, isLoading]);

  // useEffect(() => {
  //   console.log({
  //     selectedImageUrl: selectedImageUrl,
  //     selectedFile: selectedFile,
  //     imageUrl: imageUrl,
  //     currentImage: currentImage,
  //   });
  // }, [selectedImageUrl, selectedFile, imageUrl, currentImage]);

  useEffect(() => {
    console.log({
      // https://archives.bulbagarden.net/media/upload/thumb/4/4a/0025Pikachu.png/250px-0025Pikachu.png
      imageUrl,
      selectedFile,
    })
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={"3xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent
        bg={colorMode === "light" ? "white" : "gray.800"}
        as="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        {!isLoading && (
          <>
            <ModalBody pos="relative" flex={1}>
              <FormControl my={2} mb={4} userSelect="none">
                <InputGroup>
                  <Input
                    type="hidden"
                    {...register("userPk", { required: true, value: userId })}
                    readOnly
                  />
                </InputGroup>
              </FormControl>
              <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={4}>
                <Box>
                  <FormControl userSelect="none">
                    <FormLabel>About</FormLabel>
                    <InputGroup>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        {...register("about")}
                        value={aboutValue}
                        onChange={(e) => setAboutValue(e.target.value)}
                      />
                    </InputGroup>
                    {errors.about && (
                      <FormErrorMessage>
                        {errors.about.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </Box>
                <Box>
                  <FormControl userSelect="none">
                    <FormLabel>Expertise</FormLabel>
                    <Textarea
                      placeholder="Briefly, what do you focus on..."
                      {...register("expertise")}
                      value={expertiseValue}
                      onChange={(e) => setExpertiseValue(e.target.value)}
                    />
                    {errors.expertise && (
                      <FormErrorMessage>
                        {errors.expertise.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </Box>
                <Grid
                  gridTemplateColumns={{ base: "3fr 10fr", md: "4fr 8fr" }}
                  pos="relative"
                  w="100%"
                  h="100%"
                >
                  <Box>
                    <FormLabel>Image</FormLabel>
                    <Center
                      maxH={{ base: "200px", xl: "225px" }}
                      bg="gray.50"
                      mt={1}
                      rounded="lg"
                      overflow="hidden"
                    >
                      <Image
                        objectFit="cover"
                        src={
                          (selectedFile === null || !String(imageUrl).endsWith("undefined")) ? noImageLink :
                            selectedImageUrl ? selectedImageUrl
                              : imageUrl
                        }
                        alt="Preview"
                        userSelect="none"
                        bg="gray.800"
                      // onLoad={handleImageLoadSuccess}
                      // onError={handleImageLoadError}
                      />
                    </Center>
                  </Box>
                  <FormControl ml={4} mt={10}>
                    <InputGroup>
                      <Grid gridGap={2} ml={4}>
                        <FormControl>
                          <Input
                            autoComplete="off"
                            alignItems={"center"}
                            type="file"
                            // accept="image/*"
                            accept=".png, .jpeg, .jpg, image/png, image/jpeg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedFile(file);
                                setSelectedImageUrl(URL.createObjectURL(file));
                              }
                            }}
                            border={"none"}
                            sx={{
                              "::file-selector-button": {
                                background:
                                  colorMode === "light"
                                    ? "gray.100"
                                    : "gray.600",
                                borderRadius: "8px",
                                padding: "2px",
                                paddingX: "8px",
                                mt: "1px",
                                border: "1px solid",
                                borderColor:
                                  colorMode === "light"
                                    ? "gray.400"
                                    : "gray.700",
                                outline: "none",
                                mr: "15px",
                                ml: "-16px",
                                cursor: "pointer",
                              },
                              pt: "3.5px",
                              color:
                                colorMode === "light" ? "gray.800" : "gray.200",
                            }}
                          />
                        </FormControl>
                        <FormHelperText>
                          Upload an image for your display picture.
                        </FormHelperText>
                        {errors.image && (
                          <FormErrorMessage>
                            {errors.image.message}
                          </FormErrorMessage>
                        )}
                      </Grid>
                    </InputGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </ModalBody>
            <ModalFooter>
              <Button
                isLoading={mutation.isPending}
                type="submit"
                bgColor={colorMode === "light" ? `green.500` : `green.600`}
                color={colorMode === "light" ? `white` : `whiteAlpha.900`}
                _hover={{
                  bg: colorMode === "light" ? `green.600` : `green.400`,
                  color: colorMode === "light" ? `white` : `white`,
                }}
                ml={3}
                isDisabled={
                  selectedFile === null &&
                  aboutValue === initialData.about &&
                  expertiseValue === initialData.expertise
                }
              >
                Update
              </Button>
            </ModalFooter>
          </>
        )}
        {/* </Flex> */}
      </ModalContent>
    </Modal>
  );
};
