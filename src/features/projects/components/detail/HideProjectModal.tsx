import {
  toggleProjectVisibilityOnStaffProfile,
  toggleStaffProfileVisibility,
} from "@/shared/lib/api";
import {
  Text,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  type ToastId,
  UnorderedList,
  useColorMode,
  useDisclosure,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import React, { useEffect, useRef } from "react";

interface HideProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPk: number;
  projectPk: number;
  projectIsHiddenFromStaffProfile: boolean;
  refetch: () => void;
}

const HideProjectModal = ({
  isOpen,
  onClose,
  userPk,
  projectPk,
  projectIsHiddenFromStaffProfile,
  refetch,
}: HideProjectModalProps) => {
  const { colorMode } = useColorMode();
  const { isOpen: isToastOpen, onClose: closeToast } = useDisclosure();

  useEffect(() => {
    if (isToastOpen) {
      onClose();
    }
  }, [isToastOpen, onClose]);

  const handleToastClose = () => {
    closeToast();
    onClose();
  };

  // Toast
  const toast = useToast();
  const ToastIdRef = useRef<ToastId | undefined>(undefined);
  const addToast = (data: UseToastOptions) => {
    ToastIdRef.current = toast(data);
  };

  const queryClient = useQueryClient();
  const toggleVisibilityMutation = useMutation({
    // Start of mutation handling
    mutationFn: toggleProjectVisibilityOnStaffProfile,
    onMutate: () => {
      addToast({
        title: "Changing Project Visibility...",
        description: "One moment!",
        status: "loading",
        position: "top-right",
        // duration: 3000
      });
    },
    // Success handling based on API- file - declared interface
    onSuccess: () => {
      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
          title: "Success",
          description: `This project is now ${
            !projectIsHiddenFromStaffProfile ? "hidden" : "visible"
          } from your staff profile.`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      //  Close the modal
      queryClient.invalidateQueries({
        queryKey: ["hiddenProjects", userPk],
      });
      queryClient.invalidateQueries({ queryKey: ["me"] }).then(() => {
        refetch();
      });

      if (onClose) {
        onClose();
      }
    },
    // Error handling based on API - file - declared interface
    onError: (error: AxiosError) => {
      console.log(error);
      let errorMessage = "An error occurred while setting project visibility"; // Default error message

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

      if (ToastIdRef.current) {
        toast.update(ToastIdRef.current, {
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
    userPk,
    projectPk,
  }: {
    userPk: number;
    projectPk: number;
  }) => {
    await toggleVisibilityMutation.mutateAsync({
      userPk,
      projectPk,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex
      // as={"form"} onSubmit={handleSubmit(onSubmit)}
      >
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>
            {!projectIsHiddenFromStaffProfile ? "Hide" : "Show"} Project From
            Staff Profile
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {/* <Center> */}
            <Text fontWeight={"bold"} fontSize={"xl"}>
              Are you sure you want to{" "}
              {!projectIsHiddenFromStaffProfile
                ? "hide this project from your staff profile"
                : "show this project on your staff profile"}
              ?
            </Text>
            {/* </Center> */}
            <Text mt={4}>
              This project{" "}
              {!projectIsHiddenFromStaffProfile ? " will no longer " : " will "}
              appear on your projects tab in the science profiles public
              directory. You can change this setting at any time.
            </Text>

            <Text mt={4}>
              If you would still like to proceed, press "
              {!projectIsHiddenFromStaffProfile ? "Hide" : "Show"}".
            </Text>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color={"white"}
                background={colorMode === "light" ? "red.500" : "red.600"}
                _hover={{
                  background: colorMode === "light" ? "red.400" : "red.500",
                }} // isDisabled={!changesMade}
                isLoading={toggleVisibilityMutation.isPending}
                onClick={() =>
                  onSubmit({
                    userPk,
                    projectPk,
                  })
                }
                ml={3}
              >
                {!projectIsHiddenFromStaffProfile ? "Hide" : "Show"}
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};

export default HideProjectModal;
