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
  MutationError,
  MutationSuccess,
  requestCaretaker,
} from "@/shared/lib/api";
import type { ICaretakerEntry } from "@/shared/types/index.d";
import { useFormattedDate } from "@/shared/hooks/useFormattedDate";

interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPk: number;
  caretakerPk: number;
  // startDate: Date | null;
  endDate: Date | null;
  reason: "leave" | "resignation" | "other" | null;
  notes: string | undefined;
  refetch: () => void;
}

export const CaretakerModeConfirmModal = ({
  isOpen,
  onClose,
  userPk,
  caretakerPk,
  // startDate,
  endDate,
  reason,
  notes,
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

  const setCaretakerMutation = useMutation<
    MutationSuccess,
    MutationError,
    ICaretakerEntry
  >({
    // Start of mutation handling
    mutationFn: requestCaretaker,
    onMutate: () => {
      addToast({
        title: "Requesting caretaker...",
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
          description: `Your request has been made.`,
          status: "success",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      queryClient
        .invalidateQueries({
          queryKey: ["pendingAdminTasks"],
        })
        .then(() => refetch())
        .then(() => onClose());
    },
    // Error handling based on API - file - declared interface
    onError: (error) => {
      console.log(error);
      let errorMessage = "An error occurred while requesting a caretaker"; // Default error message

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

  const onSubmit = async (formData: ICaretakerEntry) => {
    console.log(formData);
    await setCaretakerMutation.mutateAsync({
      userPk: formData.userPk,
      caretakerPk: formData.caretakerPk,
      // startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      notes: formData.notes,
    });
  };

  // const formattedStart = useFormattedDate(startDate);
  const formattedEnd = useFormattedDate(endDate);

  return (
    <Modal isOpen={isOpen} onClose={handleToastClose} size={"lg"}>
      <ModalOverlay />
      <Flex>
        <ModalContent
          color={colorMode === "dark" ? "gray.400" : null}
          bg={colorMode === "light" ? "white" : "gray.800"}
        >
          <ModalHeader>Request Caretaker?</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Center>
              <Text fontWeight={"bold"} fontSize={"xl"}>
                Are you sure you want to request a caretaker?
              </Text>
            </Center>
            <Text mt={4}>
              A request will be made to admins to set the selected user as
              caretaker for your projects:
            </Text>
            <Box mt={4}>
              <UnorderedList>
                {/* <ListItem>From {formattedStart.split("@")[0]}</ListItem> */}
                {formattedEnd !== "" && (
                  <ListItem>Until {formattedEnd.split("@")[0]}</ListItem>
                )}
                <ListItem>
                  They will be able to perform actions on your behalf
                </ListItem>
                <ListItem>
                  If you return early, you can manually remove caretaker
                </ListItem>
              </UnorderedList>
            </Box>
            <Text mt={4}>
              If you would still like to proceed, press "Request Caretaker".
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
                isLoading={setCaretakerMutation.isPending}
                onClick={() =>
                  onSubmit({
                    userPk: userPk,
                    caretakerPk: caretakerPk,
                    // startDate: startDate,
                    endDate: endDate,
                    reason: reason,
                    notes: notes,
                  })
                }
                ml={3}
              >
                Request Caretaker
              </Button>
            </Grid>
          </ModalFooter>
        </ModalContent>
      </Flex>
    </Modal>
  );
};
