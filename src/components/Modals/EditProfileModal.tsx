import { useProfile } from "@/lib/hooks/tanstack/useProfile";
import {
  Box,
  Button,
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
  UseToastOptions,
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
import { StatefulMediaChangerAvatar } from "../Pages/Admin/StatefulMediaChangerAvatar";
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
  const initialFocusRef = useRef(null);
  const modalBodyRef = useRef(null);

  const imageUrl = useServerImageUrl(currentImage);
  const noImageLink = useNoImage();
  const { isLoading, profileData: data } = useProfile(userId);
  const { colorMode } = useColorMode();

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    currentImage,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Effect to create object URL when file is selected
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
  } = useForm<IProfileUpdateVariables>();

  // Toast management
  const toast = useToast();
  const toastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    toastIdRef.current = toast(data);
  };

  // Query client and mutation setup
  const queryClient = useQueryClient();

  const mutation = useMutation<
    IProfileUpdateSuccess,
    IProfileUpdateError,
    IProfileUpdateVariables
  >({
    mutationFn: updateProfile,
    onMutate: () => {
      addToast({
        title: "Updating profile...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
      });
    },
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
      onClose?.();
    },
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

  const onSubmit = async ({
    userPk,
    about,
    expertise,
  }: IProfileUpdateVariables) => {
    const image = selectedFile;
    // Check if fields have changed
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

  // Reset scroll position and focus on modal open
  useEffect(() => {
    if (isOpen) {
      // Add small delay to ensure modal is fully rendered before scrolling
      setTimeout(() => {
        if (modalBodyRef.current) {
          // Reset scroll position to top
          modalBodyRef.current.scrollTop = 0;

          // Set focus to the image label
          if (initialFocusRef.current) {
            initialFocusRef.current.focus();
            initialFocusRef.current.blur();
          }
        }
      }, 50);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={"3xl"}
      scrollBehavior="inside"
      initialFocusRef={initialFocusRef}
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
            <ModalBody pos="relative" flex={1} ref={modalBodyRef}>
              <Box userSelect="none">
                <InputGroup>
                  <Input
                    type="hidden"
                    {...register("userPk", { required: true, value: userId })}
                    readOnly
                  />
                </InputGroup>
              </Box>
              <Grid gridTemplateColumns={"repeat(1, 1fr)"} gridGap={4}>
                <Box id="image-section">
                  <FormLabel tabIndex={-1} ref={initialFocusRef}>
                    Image
                  </FormLabel>
                  <StatefulMediaChangerAvatar
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

                <Box my={2}>
                  <Controller
                    name="about"
                    control={control}
                    defaultValue={initialData?.about || ""}
                    render={({ field }) => (
                      <DatabaseRichTextEditor
                        populationData={initialData?.about || ""}
                        label="About"
                        htmlFor="about"
                        isEdit
                        field={field}
                        registerFn={register}
                        autoFocus={false}
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
                        htmlFor="expertise"
                        isEdit
                        field={field}
                        registerFn={register}
                        autoFocus={false}
                      />
                    )}
                  />
                </Box>
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
