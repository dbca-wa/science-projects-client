// Delete User Modal - for removing users from the system all together. Admin only.

import {
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
  Text,
  type ToastId,
  UnorderedList,
  useColorMode,
  useDisclosure,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  becomeCaretaker,
  MutationError,
  MutationSuccess,
  removeCaretaker,
} from "@/features/users/services/users.service";
import {
  ICaretakerEntry,
  ICaretakerObject,
  ISimpleIdProp,
  IUserData,
} from "@/shared/types";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";

interface IModalProps {
  isOpen: boolean;
  myPk: number;
  onClose: () => void;
  user: IUserData;
  refetch: () => void;
}

export const BecomeCaretakerModal = ({
  isOpen,
  myPk,
  user,
  onClose,
  refetch,
}: IModalProps) => {
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

  const becomeCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    ICaretakerEntry
  >({
    // Start of mutation handling
    mutationFn: becomeCaretaker,
    onMutate: () => {
      addToast({
        title: "Requesting Caretaker...",
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
          description: `Request made.`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient
        .invalidateQueries({
          queryKey: ["caretakers"],
        })
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: ["pendingAdminTasks"],
          }),
        )
        .then(() => refetch())
        .then(() => onClose());
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage =
        "An error occurred while requesting to become caretaker"; // Default error message

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

  const onSubmit = async () => {
    // console.log(formData);
    await becomeCaretakerMutation.mutateAsync({
      userPk: user?.pk,
      caretakerPk: myPk,
      reason: "other",
      endDate: null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Become Caretaker?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"bold"} fontSize={"xl"}>
                Are you sure you want to become {user?.display_first_name}{" "}
                {user?.display_last_name}&apos;s caretaker?
              </Text>
            </Center>
            <Text mt={4}>
              A request will be made to admins to approve your request.
            </Text>

            <Text mt={4}>
              If you would still like to proceed, press "Become Caretaker".
            </Text>
          </ModalBody>
          <ModalFooter>
            <Grid gridTemplateColumns={"repeat(2, 1fr)"} gridGap={4}>
              <Button colorScheme="gray" onClick={onClose}>
                Cancel
              </Button>
              <Button
                color={"white"}
                background={colorMode === "light" ? "green.500" : "green.600"}
                _hover={{
                  background: colorMode === "light" ? "green.400" : "green.500",
                }} // isDisabled={!changesMade}
                isLoading={becomeCaretakerMutation.isPending}
                onClick={() => onSubmit()}
                ml={3}
              >
                Become Caretaker
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
