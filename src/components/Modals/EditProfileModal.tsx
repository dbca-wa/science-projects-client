// Modal for editing profile section of user

import { useProfile } from "@/lib/hooks/tanstack/useProfile";
import {
  Box,
  Button,
  // Box,
  FormLabel,
  Grid,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ToastId,
  useColorMode,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  IProfileUpdateError,
  IProfileUpdateSuccess,
  IProfileUpdateVariables,
  removeUserAvatar,
  updateProfile,
} from "../../lib/api";
import { useNoImage } from "../../lib/hooks/helper/useNoImage";
import useServerImageUrl from "../../lib/hooks/helper/useServerImageUrl";
import { IProfile } from "../../types";
import { StatefulMediaChanger } from "../Pages/Admin/StatefulMediaChanger";
import DatabaseRichTextEditor from "../StaffProfiles/Editor/DatabaseRichTextEditor";

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
    currentImage,
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

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    // watch,
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
      onClose?.();
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
    // Check if about and expertise fields have changed
    const aboutChanged = about !== undefined && isFieldChanged("about", about);
    const expertiseChanged =
      expertise !== undefined && isFieldChanged("expertise", expertise);

    const updateData: IProfileUpdateVariables = {
      userPk: userPk,
      about: aboutChanged ? about : undefined,
      expertise: expertiseChanged ? expertise : undefined,
    };
    if (image) {
      updateData.image = image;
    }

    await mutation.mutateAsync(updateData);
  };

  useEffect(() => {
    if (selectedFile) {
      const objectURL = URL.createObjectURL(selectedFile);
      setSelectedImageUrl(objectURL);
      return () => URL.revokeObjectURL(objectURL);
    }
  }, [selectedFile]);

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
              <Box my={2} mb={4} userSelect="none">
                <InputGroup>
                  <Input
                    type="hidden"
                    {...register("userPk", { required: true, value: userId })}
                    readOnly
                  />
                </InputGroup>
              </Box>
              <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={4}>
                <Box my={2}>
                  <Controller
                    name="about"
                    control={control}
                    defaultValue={initialData?.about || ""}
                    render={({ field }) => (
                      <DatabaseRichTextEditor
                        populationData={initialData?.about || ""}
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
                    defaultValue={initialData?.expertise || ""}
                    render={({ field }) => (
                      <DatabaseRichTextEditor
                        populationData={initialData?.expertise || ""}
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

                <Grid>
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
                          pk: Number(userId),
                        });
                        queryClient.refetchQueries();
                      }}
                    />
                  </Box>
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
                isDisabled={!isValid}
              >
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
